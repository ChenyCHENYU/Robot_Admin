<template>
  <!-- 直接使用 @robot-admin/layout 包中的 SettingsDrawer 组件 -->
  <SettingsDrawer v-model:show="visible" />
</template>

<script setup lang="ts">
  import { SettingsDrawer } from '@robot-admin/layout'
  import '@robot-admin/layout/style.scss'

  /**
   * 设置抽屉组件包装器
   *
   * 现在使用 @robot-admin/layout 包提供的完整 UI 组件
   * 包含以下功能：
   * - 外观配置：主题预设、主题模式、主题色、圆角、动画
   * - 布局配置：布局模式、固定头部、面包屑、标签页、侧边栏、页脚
   * - 功能配置：缓存管理、配置导入/导出、水印、灰色模式、色弱模式、系统信息
   */
  defineOptions({
    name: 'CSettings',
  })

  const visible = defineModel<boolean>('show', { default: false })
</script>
