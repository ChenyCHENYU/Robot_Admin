/**
 * C_Draggable 拖拽组件类型定义
 */

// ================= 核心数据类型 =================

/** 可拖拽项目的数据接口 */
export interface DraggableItem {
  id: string | number
  title?: string
  name?: string
  label?: string
  description?: string
  [key: string]: any
}

/** 拖拽事件数据接口 */
export interface DragEvent {
  oldIndex: number
  newIndex: number
  item: DraggableItem
}

/** 拖拽组配置选项接口 */
export interface GroupOptions {
  name: string
  pull?: boolean | string | string[]
  put?: boolean | string | string[]
  revertClone?: boolean
}

// ================= 布局类型 =================

/** 布局模式 */
export type LayoutMode = 'vertical' | 'horizontal' | 'grid' | 'flex-wrap'

/** 主轴对齐方式 */
export type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'

/** 交叉轴对齐方式 */
export type AlignItems =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'baseline'

// ================= 组件 Props =================

/** 组件属性接口 */
export interface DraggableProps {
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

  // 布局配置
  layout?: LayoutMode
  gridColumns?: number
  gridRows?: number
  gap?: string | number
  flexWrap?: boolean
  justifyContent?: JustifyContent
  alignItems?: AlignItems
  customStyles?: Record<string, string | number>
}

// ================= 组件事件 =================

/** 组件事件接口 */
export interface DraggableEmits {
  'update:modelValue': [value: DraggableItem[]]
  'drag-start': [event: DragEvent]
  'drag-end': [event: DragEvent]
  'item-add': [item: DraggableItem, index: number]
  'item-remove': [item: DraggableItem, index: number]
  'list-change': [list: DraggableItem[]]
}
