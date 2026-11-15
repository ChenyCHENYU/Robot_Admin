/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 审批流场景、用户和本机草稿契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  WorkflowData,
  WorkflowNode,
  User,
  Department,
  WorkflowConditionField,
} from '@robot-admin/naive-ui-components/C_WorkFlow'

import { createPersonAvatar } from '@/utils/d_avatar'

// ============ 类型定义 ============
export interface WorkflowScenario {
  id: string
  name: string
  description: string
  icon: string
  template: WorkflowData
}

// ============ 工作流场景模板数据 ============
export const workflowScenarios: WorkflowScenario[] = [
  {
    id: 'default-designer',
    name: '默认设计器',
    description: '空白设计器，自由构建工作流',
    icon: 'mdi:drawing',
    template: {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 150, y: 100 },
          data: { title: '发起人', status: 'active', initiators: [] },
        },
      ],
      edges: [],
    },
  },
  {
    id: 'leave-approval',
    name: '请假审批',
    description: '员工请假申请的简单审批流程',
    icon: 'mdi:calendar-remove',
    template: {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 150, y: 100 },
          data: { title: '发起人', status: 'active', initiators: [] },
        },
        {
          id: 'approval-1',
          type: 'approval',
          position: { x: 150, y: 430 },
          data: {
            title: '直属领导审批',
            status: 'pending',
            approvers: [
              { id: '4', name: '赵六', department: '技术部', role: '技术总监' },
            ],
            approvalMode: 'any',
          },
        },
      ],
      edges: [
        {
          id: 'edge-start-1-approval-1',
          source: 'start-1',
          target: 'approval-1',
          animated: true,
          type: 'default',
        },
      ],
    },
  },
  {
    id: 'purchase-approval',
    name: '采购申请',
    description: '物品采购的多级审批流程',
    icon: 'mdi:cart',
    template: {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 150, y: 100 },
          data: { title: '发起人', status: 'active' },
        },
        {
          id: 'approval-1',
          type: 'approval',
          position: { x: 150, y: 280 },
          data: {
            title: '部门经理审批',
            status: 'pending',
            approvers: [
              { id: '4', name: '赵六', department: '技术部', role: '技术总监' },
            ],
            approvalMode: 'any',
          },
        },
        {
          id: 'approval-2',
          type: 'approval',
          position: { x: 150, y: 460 },
          data: {
            title: '财务审批',
            status: 'pending',
            approvers: [
              { id: '6', name: '孙八', department: '财务部', role: '财务经理' },
            ],
            approvalMode: 'any',
          },
        },
        {
          id: 'copy-1',
          type: 'copy',
          position: { x: 150, y: 640 },
          data: {
            title: '抄送人事',
            status: 'pending',
            copyUsers: [
              { id: '5', name: '钱七', department: '人事部', role: 'HR经理' },
            ],
          },
        },
      ],
      edges: [
        {
          id: 'edge-start-1-approval-1',
          source: 'start-1',
          target: 'approval-1',
          animated: true,
          type: 'default',
        },
        {
          id: 'edge-approval-1-approval-2',
          source: 'approval-1',
          target: 'approval-2',
          animated: true,
          type: 'default',
        },
        {
          id: 'edge-approval-2-copy-1',
          source: 'approval-2',
          target: 'copy-1',
          animated: true,
          type: 'default',
        },
      ],
    },
  },
  {
    id: 'expense-approval',
    name: '费用报销',
    description: '基于金额的条件分支审批流程',
    icon: 'mdi:receipt',
    template: {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 150, y: 100 },
          data: { title: '发起人', status: 'active' },
        },
        {
          id: 'condition-1',
          type: 'condition',
          position: { x: 150, y: 280 },
          data: {
            title: '金额判断',
            status: 'pending',
            conditions: [
              {
                id: 'cond-1',
                name: '小额 · 直属领导',
                field: 'amount',
                operator: 'less_than',
                value: '1000',
                targetNodeId: 'approval-1',
                priority: 0,
              },
              {
                id: 'cond-2',
                name: '其他金额 · 财务与总监',
                field: 'amount',
                operator: 'greater_than',
                value: '1000',
                targetNodeId: 'approval-2',
                isDefault: true,
                priority: 1,
              },
            ],
          },
        },
        {
          id: 'approval-1',
          type: 'approval',
          position: { x: -30, y: 460 },
          data: {
            title: '直属领导',
            status: 'pending',
            approvers: [
              { id: '4', name: '赵六', department: '技术部', role: '技术总监' },
            ],
            approvalMode: 'any',
          },
        },
        {
          id: 'approval-2',
          type: 'approval',
          position: { x: 330, y: 460 },
          data: {
            title: '财务+总监',
            status: 'pending',
            approvers: [
              { id: '6', name: '孙八', department: '财务部', role: '财务经理' },
              {
                id: '9',
                name: '郑十一',
                department: '产品部',
                role: '产品总监',
              },
            ],
            approvalMode: 'all',
          },
        },
      ],
      edges: [
        {
          id: 'edge-start-1-condition-1',
          source: 'start-1',
          target: 'condition-1',
          animated: true,
          type: 'default',
        },
        {
          id: 'edge-condition-1-approval-1',
          source: 'condition-1',
          target: 'approval-1',
          animated: true,
          type: 'default',
        },
        {
          id: 'edge-condition-1-approval-2',
          source: 'condition-1',
          target: 'approval-2',
          animated: true,
          type: 'default',
        },
      ],
    },
  },
  {
    id: 'contract-approval',
    name: '合同审批',
    description: '合同签署的复杂多级审批流程',
    icon: 'mdi:file-document-edit',
    template: {
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 150, y: 100 },
          data: { title: '发起人', status: 'active' },
        },
        {
          id: 'approval-1',
          type: 'approval',
          position: { x: 150, y: 280 },
          data: {
            title: '业务审批',
            status: 'pending',
            approvers: [
              {
                id: '10',
                name: '陈十二',
                department: '销售部',
                role: '销售经理',
              },
            ],
            approvalMode: 'any',
          },
        },
        {
          id: 'approval-2',
          type: 'approval',
          position: { x: 150, y: 460 },
          data: {
            title: '法务审批',
            status: 'pending',
            approvers: [
              { id: '5', name: '钱七', department: '人事部', role: 'HR经理' },
            ],
            approvalMode: 'any',
          },
        },
        {
          id: 'approval-3',
          type: 'approval',
          position: { x: 150, y: 640 },
          data: {
            title: '财务审批',
            status: 'pending',
            approvers: [
              { id: '6', name: '孙八', department: '财务部', role: '财务经理' },
            ],
            approvalMode: 'any',
          },
        },
        {
          id: 'copy-1',
          type: 'copy',
          position: { x: 150, y: 820 },
          data: {
            title: '抄送总监',
            status: 'pending',
            copyUsers: [
              { id: '4', name: '赵六', department: '技术部', role: '技术总监' },
              {
                id: '9',
                name: '郑十一',
                department: '产品部',
                role: '产品总监',
              },
            ],
          },
        },
      ],
      edges: [
        {
          id: 'edge-start-1-approval-1',
          source: 'start-1',
          target: 'approval-1',
          animated: true,
          type: 'default',
        },
        {
          id: 'edge-approval-1-approval-2',
          source: 'approval-1',
          target: 'approval-2',
          animated: true,
          type: 'default',
        },
        {
          id: 'edge-approval-2-approval-3',
          source: 'approval-2',
          target: 'approval-3',
          animated: true,
          type: 'default',
        },
        {
          id: 'edge-approval-3-copy-1',
          source: 'approval-3',
          target: 'copy-1',
          animated: true,
          type: 'default',
        },
      ],
    },
  },
]

