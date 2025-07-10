import type {
  SelectOption,
  EditType,
  ButtonType,
  TableColumn,
  RowAction,
  DataRecord,
} from '@/types/modules/table'
import { PRESET_RULES } from '@/utils/v_verify'

// ================= 业务类型定义 =================

/**
 * @description 员工数据接口
 */
export interface Employee extends DataRecord {
  id: number
  name: string
  age: number
  gender: 'male' | 'female'
  email: string
  department: string
  joinDate: number
  status: string
  description: string
}

// ================= 编辑模式配置 - 使用C_Icon组件 =================

/**
 * @description 表格编辑模式配置数组
 * @constant {Array} EDIT_MODES - 支持的编辑模式列表
 */
export const EDIT_MODES = [
  { value: 'row' as const, label: '仅行编辑', icon: 'mdi:table-row' },
  { value: 'cell' as const, label: '仅单元格编辑', icon: 'mdi:table-cell' },
  { value: 'both' as const, label: '混合模式', icon: 'mdi:table-edit' },
  {
    value: 'modal' as const,
    label: '模态框编辑 🎯',
    icon: 'mdi:window-maximize',
  },
  { value: 'none' as const, label: '禁用编辑', icon: 'mdi:lock' },
]

// ================= 模式描述配置 =================

/**
 * @description 不同编辑模式的配置信息
 * @constant {Object} MODE_CONFIG - 编辑模式配置映射
 */
export const MODE_CONFIG = {
  row: {
    title: '行内编辑模式',
    description:
      '点击右侧操作列的"编辑"按钮，整行进入编辑状态。适合需要同时编辑多个字段的场景。',
    alertType: 'success' as const,
  },
  cell: {
    title: '单元格编辑模式',
    description:
      '鼠标悬停在单元格上会显示编辑图标，点击编辑图标进入编辑状态。适合快速修改单个字段。',
    alertType: 'info' as const,
  },
  both: {
    title: '混合编辑模式',
    description: '同时支持行编辑和单元格编辑两种方式。提供最大的编辑灵活性。',
    alertType: 'warning' as const,
  },
  modal: {
    title: '模态框编辑模式 🎯',
    description:
      '使用模态框表单进行编辑，表单验证、防抖、加载状态、错误处理全部自动化。代码简洁，功能强大。',
    alertType: 'success' as const,
  },
  none: {
    title: '只读模式',
    description: '所有编辑功能均被禁用，表格处于只读状态。',
    alertType: 'error' as const,
  },
}

// ================= 数据映射 =================

/**
 * @description 部门映射配置
 * @constant {Object} DEPARTMENT_MAP - 部门代码到中文名称的映射
 */
export const DEPARTMENT_MAP = {
  tech: '技术部',
  hr: '人事部',
  market: '市场部',
  finance: '财务部',
} as const

/**
 * @description 员工状态映射配置
 * @constant {Object} STATUS_MAP - 状态代码到中文名称的映射
 */
export const STATUS_MAP = {
  active: '在职',
  inactive: '离职',
  probation: '试用期',
} as const

// ================= 选项配置 =================

/**
 * @description 部门选择选项
 * @constant {SelectOption[]} departmentOptions - 部门下拉选项数组
 */
export const departmentOptions: SelectOption[] = Object.entries(
  DEPARTMENT_MAP
).map(([value, label]) => ({ label, value }))

/**
 * @description 员工状态选择选项
 * @constant {SelectOption[]} statusOptions - 状态下拉选项数组
 */
export const statusOptions: SelectOption[] = Object.entries(STATUS_MAP).map(
  ([value, label]) => ({ label, value })
)

// ================= 初始数据 =================

/**
 * @description 表格初始数据
 * @constant {Employee[]} initialTableData - 员工信息初始数据数组
 */
export const initialTableData: Employee[] = [
  {
    id: 1,
    name: '张三',
    age: 28,
    gender: 'male',
    email: 'zhangsan@example.com',
    department: 'tech',
    joinDate: new Date('2022-01-15').getTime(),
    status: 'active',
    description: '优秀的前端开发工程师，擅长Vue.js和React开发',
  },
  {
    id: 2,
    name: '李四',
    age: 32,
    gender: 'female',
    email: 'lisi@example.com',
    department: 'hr',
    joinDate: new Date('2021-06-20').getTime(),
    status: 'active',
    description: '资深人力资源专员，负责员工招聘和培训工作',
  },
  {
    id: 3,
    name: '王五',
    age: 25,
    gender: 'male',
    email: 'wangwu@example.com',
    department: 'tech',
    joinDate: new Date('2023-03-10').getTime(),
    status: 'active',
    description: '后端开发工程师，精通Java和Spring框架',
  },
  {
    id: 4,
    name: '赵六',
    age: 29,
    gender: 'female',
    email: 'zhaoliu@example.com',
    department: 'market',
    joinDate: new Date('2022-08-12').getTime(),
    status: 'probation',
    description: '市场营销专员，负责产品推广和客户关系维护',
  },
]

