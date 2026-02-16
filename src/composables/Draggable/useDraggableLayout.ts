/*
 * @Description: C_Draggable 布局与操作引擎
 * 职责：布局样式计算、拖拽选项构建、列表 CRUD、事件分发
 */

import type {
  DraggableItem,
  DragEvent,
  DraggableProps,
} from '@/types/modules/draggable.d.ts'

// ================= 类型 =================

/** emit 函数签名（匹配 defineEmits 返回类型） */
type EmitFn = {
  (event: 'update:modelValue', value: DraggableItem[]): void
  (event: 'drag-start', dragEvent: DragEvent): void
  (event: 'drag-end', dragEvent: DragEvent): void
  (event: 'item-add', item: DraggableItem, index: number): void
  (event: 'item-remove', item: DraggableItem, index: number): void
  (event: 'list-change', list: DraggableItem[]): void
}

// ================= Composable =================

/** C_Draggable 布局与操作引擎 */
export function useDraggableLayout(props: DraggableProps, emit: EmitFn) {
  // ---------- 状态 ----------

  /** 拖拽状态标识 */
  const isDragging = ref(false)

  /** 内部列表（双向绑定） */
  const internalList = computed({
    get: () => props.modelValue ?? [],
    set: (value: DraggableItem[]) => {
      emit('update:modelValue', value)
      emit('list-change', value)
    },
  })

  /** 列表是否为空 */
  const isEmpty = computed(() => (props.modelValue ?? []).length === 0)

  // ---------- 布局计算 ----------

  /** 列表容器 CSS 类名 */
  const listClasses = computed(() => [
    'c-draggable-list',
    props.listClass,
    `layout-${props.layout}`,
    {
      'flex-wrap':
        props.flexWrap &&
        (props.layout === 'horizontal' || props.layout === 'flex-wrap'),
    },
  ])

  /** 列表容器内联样式（CSS 变量驱动） */
  const listStyles = computed(() => {
    const styles: Record<string, string | number> = {
      '--gap':
        typeof props.gap === 'number' ? `${props.gap}px` : (props.gap ?? '8px'),
      '--grid-columns': props.gridColumns ?? 4,
      '--justify-content': props.justifyContent ?? 'flex-start',
      '--align-items': props.alignItems ?? 'stretch',
      ...props.customStyles,
    }

    if (props.gridRows) {
      styles['--grid-rows'] = props.gridRows
    }

    return styles
  })

  /** 拖拽组件配置选项 */
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

    if (props.handle) {
      options.handle = props.handle
    } else if (props.showHandle) {
      options.handle = '.drag-handle'
    }

    return options
  })

  // ---------- Item 辅助 ----------

  /** 获取列表项唯一键值 */
  const getItemKey = (item: DraggableItem, index: number): string | number =>
    props.itemKey ? props.itemKey(item, index) : (item.id ?? index)

  /** 获取列表项标题 */
  const getItemTitle = (item: DraggableItem): string => {
    if (props.itemTitle) return props.itemTitle(item)
    return (
      item.title || item.name || item.label || String(item.id) || '未命名项目'
    )
  }

  /** 获取列表项描述 */
  const getItemDescription = (item: DraggableItem): string => {
    if (props.itemDescription) return props.itemDescription(item)
    return item.description || ''
  }

  /** 列表项 CSS 类名 */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getItemClass = (_index: number) => [
    'c-draggable-item',
    props.itemClass,
    { 'is-disabled': props.disabled },
  ]

  // ---------- 事件处理 ----------

  const handleStart = (event: any) => {
    isDragging.value = true
    const item = internalList.value[event.oldIndex]
    if (item) {
      emit('drag-start', {
        oldIndex: event.oldIndex,
        newIndex: event.oldIndex,
        item,
      } as DragEvent)
    }
  }

  const handleEnd = (event: any) => {
    const item = internalList.value[event.newIndex]
    if (item) {
      emit('drag-end', {
        oldIndex: event.oldIndex,
        newIndex: event.newIndex,
        item,
      } as DragEvent)
    }
    nextTick(() => {
      isDragging.value = false
    })
  }

  const handleAdd = (event: any) => {
    const item = internalList.value[event.newIndex]
    if (item) emit('item-add', item, event.newIndex)
  }

  const handleRemove = (event: any) => {
    if (event.item) emit('item-remove', event.item, event.oldIndex)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdate = (_event: any) => {
    // 列表内部排序更新 — 保留扩展点
  }

  // ---------- 列表 CRUD ----------

  /** 添加项目 */
  const addItem = (item: DraggableItem, index?: number): void => {
    const list = [...internalList.value]
    if (typeof index === 'number' && index >= 0 && index <= list.length) {
      list.splice(index, 0, item)
    } else {
      list.push(item)
    }
    internalList.value = list
  }

  /** 移除项目 */
  const removeItem = (index: number): DraggableItem | null => {
    if (index >= 0 && index < internalList.value.length) {
      const list = [...internalList.value]
      const [removed] = list.splice(index, 1)
      internalList.value = list
      return removed
    }
    return null
  }

  /** 移动项目 */
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

  /** 更新整个列表 */
  const updateList = (newList: DraggableItem[]): void => {
    internalList.value = [...newList]
  }

  /** 清空列表 */
  const clear = (): void => {
    internalList.value = []
  }

  /** 按索引获取项目 */
  const getItem = (index: number): DraggableItem | undefined =>
    internalList.value[index]

  /** 按条件查找索引 */
  const findIndex = (predicate: (item: DraggableItem) => boolean): number =>
    internalList.value.findIndex(predicate)

  // ---------- 导出 ----------

  return {
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
  }
}
