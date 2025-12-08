/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-03 12:25:11
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-04 16:44:21
 * @FilePath: \Robot_Admin\src\components\global\C_WorkFlow\data.ts
 * @Description:  工作（审批流）流组件 - 数据层
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { NodeType, WorkflowNode } from '@/types/work-flow'

// 节点类型选项
export const NODE_TYPE_OPTIONS = [
  {
    type: 'approval' as NodeType,
    label: '审批人',
    icon: 'i-mdi:account-check w-4 h-4',
    iconClass: 'approval-icon',
  },
  {
    type: 'copy' as NodeType,
    label: '抄送人',
    icon: 'i-mdi:email-outline w-4 h-4',
    iconClass: 'copy-icon',
  },
  {
    type: 'condition' as NodeType,
    label: '条件分支',
    icon: 'i-mdi:source-branch w-4 h-4',
    iconClass: 'condition-icon',
  },
]

// 审批模式选项
export const APPROVAL_MODES = [
  { value: 'any', label: '或签', desc: '任意一人同意即可通过' },
  { value: 'all', label: '会签', desc: '所有人都同意才能通过' },
  { value: 'sequence', label: '顺序审批', desc: '按选择顺序依次审批' },
]

// 字段选项
export const FIELD_OPTIONS = [
  { label: '申请金额', value: 'amount' },
  { label: '申请人部门', value: 'department' },
  { label: '申请类型', value: 'type' },
  { label: '紧急程度', value: 'priority' },
]

// 操作符选项
export const OPERATOR_OPTIONS = [
  { label: '等于', value: 'equals' },
  { label: '大于', value: 'greater_than' },
  { label: '小于', value: 'less_than' },
  { label: '包含', value: 'contains' },
  { label: '不等于', value: 'not_equals' },
]

// 节点标题映射
export const NODE_TITLES: Record<NodeType, string> = {
  start: '发起人',
  approval: '审批人',
  copy: '抄送人',
  condition: '条件分支',
}

// 配置标题映射
export const CONFIG_TITLES = {
  approval: '审批人设置',
  copy: '抄送人设置',
  condition: '条件分支设置',
}

// 字段显示名称映射
export const FIELD_DISPLAY_NAMES: Record<string, string> = {
  approvers: '审批人',
  conditions: '条件配置',
  connection: '节点连接',
  copyUsers: '抄送人',
}

// 错误类型文本映射
export const ERROR_TYPE_TEXTS: Record<string, string> = {
  required: '必填',
  incomplete: '不完整',
  warning: '警告',
  error: '错误',
}

// 初始节点数据
export const INITIAL_NODE: WorkflowNode = {
  id: 'start-1',
  type: 'start',
  position: { x: 150, y: 100 },
  data: { title: '发起人', status: 'active', initiators: [] },
}

// 默认头像生成函数
export const getDefaultAvatar = (name: string): string =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`

// 生成条件ID的函数
export const generateConditionId = (): string => `condition-${Date.now()}`

// 生成边ID的函数
export const generateEdgeId = (sourceId: string, targetId: string): string =>
  `edge-${sourceId}-${targetId}`

// 默认条件对象工厂函数
export const createDefaultCondition = () => ({
  id: generateConditionId(),
  name: '',
  field: '',
  operator: 'equals' as const,
  value: '',
})