// ================= 扩展的表格数据（新增用于分页演示） =================

/**
 * @description 扩展的员工数据，包含更多记录用于分页演示
 * @constant {Employee[]} extendedTableData - 扩展的员工信息数据数组
 */
export const extendedTableData: Employee[] = [
  ...initialTableData,

  // 新增数据（共18条数据，便于分页展示）
  {
    id: 5,
    name: '陈七',
    age: 26,
    gender: 'male',
    email: 'chenqi@example.com',
    department: 'tech',
    joinDate: new Date('2023-05-15').getTime(),
    status: 'active',
    description: '全栈开发工程师，熟悉前后端技术栈，负责项目架构设计',
  },
  {
    id: 6,
    name: '孙八',
    age: 31,
    gender: 'female',
    email: 'sunba@example.com',
    department: 'finance',
    joinDate: new Date('2021-11-08').getTime(),
    status: 'active',
    description: '财务主管，负责公司财务管理和预算规划，具有CPA资质',
  },
  {
    id: 7,
    name: '周九',
    age: 27,
    gender: 'male',
    email: 'zhoujiu@example.com',
    department: 'market',
    joinDate: new Date('2022-12-03').getTime(),
    status: 'active',
    description: '资深市场分析师，负责市场调研和数据分析，精通数据挖掘',
  },
  {
    id: 8,
    name: '吴十',
    age: 24,
    gender: 'female',
    email: 'wushi@example.com',
    department: 'hr',
    joinDate: new Date('2023-07-20').getTime(),
    status: 'probation',
    description: '人力资源助理，协助处理员工入职和离职手续，学习HRBP知识',
  },
  {
    id: 9,
    name: '郑十一',
    age: 35,
    gender: 'male',
    email: 'zhengshiyi@example.com',
    department: 'tech',
    joinDate: new Date('2020-03-12').getTime(),
    status: 'active',
    description: '技术经理，负责团队管理和技术规划，拥有10年开发经验',
  },
  {
    id: 10,
    name: '王十二',
    age: 28,
    gender: 'female',
    email: 'wangshier@example.com',
    department: 'market',
    joinDate: new Date('2022-04-18').getTime(),
    status: 'active',
    description: '品牌经理，负责公司品牌建设和推广活动，擅长社交媒体营销',
  },
  {
    id: 11,
    name: '李十三',
    age: 30,
    gender: 'male',
    email: 'lishisan@example.com',
    department: 'finance',
    joinDate: new Date('2021-09-25').getTime(),
    status: 'active',
    description: '财务分析师，负责财务数据分析和报告，熟悉SAP系统',
  },
  {
    id: 12,
    name: '张十四',
    age: 23,
    gender: 'female',
    email: 'zhangshisi@example.com',
    department: 'tech',
    joinDate: new Date('2023-08-10').getTime(),
    status: 'probation',
    description: '前端开发实习生，学习Vue.js和TypeScript，表现优秀',
  },
  {
    id: 13,
    name: '赵十五',
    age: 33,
    gender: 'male',
    email: 'zhaoshiwu@example.com',
    department: 'hr',
    joinDate: new Date('2020-12-15').getTime(),
    status: 'active',
    description: '人力资源经理，制定招聘策略和员工发展计划，HRBP认证',
  },
  {
    id: 14,
    name: '钱十六',
    age: 29,
    gender: 'female',
    email: 'qianshiliu@example.com',
    department: 'market',
    joinDate: new Date('2022-02-28').getTime(),
    status: 'active',
    description: '数字营销专员，负责线上推广和社交媒体运营，精通SEO/SEM',
  },
  {
    id: 15,
    name: '孙十七',
    age: 26,
    gender: 'male',
    email: 'sunshiqi@example.com',
    department: 'tech',
    joinDate: new Date('2023-01-05').getTime(),
    status: 'active',
    description: 'DevOps工程师，负责自动化部署和运维监控，熟悉云平台',
  },
  {
    id: 16,
    name: '李十八',
    age: 32,
    gender: 'female',
    email: 'lishiba@example.com',
    department: 'finance',
    joinDate: new Date('2021-06-12').getTime(),
    status: 'active',
    description: '税务专员，负责公司税务申报和合规管理，注册税务师',
  },
  {
    id: 17,
    name: '周十九',
    age: 25,
    gender: 'male',
    email: 'zhoushijiu@example.com',
    department: 'tech',
    joinDate: new Date('2023-04-22').getTime(),
    status: 'probation',
    description: '后端开发工程师，专注于微服务架构设计，学习中',
  },
  {
    id: 18,
    name: '吴二十',
    age: 34,
    gender: 'female',
    email: 'wuershi@example.com',
    department: 'market',
    joinDate: new Date('2020-08-30').getTime(),
    status: 'active',
    description: '市场总监，制定市场战略和管理营销团队，MBA学历',
  },
]

