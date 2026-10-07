<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\views\error-page\components\c_errorPage\index.vue
 * @Description: 四类异常页共享布局与稳定装饰数据，保留独立配色和恢复操作
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    class="error-screen min-h-screen flex items-center justify-center relative overflow-hidden"
    :class="`error-screen--${code}`"
  >
    <!-- 背景动画粒子 -->
    <div class="absolute inset-0">
      <div
        v-for="(particle, index) in particles"
        :key="index"
        class="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
        :style="particle"
        data-error-particle
        aria-hidden="true"
      ></div>
    </div>

    <!-- 主要内容 -->
    <div class="text-center z-10 px-4">
      <!-- 404大号文字 -->
      <div class="relative mb-8">
        <h1
          class="error-screen__code text-8xl md:text-9xl font-bold text-transparent bg-clip-text animate-pulse mb-4"
        >
          {{ code }}
        </h1>
        <!-- 光效 -->
        <div
          class="error-screen__glow absolute inset-0 text-8xl md:text-9xl font-bold opacity-20 blur-2xl animate-pulse"
        >
          {{ code }}
        </div>
      </div>

      <!-- 图标和描述 -->
      <div class="mb-8">
        <div
          class="error-screen__icon text-6xl mb-4 animate-bounce mx-auto"
          :class="content.icon"
          aria-hidden="true"
        ></div>
        <h2 class="text-2xl md:text-3xl font-semibold text-white mb-4">
          {{ content.title }}
        </h2>
        <p class="text-gray-300 text-lg max-w-md mx-auto">
          {{ content.description }}
        </p>
      </div>

      <!-- 倒计时和按钮 -->
      <div class="space-y-6">
        <div
          class="error-screen__countdown flex items-center justify-center space-x-2"
        >
          <div class="i-mdi-timer-outline text-xl"></div>
          <span class="text-lg">{{ countdown }}秒后自动跳转首页</span>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="goHome"
            class="error-screen__primary group relative px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div class="flex items-center space-x-2">
              <div class="i-mdi-home text-xl"></div>
              <span>返回首页</span>
            </div>
            <div
              class="error-screen__button-glow absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            ></div>
          </button>

          <button
            v-if="code === '401' || code === '500'"
            @click="code === '401' ? goLogin() : refresh()"
            class="group relative px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            :class="
              code === '401' ? 'error-screen__login' : 'error-screen__retry'
            "
          >
            <div class="flex items-center space-x-2">
              <div
                class="text-xl"
                :class="code === '401' ? 'i-mdi-login' : 'i-mdi-refresh'"
              ></div>
              <span>{{ code === '401' ? '立即登录' : '刷新重试' }}</span>
            </div>
            <div
              class="error-screen__button-glow absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            ></div>
          </button>

          <button
            @click="goBack"
            class="error-screen__secondary group relative px-8 py-3 border-2 rounded-lg font-semibold transition-all duration-300 hover:text-white hover:scale-105 hover:shadow-lg"
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
      class="error-screen__decoration absolute top-20 left-20 w-32 h-32 border-2 rounded-full animate-spin"
    ></div>
    <div
      class="error-screen__decoration absolute bottom-20 right-20 w-24 h-24 border-2 rotate-45 animate-pulse"
    ></div>
    <div
      class="error-screen__decoration-fill absolute top-1/2 left-10 w-16 h-16 rounded-lg rotate-45 animate-bounce"
    ></div>
    <div
      v-if="content.decorations"
      class="absolute top-32 right-32 opacity-10"
      aria-hidden="true"
    >
      <div
        class="error-screen__glow text-4xl animate-pulse"
        :class="content.decorations[0]"
      ></div>
    </div>
    <div
      v-if="content.decorations"
      class="absolute bottom-32 left-32 opacity-10"
      aria-hidden="true"
    >
      <div
        class="error-screen__glow text-4xl animate-pulse"
        :class="content.decorations[1]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { errorContent, particles, type ErrorCode } from './data'
  import { useErrorPage } from './useErrorPage'

  defineOptions({ name: 'ErrorPageBase' })
  const props = defineProps<{ code: ErrorCode }>()
  const content = computed(() => errorContent[props.code])
  const { countdown, goHome, goBack, goLogin, refresh } = useErrorPage()
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
