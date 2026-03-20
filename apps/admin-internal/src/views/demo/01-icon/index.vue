<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 10:43:21
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 21:00:00
 * @FilePath: \Robot_Admin\src\views\demo\01-icon\index.vue
 * @Description: 图标组件演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="demo-container">
    <c_vTitle
      title="图标组件场景示例"
      icon="mdi:palette-outline"
      description="支持 Iconify、UnoCSS、组件、SVG、图片等多种图标类型，点击图标查看对应代码"
    />

    <!-- 演示区块 -->
    <div class="demo-grid">
      <NCard
        v-for="demo in demoSections"
        :key="demo.id"
        class="demo-card"
        :class="{ active: activeDemo === demo.id }"
        :bordered="false"
        @click="activeDemo = demo.id"
      >
        <div class="card-header">
          <span class="card-badge">{{ demo.id }}</span>
          <span class="card-title">{{
            demo.title.replace(/^\d+\.\s*/, '')
          }}</span>
          <NTag
            :type="getTagType(demo.badge)"
            size="tiny"
            round
          >
            {{ demo.badgeText }}
          </NTag>
        </div>
        <div class="card-icons">
          <div
            v-for="icon in demo.icons.slice(0, 4)"
            :key="icon.key"
            class="icon-preview"
            :title="
              typeof icon.label === 'function' ? icon.label() : icon.label
            "
            @click.stop="icon.handler?.()"
          >
            <C_Icon v-bind="icon.props as any" />
          </div>
          <span
            v-if="demo.icons.length > 4"
            class="more-count"
            >+{{ demo.icons.length - 4 }}</span
          >
        </div>
      </NCard>
    </div>

    <!-- 代码预览区 -->
    <NCard
      class="code-panel"
      :bordered="false"
    >
      <div class="code-panel-header">
        <div class="panel-title">
          <Icon icon="mdi:code-braces" />
          <span>{{ activeDemoData?.title }}</span>
        </div>
        <div class="panel-actions">
          <NButton
            size="tiny"
            quaternary
            @click="copyCode"
          >
            <template #icon>
              <Icon icon="mdi:content-copy" />
            </template>
            复制
          </NButton>
        </div>
      </div>

      <div class="code-content">
        <div class="icon-showcase">
          <div
            v-for="icon in activeDemoData?.icons || []"
            :key="icon.key"
            class="showcase-item"
            @click="icon.handler?.()"
          >
            <C_Icon v-bind="icon.props as any" />
            <code>{{
              typeof icon.label === 'function' ? icon.label() : icon.label
            }}</code>
          </div>
        </div>
        <NDivider vertical />
        <div class="code-block">
          <C_Code
            :language="activeDemoData?.language || 'html'"
            :code="activeDemoData?.code || ''"
            :show-header="false"
            :max-height="360"
          />
        </div>
      </div>

      <div
        v-if="activeDemoData?.note"
        class="code-note"
        v-html="activeDemoData?.note"
      />
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import { createHandlers, createDemoSections } from './data'

  // 状态管理
  const loading = ref(false)
  const rotation = ref(0)
  const flipped = ref(false)
  const activeDemo = ref('iconify')

  // 创建事件处理器和演示数据
  const handlers = createHandlers(loading, rotation, flipped)
  const demoSections = computed(() =>
    createDemoSections(handlers, loading, rotation, flipped)
  )

  // 当前选中的演示数据
  const activeDemoData = computed(() =>
    demoSections.value.find(d => d.id === activeDemo.value)
  )

  // Badge 到 NTag type 的映射
  const getTagType = (badge: string) => {
    const typeMap: Record<
      string,
      'default' | 'info' | 'success' | 'warning' | 'error'
    > = {
      primary: 'info',
      secondary: 'default',
      success: 'success',
      warning: 'warning',
      danger: 'error',
      info: 'info',
      purple: 'info',
    }
    return typeMap[badge] || 'default'
  }

  // 复制代码
  const message = useMessage()
  const copyCode = async () => {
    if (!activeDemoData.value?.code) return
    await navigator.clipboard.writeText(activeDemoData.value.code)
    message.success('代码已复制')
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
