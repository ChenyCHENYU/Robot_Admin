import { onBeforeUnmount, ref, shallowRef } from 'vue'
import {
  FactoryEngine,
  PIPE_MODELS,
  SUB_SCENES,
  type DayNightMode,
  type LoadProgress,
  type SceneConfig,
  type SceneLevel,
} from '../engine'

/**
 * 3D 工厂场景 composable
 * 封装 FactoryEngine 的完整生命周期, 包含下钻/能源/标签等状态管理
 */
export function useFactoryScene(config?: Partial<SceneConfig>) {
  const engine = shallowRef<FactoryEngine>()
  const loading = ref(true)
  const progress = ref(0)
  const progressText = ref('初始化')
  const currentModel = ref('')
  const dayNight = ref<DayNightMode>('day')
  const sceneLevel = ref<SceneLevel>(1)
  const currentBuilding = ref('')
  const energyMode = ref('')

  /** 初始化场景(单容器模式) */
  async function initScene(container: HTMLElement) {
    const inst = new FactoryEngine(config)
    engine.value = inst

    inst.init(container)

    inst.on('progress', (data: LoadProgress) => {
      progress.value = Math.round((data.loaded / data.total) * 100)
      currentModel.value = data.modelName
      progressText.value = data.loaded === data.total ? '渲染中' : '加载中'
    })

    inst.on('loaded', () => {
      loading.value = false
      progress.value = 100
      inst.showBuildingLabels()

      // 恢复上次视角 — 必须在模型加载完毕后, 否则 controls.enabled=false 会阻塞交互
      const saved = sessionStorage.getItem('factory3d_camera')
      if (saved) {
        try {
          const state = JSON.parse(saved)
          inst.restoreCameraState(state, 1500)
        } catch {
          /* ignore */
        }
      }
    })

    inst.on('drillDown', (name: string) => {
      sceneLevel.value = 2
      currentBuilding.value = name
    })

    inst.on('returnOverview', () => {
      sceneLevel.value = 1
      currentBuilding.value = ''
      inst.showBuildingLabels()
    })

    await inst.loadModels()
  }

  /** 下钻到建筑 */
  async function drillDown(buildingName: string) {
    await engine.value?.drillDown(buildingName)
  }

  /** 返回总览 */
  function returnToOverview() {
    engine.value?.returnToOverview()
  }

  /** 切换日夜 */
  function toggleDayNight() {
    dayNight.value = dayNight.value === 'day' ? 'night' : 'day'
    engine.value?.switchDayNight(dayNight.value)
  }

  /** 设置日夜模式 */
  function setDayNight(mode: DayNightMode) {
    dayNight.value = mode
    engine.value?.switchDayNight(mode)
  }

  /** 显示能源管道 */
  function showEnergy(type: string) {
    if (energyMode.value === type) {
      hideEnergy()
      return
    }
    energyMode.value = type
    engine.value?.showEnergyOverlay(type)
  }

  /** 关闭能源管道 */
  function hideEnergy() {
    energyMode.value = ''
    engine.value?.hideEnergyOverlay()
  }

  /** 重置视角 */
  function resetCamera() {
    engine.value?.resetCamera()
  }

  /** 判断建筑是否支持下钻 */
  function canDrillDown(name: string): boolean {
    return !!SUB_SCENES[name]
  }

  /** 获取管道名称列表 */
  function getPipeNames(): string[] {
    return PIPE_MODELS.map(p => p.name)
  }

  onBeforeUnmount(() => {
    // 保存相机状态
    const state = engine.value?.getCameraState()
    if (state) {
      try {
        sessionStorage.setItem('factory3d_camera', JSON.stringify(state))
      } catch {
        /* ignore */
      }
    }
    engine.value?.dispose()
  })

  return {
    engine,
    loading,
    progress,
    progressText,
    currentModel,
    dayNight,
    sceneLevel,
    currentBuilding,
    energyMode,
    initScene,
    drillDown,
    returnToOverview,
    toggleDayNight,
    setDayNight,
    showEnergy,
    hideEnergy,
    resetCamera,
    canDrillDown,
    getPipeNames,
  }
}
