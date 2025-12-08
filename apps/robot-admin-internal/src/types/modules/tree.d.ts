/**
 * Tree组件相关类型定义
 */

// 预设模式类型
export type TreeMode = 'menu' | 'file' | 'org' | 'custom'

// 树节点状态类型
export type StatusType = 'success' | 'warning' | 'error' | 'info'

// 按钮类型
export type ButtonType = 'primary' | 'info' | 'warning' | 'error' | 'default'

// 基础树选项类型
export interface TreeOption {
  [key: string]: any
  id?: string | number
  key?: string | number
  label?: string
  children?: TreeOption[]
}

// 拖拽信息类型
export interface DropInfo {
  node: TreeOption
  dragNode: TreeOption
  dropPosition: 'before' | 'inside' | 'after'
  event: DragEvent
}

// 基础树节点数据类型
export interface TreeNodeData {
  [key: string]: any
  id: string | number
  name: string
  type?: string
  children?: TreeNodeData[]
}

// 状态配置类型
export interface StatusConfig {
  field: string
  values: Record<
    string | number,
    {
      text: string
      type: StatusType
    }
  >
}

// 操作按钮配置
export interface ActionConfig {
  key: string
  text: string
  icon: string
  type?: ButtonType
  show?: (node: TreeNodeData) => boolean
  confirm?: string
}

// 图标配置类型
export interface IconConfig {
  default?: string
  typeMap?: Record<string, string>
  colorMap?: Record<string, string>
}

// Tree组件Props类型
export interface TreeProps {
  // 数据相关
  data: TreeNodeData[]
  mode?: TreeMode
  keyField?: string
  labelField?: string
  childrenField?: string

  // 搜索相关
  searchPattern?: string
  searchable?: boolean
  searchPlaceholder?: string

  // 功能开关
  draggable?: boolean
  showLine?: boolean
  showToolbar?: boolean
  addable?: boolean
  addText?: string
  refreshable?: boolean

  // 自定义配置
  iconField?: string
  iconConfig?: IconConfig
  statusConfigs?: StatusConfig[]
  actions?: ActionConfig[]

  // 默认状态
  defaultExpandAll?: boolean
  defaultExpandedKeys?: (string | number)[]
  defaultSelectedKeys?: (string | number)[]
}

// Tree组件暴露的方法类型
export interface TreeExpose {
  expandAll: () => void
  collapseAll: () => void
  selectNode: (key: string | number) => void
  getSelectedNode: () => TreeNodeData | null
  expandedKeys: Ref<(string | number)[]>
  selectedKeys: Ref<(string | number)[]>
}

// Tree组件事件类型
export interface TreeEmits {
  'node-select': [node: TreeNodeData | null, selectedKeys: (string | number)[]]
  'node-action': [action: string, node: TreeNodeData]
  'node-drop': [info: DropInfo]
  add: [parentNode?: TreeNodeData]
  refresh: []
}
