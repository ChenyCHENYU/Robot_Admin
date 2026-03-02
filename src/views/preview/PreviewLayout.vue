<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-02
 * @Description: 组件预览页布局 - 无需登录的独立展示布局
 * 用于文档站 iframe 嵌入，不包含 admin layout（侧边栏/头部）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="preview-layout">
    <RouterView />
  </div>
</template>

<style scoped>
  .preview-layout {
    padding: 24px;
    min-height: 100vh;
    background: var(--body-color, #fff);
    overflow-y: auto;
  }
</style>
