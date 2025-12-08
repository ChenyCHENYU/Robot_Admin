<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 09:10:18
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 15:36:02
 * @FilePath: \Robot_Admin\src\components\global\C_Draggable\index.vue
 * @Description: 拖拽组件  - 基于 vue-draggable-plus 封装
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

  /**
   * * @description 可拖拽项目的数据接口
   * ? @interface DraggableItem
   */
  export interface DraggableItem {
    id: string | number
    title?: string
    name?: string
    label?: string
    description?: string
    [key: string]: any
  }

  /**
   * * @description 拖拽事件数据接口
   * ? @interface DragEvent
   */
  export interface DragEvent {
    oldIndex: number
    newIndex: number
    item: DraggableItem
  }

  /**
   * * @description 拖拽组配置选项接口
   * ? @interface GroupOptions
   */
  interface GroupOptions {
    name: string
    pull?: boolean | string | string[]
    put?: boolean | string | string[]
    revertClone?: boolean
  }

  /**
   * * @description 布局模式枚举
   * ? @type LayoutMode
   */
  type LayoutMode = 'vertical' | 'horizontal' | 'grid' | 'flex-wrap'

  /**
   * * @description 组件属性接口
   * ? @interface Props
   */
  interface Props {
    // 基础数据
    modelValue?: DraggableItem[]

    // 拖拽配置
    disabled?: boolean
    group?: string | GroupOptions
    sort?: boolean
    animation?: number
    delay?: number

    // 拖拽手柄
    handle?: string
    showHandle?: boolean

    // 样式类名
    ghostClass?: string
    chosenClass?: string
    dragClass?: string
    wrapperClass?: string
    listClass?: string
    itemClass?: string

    // UI 配置
    showEmptyState?: boolean
    emptyText?: string

    // 自定义函数
    itemKey?: (item: DraggableItem, index: number) => string | number
    itemTitle?: (item: DraggableItem) => string
    itemDescription?: (item: DraggableItem) => string

    // 高级配置
    swapThreshold?: number
    invertSwap?: boolean
    direction?: 'vertical' | 'horizontal'

    // 新增布局配置
    layout?: LayoutMode
    gridColumns?: number
    gridRows?: number
    gap?: string | number
    flexWrap?: boolean
    justifyContent?:
      | 'flex-start'
      | 'flex-end'
      | 'center'
      | 'space-between'
      | 'space-around'
      | 'space-evenly'
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
    customStyles?: Record<string, string | number>
  }

  /**
   * * @description 组件属性定义与默认值
   */
  const props = withDefaults(defineProps<Props>(), {
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

  /**
   * * @description 组件事件接口
   * ? @interface Emits
   */
  interface Emits {
    'update:modelValue': [value: DraggableItem[]]
    'drag-start': [event: DragEvent]
    'drag-end': [event: DragEvent]
    'item-add': [item: DraggableItem, index: number]
    'item-remove': [item: DraggableItem, index: number]
    'list-change': [list: DraggableItem[]]
  }

  /**
   * * @description 组件事件定义
   */
  const emit = defineEmits<Emits>()

  /**
   * * @description 拖拽状态标识
   */
  const isDragging = ref(false)

  /**
   * * @description 内部列表数据管理
   * ? @computed
   * ! @returns 双向绑定的列表数据
   */
  const internalList = computed({
    get: () => props.modelValue,
    set: (value: DraggableItem[]) => {
      emit('update:modelValue', value)
      emit('list-change', value)
    },
  })

  /**
   * * @description 检查列表是否为空
   * ? @computed
   * ! @returns 列表是否为空的布尔值
   */
  const isEmpty = computed(() => props.modelValue.length === 0)

  /**
   * * @description 构建列表容器的CSS类名
   * ? @computed
   * ! @returns CSS类名数组
   */
  const listClasses = computed(() => {
    return [
      'c-draggable-list',
      props.listClass,
      `layout-${props.layout}`,
      {
        'flex-wrap':
          props.flexWrap &&
          (props.layout === 'horizontal' || props.layout === 'flex-wrap'),
      },
    ]
  })

  /**
   * * @description 构建列表容器的内联样式
   * ? @computed
   * ! @returns 样式对象
   */
  const listStyles = computed(() => {
    const styles: Record<string, string | number> = {
      '--gap': typeof props.gap === 'number' ? `${props.gap}px` : props.gap,
      '--grid-columns': props.gridColumns,
      '--justify-content': props.justifyContent,
      '--align-items': props.alignItems,
      ...props.customStyles,
    }

    if (props.gridRows) {
      styles['--grid-rows'] = props.gridRows
    }

    return styles
  })

  /**
   * * @description 构建拖拽组件的配置选项
   * ? @computed
   * ! @returns 拖拽组件配置对象
   */
  const draggableOptions = computed(() => {
    const options: Record<string, any> = {
      disabled: props.disabled,
      group: props.group,
      sort: props.sort,
      animation: props.animation,
      delay: props.delay,
      ghostClass: props.ghostClass,
      chosenClass: props.chosenClass,
      dragClass: props.dragClass,
      swapThreshold: props.swapThreshold,
      invertSwap: props.invertSwap,
      direction: props.direction,
      forceFallback: false,
    }

    // 处理 handle
    if (props.handle) {
      options.handle = props.handle
    } else if (props.showHandle) {
      options.handle = '.drag-handle'
    }

    return options
  })

  /**
   * * @description 获取列表项的唯一键值
   * ? @param item - 列表项数据
   * ? @param index - 项目索引
   * ! @returns 唯一键值
   */
  const getItemKey = (item: DraggableItem, index: number): string | number => {
    return props.itemKey ? props.itemKey(item, index) : (item.id ?? index)
  }

  /**
   * * @description 获取列表项的标题
   * ? @param item - 列表项数据
   * ! @returns 项目标题字符串
   */
  const getItemTitle = (item: DraggableItem): string => {
    if (props.itemTitle) {
      return props.itemTitle(item)
    }
    return (
      item.title || item.name || item.label || String(item.id) || '未命名项目'
    )
  }

  /**
   * * @description 获取列表项的描述信息
   * ? @param item - 列表项数据
   * ! @returns 项目描述字符串
   */
  const getItemDescription = (item: DraggableItem): string => {
    if (props.itemDescription) {
      return props.itemDescription(item)
    }
    return item.description || ''
  }

  /**
   * * @description 构建列表项的CSS类名
   * ? @param index - 项目索引
   * ! @returns CSS类名数组
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getItemClass = (index: number) => {
    return [
      'c-draggable-item',
      props.itemClass,
      {
        'is-disabled': props.disabled,
      },
    ]
  }

  /**
   * * @description 处理拖拽开始事件
   * ? @param event - 拖拽事件对象
   */
  const handleStart = (event: any) => {
    isDragging.value = true

    const item = internalList.value[event.oldIndex]
    if (item) {
      const dragEvent: DragEvent = {
        oldIndex: event.oldIndex,
        newIndex: event.oldIndex,
        item,
      }
      emit('drag-start', dragEvent)
    }
  }

  /**
   * * @description 处理拖拽结束事件
   * ? @param event - 拖拽事件对象
   */
  const handleEnd = (event: any) => {
    const item = internalList.value[event.newIndex]
    if (item) {
      const dragEvent: DragEvent = {
        oldIndex: event.oldIndex,
        newIndex: event.newIndex,
        item,
      }
      emit('drag-end', dragEvent)
    }

    // 重置状态
    nextTick(() => {
      isDragging.value = false
    })
  }

  /**
   * * @description 处理项目添加事件
   * ? @param event - 拖拽事件对象
   */
  const handleAdd = (event: any) => {
    const item = internalList.value[event.newIndex]
    if (item) {
      emit('item-add', item, event.newIndex)
    }
  }

  /**
   * * @description 处理项目移除事件
   * ? @param event - 拖拽事件对象
   */
  const handleRemove = (event: any) => {
    if (event.item) {
      emit('item-remove', event.item, event.oldIndex)
    }
  }

  /**
   * * @description 处理列表更新事件
   * ? @param event - 拖拽事件对象
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdate = (event: any) => {
    // 处理列表内部排序更新
  }

  /**
   * * @description 向列表添加新项目
   * ? @param item - 要添加的项目数据
   * ? @param index - 插入位置索引，可选
   */
  const addItem = (item: DraggableItem, index?: number): void => {
    const list = [...internalList.value]
    if (typeof index === 'number' && index >= 0 && index <= list.length) {
      list.splice(index, 0, item)
    } else {
      list.push(item)
    }
    internalList.value = list
  }

  /**
   * * @description 从列表移除指定索引的项目
   * ? @param index - 要移除的项目索引
   * ! @returns 被移除的项目数据，如果索引无效则返回null
   */
  const removeItem = (index: number): DraggableItem | null => {
    if (index >= 0 && index < internalList.value.length) {
      const list = [...internalList.value]
      const [removed] = list.splice(index, 1)
      internalList.value = list
      return removed
    }
    return null
  }

  /**
   * * @description 移动列表中的项目
   * ? @param fromIndex - 源位置索引
   * ? @param toIndex - 目标位置索引
   * ! @returns 是否移动成功
   */
  const moveItem = (fromIndex: number, toIndex: number): boolean => {
    const list = internalList.value
    if (
      fromIndex >= 0 &&
      fromIndex < list.length &&
      toIndex >= 0 &&
      toIndex < list.length &&
      fromIndex !== toIndex
    ) {
      const newList = [...list]
      const [item] = newList.splice(fromIndex, 1)
      newList.splice(toIndex, 0, item)
      internalList.value = newList
      return true
    }
    return false
  }

  /**
   * * @description 更新整个列表数据
   * ? @param newList - 新的列表数据
   */
  const updateList = (newList: DraggableItem[]): void => {
    internalList.value = [...newList]
  }

  /**
   * * @description 清空列表所有数据
   */
  const clear = (): void => {
    internalList.value = []
  }

  /**
   * * @description 根据索引获取项目数据
   * ? @param index - 项目索引
   * ! @returns 项目数据，如果索引无效则返回undefined
   */
  const getItem = (index: number): DraggableItem | undefined => {
    return internalList.value[index]
  }

  /**
   * * @description 查找符合条件的项目索引
   * ? @param predicate - 查找条件函数
   * ! @returns 项目索引，未找到则返回-1
   */
  const findIndex = (predicate: (item: DraggableItem) => boolean): number => {
    return internalList.value.findIndex(predicate)
  }

  /**
   * * @description 暴露给父组件的方法和属性
   */
  defineExpose({
    // 只读状态
    isDragging: readonly(isDragging),
    list: readonly(internalList),
    isEmpty: readonly(isEmpty),

    // 操作方法
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
