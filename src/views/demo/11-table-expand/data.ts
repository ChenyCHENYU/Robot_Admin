/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\demo\11-table-expand\data.ts
 * @Description: 表格演示配置与展示；数据源遵循项目运行模式
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { h } from 'vue'
import { NTag } from 'naive-ui/es'
import type {
  TableColumn,
  ParentChildLinkMode,
} from '@robot-admin/naive-ui-components'
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
