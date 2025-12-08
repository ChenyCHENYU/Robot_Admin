// AntV X6 相关类型定义

import type { Graph } from '@antv/x6'

// 基础位置类型
export interface Position {
  x: number
  y: number
}

// ER图相关类型
export interface ERField {
  name: string
  type: string
  isPrimaryKey: boolean
  isRequired: boolean
  isForeignKey: boolean
  foreignKey?: string // 格式: "table_id.field_name"
  comment?: string
  defaultValue?: string
}

export interface ERTable {
  id: string
  name: string
  comment?: string
  fields: ERField[]
  position: Position
}

export interface ERRelation {
  id: string
  type: 'foreign-key' | 'one-to-one' | 'one-to-many' | 'many-to-many'
  sourceTable: string
  sourceField: string
  targetTable: string
  targetField: string
  name?: string
  comment?: string
}

export interface ERDiagramData {
  tables: ERTable[]
  relations: ERRelation[]
}

// BPMN相关类型
export interface BPMNNode {
  id: string
  type: 'start' | 'end' | 'task' | 'gateway' | 'event'
  name: string
  position: Position
  properties: Record<string, any>
}

export interface BPMNFlow {
  id: string
  source: string
  target: string
  name?: string
  condition?: string
}

export interface BPMNDiagramData {
  nodes: BPMNNode[]
  flows: BPMNFlow[]
}

// UML类图相关类型
export interface UMLAttribute {
  name: string
  type: string
  visibility: 'public' | 'private' | 'protected'
  isStatic?: boolean
}

export interface UMLMethod {
  name: string
  returnType: string
  visibility: 'public' | 'private' | 'protected'
  parameters?: string[]
  isStatic?: boolean
  isAbstract?: boolean
}

export interface UMLClass {
  id: string
  name: string
  attributes: UMLAttribute[]
  methods: UMLMethod[]
  position: Position
  isAbstract?: boolean
}

export interface UMLRelation {
  id: string
  type:
    | 'inheritance'
    | 'composition'
    | 'aggregation'
    | 'association'
    | 'dependency'
  source: string
  target: string
  name?: string
  multiplicity?: string
}

export interface UMLDiagramData {
  classes: UMLClass[]
  relations: UMLRelation[]
}

// 通用图表数据类型
export type DiagramData = ERDiagramData | BPMNDiagramData | UMLDiagramData

// 图表类型
export type DiagramType = 'er' | 'bpmn' | 'uml'

// 图表配置
export interface DiagramConfig {
  type: DiagramType
  data?: DiagramData
  width?: string | number
  height?: string | number
  readonly?: boolean
  showToolbar?: boolean
  theme?: 'light' | 'dark'
}

// 工具栏相关
export type ToolbarAction =
  | 'new'
  | 'open'
  | 'save'
  | 'save-as'
  | 'import'
  | 'export'
  | 'undo'
  | 'redo'
  | 'copy'
  | 'paste'
  | 'delete'
  | 'select-all'
  | 'clear'
  | 'zoom-in'
  | 'zoom-out'
  | 'zoom-fit'
  | 'center'
  | 'layout'
  | 'align'

export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf' | 'json'

// 菜单项类型
export interface MenuItem {
  label: string
  key: string
  icon?: string
  shortcut?: string
  type?: 'divider'
}

// 验证结果
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// 图表事件
export interface GraphEvents {
  ready: (graph: Graph) => void
  dataChange: (data: DiagramData) => void
  nodeClick: (nodeId: string, data: any) => void
  nodeDoubleClick: (nodeId: string, data: any) => void
  edgeClick: (edgeId: string, data: any) => void
  selectionChange: (selectedIds: string[]) => void
}

// 布局选项
export interface LayoutOptions {
  type: 'auto' | 'hierarchical' | 'force' | 'grid' | 'circular'
  direction?: 'TB' | 'BT' | 'LR' | 'RL'
  spacing?: number
  nodeSpacing?: number
  layerSpacing?: number
}

// 样式主题
export interface ThemeConfig {
  background: string
  grid: {
    visible: boolean
    color: string
  }
  node: {
    fill: string
    stroke: string
    strokeWidth: number
  }
  edge: {
    stroke: string
    strokeWidth: number
  }
  text: {
    color: string
    fontSize: number
    fontFamily: string
  }
}

// 导出选项
export interface ExportOptions {
  format: ExportFormat
  quality?: number
  width?: number
  height?: number
  backgroundColor?: string
  padding?: number
}

// 网格配置
export interface GridConfig {
  visible: boolean
  type: 'dot' | 'fixedDot' | 'mesh' | 'doubleMesh'
  size: number
  color: string
  thickness?: number
}

// 连接配置
export interface ConnectionConfig {
  allowBlank: boolean
  allowLoop: boolean
  allowNode: boolean
  allowEdge: boolean
  allowPort: boolean
  allowMulti: boolean
  highlight: boolean
}

// 选择配置
export interface SelectionConfig {
  enabled: boolean
  multiple: boolean
  rubberband: boolean
  movable: boolean
  showNodeSelectionBox: boolean
  showEdgeSelectionBox: boolean
}

// 快照配置
export interface SnapshotConfig {
  enabled: boolean
  maxSize: number
}

// 键盘配置
export interface KeyboardConfig {
  enabled: boolean
  global: boolean
}

// 鼠标滚轮配置
export interface MouseWheelConfig {
  enabled: boolean
  global: boolean
  modifiers: string | string[]
  minScale: number
  maxScale: number
  sensitivity: number
}

// 滚动配置
export interface ScrollerConfig {
  enabled: boolean
  pageVisible: boolean
  pageBreak: boolean
  pannable: boolean
  cursor: string
  padding: number
}

// 小地图配置
export interface MinimapConfig {
  enabled: boolean
  container: HTMLElement
  width: number
  height: number
  scalable: boolean
  moveable: boolean
}

// 历史记录配置
export interface HistoryConfig {
  enabled: boolean
  maxSize: number
  ignoreAdd: boolean
  ignoreRemove: boolean
  ignoreChange: boolean
}

// 剪贴板配置
export interface ClipboardConfig {
  enabled: boolean
  useLocalStorage: boolean
}

// 组合配置类型
export interface GraphConfig {
  grid?: GridConfig
  connection?: ConnectionConfig
  selection?: SelectionConfig
  snapshot?: SnapshotConfig
  keyboard?: KeyboardConfig
  mousewheel?: MouseWheelConfig
  scroller?: ScrollerConfig
  minimap?: MinimapConfig
  history?: HistoryConfig
  clipboard?: ClipboardConfig
}
