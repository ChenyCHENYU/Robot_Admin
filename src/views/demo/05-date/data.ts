/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-29 21:43:34
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 23:15:00
 * @FilePath: \Robot_Admin\src\views\demo\05-date\data.ts
 * @Description: 日期选择器组件演示数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { ActionItem } from '@/types/modules/action-bar'

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
