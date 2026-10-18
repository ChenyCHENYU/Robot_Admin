/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\demo\11-table-expand\data.ts
 * @Description: 表格演示配置与展示；数据源遵循项目运行模式
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { DataTableColumns, DataTableRowKey } from 'naive-ui'
import type {
  TableColumn,
  TableInstance,
  ParentChildLinkMode,
} from '@robot-admin/naive-ui-components/C_Table'
import type {
  DemoEmployee as TestRecord,
  DemoEmployeeTask as ChildDataType,
} from '@/api/demo-employees.contract'
export type { DemoEmployeeTask as ChildDataType } from '@/api/demo-employees.contract'

// ================= Demo 专用类型 =================
export type { DemoEmployee as TestRecord } from '@/api/demo-employees.contract'

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

// ================= 子表格列配置 =================
const childIndexColumn = {
  key: '_index',
  title: '序号',
  width: 50,
  render: (_row: ChildDataType, index: number) => index + 1,
}

export const childColumnsConfig = {
  // 项目子表列
  project: [
    childIndexColumn,
    { key: 'project', title: '项目名称', width: 150 },
    { key: 'progress', title: '进度', width: 100 },
    { key: 'status', title: '状态', width: 100 },
  ] satisfies DataTableColumns<ChildDataType>,

  // 需求子表列
  requirement: [
    childIndexColumn,
    { key: 'requirement', title: '需求名称', width: 150 },
    { key: 'priority', title: '优先级', width: 100 },
    { key: 'status', title: '状态', width: 100 },
  ] satisfies DataTableColumns<ChildDataType>,

  // 服务子表列
  service: [
    childIndexColumn,
    { key: 'service', title: '服务名称', width: 150 },
    { key: 'version', title: '版本', width: 100 },
    { key: 'status', title: '状态', width: 100 },
  ] satisfies DataTableColumns<ChildDataType>,
}

// ================= 子表格列配置获取函数 =================
/**
 * 根据子数据类型获取对应的列配置
 * @param childData 子数据项
 * @returns 对应的表格列配置
 */
export const getChildColumns = (
  childData: ChildDataType
): DataTableColumns<ChildDataType> => {
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

type NestedSelectionController = Pick<
  TableInstance<TestRecord, ChildDataType>,
  'selectChildRow' | 'unselectChildRow' | 'selectRow' | 'unselectRow'
>

const matchesParentSelection = (
  mode: ParentChildLinkMode,
  count: number,
  total: number
) => (mode === 'strict' ? total > 0 && count === total : count > 0)

/** 自定义子表复用父实例的选择状态；公开逐行方法需要由消费方同步联动。 */
export function syncChildSelection(
  table: NestedSelectionController,
  parent: TestRecord,
  previousKeys: DataTableRowKey[],
  nextKeys: DataTableRowKey[],
  children: ChildDataType[],
  config: DemoConfig
): void {
  if (!config.enableChildSelection) return
  const available = new Set<DataTableRowKey>(children.map(child => child.id))
  const next = new Set(nextKeys.filter(key => available.has(key)))
  const previous = new Set(previousKeys)
  for (const key of previous) {
    if (!next.has(key)) table.unselectChildRow(parent.id, key)
  }
  for (const key of next) {
    if (!previous.has(key)) table.selectChildRow(parent.id, key)
  }
  if (!config.enableSelection) return
  const shouldSelect =
    parent.status === '在职' &&
    matchesParentSelection(
      config.parentChildLinkMode,
      next.size,
      children.length
    )
  if (shouldSelect) table.selectRow(parent.id)
  else table.unselectRow(parent.id)
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
