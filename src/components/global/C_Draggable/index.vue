<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 09:10:18
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 15:36:02
 * @FilePath: \Robot_Admin\src\components\global\C_Draggable\index.vue
 * @Description: 拖拽组件  - 基于 vue-draggable-plus 封装（薄 UI 壳 + useDraggableLayout 引擎）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    class="c-draggable-wrapper"
    :class="wrapperClass"
  >
    <VueDraggable
      v-model="internalList"
      v-bind="draggableOptions"
      :class="listClasses"
      :style="listStyles"
      @start="handleStart"
      @end="handleEnd"
      @add="handleAdd"
      @remove="handleRemove"
      @update="handleUpdate"
    >
      <div
        v-for="(item, index) in internalList"
        :key="getItemKey(item, index)"
        :class="getItemClass(index)"
        :data-index="index"
      >
        <slot
          :item="item"
          :index="index"
          :is-dragging="isDragging"
          :is-disabled="disabled"
        >
          <!-- 默认渲染 -->
          <div class="default-item">
            <div
              v-if="showHandle"
              class="drag-handle"
            >
              <div class="i-mdi:drag-vertical"></div>
            </div>
            <div class="item-content">
              <div class="item-title">{{ getItemTitle(item) }}</div>
              <div
                v-if="getItemDescription(item)"
                class="item-description"
              >
                {{ getItemDescription(item) }}
              </div>
            </div>
          </div>
        </slot>
      </div>
    </VueDraggable>

    <!-- 空状态 -->
    <div
      v-if="isEmpty && showEmptyState"
      class="empty-state"
    >
      <slot name="empty">
        <div class="default-empty">
          <div class="empty-icon i-mdi:inbox-outline"></div>
          <p class="empty-text">{{ emptyText }}</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { VueDraggable } from 'vue-draggable-plus'
  import { useDraggableLayout } from '@/composables/Draggable/useDraggableLayout'

  import type {
    DraggableProps,
    DraggableEmits,
  } from '@/types/modules/draggable.d.ts'

  // ================= Props & Emits =================

  const props = withDefaults(defineProps<DraggableProps>(), {
    modelValue: () => [],
    disabled: false,
    group: 'default',
    sort: true,
    animation: 200,
    delay: 0,
    handle: '',
    showHandle: false,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    wrapperClass: '',
    listClass: '',
    itemClass: '',
    showEmptyState: true,
    emptyText: '暂无数据',
    swapThreshold: 1,
    invertSwap: false,
    direction: 'vertical',
    layout: 'vertical',
    gridColumns: 4,
    gridRows: undefined,
    gap: '8px',
    flexWrap: false,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    customStyles: () => ({}),
  })

  const emit = defineEmits<DraggableEmits>()

  // ================= Composable 引擎 =================

  const {
    // 状态
    isDragging,
    internalList,
    isEmpty,
    // 布局
    listClasses,
    listStyles,
    draggableOptions,
    // Item 辅助
    getItemKey,
    getItemTitle,
    getItemDescription,
    getItemClass,
    // 事件
    handleStart,
    handleEnd,
    handleAdd,
    handleRemove,
    handleUpdate,
    // CRUD
    addItem,
    removeItem,
    moveItem,
    updateList,
    clear,
    getItem,
    findIndex,
  } = useDraggableLayout(props, emit)

  // ================= Expose =================

  defineExpose({
    isDragging: readonly(isDragging),
    list: readonly(internalList),
    isEmpty: readonly(isEmpty),
    addItem,
    removeItem,
    moveItem,
    updateList,
    clear,
    getItem,
    findIndex,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
