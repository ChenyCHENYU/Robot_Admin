import type { SelectOption, DataRecord } from '@/types/modules/table'
import type { TableColumn, UseTableCrudConfig } from '@robot-admin/request-core'
import { PRESET_RULES } from '@/utils/v_verify'

// ================= 业务类型定义 =================
export interface Employee extends DataRecord {
  id: number
  name: string
  age: number
  gender: 'male' | 'female'
  email: string
  department: 'tech' | 'hr' | 'market' | 'finance'
  joinDate: number
  status: 'active' | 'inactive' | 'probation'
  description?: string
}

// ================= 编辑模式配置 =================
export const EDIT_MODES = [
  { value: 'row', label: '仅行编辑', icon: 'mdi:table-row' },
  { value: 'cell', label: '仅单元格编辑', icon: 'mdi:table-cell' },
  { value: 'both', label: '混合模式', icon: 'mdi:table-edit' },
  { value: 'modal', label: '模态框编辑', icon: 'mdi:window-maximize' },
  { value: 'none', label: '禁用编辑', icon: 'mdi:lock' },
]

export const MODE_CONFIG = {
  row: {
    title: '行内编辑模式',
    description:
      '点击右侧操作列的"编辑"按钮，整行进入编辑状态。适合需要同时编辑多个字段的场景。',
    alertType: 'success',
  },
  cell: {
    title: '单元格编辑模式',
    description:
      '鼠标悬停在单元格上会显示编辑图标，点击编辑图标进入编辑状态。适合快速修改单个字段。',
    alertType: 'info',
  },
  both: {
    title: '混合编辑模式',
    description: '同时支持行编辑和单元格编辑两种方式。提供最大的编辑灵活性。',
    alertType: 'warning',
  },
  modal: {
    title: '模态框编辑模式',
    description:
      '使用模态框表单进行编辑，表单验证、防抖、加载状态、错误处理全部自动化。代码简洁，功能强大。',
    alertType: 'success',
  },
  none: {
    title: '只读模式',
    description: '所有编辑功能均被禁用，表格处于只读状态。',
    alertType: 'error',
  },
}

// ================= 选项配置 =================
const departmentOptions: SelectOption[] = [
  { label: '技术部', value: 'tech' },
  { label: '人事部', value: 'hr' },
  { label: '市场部', value: 'market' },
  { label: '财务部', value: 'finance' },
]

const statusOptions: SelectOption[] = [
  { label: '在职', value: 'active' },
  { label: '离职', value: 'inactive' },
  { label: '试用期', value: 'probation' },
]

const genderOptions: SelectOption[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

// ================= 简化的格式化函数 =================
const formatGender = (gender: string) =>
  gender === 'male' ? '男' : gender === 'female' ? '女' : gender

const formatDate = (timestamp: number) =>
  timestamp ? new Date(timestamp).toLocaleDateString() : '-'

const formatDepartment = (department: string) => {
  const map: Record<string, string> = {
    tech: '技术部',
    hr: '人事部',
    market: '市场部',
    finance: '财务部',
  }
  return map[department] || department
}

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    active: '在职',
    inactive: '离职',
    probation: '试用期',
  }
  return map[status] || status
}

const formatDescription = (desc?: string) =>
  desc ? (desc.length > 30 ? desc.substring(0, 30) + '...' : desc) : '暂无描述'

