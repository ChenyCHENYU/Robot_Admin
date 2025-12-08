<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center relative overflow-hidden"
  >
    <!-- 背景动画粒子 -->
    <div class="absolute inset-0">
      <div
        v-for="i in 20"
        :key="i"
        class="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
        :style="{
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDelay: Math.random() * 2 + 's',
          animationDuration: 2 + Math.random() * 3 + 's',
        }"
      ></div>
    </div>

    <!-- 主要内容 -->
    <div class="text-center z-10 px-4">
      <!-- 404大号文字 -->
      <div class="relative mb-8">
        <h1
          class="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse mb-4"
        >
          404
        </h1>
        <!-- 光效 -->
        <div
          class="absolute inset-0 text-8xl md:text-9xl font-bold text-cyan-400 opacity-20 blur-2xl animate-pulse"
        >
          404
        </div>
      </div>

      <!-- 图标和描述 -->
      <div class="mb-8">
        <div
          class="i-mdi-robot-confused text-6xl text-purple-400 mb-4 animate-bounce mx-auto"
        ></div>
        <h2 class="text-2xl md:text-3xl font-semibold text-white mb-4">
          页面走丢了
        </h2>
        <p class="text-gray-300 text-lg max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移除
        </p>
      </div>

      <!-- 倒计时和按钮 -->
      <div class="space-y-6">
        <div class="flex items-center justify-center space-x-2 text-cyan-300">
          <div class="i-mdi-timer-outline text-xl"></div>
          <span class="text-lg">{{ countdown }}秒后自动跳转首页</span>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="goHome"
            class="group relative px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold text-white transition-all duration-300 hover:from-cyan-400 hover:to-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          >
            <div class="flex items-center space-x-2">
              <div class="i-mdi-home text-xl"></div>
              <span>返回首页</span>
            </div>
            <div
              class="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            ></div>
          </button>

          <button
            @click="goBack"
            class="group relative px-8 py-3 border-2 border-purple-400 rounded-lg font-semibold text-purple-400 transition-all duration-300 hover:bg-purple-400 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-400/25"
          >
            <div class="flex items-center space-x-2">
              <div class="i-mdi-arrow-left text-xl"></div>
              <span>返回上页</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 装饰性几何图形 -->
    <div
      class="absolute top-20 left-20 w-32 h-32 border-2 border-purple-400/30 rounded-full animate-spin"
    ></div>
    <div
      class="absolute bottom-20 right-20 w-24 h-24 border-2 border-cyan-400/30 rotate-45 animate-pulse"
    ></div>
    <div
      class="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-lg rotate-45 animate-bounce"
    ></div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: '404-page',
  })

  const router = useRouter()
  const countdown = ref(5)
  let timer: number | null = null

  const startCountdown = () => {
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        goHome()
      }
    }, 1000)
  }

  const goHome = () => {
    if (timer) {
      clearInterval(timer)
    }
    router.push('/')
  }

  const goBack = () => {
    if (timer) {
      clearInterval(timer)
    }
    router.back()
  }

  onMounted(() => {
    startCountdown()
  })

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
    }
  })
</script>

<style scoped>
  /* 自定义动画 */
  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
</style>
