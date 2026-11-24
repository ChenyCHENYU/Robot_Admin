<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\login\components\Spline.vue
 * @Description: 登录页 Spline 场景加载及资源清理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 -->
<template>
  <ParentSize
    :parent-size-styles="parentSizeStyles"
    :debounce-time="50"
    v-bind="$attrs"
  >
    <template #default>
      <canvas
        ref="canvasRef"
        :style="canvasStyle"
      />
      <slot v-if="isLoading" />
    </template>
  </ParentSize>
  <div class="login-logo"></div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'LoginSplineScene' })
  import { ref, onMounted, onUnmounted, computed, shallowRef } from 'vue'
  import type { Application as ApplicationType } from '@splinetool/runtime'
  import ParentSize from './ParentSize.vue'

  const props = defineProps({
    scene: {
      type: String,
      required: true,
    },
    onLoad: Function,
    renderOnDemand: {
      type: Boolean,
      default: true,
    },
    paused: {
      type: Boolean,
      default: false,
    },
    style: Object,
  })

  const emit = defineEmits(['error'])

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const isLoading = ref(false)
  const splineApp = shallowRef<ApplicationType | null>(null)

  const parentSizeStyles = computed(() => ({
    overflow: 'hidden',
    ...props.style,
  }))

  const canvasStyle = {
    display: 'block',
    width: '100%',
    height: '100%',
  }

  const CACHE_READ_ERROR = /ERR_CACHE_READ_FAILURE/
  let initGeneration = 0

  /** 拦截 Spline 运行时引发的已知缓存读取拒绝。 */
  function ignoreCacheRejection(event: PromiseRejectionEvent) {
    const message = String(event.reason?.message || event.reason || '')
    if (CACHE_READ_ERROR.test(message)) event.preventDefault()
  }

  /** 同一缓存读取错误也可能由浏览器错误事件报告。 */
  function ignoreCacheError(event: ErrorEvent) {
    const message = String(event.message || event.error?.message || '')
    if (CACHE_READ_ERROR.test(message)) event.preventDefault()
  }

  /** 重新初始化或卸载时释放当前场景实例。 */
  function disposeSpline() {
    if (!splineApp.value) return
    splineApp.value.dispose()
    splineApp.value = null
  }

  /** 本次初始化仍有效时，为首次加载失败补一次绕过缓存的重试。 */
  async function loadScene(app: ApplicationType, generation: number) {
    try {
      await app.load(props.scene)
    } catch {
      if (generation !== initGeneration) return
      const separator = props.scene.includes('?') ? '&' : '?'
      await app.load(`${props.scene}${separator}t=${Date.now()}`)
    }
  }

  /** 按需初始化场景，过期任务不能覆盖或恢复已卸载的画布。 */
  async function initSpline() {
    if (!canvasRef.value) return

    const generation = ++initGeneration
    const canvas = canvasRef.value
    isLoading.value = true

    try {
      disposeSpline()

      // ⚡ 动态导入 Spline Runtime（4.4MB），避免阻塞首屏 JS 解析
      const { Application } = await import('@splinetool/runtime')
      if (generation !== initGeneration || !canvasRef.value) return

      const app = new Application(canvas, {
        renderOnDemand: props.renderOnDemand,
      })
      splineApp.value = app

      await loadScene(app, generation)
      if (generation !== initGeneration) return
      isLoading.value = false
      if (props.paused) app.stop()
      props.onLoad?.(app)
    } catch (err) {
      if (generation !== initGeneration) return
      console.error('Spline initialization error:', err)
      emit('error', err)
      isLoading.value = false
    }
  }

  // ===== 页面可见性——Tab 切走时暂停 Spline，切回时恢复 =====
  /** 后台标签页或显式暂停时停止场景渲染。 */
  function syncPlayback() {
    if (!splineApp.value) return
    if (document.hidden || props.paused) {
      splineApp.value.stop()
    } else {
      splineApp.value.play()
    }
  }

  watch(() => props.paused, syncPlayback, { flush: 'post' })

  onMounted(() => {
    window.addEventListener('unhandledrejection', ignoreCacheRejection)
    window.addEventListener('error', ignoreCacheError)
    document.addEventListener('visibilitychange', syncPlayback)
    initSpline()
  })

  onUnmounted(() => {
    initGeneration++
    window.removeEventListener('unhandledrejection', ignoreCacheRejection)
    window.removeEventListener('error', ignoreCacheError)
    document.removeEventListener('visibilitychange', syncPlayback)
    disposeSpline()
  })
</script>
