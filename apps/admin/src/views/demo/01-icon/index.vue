<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 10:43:21
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-24 14:39:17
 * @FilePath: \Robot_Admin\src\views\demo\01-icon\index.vue
 * @Description: 图标组件演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="demo-container">
    <div class="demo-header">
      <NH1>图标组件场景示例</NH1>
      <p
        >支持 Iconify、UnoCSS、组件、SVG、图片等多种图标类型，默认使用 Iconify
        提供动态能力</p
      >
    </div>
    <!-- 演示区块 -->
    <section
      v-for="demo in demoSections"
      :key="demo.id"
      class="demo-section"
    >
      <div class="section-title">
        <h2>{{ demo.title }}</h2>
        <span :class="`badge badge-${demo.badge}`">{{ demo.badgeText }}</span>
      </div>

      <div class="demo-content">
        <div class="demo-preview">
          <div class="icon-list">
            <div
              v-for="icon in demo.icons"
              :key="icon.key"
              class="icon-item"
            >
              <C_Icon
                v-bind="icon.props as any"
                @click="icon.handler"
              />
              <span>{{
                typeof icon.label === 'function' ? icon.label() : icon.label
              }}</span>
            </div>
          </div>
        </div>

        <C_Code
          :language="demo.language"
          :code="demo.code"
          :show-header="false"
          :max-height="200"
        />

        <div
          v-if="demo.note"
          class="note"
          v-html="demo.note"
        ></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { createHandlers, createDemoSections } from './data'

  // 状态管理
  const loading = ref(false)
  const rotation = ref(0)
  const flipped = ref(false)

  // 创建事件处理器和演示数据
  const handlers = createHandlers(loading, rotation, flipped)
  const demoSections = computed(() =>
    createDemoSections(handlers, loading, rotation, flipped)
  )
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
