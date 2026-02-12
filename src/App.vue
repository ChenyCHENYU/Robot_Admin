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
    :hljs="hljs"
    class="global-config-provider"
  >
    <!-- 添加 NGlobalStyle 同步 body 样式 -->
    <NGlobalStyle />

    <NLoadingBarProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <NMessageProvider>
            <RouterView />
            <!-- 全局重新登录弹框 -->
            <C_ReLoginDialog
              v-model="reLoginStore.visible"
              :username="reLoginStore.username"
              @success="handleReLoginSuccess"
            />
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
  import { s_reLoginStore } from '@/stores/reLogin'
  import { removeLoading } from '@/plugins/loading'
  import '@/lib/version'

  // 获取 hljs 实例用于 NCode 组件
  const { hljs } = window

  const themeStore = useThemeStore()
  const reLoginStore = s_reLoginStore()

  // 重新登录成功处理
  const handleReLoginSuccess = () => {
    reLoginStore.hide()
  }

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
