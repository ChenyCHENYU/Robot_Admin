<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-06 14:07:01
 * @FilePath: \Robot_Admin\src\App.vue
 * @Description: 根入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NConfigProvider
    :theme="themeStore.currentTheme"
    :theme-overrides="themeStore.themeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
    class="global-config-provider"
  >
    <NLoadingBarProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <NMessageProvider>
            <RouterView />
          </NMessageProvider>
        </NNotificationProvider>
      </NDialogProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
  import { onMounted, nextTick } from 'vue'
  import { zhCN, dateZhCN } from 'naive-ui/es' // 中文语言包
  import { useThemeStore } from '@/stores/theme'
  import { removeLoading } from '@/plugins/loading'
  import '@/lib/version'

  const themeStore = useThemeStore()

  // 初始化
  onMounted(async () => {
    themeStore.init()

    // 确保DOM完全渲染后再移除加载动画
    await nextTick()

    // 使用 requestAnimationFrame 确保浏览器完成渲染
    requestAnimationFrame(() => {
      removeLoading(200) // 200ms 延迟，让用户感知加载完成
    })
  })
</script>