// ================= 表格列配置 =================

/**
 * @description 获取表格列配置
 * @returns {TableColumn<DataRecord>[]} 表格列配置数组
 */
export const getTableColumns = (): TableColumn<DataRecord>[] => [
  {
    key: 'name',
    title: '姓名',
    width: 120,
    editable: true,
    required: true,
    editType: 'input' as EditType,
    editProps: { rules: [PRESET_RULES.length('姓名', 2, 20)] },
  },
  {
    key: 'age',
    title: '年龄',
    width: 100,
    editable: true,
    editType: 'number' as EditType,
    editProps: { min: 18, max: 65, step: 1, showButton: false },
    required: true,
  },
  {
    key: 'gender',
    title: '性别',
    width: 100,
    editable: true,
    editType: 'select' as EditType,
    editProps: {
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ],
    },
    render: (row: DataRecord) => {
      const employee = row as Employee
      return employee.gender === 'male' ? '男' : '女'
    },
    required: true,
  },
  {
    key: 'email',
    title: '邮箱',
    width: 200,
    editable: true,
    required: true,
    editType: 'email' as EditType,
  },
  {
    key: 'department',
    title: '部门',
    width: 120,
    editable: true,
    editType: 'select' as EditType,
    editProps: { options: departmentOptions },
    render: (row: DataRecord) => {
      const employee = row as Employee
      return (
        DEPARTMENT_MAP[employee.department as keyof typeof DEPARTMENT_MAP] ||
        employee.department
      )
    },
    required: true,
  },
  {
    key: 'joinDate',
    title: '入职日期',
    width: 140,
    editable: true,
    editType: 'date' as EditType,
    editProps: {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'timestamp',
    },
    render: (row: DataRecord) => {
      const employee = row as Employee
      return employee.joinDate
        ? new Date(employee.joinDate).toLocaleDateString()
        : '-'
    },
    required: true,
  },
  {
    key: 'status',
    title: '状态',
    width: 100,
    editable: true,
    editType: 'select' as EditType,
    editProps: { options: statusOptions },
    render: (row: DataRecord) => {
      const employee = row as Employee
      return (
        STATUS_MAP[employee.status as keyof typeof STATUS_MAP] ||
        employee.status
      )
    },
    required: false,
  },
  {
    key: 'description',
    title: '描述',
    width: 200,
    editable: true,
    editType: 'textarea' as EditType,
    editProps: {
      type: 'textarea',
      rows: 3,
      placeholder: '请输入员工描述信息',
      rules: [PRESET_RULES.length('描述', 0, 200)],
    },
    render: (row: DataRecord) => {
      const employee = row as Employee
      const desc = employee.description || ''
      return desc.length > 30 ? desc.substring(0, 30) + '...' : desc
    },
    required: false,
  },
]

// ================= 🗑️ 原有的表格行操作配置（保留向下兼容） =================

/**
 * @description 获取表格行操作配置（向下兼容）
 * @param message - 消息提示实例
 * @param dialog - 对话框实例
 * @param tableData - 表格数据引用
 * @returns {RowAction<DataRecord>[]} 行操作配置数组
 */
