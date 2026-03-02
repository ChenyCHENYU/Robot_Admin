<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-02
 * @Description: 组件预览页布局 - 无需登录的独立展示布局
 * 用于文档站 iframe 嵌入，不包含 admin layout（侧边栏/头部）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="preview-layout">
    <RouterView v-slot="{ Component }">
      <Suspense>
        <template #default>
          <component :is="Component" />
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

  const error = ref<Error | null>(null)

  onErrorCaptured((err: Error) => {
    error.value = err
    console.error('[PreviewLayout] 组件加载异常:', err)
    return false // 阻止错误继续传播
  })
</script>

<style scoped>
  .preview-layout {
    padding: 24px;
    min-height: 100vh;
    background: var(--body-color, #fff);
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
</style>
