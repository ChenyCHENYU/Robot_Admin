import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/addons/renderers/CSS2DRenderer.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import gsap from 'gsap'
import type {
  DayNightMode,
  DisposeCallback,
  EngineEvent,
  EventPoint,
  LoadProgress,
  ModelEntry,
  SceneConfig,
  SceneLevel,
  SubSceneConfig,
  Vec3Like,
} from './types'
import {
  BUILDING_LABELS,
  BUILDING_MODELS,
  DEFAULT_SCENE_CONFIG,
  ENERGY_MAP,
  FINAL_MODEL,
  PIPE_MODELS,
  SUB_SCENES,
} from './config'

type EventHandler = (...args: any[]) => void

/**
 * 3D 工厂场景引擎 — 忠实还原原始 City.js 全部交互逻辑
 */
export class FactoryEngine {
  // ---- 核心对象 ----
  scene!: THREE.Scene
  camera!: THREE.PerspectiveCamera
  renderer!: THREE.WebGLRenderer
  css2dRenderer!: CSS2DRenderer
  controls!: OrbitControls

  // ---- 加载器 ----
  private gltfLoader!: GLTFLoader
  private dracoLoader!: DRACOLoader
  private textureLoader!: THREE.TextureLoader
  private cubeTextureLoader!: THREE.CubeTextureLoader

  // ---- 状态 ----
  private disposed = false
  private config: SceneConfig
  private container: HTMLElement | null = null
  private lightGroup!: THREE.Group
  private ambientLight!: THREE.AmbientLight
  private animFrameId = 0

  // ---- 标签管理 ----
  private labels: CSS2DObject[] = []

  // ---- 事件系统 ----
  private eventMap = new Map<string, Set<EventHandler>>()

  // ---- 清理回调 ----
  private disposeCallbacks: DisposeCallback[] = []

  // ---- 下钻系统 ----
  private subSceneCache = new Map<string, THREE.Group>()
  private savedCameraPos: THREE.Vector3 | null = null
  private savedControlsTarget: THREE.Vector3 | null = null
  private currentLevel: SceneLevel = 1
  private terrainMaterialBackup = new Map<
    number,
    { material: THREE.Material | THREE.Material[]; posY?: number }
  >()

  // ---- 能源覆盖 ----
  private energyActive = false

  /** 创建引擎实例 */
  constructor(config?: Partial<SceneConfig>) {
    this.config = { ...DEFAULT_SCENE_CONFIG, ...config }
  }

  // ==================== 公共 API ====================

  /** 初始化引擎, 单容器模式(canvas + css2d 均挂载至同一父节点) */
  init(container: HTMLElement) {
    this.container = container
    container.style.touchAction = 'none'

    this.initScene()
    this.initCamera()
    this.initRenderer()
    this.initCSS2DRenderer()
    this.initLights()
    this.initLoaders()

    // Canvas 挂到主容器
    container.appendChild(this.renderer.domElement)

    // CSS2D 挂到独立容器(与原始架构一致, 避免事件干扰)
    const cssContainer = document.getElementById('cssrender')
    if (cssContainer) {
      cssContainer.appendChild(this.css2dRenderer.domElement)
    } else {
      container.appendChild(this.css2dRenderer.domElement)
    }

    // 控制器绑定到主容器
    this.initControls()

    const onResize = this.handleResize.bind(this)
    window.addEventListener('resize', onResize)
    this.disposeCallbacks.push(() =>
      window.removeEventListener('resize', onResize)
    )

    this.startRenderLoop()
  }

