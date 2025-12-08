<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 09:51:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 00:02:35
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Inline\index.vue
 * @Description: 表单组件 - 内联布局组件 
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    class="c-form-inline"
    :style="containerStyle"
  >
    <div
      v-for="(item, index) in formItems"
      :key="getItemKey(item, index)"
      class="c-form-inline-item"
      :style="getItemStyle(index)"
    >
      <component :is="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { VNode, CSSProperties } from 'vue'
  import type {
    LayoutProps,
    FormOption,
    ItemLayoutConfig,
  } from '@/types/modules/form'

  // ================= 组件属性 =================

  const props = withDefaults(defineProps<LayoutProps>(), {
    layoutConfig: () => ({}),
    options: () => [],
  })

  // ================= 计算属性 =================

  /**
   * 获取统一项目宽度
   */
  const itemWidth = computed((): number => 280)

  /**
   * 获取项目间距
   */
  const gap = computed((): number => {
    return props.layoutConfig?.inline?.gap ?? 16
  })

  /**
   * 获取行间距
   */
  const rowGap = computed((): number => 16)

  /**
   * 获取对齐方式 - 既控制垂直对齐也控制水平对齐
   */
  const align = computed((): 'start' | 'center' | 'end' => {
    const alignValue = props.layoutConfig?.inline?.align
    return alignValue === 'start' || alignValue === 'end'
      ? alignValue
      : 'center'
  })

  /**
   * 获取垂直对齐样式
   */
  const alignItems = computed((): string => {
    switch (align.value) {
      case 'start':
        return 'flex-start'
      case 'end':
        return 'flex-end'
      default:
        return 'center'
    }
  })

  /**
   * 获取水平对齐样式
   */
  const justifyContent = computed((): string => {
    switch (align.value) {
      case 'start':
        return 'flex-start'
      case 'end':
        return 'flex-end'
      case 'center':
        return 'center'
      default:
        return 'flex-start' // 默认左对齐，避免拉伸
    }
  })

  /**
   * 容器样式计算
   */
  const containerStyle = computed((): CSSProperties => {
    return {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: alignItems.value,
      justifyContent: justifyContent.value,
      gap: `${rowGap.value}px ${gap.value}px`,
      width: '100%',
    }
  })

  // ================= 方法 =================

  /**
   * 获取表单项的唯一key
   */
  const getItemKey = (item: VNode, index: number): string => {
    if (item.key != null) {
      return String(item.key)
    }

    const itemProps = item.props as any
    if (itemProps?.path) {
      return itemProps.path
    }

    return `form-item-${index}`
  }

  /**
   * 获取表单项样式
   */
  const getItemStyle = (index: number): CSSProperties => {
    const option: FormOption | undefined = props.options?.[index]
    const layoutConfig: ItemLayoutConfig | undefined = option?.layout

    // 基础样式，统一宽度
    const baseStyle: CSSProperties = {
      width: `${itemWidth.value}px`,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    }

    // 如果单独设置了宽度，则覆盖统一宽度
    if (layoutConfig?.width !== undefined) {
      baseStyle.width =
        typeof layoutConfig.width === 'number'
          ? `${layoutConfig.width}px`
          : layoutConfig.width
    }

    // 合并自定义样式
    if (layoutConfig?.style) {
      Object.assign(baseStyle, layoutConfig.style)
    }

    return baseStyle
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
