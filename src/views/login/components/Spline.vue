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
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { Application } from '@splinetool/runtime'
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
    style: Object,
  })

  const emit = defineEmits(['error'])

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const isLoading = ref(false)
  const splineApp = ref<Application | null>(null)

  const parentSizeStyles = computed(() => ({
    overflow: 'hidden',
    ...props.style,
  }))

  const canvasStyle = computed(() => ({
    display: 'block',
    width: '100%',
    height: '100%',
  }))

  // ===== 拦截 Spline / 浏览器扩展 的连接错误 =====
  const CONNECTION_RE =
    /Could not establish connection|Receiving end does not exist|ERR_CACHE_READ_FAILURE/
  let _rejHandler: ((e: PromiseRejectionEvent) => void) | null = null
  let _errHandler: ((e: ErrorEvent) => void) | null = null

  function installErrorGuard() {
    _rejHandler = (e: PromiseRejectionEvent) => {
      const msg = String(e.reason?.message || e.reason || '')
      if (CONNECTION_RE.test(msg)) e.preventDefault()
    }
    _errHandler = (e: ErrorEvent) => {
      const msg = String(e.message || e.error?.message || '')
      if (CONNECTION_RE.test(msg)) e.preventDefault()
    }
    window.addEventListener('unhandledrejection', _rejHandler)
    window.addEventListener('error', _errHandler)
  }

  function removeErrorGuard() {
    if (_rejHandler) {
      window.removeEventListener('unhandledrejection', _rejHandler)
      _rejHandler = null
    }
    if (_errHandler) {
      window.removeEventListener('error', _errHandler)
      _errHandler = null
    }
  }

  async function initSpline() {
    if (!canvasRef.value) return

    isLoading.value = true

    // 过滤 Spline 的版本兼容性警告（仅在初始化期间）
    const originalWarn = console.warn
    const originalLog = console.log
    const filterFn = (...args: any[]) => {
      if (
        args.some(
          arg => typeof arg === 'string' && arg.includes('updating from')
        )
      )
        return
      return true
    }
    console.warn = (...args) => {
      if (filterFn(...args)) originalWarn.apply(console, args)
    }
    console.log = (...args) => {
      if (filterFn(...args)) originalLog.apply(console, args)
    }

    try {
      if (splineApp.value) {
        splineApp.value.dispose()
        splineApp.value = null
      }

      splineApp.value = new Application(canvasRef.value, {
        renderOnDemand: props.renderOnDemand,
      })

      try {
        await splineApp.value.load(props.scene)
      } catch {
        // 重试：带 cache-buster
        const retryUrl = props.scene.includes('?')
          ? `${props.scene}&t=${Date.now()}`
          : `${props.scene}?t=${Date.now()}`
        await splineApp.value.load(retryUrl)
      }

      isLoading.value = false
      props.onLoad?.(splineApp.value)

      // 加载后立即冻结为静态画面，避免持续 60fps 消耗 GPU
      splineApp.value.stop()
    } catch (err) {
      console.error('Spline initialization error:', err)
      emit('error', err)
      isLoading.value = false
    } finally {
      // 一定要恢复 console，避免全局污染
      console.warn = originalWarn
      console.log = originalLog
    }
  }

  onMounted(() => {
    installErrorGuard()
    initSpline()
  })

  onUnmounted(() => {
    removeErrorGuard()
    // 销毁 Spline 实例
    if (splineApp.value) {
      splineApp.value.dispose()
      splineApp.value = null
    }
  })
</script>
