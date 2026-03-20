// ============ 类型定义 ============
export interface User {
  id: string
  name: string
  avatar?: string
  department: string
  role: string
  email?: string
  phone?: string
}

export interface Role {
  id: string
  name: string
  description?: string
  level?: number
}

export interface Department {
  id: string
  name: string
  parentId?: string
  manager?: string
}

export interface WorkflowScenario {
  id: string
  name: string
  description: string
  icon: string
  template: any
}

export interface ValidationError {
  nodeId: string
  nodeName: string
  field: string
  message: string
  type: 'required' | 'warning' | 'error'
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
          position: { x: 150, y: 280 },
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
                name: '小额',
                field: 'amount',
                operator: 'less_than',
                value: '1000',
              },
              {
                id: 'cond-2',
                name: '大额',
                field: 'amount',
                operator: 'greater_than',
                value: '1000',
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
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    department: '技术部',
    role: '前端工程师',
    email: 'zhangsan@company.com',
    phone: '13800138001',
  },
  {
    id: '2',
    name: '李四',
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    department: '技术部',
    role: '后端工程师',
    email: 'lisi@company.com',
    phone: '13800138002',
  },
  {
    id: '3',
    name: '王五',
    avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
    department: '产品部',
    role: '产品经理',
    email: 'wangwu@company.com',
    phone: '13800138003',
  },
  {
    id: '4',
    name: '赵六',
    avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
    department: '技术部',
    role: '技术总监',
    email: 'zhaoliu@company.com',
    phone: '13800138004',
  },
  {
    id: '5',
    name: '钱七',
    avatar: 'https://avatars.githubusercontent.com/u/5?v=4',
    department: '人事部',
    role: 'HR经理',
    email: 'qianqi@company.com',
    phone: '13800138005',
  },
  {
    id: '6',
    name: '孙八',
    avatar: 'https://avatars.githubusercontent.com/u/6?v=4',
    department: '财务部',
    role: '财务经理',
    email: 'sunba@company.com',
    phone: '13800138006',
  },
  {
    id: '7',
    name: '周九',
    avatar: 'https://avatars.githubusercontent.com/u/7?v=4',
    department: '设计部',
    role: 'UI设计师',
    email: 'zhoujiu@company.com',
    phone: '13800138007',
  },
  {
    id: '8',
    name: '吴十',
    avatar: 'https://avatars.githubusercontent.com/u/8?v=4',
    department: '运营部',
    role: '运营专员',
    email: 'wushi@company.com',
    phone: '13800138008',
  },
  {
    id: '9',
    name: '郑十一',
    avatar: 'https://avatars.githubusercontent.com/u/9?v=4',
    department: '产品部',
    role: '产品总监',
    email: 'zhengshiyi@company.com',
    phone: '13800138009',
  },
  {
    id: '10',
    name: '陈十二',
    avatar: 'https://avatars.githubusercontent.com/u/10?v=4',
    department: '销售部',
    role: '销售经理',
    email: 'chenshier@company.com',
    phone: '13800138010',
  },
]

// ============ 角色数据 ============
export const roleList: Role[] = [
  { id: '1', name: '实习生', description: '公司实习生', level: 1 },
  { id: '2', name: '初级工程师', description: '1-2年工作经验', level: 2 },
  { id: '3', name: '中级工程师', description: '2-5年工作经验', level: 3 },
  { id: '4', name: '高级工程师', description: '5-8年工作经验', level: 4 },
  { id: '5', name: '技术专家', description: '8年以上工作经验', level: 5 },
  { id: '6', name: '项目经理', description: '负责项目管理', level: 4 },
  { id: '7', name: '产品经理', description: '负责产品规划', level: 4 },
  { id: '8', name: '部门经理', description: '部门管理者', level: 5 },
  { id: '9', name: '技术总监', description: '技术部门负责人', level: 6 },
  { id: '10', name: '产品总监', description: '产品部门负责人', level: 6 },
]

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

// ============ 配置常量 ============

// 节点描述生成器
export const NODE_DESCRIPTION_GENERATORS = {
  initiators: (count: number) => `${count}个发起人`,
  approvers: (count: number) => `${count}个审批人`,
  copyUsers: (count: number) => `${count}个抄送人`,
  conditions: (count: number) => `${count}个条件`,
} as const

// 节点类型映射
export const NODE_MAPS = {
  typeClass: {
    start: 'node-start',
    approval: 'node-approval',
    copy: 'node-copy',
    condition: 'node-condition',
  } as const,

  icon: {
    start: 'i-mdi:play-circle',
    approval: 'i-mdi:account-check',
    copy: 'i-mdi:email-outline',
    condition: 'i-mdi:source-branch',
  } as const,
}

// 验证规则
export const VALIDATION_RULES = {
  approval: (node: any) =>
    !node.data?.approvers?.length ? '审批节点缺少审批人' : null,
  condition: (node: any) =>
    !node.data?.conditions?.length ? '条件节点缺少分支条件' : null,
} as const
