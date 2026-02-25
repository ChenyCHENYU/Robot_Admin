<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-16 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-16 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_SplitPane\index.vue
 * @Description: 分割面板组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    ref="containerRef"
    class="c-split-pane"
    :class="[
      `c-split-pane--${direction}`,
      {
        'c-split-pane--dragging': isDragging,
        'c-split-pane--disabled': disabled,
        'c-split-pane--collapsed-first': isFirstCollapsed,
        'c-split-pane--collapsed-second': isSecondCollapsed,
      },
    ]"
  >
    <!-- 首面板 -->
    <div
      class="split-panel split-panel--first"
      :style="firstPanelStyle"
    >
      <div class="split-panel__content">
        <slot name="first" />
      </div>
    </div>

    <!-- 分割线手柄 -->
    <div
      class="split-gutter"
      :style="gutterStyle"
      role="separator"
      :aria-orientation="direction === 'horizontal' ? 'vertical' : 'horizontal'"
      :aria-valuenow="Math.round(panelSize)"
      :aria-valuemin="0"
      :aria-valuemax="100"
      tabindex="0"
      @mousedown="handleMouseDown"
      @touchstart.prevent="handleMouseDown"
      @dblclick="handleDoubleClick"
      @keydown="handleKeyDown"
    >
      <div class="split-gutter__visual">
        <div class="split-gutter__dots">
          <span
            v-for="i in 3"
            :key="i"
            class="split-gutter__dot"
          />
        </div>
      </div>

      <!-- 折叠按钮 -->
      <template v-if="showCollapseButton && collapsible">
        <button
          class="split-gutter__collapse-btn split-gutter__collapse-btn--first"
          :title="isFirstCollapsed ? '展开首面板' : '折叠首面板'"
          @click.stop="toggle('first')"
          @mousedown.stop
        >
          <Icon :icon="collapseFirstIcon" />
        </button>
        <button
          class="split-gutter__collapse-btn split-gutter__collapse-btn--second"
          :title="isSecondCollapsed ? '展开第二面板' : '折叠第二面板'"
          @click.stop="toggle('second')"
          @mousedown.stop
        >
          <Icon :icon="collapseSecondIcon" />
        </button>
      </template>
    </div>

    <!-- 第二面板 -->
    <div
      class="split-panel split-panel--second"
      :style="secondPanelStyle"
    >
      <div class="split-panel__content">
        <slot name="second" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSplitResize } from '@/composables/SplitPane/useSplitResize'
  import type {
    CollapseTarget,
    SplitDirection,
    SplitPaneExpose,
  } from '@/types/modules/split-pane'
  import { Icon } from '@iconify/vue'

  interface Props {
    /** 分割方向 */
    direction?: SplitDirection
    /** 首面板默认大小（百分比 0-100） */
    defaultSize?: number
    /** 首面板最小大小（百分比 0-100） */
    minSize?: number
    /** 首面板最大大小（百分比 0-100） */
    maxSize?: number
    /** 是否禁用拖拽调整 */
    disabled?: boolean
    /** 是否可折叠 */
    collapsible?: boolean
    /** 是否显示折叠按钮 */
    showCollapseButton?: boolean
    /** 分割线宽度（px） */
    gutterSize?: number
    /** 键盘微调步长（百分比） */
    step?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    direction: 'horizontal',
    defaultSize: 50,
    minSize: 0,
    maxSize: 100,
    disabled: false,
    collapsible: true,
    showCollapseButton: true,
    gutterSize: 6,
    step: 2,
  })

  const emit = defineEmits<{
    resize: [firstSize: number, secondSize: number]
    collapse: [target: CollapseTarget]
    expand: [target: CollapseTarget]
    'drag-start': [size: number]
    'drag-end': [size: number]
  }>()

  const containerRef = ref<HTMLElement | null>(null)

  const {
    panelSize,
    isDragging,
    isFirstCollapsed,
    isSecondCollapsed,
    handleMouseDown,
    handleDoubleClick,
    handleKeyDown,
    collapse,
    expand,
    toggle,
    resetSize,
    setSize,
    getPanelInfo,
  } = useSplitResize({
    containerRef,
    direction: toRef(props, 'direction'),
    defaultSize: props.defaultSize,
    minSize: props.minSize,
    maxSize: props.maxSize,
    disabled: toRef(props, 'disabled'),
    collapsible: toRef(props, 'collapsible'),
    step: props.step,
    onResize: (first, second) => emit('resize', first, second),
    onCollapse: target => emit('collapse', target),
    onExpand: target => emit('expand', target),
    onDragStart: size => emit('drag-start', size),
    onDragEnd: size => emit('drag-end', size),
  })

  // ─── 计算样式 ────────────────────────────────────
  const firstPanelStyle = computed(() => {
    const sizeValue = `calc(${panelSize.value}% - ${props.gutterSize / 2}px)`
    return props.direction === 'horizontal'
      ? { width: sizeValue }
      : { height: sizeValue }
  })

  const secondPanelStyle = computed(() => {
    const sizeValue = `calc(${100 - panelSize.value}% - ${props.gutterSize / 2}px)`
    return props.direction === 'horizontal'
      ? { width: sizeValue }
      : { height: sizeValue }
  })

  const gutterStyle = computed(() => {
    return props.direction === 'horizontal'
      ? { width: `${props.gutterSize}px` }
      : { height: `${props.gutterSize}px` }
  })

  // ─── 折叠按钮图标 ─────────────────────────────────
  const collapseFirstIcon = computed(() => {
    if (props.direction === 'horizontal') {
      return isFirstCollapsed.value ? 'mdi:chevron-right' : 'mdi:chevron-left'
    }
    return isFirstCollapsed.value ? 'mdi:chevron-down' : 'mdi:chevron-up'
  })

  const collapseSecondIcon = computed(() => {
    if (props.direction === 'horizontal') {
      return isSecondCollapsed.value ? 'mdi:chevron-left' : 'mdi:chevron-right'
    }
    return isSecondCollapsed.value ? 'mdi:chevron-up' : 'mdi:chevron-down'
  })

  // ─── 暴露方法 ────────────────────────────────────
  defineExpose<SplitPaneExpose>({
    collapse,
    expand,
    toggle,
    resetSize,
    getPanelInfo,
    setSize,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
