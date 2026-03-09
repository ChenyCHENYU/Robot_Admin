import type { TableColumn, DataRecord } from '@robot-admin/naive-ui-components'

// ================= 类型定义 =================
export interface ChildWorkData {
  id: number
  project?: string
  progress?: string
  requirement?: string
  priority?: string
  service?: string
  version?: string
  status: string
}

export interface DynamicEmployee extends DataRecord {
  id: number
  name: string
  age: number
  email: string
  department: string
  role: string
  salary: number
  status: string
  hasChildren: boolean
  childData: ChildWorkData[]
}

export interface DynamicEmployeeApiResponse {
  code: string
  message: string
  data: {
    list: DynamicEmployee[]
    total: number
    page: number
    pageSize: number
  }
  timestamp: number
}

// ================= 操作日志类型 =================
export interface Log {
  type: 'add' | 'delete' | 'edit' | 'select'
  message: string
  time: string
}

// ================= 模拟API数据 =================
export const mockDynamicEmployeeData: DynamicEmployeeApiResponse = {
  code: '0',
  message: '操作成功',
  data: {
    list: [
      {
        id: 1,
        name: '张三',
        age: 28,
        email: 'zhang@example.com',
        department: '技术部',
        role: '前端工程师',
        salary: 15000,
        status: '在职',
        hasChildren: true,
        childData: [
          {
            id: 101,
            project: '管理系统前端',
            progress: '80%',
            status: '进行中',
          },
          {
            id: 102,
            project: '移动应用开发',
            progress: '60%',
            status: '设计中',
          },
          {
            id: 103,
            project: '组件库建设',
            progress: '90%',
            status: '测试中',
          },
        ],
      },
      {
        id: 2,
        name: '李四',
        age: 32,
        email: 'li@example.com',
        department: '产品部',
        role: '产品经理',
        salary: 18000,
        status: '在职',
        hasChildren: true,
        childData: [
          {
            id: 201,
            requirement: '用户需求调研',
            status: '已完成',
            priority: '高',
          },
          {
            id: 202,
            requirement: '竞品分析报告',
            status: '进行中',
            priority: '中',
          },
          {
            id: 203,
            requirement: '原型设计评审',
            status: '待开始',
            priority: '高',
          },
        ],
      },
      {
        id: 3,
        name: '王五',
        age: 26,
        email: 'wang@example.com',
        department: '设计部',
        role: 'UI设计师',
        salary: 12000,
        status: '离职',
        hasChildren: false,
        childData: [],
      },
      {
        id: 4,
        name: '赵六',
        age: 35,
        email: 'zhao@example.com',
        department: '技术部',
        role: '后端工程师',
        salary: 20000,
        status: '在职',
        hasChildren: true,
        childData: [
          {
            id: 401,
            service: 'API接口开发',
            version: 'v2.1',
            status: '已部署',
          },
          {
            id: 402,
            service: '数据库优化',
            version: 'v1.3',
            status: '测试中',
          },
        ],
      },
      {
        id: 5,
        name: '钱七',
        age: 29,
        email: 'qian@example.com',
        department: '运营部',
        role: '运营专员',
        salary: 13000,
        status: '在职',
        hasChildren: false,
        childData: [],
      },
    ],
    total: 5,
    page: 1,
    pageSize: 10,
  },
  timestamp: Date.now(),
}

// ================= 表格列配置 =================
export const dynamicTableColumns: TableColumn<DataRecord>[] = [
  {
    key: 'name',
    title: '姓名',
    width: 100,
    editable: true,
    editType: 'input',
  },
  {
    key: 'age',
    title: '年龄',
    width: 80,
    editable: true,
    editType: 'number',
  },
  {
    key: 'email',
    title: '邮箱',
    width: 200,
    editable: true,
    editType: 'email',
  },
  {
    key: 'department',
    title: '部门',
    width: 100,
    editable: true,
    editType: 'select',
    editProps: {
      options: [
        { label: '技术部', value: '技术部' },
        { label: '产品部', value: '产品部' },
        { label: '设计部', value: '设计部' },
        { label: '运营部', value: '运营部' },
      ],
    },
  },
  {
    key: 'role',
    title: '角色',
    width: 120,
    editable: true,
    editType: 'input',
  },
  {
    key: 'salary',
    title: '薪资',
    width: 100,
    editable: true,
    editType: 'number',
    render: (row: DataRecord) => {
      const employee = row as DynamicEmployee
      return `¥${employee.salary.toLocaleString()}`
    },
  },
  {
    key: 'status',
    title: '状态',
    width: 80,
    editable: true,
    editType: 'select',
    editProps: {
      options: [
        { label: '在职', value: '在职' },
        { label: '离职', value: '离职' },
      ],
    },
    render: (row: DataRecord) => {
      const employee = row as DynamicEmployee
      return employee.status === '在职' ? '🟢 在职' : '🔴 离职'
    },
  },
]

// ================= 工具函数 =================
export const getLogTagType = (type: Log['type']) => {
  const typeMap = {
    add: 'success',
    delete: 'error',
    edit: 'warning',
    select: 'info',
  }
  return typeMap[type] || 'default'
}

// ================= 默认新员工数据生成器 =================
export const createDefaultEmployee = (): DynamicEmployee => ({
  id: Date.now(),
  name: '新员工',
  age: 25,
  email: '',
  department: '技术部',
  role: '实习生',
  salary: 8000,
  status: '在职',
  hasChildren: false,
  childData: [],
})

// ================= 随机员工数据生成器 =================
export const generateRandomEmployee = (): DynamicEmployee => {
  const names = ['赵六', '钱七', '孙八', '李九', '周十', '吴十一']
  const departments = ['技术部', '产品部', '设计部', '运营部']
  const roles = [
    '前端工程师',
    '后端工程师',
    '产品经理',
    'UI设计师',
    '运营专员',
    '测试工程师',
  ]

  return {
    id: Date.now(),
    name: names[Math.floor(Math.random() * names.length)],
    age: Math.floor(Math.random() * 20) + 23,
    email: `user${Date.now()}@example.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    salary: Math.floor(Math.random() * 15000) + 8000,
    status: '在职',
    hasChildren: false,
    childData: [],
  }
}