  /** 并发加载全部模型 */
  async loadModels(concurrency = 3) {
    const allModels = [...BUILDING_MODELS, ...PIPE_MODELS, FINAL_MODEL]
    const total = allModels.length
    let loaded = 0
    let cursor = 0

    const next = (): Promise<void> | undefined => {
      if (cursor >= total) return undefined
      const entry = allModels[cursor++]
      return this.loadModel(entry).then(() => {
        loaded++
        this.emit('progress', {
          loaded,
          total,
          modelName: entry.name,
        } as LoadProgress)
        return next()
      })
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, total) }, () => next()!)
    )

    // 管道默认隐藏
    PIPE_MODELS.forEach(p => {
      const obj = this.scene.getObjectByName(p.name)
      if (obj) obj.visible = false
    })

    this.emit('loaded')
  }

  /** 获取当前层级 */
  getLevel(): SceneLevel {
    return this.currentLevel
  }

  // ==================== 下钻系统(匹配原始 changeIf 逻辑) ====================

  /** 下钻到建筑子场景 */
  async drillDown(buildingName: string): Promise<void> {
    const subConfig = SUB_SCENES[buildingName]
    if (!subConfig || this.currentLevel === 2) return

    this.currentLevel = 2
    this.clearLabels()

    // 保存当前视角
    this.savedCameraPos = this.camera.position.clone()
    this.savedControlsTarget = this.controls.target.clone()

    // 创建地形替换材质 (bg-tuan.png)
    const bgTex = this.textureLoader.load(
      `${this.config.textureBasePath}bg-tuan.png`
    )
    bgTex.repeat.set(200, 200)
    bgTex.wrapS = THREE.RepeatWrapping
    bgTex.wrapT = THREE.RepeatWrapping
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x6d7fa5,
      map: bgTex,
    })

    // 逐一处理场景子节点
    this.scene.children.forEach(child => {
      // 始终保留环境光
      if (child instanceof THREE.AmbientLight) return
      // 子场景不动
      if (child.userData?.isSubScene) return

      // 灯光组 — 匹配原始每栋楼的灯光配置
      if (child.name === 'lightGroup') {
        this.adjustLightsForDrillDown(buildingName, child)
        return
      }

      // 地形 — 半透明 + 地形01 换贴图
      if (child.name === '地形') {
        child.traverse(c => {
          if (!(c instanceof THREE.Mesh)) return
          this.terrainMaterialBackup.set(c.id, {
            material: c.material,
            posY: c.name === '地形01' ? c.position.y : undefined,
          })
          if (c.name === '地形01') {
            c.material = bgMat
            c.material.opacity = 1
            c.position.y = 4
          } else {
            c.material = c.material.clone()
            c.material.transparent = true
            c.material.opacity = 0.1
          }
        })
        return
      }

      // 不需要文件的子场景 — 保留已有模型
      if (buildingName === '地磅' && child.name === '地磅') return
      if (buildingName === '尾矿池单独场景' && child.name === '尾矿池单独场景')
        return

      child.visible = false
    })

    // 加载或显示子场景模型
    if (subConfig.file) {
      const cached = this.subSceneCache.get(buildingName)
      if (cached) {
        cached.visible = true
      } else {
        const group = await this.loadSubScene(subConfig)
        this.subSceneCache.set(buildingName, group)
      }
    }

    // 飞入相机
    this.moveCamera(subConfig.cameraTarget, subConfig.cameraPosition, 2000)

    this.emit('drillDown', buildingName)
  }

  /** 从子场景返回总览(匹配原始 callBackOne) */
  returnToOverview(): void {
    if (this.currentLevel === 1) return
    this.currentLevel = 1
    this.clearLabels()

    // 隐藏所有子场景
    this.subSceneCache.forEach(g => {
      g.visible = false
    })

    // 恢复全部场景子节点
    this.scene.children.forEach(child => {
      if (child.userData?.isSubScene) return
      child.visible = true

      // 恢复地形材质
      if (child.name === '地形') {
        child.traverse(c => {
          if (!(c instanceof THREE.Mesh)) return
          const backup = this.terrainMaterialBackup.get(c.id)
          if (backup) {
            c.material = backup.material
            if (backup.posY !== undefined) c.position.y = 0
          }
          if (!Array.isArray(c.material)) {
            c.material.opacity = 1
            c.material.transparent = false
          }
          if (c.name?.includes('周围空盒子')) {
            ;(c.material as THREE.Material & { opacity: number }).opacity = 0.3
            ;(
              c.material as THREE.Material & { transparent: boolean }
            ).transparent = true
            ;(c.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
          }
        })
        this.terrainMaterialBackup.clear()
      }

      // 恢复灯光
      if (child.name === 'lightGroup') {
        child.traverse(c => {
          c.visible = true
          if (c instanceof THREE.PointLight) {
            if (c.name === 'point1') {
              c.position.set(80, 90, -180)
              c.intensity = 0
            } else if (c.name === 'point2') {
              c.position.set(180, 90, -80)
              c.intensity = 0
            }
          }
        })
      }
    })

    // 管道保持隐藏
    PIPE_MODELS.forEach(p => {
      const obj = this.scene.getObjectByName(p.name)
      if (obj) obj.visible = false
    })

    // 飞回保存的视角
    if (this.savedCameraPos && this.savedControlsTarget) {
      this.moveCamera(
        {
          x: this.savedControlsTarget.x,
          y: this.savedControlsTarget.y,
          z: this.savedControlsTarget.z,
        },
        {
          x: this.savedCameraPos.x,
          y: this.savedCameraPos.y,
          z: this.savedCameraPos.z,
        },
        2000
      )
    } else {
      this.resetCamera()
    }

    this.savedCameraPos = null
    this.savedControlsTarget = null
    this.emit('returnOverview')
  }

  // ==================== 能源管道可视化(匹配原始 能源-X 逻辑) ====================

  /** 显示能源覆盖 */
  showEnergyOverlay(type: string): void {
    // 先还原
    if (this.energyActive) this.hideEnergyOverlay()
    this.energyActive = true

    // 确定要展示的管道和建筑
    let pipesToShow: string[]
    let buildingsToShow: Set<string>

    if (type === '总览') {
      pipesToShow = PIPE_MODELS.map(p => p.name)
      buildingsToShow = new Set<string>()
      Object.values(ENERGY_MAP).forEach(m =>
        m.buildings.forEach(b => buildingsToShow.add(b))
      )
    } else {
      const mapping = ENERGY_MAP[type]
      if (!mapping) return
      pipesToShow = [mapping.pipe]
      buildingsToShow = new Set(mapping.buildings)
    }

    const pipeSet = new Set(pipesToShow)

    // 创建半透明地形材质
    const bgTex = this.textureLoader.load(
      `${this.config.textureBasePath}bg-tuan.png`
    )
    bgTex.repeat.set(200, 200)
    bgTex.wrapS = THREE.RepeatWrapping
    bgTex.wrapT = THREE.RepeatWrapping
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x6d7fa5,
      map: bgTex,
      transparent: true,
      opacity: 0.2,
    })

    this.scene.children.forEach(child => {
      if (child instanceof THREE.AmbientLight) return
      if (child.userData?.isSubScene) return

      // 灯光组 — 仅保留平行光和聚光灯
      if (child.name === 'lightGroup') {
        child.traverse(c => {
          if (c instanceof THREE.PointLight) c.visible = false
        })
        return
      }

      // 地形半透明
      if (child.name === '地形') {
        child.traverse(c => {
          if (!(c instanceof THREE.Mesh)) return
          if (!this.terrainMaterialBackup.has(c.id)) {
            this.terrainMaterialBackup.set(c.id, {
              material: c.material,
              posY: c.name === '地形01' ? c.position.y : undefined,
            })
          }
          if (c.name === '地形01') {
            c.material = bgMat
            c.position.y = 4
          } else {
            c.material = c.material.clone()
            c.material.transparent = true
            c.material.opacity = 0.1
          }
        })
        return
      }

      // 管道
      if (pipeSet.has(child.name)) {
        child.visible = true
        return
      }

      // 相关建筑
      if (buildingsToShow.has(child.name)) {
        child.visible = true
        return
      }

      // 其余隐藏
      child.visible = false
    })
  }

  /** 关闭能源覆盖 */
  hideEnergyOverlay(): void {
    if (!this.energyActive) return
    this.energyActive = false

    // 恢复全部可见性
    this.scene.children.forEach(child => {
      if (child.userData?.isSubScene) return
      child.visible = true

      if (child.name === '地形') {
        child.traverse(c => {
          if (!(c instanceof THREE.Mesh)) return
          const backup = this.terrainMaterialBackup.get(c.id)
          if (backup) {
            c.material = backup.material
            if (backup.posY !== undefined) c.position.y = 0
          }
          if (!Array.isArray(c.material)) {
            c.material.opacity = 1
            c.material.transparent = false
          }
          if (c.name?.includes('周围空盒子')) {
            ;(c.material as THREE.Material & { opacity: number }).opacity = 0.3
            ;(
              c.material as THREE.Material & { transparent: boolean }
            ).transparent = true
            ;(c.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
          }
        })
        this.terrainMaterialBackup.clear()
      }

      if (child.name === 'lightGroup') {
        child.traverse(c => {
          c.visible = true
          if (c instanceof THREE.PointLight) c.intensity = 0
        })
      }
    })

    // 管道 + 子场景隐藏
    PIPE_MODELS.forEach(p => this.setModelVisible(p.name, false))
    this.subSceneCache.forEach(g => {
      g.visible = false
    })
  }

  // ==================== 标签系统 ====================

  /** 显示总览建筑标签 */
  showBuildingLabels(): void {
    this.clearLabels()
    BUILDING_LABELS.forEach(cfg => {
      const hasDrill = !!SUB_SCENES[cfg.name]
      const el = document.createElement('div')
      el.className = 'building-label'
      if (hasDrill) {
        el.innerHTML = `
          <div class="building-label__tag building-label__tag--drill">
            <span class="building-label__text">${cfg.name}</span>
            <span class="building-label__drill-icon">▶</span>
          </div>
          <div class="building-label__stem building-label__stem--drill"></div>
          <div class="building-label__dot building-label__dot--drill">
            <div class="building-label__ring"></div>
          </div>
        `
      } else {
        el.innerHTML = `
          <div class="building-label__tag">
            <span class="building-label__text">${cfg.name}</span>
          </div>
          <div class="building-label__stem"></div>
          <div class="building-label__dot"></div>
        `
      }

      // 可下钻标签 — 确保可点击
      if (hasDrill) {
        el.style.pointerEvents = 'auto'
        el.style.cursor = 'pointer'
        el.addEventListener('click', (e: MouseEvent) => {
          e.stopPropagation()
          this.emit('labelClick', { name: cfg.name, position: cfg.position })
        })
      }

      const obj = new CSS2DObject(el)
      obj.name = `label_${cfg.name}`
      obj.position.set(cfg.position.x, cfg.position.y, cfg.position.z)
      // 不要覆盖 el 的 pointerEvents (CSS2DObject.element === el)
      this.labels.push(obj)
      this.scene.add(obj)
    })
  }

  /** 添加事件标签点(二级环保数据) */
  addEventLabels(events: EventPoint[]): void {
    this.clearLabels()
    events.forEach(evt => {
      const label = this.createEventLabel(evt)
      this.labels.push(label)
      this.scene.add(label)
    })
  }

  /** 清除所有标签 */
  clearLabels(): void {
    this.labels.forEach(label => {
      this.scene.remove(label)
      label.element.remove()
    })
    this.labels = []
  }

  // ==================== 日夜切换 ====================

  /** 切换日夜模式 */
  switchDayNight(mode: DayNightMode): void {
    const files =
      mode === 'day' ? this.config.daySkybox : this.config.nightSkybox
    const tex = this.cubeTextureLoader
      .setPath(this.config.skyboxPath)
      .load(files)

    tex.colorSpace = THREE.SRGBColorSpace
    tex.mapping = THREE.CubeRefractionMapping

    if (this.scene.background instanceof THREE.CubeTexture) {
      this.scene.background.dispose()
    }
    this.scene.background = tex

    const targetIntensity = mode === 'day' ? 1 : 0.3
    gsap.to(this.ambientLight, {
      intensity: targetIntensity,
      duration: 2,
      onUpdate: () => {
        this.lightGroup.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.PointLight) {
            child.intensity =
              mode === 'day'
                ? (1 - this.ambientLight.intensity) * 2
                : (1.1 - this.ambientLight.intensity) * 2
          } else if (child instanceof THREE.DirectionalLight) {
            child.intensity = this.ambientLight.intensity
          }
          if (child.name === 'spotLight' && child instanceof THREE.SpotLight) {
            child.intensity =
              mode === 'day'
                ? this.ambientLight.intensity * 2
                : this.ambientLight.intensity * 3 + 0.2
          }
        })
      },
    })
  }

  // ==================== 相机控制 ====================

  /** 平滑移动相机(使用 gsap 驱动, 无需 render loop 手动 update) */
  moveCamera(target: Vec3Like, position: Vec3Like, duration = 2000): void {
    this.controls.enabled = false
    const cam = {
      px: this.camera.position.x,
      py: this.camera.position.y,
      pz: this.camera.position.z,
      tx: this.controls.target.x,
      ty: this.controls.target.y,
      tz: this.controls.target.z,
    }
    gsap.to(cam, {
      px: position.x,
      py: position.y,
      pz: position.z,
      tx: target.x,
      ty: target.y,
      tz: target.z,
      duration: duration / 1000,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.camera.position.set(cam.px, cam.py, cam.pz)
        this.controls.target.set(cam.tx, cam.ty, cam.tz)
        this.controls.update()
      },
      onComplete: () => {
        this.controls.enabled = true
      },
    })
  }

  /** 重置到默认视角 */
  resetCamera(duration = 2000): void {
    this.moveCamera(
      this.config.cameraTarget,
      this.config.cameraPosition,
      duration
    )
  }

  // ==================== 通用模型操作 ====================

  /** 按名称显示/隐藏模型 */
  setModelVisible(name: string, visible: boolean): void {
    const obj = this.scene.getObjectByName(name)
    if (obj) obj.visible = visible
  }

  /** 获取当前相机状态 */
  getCameraState(): { position: number[]; target: number[] } {
    return {
      position: this.camera.position.toArray(),
      target: this.controls.target.toArray(),
    }
  }

  /** 恢复相机状态 */
  restoreCameraState(
    state: { position: number[]; target: number[] },
    duration = 1000
  ): void {
    this.moveCamera(
      { x: state.target[0], y: state.target[1], z: state.target[2] },
      { x: state.position[0], y: state.position[1], z: state.position[2] },
      duration
    )
  }

  // ---- 事件系统 ----

  /** 监听事件 */
  on(event: EngineEvent, handler: EventHandler): void {
    if (!this.eventMap.has(event)) this.eventMap.set(event, new Set())
    this.eventMap.get(event)!.add(handler)
  }

  /** 取消监听 */
  off(event: EngineEvent, handler: EventHandler): void {
    this.eventMap.get(event)?.delete(handler)
  }

  /** 触发事件 */
  private emit(event: EngineEvent, ...args: any[]): void {
    this.eventMap.get(event)?.forEach(fn => fn(...args))
  }

  /** 销毁引擎 */
  dispose(): void {
    if (this.disposed) return
    this.disposed = true

    this.clearLabels()
    this.disposeCallbacks.forEach(cb => cb())
    this.disposeCallbacks = []
    cancelAnimationFrame(this.animFrameId)

    this.subSceneCache.forEach(group => {
      group.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose()
          const mat = obj.material
          if (Array.isArray(mat)) mat.forEach(m => m.dispose())
          else mat?.dispose()
        }
      })
    })
    this.subSceneCache.clear()
    this.terrainMaterialBackup.clear()

    this.scene.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose()
        const mat = obj.material
        if (Array.isArray(mat)) mat.forEach(m => m.dispose())
        else mat?.dispose()
      }
    })

    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.controls.dispose()
    this.dracoLoader.dispose()

    try {
      this.container?.removeChild(this.renderer.domElement)
    } catch {
      /* already removed */
    }
    try {
      this.css2dRenderer.domElement.parentElement?.removeChild(
        this.css2dRenderer.domElement
      )
    } catch {
      /* already removed */
    }
    this.eventMap.clear()
  }

  // ==================== 内部方法 ====================

  /** 初始化场景 */
  private initScene(): void {
    this.scene = new THREE.Scene()
    this.cubeTextureLoader = new THREE.CubeTextureLoader()
    const tex = this.cubeTextureLoader
      .setPath(this.config.skyboxPath)
      .load(this.config.daySkybox)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.mapping = THREE.CubeRefractionMapping
    this.scene.background = tex
  }

  /** 初始化相机 */
  private initCamera(): void {
    const w = this.container!.clientWidth || window.innerWidth
    const h = this.container!.clientHeight || window.innerHeight
    this.camera = new THREE.PerspectiveCamera(75, w / h, 1, 4000)
    const { x, y, z } = this.config.cameraPosition
    this.camera.position.set(x, y, z)
  }

  /** WebGL 渲染器 — 关闭 shadowMap (与原始一致, 提升性能) */
  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    })
    const w = this.container!.clientWidth || window.innerWidth
    const h = this.container!.clientHeight || window.innerHeight
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(w, h)
    this.renderer.domElement.style.display = 'block'
    // 原始代码未启用 shadowMap — 保持一致以获得最佳性能
    this.renderer.shadowMap.autoUpdate = false
    this.renderer.shadowMap.needsUpdate = true
  }

  /** 初始化 CSS2D 渲染器 */
  private initCSS2DRenderer(): void {
    this.css2dRenderer = new CSS2DRenderer()
    const w = this.container!.clientWidth || window.innerWidth
    const h = this.container!.clientHeight || window.innerHeight
    this.css2dRenderer.setSize(w, h)
    const s = this.css2dRenderer.domElement.style
    s.position = 'absolute'
    s.top = '0'
    s.left = '0'
    s.pointerEvents = 'none'
  }

  /** 初始化控制器 */
  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.container!)
    this.controls.enableDamping = true
    this.controls.maxDistance = 600
    this.controls.enablePan = true
    this.controls.maxPolarAngle = Math.PI / 2 - 0.25
    // 立即设置目标点, 避免初始帧朝向 (0,0,0)
    const t = this.config.cameraTarget
    this.controls.target.set(t.x, t.y, t.z)
    this.controls.update()
  }

  /** 初始化灯光 */
  private initLights(): void {
    this.lightGroup = new THREE.Group()
    this.lightGroup.name = 'lightGroup'

    const dirLight = new THREE.DirectionalLight(0xfcfcee, 0.3)
    dirLight.name = 'dirLight'
    dirLight.position.set(60, 400, -380)
    this.lightGroup.add(dirLight)

    const spotLight = new THREE.SpotLight(0xfcfcee, 2.0)
    spotLight.name = 'spotLight'
    spotLight.position.set(60, 1600, -2880)
    spotLight.castShadow = true
    spotLight.shadow.mapSize.set(512, 512)
    spotLight.angle = Math.PI / 3
    spotLight.shadow.camera.near = 10
    spotLight.shadow.camera.far = 4000
    spotLight.shadow.camera.fov = 50
    this.lightGroup.add(spotLight)

    const pointPositions = [
      { x: 80, y: 90, z: -180 },
      { x: 180, y: 90, z: -80 },
      { x: 40, y: 90, z: 300 },
      { x: 80, y: 90, z: 100 },
      { x: 220, y: 90, z: 80 },
      { x: 220, y: 90, z: 320 },
      { x: 180, y: 90, z: 220 },
    ]
    pointPositions.forEach((pos, i) => {
      const pl = new THREE.PointLight(0xf88d1e, 0, 100)
      pl.position.set(pos.x, pos.y, pos.z)
      pl.name = `point${i + 1}`
      this.lightGroup.add(pl)
    })

    this.scene.add(this.lightGroup)

    this.ambientLight = new THREE.AmbientLight('#fff', 1)
    this.scene.add(this.ambientLight)
  }

  /** 初始化加载器 */
  private initLoaders(): void {
    this.textureLoader = new THREE.TextureLoader()
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath(this.config.dracoDecoderPath)
    this.dracoLoader.setDecoderConfig({ type: 'js' })
    this.dracoLoader.preload()

    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(this.dracoLoader)
  }

  /** 渲染循环 — 使用 requestAnimationFrame (与原始 animate.js 一致) */
  private startRenderLoop(): void {
    const animate = () => {
      if (this.disposed) return
      this.animFrameId = requestAnimationFrame(animate)
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
      this.css2dRenderer.render(this.scene, this.camera)
    }
    animate()
  }

  /** 窗口尺寸变化 */
  private handleResize(): void {
    const w = this.container?.clientWidth || window.innerWidth
    const h = this.container?.clientHeight || window.innerHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.css2dRenderer.setSize(w, h)
  }

  /** 加载单个模型 */
  private loadModel(entry: ModelEntry): Promise<void> {
    const { modelBasePath, modelOffset } = this.config
    return new Promise<void>(resolve => {
      this.gltfLoader.load(
        `${modelBasePath}${entry.file}`,
        gltf => {
          const model = gltf.scene
          model.position.set(modelOffset.x, modelOffset.y, modelOffset.z)
          model.name = entry.name

          if (entry.materialHandler === 'transparent') {
            model.traverse((item: THREE.Object3D) => {
              if (item instanceof THREE.Mesh) {
                item.castShadow = true
                item.receiveShadow = true
                item.material.transparent = true
                item.material.opacity = 0.1
                item.material.side = THREE.DoubleSide
              }
            })
          } else if (entry.materialHandler === 'shadow') {
            model.traverse((item: THREE.Object3D) => {
              if (item instanceof THREE.Mesh) {
                item.castShadow = true
                item.receiveShadow = true
              }
            })
          }

          this.scene.add(model)
          resolve()
        },
        undefined,
        () => resolve()
      )
    })
  }

  /** 加载子场景模型 */
  private loadSubScene(config: SubSceneConfig): Promise<THREE.Group> {
    return new Promise(resolve => {
      this.gltfLoader.load(
        `${this.config.modelBasePath}${config.file}`,
        gltf => {
          const model = gltf.scene
          model.position.set(config.offset.x, config.offset.y, config.offset.z)
          model.name = config.name
          model.userData = { isSubScene: true }
          this.scene.add(model)
          resolve(model)
        },
        undefined,
        () => resolve(new THREE.Group())
      )
    })
  }

  /** 匹配原始 changeIf 中每栋楼的灯光配置 */
  private adjustLightsForDrillDown(
    buildingName: string,
    lightGroup: THREE.Object3D
  ): void {
    const LIGHT_MAP: Record<
      string,
      {
        point1?: { x: number; y: number; z: number; intensity: number }
        point2?: { x: number; y: number; z: number; intensity: number }
      }
    > = {
      原料大棚: {
        point1: { x: 190, y: 90, z: 340, intensity: 1 },
        point2: { x: 190, y: 90, z: 240, intensity: 1 },
      },
      造球室: { point1: { x: 180, y: 120, z: 80, intensity: 3 } },
      焙烧车间: { point1: { x: 210, y: 120, z: 80, intensity: 3 } },
      选矿车间: { point1: { x: 76, y: 120, z: 300, intensity: 3 } },
      干燥室: { point1: { x: 76, y: 120, z: 300, intensity: 3 } },
      配料室: { point1: { x: 40, y: 120, z: 30, intensity: 3 } },
      尾矿池单独场景: { point1: { x: 168, y: 120, z: 220, intensity: 3 } },
    }

    const cfg = LIGHT_MAP[buildingName]
    lightGroup.traverse(child => {
      if (child === lightGroup) return
      this.applyDrillLightConfig(child, cfg)
    })
  }

  /** 为下钻设置单个灯光 */
  private applyDrillLightConfig(
    child: THREE.Object3D,
    cfg?: {
      point1?: { x: number; y: number; z: number; intensity: number }
      point2?: { x: number; y: number; z: number; intensity: number }
    }
  ): void {
    // 隐藏所有非 dirLight/spotLight 灯光
    if (
      child instanceof THREE.Light &&
      child.name !== 'dirLight' &&
      child.name !== 'spotLight'
    ) {
      child.visible = false
    }
    // 按配置开启点光源
    if (cfg?.point1 && child.name === 'point1') {
      child.visible = true
      ;(child as THREE.PointLight).position.set(
        cfg.point1.x,
        cfg.point1.y,
        cfg.point1.z
      )
      ;(child as THREE.PointLight).intensity = cfg.point1.intensity
    }
    if (cfg?.point2 && child.name === 'point2') {
      child.visible = true
      ;(child as THREE.PointLight).position.set(
        cfg.point2.x,
        cfg.point2.y,
        cfg.point2.z
      )
      ;(child as THREE.PointLight).intensity = cfg.point2.intensity
    }
  }

  /** 创建事件标签 */
  private createEventLabel(event: EventPoint): CSS2DObject {
    const el = document.createElement('div')
    el.className = 'factory-label'
    el.innerHTML = `
      <div class="factory-label__content">
        <h3>${event.value}</h3>
        ${
          event.num1
            ? `<div class="factory-label__pm">
              <span>TSP</span><span class="num">${event.num1}mg/m³</span>
            </div>
            <div class="factory-label__pm">
              <span>PM2.5</span><span class="num">${event.num2}mg/m³</span>
            </div>
            <div class="factory-label__pm">
              <span>PM10</span><span class="num">${event.num3}mg/m³</span>
            </div>`
            : ''
        }
      </div>
    `
    el.style.pointerEvents = 'auto'
    el.style.cursor = 'pointer'
    el.addEventListener('click', () => this.emit('labelClick', event))

    const obj = new CSS2DObject(el)
    obj.name = event.value
    obj.position.set(event.position.x / 5 + 120, 100, event.position.y / 5 - 30)
    return obj
  }
}
