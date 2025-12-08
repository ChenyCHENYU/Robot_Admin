/**
 * 工作流相关类型定义
 */

// 基础用户类型
export interface User {
  id: string
  name: string
  avatar?: string
  department: string
  role: string
  email?: string
  phone?: string
}

// 角色类型
export interface Role {
  id: string
  name: string
  description?: string
  level?: number
}

// 部门类型
export interface Department {
  id: string
  name: string
  parentId?: string
  manager?: string
}

// 条件类型
export interface Condition {
  id: string
  name: string
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  value: string
}

// 节点状态类型
export type NodeStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'completed'

// 节点类型
export type NodeType = 'start' | 'approval' | 'copy' | 'condition'

// 审批模式类型
export type ApprovalMode = 'any' | 'all' | 'sequence'

// 验证错误类型 - 扩展更多错误类型
export type ValidationErrorType =
  | 'required' // 必填字段未填
  | 'invalid' // 无效值
  | 'incomplete' // 配置不完整
  | 'warning' // 警告类型
  | 'error' // 一般错误
  | 'custom' // 自定义错误

// 节点数据基础接口
export interface BaseNodeData {
  title: string
  status?: NodeStatus
  config?: Record<string, any>
  initiators?: User[]
}

// 开始节点数据
export interface StartNodeData extends BaseNodeData {
  title: string
  status: 'active'
}

// 审批节点数据
export interface ApprovalNodeData extends BaseNodeData {
  approvers?: User[]
  approvalMode?: ApprovalMode
}

// 抄送节点数据
export interface CopyNodeData extends BaseNodeData {
  copyUsers?: User[]
}

// 条件节点数据
export interface ConditionNodeData extends BaseNodeData {
  conditions?: Condition[]
}

// 联合节点数据类型
export type NodeData =
  | StartNodeData
  | ApprovalNodeData
  | CopyNodeData
  | ConditionNodeData

// 扩展 Vue Flow 的 Node 类型
export interface WorkflowNode {
  id: string
  type: NodeType
  position: {
    x: number
    y: number
  }
  data: NodeData
  selected?: boolean
  dragging?: boolean
  connectable?: boolean
  selectable?: boolean
  deletable?: boolean
  dragHandle?: string
  width?: number
  height?: number
  parentNode?: string
  zIndex?: number
  extent?: 'parent' | [[number, number], [number, number]]
  expandParent?: boolean
}

// 扩展 Vue Flow 的 Edge 类型
export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  type?: string
  animated?: boolean
  hidden?: boolean
  deletable?: boolean
  selectable?: boolean
  data?: any
  style?: any
  label?: string
  labelStyle?: any
  labelShowBg?: boolean
  labelBgStyle?: any
  labelBgPadding?: [number, number]
  labelBgBorderRadius?: number
  markerStart?: string
  markerEnd?: string
}

// 工作流数据接口
export interface WorkflowData {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  config?: {
    title?: string
    description?: string
    version?: string
    createdAt?: string
    updatedAt?: string
  }
}

// 组件Props接口
export interface WorkflowProps {
  users?: User[]
  roles?: Role[]
  departments?: Department[]
  modelValue?: WorkflowData
  readonly?: boolean
  theme?: 'light' | 'dark'
}

// 组件Emits接口
export interface WorkflowEmits {
  'update:modelValue': [value: WorkflowData]
  change: [value: WorkflowData]
  'node-click': [node: WorkflowNode]
  'edge-click': [edge: WorkflowEdge]
  save: [data: WorkflowData]
  'validate-error': [errors: ValidationError[]]
}

// 验证错误接口 - 使用新的错误类型
export interface ValidationError {
  nodeId: string
  nodeName: string
  field: string
  message: string
  type: ValidationErrorType
  // 可选的额外信息
  details?: string
  severity?: 'low' | 'medium' | 'high'
  fixSuggestion?: string
}

// 菜单位置接口
export interface MenuPosition {
  x: number
  y: number
}

// 节点配置表单数据接口
export interface NodeConfigFormData {
  approval?: {
    selectedUsers: string[]
    approvalMode: ApprovalMode
  }
  copy?: {
    selectedUsers: string[]
  }
  condition?: {
    conditions: Condition[]
  }
}

// 验证规则接口
export interface ValidationRule {
  field: string
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  message: string
  validator?: (value: any, data: any) => boolean
}

// 工作流配置接口
export interface WorkflowConfig {
  title?: string
  description?: string
  version?: string
  allowedNodeTypes?: NodeType[]
  maxNodes?: number
  enableValidation?: boolean
  validationRules?: Record<string, ValidationRule[]>
  theme?: {
    primaryColor?: string
    backgroundColor?: string
    nodeColors?: Record<NodeType, string>
  }
}

// 工作流统计信息接口
export interface WorkflowStats {
  totalNodes: number
  approvalNodes: number
  copyNodes: number
  conditionNodes: number
  totalEdges: number
  validationErrors: number
  lastModified?: string
}

// 节点模板接口
export interface NodeTemplate {
  id: string
  name: string
  type: NodeType
  description?: string
  defaultData: Partial<NodeData>
  icon?: string
  category?: string
}

// 工具函数类型
export interface WorkflowUtils {
  validateWorkflow: (data: WorkflowData) => ValidationError[]
  exportWorkflow: (data: WorkflowData, format?: 'json' | 'yaml') => string
  importWorkflow: (content: string, format?: 'json' | 'yaml') => WorkflowData
  generateNodeId: (type: NodeType) => string
  generateEdgeId: (sourceId: string, targetId: string) => string
  cloneWorkflow: (data: WorkflowData) => WorkflowData
  mergeWorkflows: (workflows: WorkflowData[]) => WorkflowData
}

// API 响应接口
export interface WorkflowApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: ValidationError[]
  timestamp?: string
}

// 工作流历史记录接口
export interface WorkflowHistory {
  id: string
  workflowId: string
  version: number
  data: WorkflowData
  changes: {
    type: 'create' | 'update' | 'delete'
    nodeId?: string
    edgeId?: string
    description: string
  }[]
  createdBy: string
  createdAt: string
}

// 导出所有类型的联合类型，方便使用
export type AllWorkflowTypes =
  | User
  | Role
  | Department
  | Condition
  | WorkflowNode
  | WorkflowEdge
  | WorkflowData
  | ValidationError
  | MenuPosition
  | NodeConfigFormData
  | WorkflowConfig
  | WorkflowStats
  | NodeTemplate
  | WorkflowHistory
