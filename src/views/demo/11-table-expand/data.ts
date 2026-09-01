import { h } from 'vue'
import { NTag } from 'naive-ui/es'
import type {
  DataRecord,
  TableColumn,
  ParentChildLinkMode,
} from '@robot-admin/naive-ui-components'
import type { GetEmployeesExpandListResponse } from '@/api/generated'

// ================= Demo 专用类型 =================
export interface TestRecord extends DataRecord {
  id: number
  name: string
  department: string
  role: string
  status: string
  childData?: ChildDataType[]
  hasChildren?: boolean
}

export interface DemoConfig {
  enableSelection: boolean
  enableChildSelection: boolean
  parentChildLinkMode: ParentChildLinkMode
}

// ================= 配置相关 =================
export const defaultConfig: DemoConfig = {
  enableSelection: true,
  enableChildSelection: true,
  parentChildLinkMode: 'loose',
}

// ================= 类型别名 - 直接使用API类型 =================
// 提取API响应中的员工数据类型
export type EmployeeData = GetEmployeesExpandListResponse['data']['list'][0]
// 提取子数据类型
export type ChildDataType = EmployeeData['childData'][0]
// 增强的记录类型 - 修复类型冲突
// ================= 子表格列配置 =================
export const childColumnsConfig = {
  // 项目子表列
  project: [
    { type: 'index', title: '序号', width: 50 },
    { key: 'project', title: '项目名称', width: 150 },
    { key: 'progress', title: '进度', width: 100 },
    { key: 'status', title: '状态', width: 100 },
  ] as TableColumn<ChildDataType>[],

  // 需求子表列
  requirement: [
    { type: 'index', title: '序号', width: 50 },
    { key: 'requirement', title: '需求名称', width: 150 },
    { key: 'priority', title: '优先级', width: 100 },
    { key: 'status', title: '状态', width: 100 },
  ] as TableColumn<ChildDataType>[],

  // 服务子表列
  service: [
    { type: 'index', title: '序号', width: 50 },
    { key: 'service', title: '服务名称', width: 150 },
    { key: 'version', title: '版本', width: 100 },
    { key: 'status', title: '状态', width: 100 },
  ] as TableColumn<ChildDataType>[],
}

// ================= 子表格列配置获取函数 =================
/**
 * 根据子数据类型获取对应的列配置
 * @param childData 子数据项
 * @returns 对应的表格列配置
 */
export const getChildColumns = (
  childData: ChildDataType
): TableColumn<ChildDataType>[] => {
  // 通过检查数据对象的属性来判断类型
  if ('project' in childData) {
    return childColumnsConfig.project
  }
  if ('requirement' in childData) {
    return childColumnsConfig.requirement
  }
  if ('service' in childData) {
    return childColumnsConfig.service
  }

  // 默认返回项目列配置
  console.warn('无法识别子数据类型，使用默认项目列配置')
  return childColumnsConfig.project
}

// ================= 主表格列配置 =================
export const dataColumns: TableColumn<TestRecord>[] = [
  {
    type: 'selection',
  },
  {
    type: 'expand',
  },
  {
    type: 'index',
    title: '序号',
    width: 50,
  },
  {
    key: 'name',
    title: '姓名',
    width: 120,
  },
  {
    key: 'department',
    title: '部门',
    width: 120,
  },
  {
    key: 'role',
    title: '角色',
    width: 150,
  },
  {
    key: 'status',
    title: '状态',
    width: 100,
    render: (row: TestRecord) => {
      return h(
        NTag,
        {
          type: row.status === '在职' ? 'success' : 'error',
          size: 'small',
        },
        () => row.status
      )
    },
  },
]