// ============ 用户数据 ============
export const userList: User[] = [
  {
    id: '1',
    name: '张三',

    department: '技术部',
    role: '前端工程师',
    email: 'zhangsan@company.com',
    phone: '13800138001',
  },
  {
    id: '2',
    name: '李四',

    department: '技术部',
    role: '后端工程师',
    email: 'lisi@company.com',
    phone: '13800138002',
  },
  {
    id: '3',
    name: '王五',

    department: '产品部',
    role: '产品经理',
    email: 'wangwu@company.com',
    phone: '13800138003',
  },
  {
    id: '4',
    name: '赵六',

    department: '技术部',
    role: '技术总监',
    email: 'zhaoliu@company.com',
    phone: '13800138004',
  },
  {
    id: '5',
    name: '钱七',

    department: '人事部',
    role: 'HR经理',
    email: 'qianqi@company.com',
    phone: '13800138005',
  },
  {
    id: '6',
    name: '孙八',

    department: '财务部',
    role: '财务经理',
    email: 'sunba@company.com',
    phone: '13800138006',
  },
  {
    id: '7',
    name: '周九',

    department: '设计部',
    role: 'UI设计师',
    email: 'zhoujiu@company.com',
    phone: '13800138007',
  },
  {
    id: '8',
    name: '吴十',

    department: '运营部',
    role: '运营专员',
    email: 'wushi@company.com',
    phone: '13800138008',
  },
  {
    id: '9',
    name: '郑十一',

    department: '产品部',
    role: '产品总监',
    email: 'zhengshiyi@company.com',
    phone: '13800138009',
  },
  {
    id: '10',
    name: '陈十二',

    department: '销售部',
    role: '销售经理',
    email: 'chenshier@company.com',
    phone: '13800138010',
  },
]

