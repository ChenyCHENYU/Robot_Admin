/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-29 21:43:34
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 23:15:00
 * @FilePath: \Robot_Admin\src\views\demo\05-date\data.ts
 * @Description: 日期选择器组件演示数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'

type DateRange = [string, string]

interface DateSelections {
  singleDate: string | null
  singleDateTime: string | null
  dateRange: DateRange | null
  dateTimeRange: DateRange | null
  smartRange: DateRange | null
  pastDate: string | null
  timestamp: string | null
  chineseDate: string | null
}

export const emptyDates: Readonly<DateSelections> = {
  singleDate: null,
  singleDateTime: null,
  dateRange: null,
  dateTimeRange: null,
  smartRange: null,
  pastDate: null,
  timestamp: null,
  chineseDate: null,
}

/** 只为前三个空选择器填充示例，保留用户已选值及其余场景。 */
export const fillDateDefaults = (dates: DateSelections): number => {
  let missing = 0
  if (!dates.singleDate) {
    dates.singleDate = '2024-01-15'
    missing++
  }
  if (!dates.singleDateTime) {
    dates.singleDateTime = '2024-01-15 14:30:00'
    missing++
  }
  if (!dates.dateRange) {
    dates.dateRange = ['2024-01-10', '2024-01-20']
    missing++
  }
  return missing
}

/**
 * * @description: 创建操作按钮配置
 */
export const createDateActions = (
  clearAll: () => void,
  setDefault: () => void,
  getData: () => void
): ActionItem[] => [
  { label: '清空所有日期', type: 'warning', onClick: clearAll },
  { label: '设置默认日期', type: 'primary', onClick: setDefault },
  { label: '获取组件数据', type: 'info', onClick: getData },
]