// ================= 表格列配置 =================
export const getTableColumns = (): TableColumn[] => [
  {
    key: 'name',
    title: '姓名',
    width: 120,
    editable: true,
    required: true,
    editType: 'input',
    editProps: {
      rules: [PRESET_RULES.length('姓名', 2, 20)],
      placeholder: '请输入姓名',
    },
  },
  {
    key: 'age',
    title: '年龄',
    width: 100,
    editable: true,
    required: true,
    editType: 'number',
    editProps: {
      min: 18,
      max: 65,
      step: 1,
      showButton: false,
      placeholder: '请输入年龄',
    },
  },
  {
    key: 'gender',
    title: '性别',
    width: 100,
    editable: true,
    required: true,
    editType: 'select',
    editProps: {
      options: genderOptions,
      placeholder: '请选择性别',
    },
    render: (row: Employee) => formatGender(row.gender),
  },
  {
    key: 'email',
    title: '邮箱',
    width: 200,
    editable: true,
    required: true,
    editType: 'email',
    editProps: {
      rules: [PRESET_RULES.email('邮箱')],
      placeholder: '请输入邮箱地址',
    },
  },
  {
    key: 'department',
    title: '部门',
    width: 120,
    editable: true,
    required: true,
    editType: 'select',
    editProps: {
      options: departmentOptions,
      placeholder: '请选择部门',
    },
    render: (row: Employee) => formatDepartment(row.department),
  },
  {
    key: 'joinDate',
    title: '入职日期',
    width: 140,
    editable: true,
    required: true,
    editType: 'date',
    editProps: {
      type: 'date',
      format: 'yyyy-MM-dd',
      valueFormat: 'timestamp',
      placeholder: '请选择入职日期',
    },
    render: (row: Employee) => formatDate(row.joinDate),
  },
  {
    key: 'status',
    title: '状态',
    width: 100,
    editable: true,
    required: false,
    editType: 'select',
    editProps: {
      options: statusOptions,
      placeholder: '请选择状态',
    },
    render: (row: Employee) => formatStatus(row.status),
  },
  {
    key: 'description',
    title: '描述',
    width: 200,
    editable: true,
    required: false,
    editType: 'textarea',
    editProps: {
      type: 'textarea',
      rows: 3,
      placeholder: '请输入员工描述信息',
      rules: [PRESET_RULES.length('描述', 0, 200)],
    },
    render: (row: Employee) => formatDescription(row.description),
  },
]

// ================= 工具函数 =================
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

// ================= 详情弹窗配置 =================
export const detailConfig = {
  sections: [
    {
      title: '基本信息',
      columns: 2,
      items: [
        { label: '员工ID', key: 'id', type: 'number' },
        { label: '姓名', key: 'name', type: 'text' },
        {
          label: '年龄',
          key: 'age',
          type: 'number',
          formatter: (val: number) => `${val}岁`,
        },
        {
          label: '性别',
          key: 'gender',
          type: 'tag',
          tagType: 'info',
          formatter: (val: string) =>
            val === 'male' ? '男' : val === 'female' ? '女' : val,
        },
      ],
    },
    {
      title: '工作信息',
      columns: 2,
      items: [
        {
          label: '部门',
          key: 'department',
          type: 'tag',
          tagType: 'success',
        },
        {
          label: '状态',
          key: 'status',
          type: 'tag',
          tagType: 'success',
        },
        { label: '入职日期', key: 'joinDate', type: 'date' },
        { label: '邮箱', key: 'email', type: 'email' },
      ],
    },
    {
      title: '其他信息',
      columns: 1,
      items: [
        {
          label: '描述',
          key: 'description',
          type: 'text',
          span: 2,
          formatter: (val?: string) => val || '暂无描述信息',
        },
      ],
    },
  ],
}

// ================= 统一配置对象 =================
/**
 * 员工表格 CRUD 配置
 * @description 一个配置对象搞定所有表格需求，无需工厂函数和类型体操
 */
export const employeeTableConfig: UseTableCrudConfig<Employee> = {
  // API 端点配置
  api: {
    list: '/employees/list',
    get: '/employees/:id',
    update: '/employees/:id',
    remove: '/employees/:id',
    create: '/employees',
  },

  // 表格列配置
  columns: getTableColumns(),

  // 自定义操作按钮
  customActions: [
    {
      key: 'copy',
      label: '复制',
      icon: 'mdi:content-copy',
      type: 'default',
      handler: (row, ctx) => {
        const newRow: Employee = {
          ...row,
          id: Date.now(),
          name: `${row.name}_副本`,
        }
        // 计算实际插入位置（考虑分页）
        const actualIndex = ctx.paginationEnabled
          ? (ctx.page.current - 1) * ctx.page.size + ctx.index + 1
          : ctx.index + 1
        ctx.data.splice(actualIndex, 0, newRow)
        ctx.message.success('复制成功')
      },
    },
    {
      key: 'authorize',
      label: '授权',
      icon: 'mdi:shield-key',
      type: 'warning',
      handler: (row, ctx) => {
        ctx.dialog.info({
          title: '员工授权',
          content: `正在为员工 "${row.name}" 配置系统权限...`,
          positiveText: '确定',
          onPositiveClick: () => {
            ctx.message.success('授权配置完成')
          },
        })
      },
    },
  ],

  // 详情弹窗配置
  detail: detailConfig,

  // 配置选项
  idKey: 'id',
  createNewRow: createNewEmployee,
}
