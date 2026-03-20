import { type DataTableColumns } from 'naive-ui/es'

// 常量
export const PREVIEW_ROWS = 10

// 示例数据
export const sampleData = [
  {
    姓名: '张三',
    部门: '技术部',
    职位: '前端工程师',
    薪资: 12000,
    入职日期: '2023-01-15',
  },
  {
    姓名: '李四',
    部门: '产品部',
    职位: '产品经理',
    薪资: 15000,
    入职日期: '2022-05-20',
  },
  {
    姓名: '王五',
    部门: '设计部',
    职位: 'UI设计师',
    薪资: 10000,
    入职日期: '2023-03-10',
  },
]

// 操作历史列配置
export const historyColumns: DataTableColumns = [
  { title: '时间', key: 'time', width: 160 },
  { title: '操作', key: 'operation', width: 120 },
  { title: '描述', key: 'description', ellipsis: true },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: row => {
      return h(
        NTag,
        {
          type: row.status === 'success' ? 'success' : 'error',
        },
        { default: () => (row.status === 'success' ? '成功' : '失败') }
      )
    },
  },
]