// 模板只描述人员 ID，在展示前统一补全头像；恢复草稿同样经过此入口。
userList.forEach(user => {
  user.avatar = createPersonAvatar(user.name)
})
/** 补齐已知人员的头像，保留草稿中的实际人员信息。 */
export function hydrateWorkflowPeople(data: WorkflowData): WorkflowData {
  const people = (users: User[] = []) =>
    users.map(user => ({
      ...user,
      avatar:
        userList.find(item => item.id === user.id)?.avatar ??
        createPersonAvatar(user.name),
    }))
  return {
    ...data,
    nodes: data.nodes.map(node => {
      if (node.type === 'approval')
        return {
          ...node,
          data: { ...node.data, approvers: people(node.data.approvers) },
        }
      if (node.type === 'copy')
        return {
          ...node,
          data: { ...node.data, copyUsers: people(node.data.copyUsers) },
        }
      if (node.type === 'start')
        return {
          ...node,
          data: { ...node.data, initiators: people(node.data.initiators) },
        }
      return node
    }),
  }
}
workflowScenarios.forEach(scenario => {
  if (scenario.id !== 'default-designer') {
    const start = scenario.template.nodes.find(node => node.type === 'start')
    if (start) start.data.initiators = [userList[0]]
  }
  scenario.template = hydrateWorkflowPeople(scenario.template)
})

// ============ 部门数据 ============
export const deptList: Department[] = [
  { id: '1', name: '技术部', manager: '赵六' },
  { id: '2', name: '产品部', manager: '郑十一' },
  { id: '3', name: '设计部', manager: '周九' },
  { id: '4', name: '人事部', manager: '钱七' },
  { id: '5', name: '财务部', manager: '孙八' },
  { id: '6', name: '运营部', manager: '吴十' },
  { id: '7', name: '销售部', manager: '陈十二' },
  { id: '8', name: '前端组', parentId: '1', manager: '张三' },
  { id: '9', name: '后端组', parentId: '1', manager: '李四' },
  { id: '10', name: '测试组', parentId: '1' },
]

/** 条件配置使用组件公开字段协议，不在应用重复实现分支求值。 */
export const CONDITION_FIELDS: WorkflowConditionField[] = [
  {
    key: 'amount',
    label: '报销金额（元）',
    type: 'number',
    operators: ['less_than', 'greater_than', 'equals'],
  },
]
export const NODE_LABELS = {
  start: '发起',
  approval: '审批',
  copy: '抄送',
  condition: '条件分支',
}
export const USER_OPTIONS = userList.map(user => ({
  label: user.name,
  value: user.id,
}))

const validStoredPosition = (position: WorkflowNode['position'] | undefined) =>
  Number.isFinite(position?.x) && Number.isFinite(position?.y)

const validStoredNode = (value: unknown): value is WorkflowNode => {
  if (!value || typeof value !== 'object') return false
  const node = value as Partial<WorkflowNode>
  return (
    typeof node.id === 'string' &&
    typeof node.type === 'string' &&
    ['start', 'approval', 'copy', 'condition'].includes(node.type) &&
    typeof node.data?.title === 'string' &&
    validStoredPosition(node.position)
  )
}
const validStoredFlow = (value: unknown): value is WorkflowData => {
  if (!value || typeof value !== 'object') return false
  const flow = value as Partial<WorkflowData>
  return (
    Array.isArray(flow.nodes) &&
    flow.nodes.length <= 300 &&
    flow.nodes.every(validStoredNode) &&
    Array.isArray(flow.edges) &&
    flow.edges.length <= 500 &&
    flow.edges.every(
      edge =>
        typeof edge?.id === 'string' &&
        typeof edge.source === 'string' &&
        typeof edge.target === 'string'
    )
  )
}
/** 只恢复已知场景和可渲染草稿，不让损坏的本机记录阻断工作台。 */
export const restoreWorkflowDrafts = (
  raw: string
): Record<string, WorkflowData> => {
  const stored = JSON.parse(raw)
  if (
    stored?.version !== 1 ||
    !stored.drafts ||
    typeof stored.drafts !== 'object'
  )
    throw new Error('草稿结构无效')
  const result: Record<string, WorkflowData> = {}
  workflowScenarios.forEach(scenario => {
    const item = stored.drafts[scenario.id]
    if (validStoredFlow(item)) result[scenario.id] = item
  })
  return result
}
