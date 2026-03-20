<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-02
 * @Description: 组件预览页布局 - 无需登录的独立展示布局
 * 用于文档站 iframe 嵌入，不包含 admin layout（侧边栏/头部）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="preview-layout">
    <!-- 错误展示 -->
    <div
      v-if="error"
      class="preview-error"
    >
      <div class="error-icon">⚠️</div>
      <h2>组件加载失败</h2>
      <p>{{ error.message }}</p>
      <button
        class="retry-btn"
        @click="handleRetry"
        >重新加载</button
      >
    </div>

    <!-- 正常路由内容 -->
    <RouterView
      v-else
      v-slot="{ Component, route }"
    >
      <Suspense>
        <template #default>
          <component
            :is="Component"
            :key="route.path"
          />
        </template>
        <template #fallback>
          <div class="preview-loading">
            <NSpin size="large" />
            <span>组件加载中…</span>
          </div>
        </template>
      </Suspense>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
  import { onErrorCaptured, ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const error = ref<Error | null>(null)

  onErrorCaptured((err: Error) => {
    error.value = err
    console.error('[PreviewLayout] 组件加载异常:', err)
    return false // 阻止错误继续传播
  })

  /** 重试 - 刷新当前路由 */
  const handleRetry = () => {
    error.value = null
    router.go(0)
  }
</script>

<style scoped>
  .preview-layout {
    padding: 24px;
    min-height: 100vh;
    background: var(--body-color, #fff);
    color: var(--text-color-1, #333);
    overflow-y: auto;
  }

  .preview-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 60vh;
    color: var(--text-color-3, #999);
    font-size: 14px;
  }

  .preview-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    color: var(--text-color-2, #666);
  }

  .preview-error .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .preview-error h2 {
    margin: 0 0 8px;
    font-size: 20px;
    color: var(--text-color-1, #333);
  }

  .preview-error p {
    margin: 0 0 24px;
    font-size: 14px;
    color: var(--text-color-3, #999);
    max-width: 400px;
    word-break: break-all;
  }

  .retry-btn {
    padding: 8px 24px;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 6px;
    background: var(--button-color-2, #f5f5f5);
    color: var(--text-color-1, #333);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .retry-btn:hover {
    background: var(--primary-color, #1677ff);
    color: #fff;
    border-color: var(--primary-color, #1677ff);
  }
</style>