export const getTableRowActions = (
  message: any,
  dialog: any,
  tableData: any
): RowAction<DataRecord>[] => [
  {
    label: '查看',
    icon: 'mdi:eye',
    type: 'info' as ButtonType,
    onClick: () => {}, // 由表格组件内部处理
  },
  {
    label: '复制',
    icon: 'mdi:content-copy',
    type: 'default' as ButtonType,
    onClick: (row: DataRecord, index: number) => {
      const employee = row as Employee
      const newRow: Employee = {
        ...employee,
        id: Date.now(),
        name: `${employee.name}_副本`,
      }
      tableData.value.splice(index + 1, 0, newRow)
      message.success('复制成功')
    },
  },
  {
    label: '删除',
    icon: 'mdi:delete',
    type: 'error' as ButtonType,
    onClick: (row: DataRecord, index: number) => {
      const employee = row as Employee
      dialog.warning({
        title: '确认删除',
        content: `确定要删除员工"${employee.name}"吗？`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          tableData.value.splice(index, 1)
          message.success('删除成功')
        },
      })
    },
  },
]

// ================= 工具函数 =================

/**
 * @description 创建新员工数据
 * @returns {Employee} 新员工对象
 */
export const createNewEmployee = (): Employee => ({
  id: Date.now(),
  name: `新员工_${Math.floor(Math.random() * 1000)}`,
  age: 25,
  gender: 'male',
  email: `user${Date.now()}@example.com`,
  department: 'tech',
  joinDate: Date.now(),
  status: 'probation',
  description: '新入职员工，待完善信息',
})

// ================= 🎯 新增：操作配置工厂函数 =================

/**
 * @description 创建标准的操作配置
 * @param tableData - 表格数据引用
 * @param message - 消息提示实例
 * @param dialog - 对话框实例
 * @returns 标准操作配置对象
 */
export const createStandardActions = (
  tableData: any,
  message: any,
  dialog: any
) => ({
  // 内置操作使用默认配置
  edit: {},
  delete: {
    confirmText: (row: DataRecord) => {
      const employee = row as Employee
      return `确定要删除员工"${employee.name}"吗？`
    },
  },
  detail: {},

  // 自定义操作
  custom: [
    {
      key: 'copy',
      label: '复制',
      icon: 'mdi:content-copy',
      type: 'default' as ButtonType,
      onClick: (row: DataRecord, index: number) => {
        const employee = row as Employee
        const newRow: Employee = {
          ...employee,
          id: Date.now(),
          name: `${employee.name}_副本`,
        }
        tableData.value.splice(index + 1, 0, newRow)
        message.success('复制成功')
      },
      show: (row: DataRecord) => {
        const employee = row as Employee
        return employee.status === 'active'
      }, // 只有在职员工显示复制按钮
    },
    {
      key: 'authorize',
      label: '授权',
      icon: 'mdi:shield-key',
      type: 'warning' as ButtonType,
      onClick: (row: DataRecord) => {
        const employee = row as Employee
        dialog.info({
          title: '员工授权',
          content: `正在为员工 "${employee.name}" 配置系统权限...`,
          positiveText: '确定',
          onPositiveClick: () => {
            message.success('授权配置完成')
          },
        })
      },
    },
  ],
})

/**
 * @description 创建API模式的操作配置
 * @returns API操作配置对象
 */
export const createApiActions = () => ({
  edit: {
    api: '/api/employees', // 真实API接口
  },
  delete: {
    api: '/api/employees',
    confirmText: (row: DataRecord) => {
      const employee = row as Employee
      return `确定要删除员工"${employee.name}"吗？此操作不可撤销！`
    },
  },
  detail: {},

  custom: [
    {
      key: 'export',
      label: '导出',
      icon: 'mdi:download',
      type: 'success' as ButtonType,
      onClick: (row: DataRecord) => {
        const employee = row as Employee
        console.log('导出员工信息:', employee)
        // 实际的导出逻辑
      },
    },
  ],
})

/**
 * @description 创建自定义逻辑的操作配置
 * @param onEdit - 自定义编辑处理函数
 * @param onDelete - 自定义删除处理函数
 * @param onView - 自定义查看处理函数
 * @returns 自定义操作配置对象
 */
export const createCustomActions = (
  onEdit: (row: Employee) => void,
  onDelete: (row: Employee, index: number) => void,
  onView: (row: Employee) => void
) => ({
  edit: {
    onEdit: (row: DataRecord) => {
      const employee = row as Employee
      console.log('自定义编辑逻辑:', employee)
      onEdit(employee)
    },
  },
  delete: {
    onDelete: async (row: DataRecord, index: number) => {
      const employee = row as Employee
      console.log('自定义删除逻辑:', employee)
      await onDelete(employee, index)
    },
  },
  detail: {
    onView: (row: DataRecord) => {
      const employee = row as Employee
      console.log('自定义查看逻辑:', employee)
      onView(employee)
    },
  },
})
