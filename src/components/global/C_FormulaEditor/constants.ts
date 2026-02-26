/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_FormulaEditor\constants.ts
 * @Description: 公式编辑器常量定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  FormulaFunction,
  FormulaKeyboardKey,
} from '@/types/modules/formula-editor'

// ─── 虚拟键盘布局 ───────────────────────────────
// 与参考系统保持一致：运算符 5 列 × 3 行 | 数字 5 列 × 3 行

/** 运算符区（5 列 × 3 行） */
export const OPERATOR_KEYS: FormulaKeyboardKey[] = [
  // Row 1
  { label: '?', value: ' ? ', type: 'logic', color: 'warning' },
  { label: ':', value: ' : ', type: 'logic', color: 'warning' },
  { label: 'and', value: ' AND ', type: 'logic', color: 'warning' },
  { label: 'or', value: ' OR ', type: 'logic', color: 'warning' },
  { label: '(', value: '(', type: 'paren' },
  // Row 2
  { label: ')', value: ')', type: 'paren' },
  { label: ',', value: ', ', type: 'paren' },
  { label: '==', value: ' == ', type: 'compare' },
  { label: '>', value: ' > ', type: 'compare' },
  { label: '<', value: ' < ', type: 'compare' },
  // Row 3
  { label: '≥', value: ' >= ', type: 'compare' },
  { label: '≤', value: ' <= ', type: 'compare' },
  { label: '≠', value: ' != ', type: 'compare' },
  { label: '%', value: ' % ', type: 'operator' },
]

/** 数字区（5 列 × 3 行） */
export const NUMBER_KEYS: FormulaKeyboardKey[] = [
  // Row 1
  { label: '1', value: '1', type: 'number' },
  { label: '2', value: '2', type: 'number' },
  { label: '3', value: '3', type: 'number' },
  { label: '+', value: ' + ', type: 'operator', color: 'primary' },
  { label: '−', value: ' - ', type: 'operator', color: 'primary' },
  // Row 2
  { label: '4', value: '4', type: 'number' },
  { label: '5', value: '5', type: 'number' },
  { label: '6', value: '6', type: 'number' },
  { label: '×', value: ' * ', type: 'operator', color: 'primary' },
  { label: '÷', value: ' / ', type: 'operator', color: 'primary' },
  // Row 3
  { label: '7', value: '7', type: 'number' },
  { label: '8', value: '8', type: 'number' },
  { label: '9', value: '9', type: 'number' },
  { label: '0', value: '0', type: 'number' },
  { label: '.', value: '.', type: 'number' },
]

/** 动作键（⌫ + 清空） */
export const ACTION_KEYS: FormulaKeyboardKey[] = [
  { label: '⌫', value: 'BACKSPACE', type: 'action', isAction: true },
  { label: '清空', value: 'CLEAR', type: 'action', isAction: true },
]

// ─── 内置函数 ───────────────────────────────────

/** 默认可用函数列表 */
export const DEFAULT_FUNCTIONS: FormulaFunction[] = [
  {
    name: 'IF',
    signature: 'IF(条件, 真值, 假值)',
    description: '根据条件返回不同的值',
    category: '逻辑',
  },
  {
    name: 'AND',
    signature: 'AND(条件1, 条件2)',
    description: '全部条件为真时返回真',
    category: '逻辑',
  },
  {
    name: 'OR',
    signature: 'OR(条件1, 条件2)',
    description: '任一条件为真时返回真',
    category: '逻辑',
  },
  {
    name: 'NOT',
    signature: 'NOT(条件)',
    description: '对条件取反',
    category: '逻辑',
  },
  {
    name: 'SUM',
    signature: 'SUM(值1, 值2, ...)',
    description: '计算所有值的总和',
    category: '数学',
  },
  {
    name: 'AVG',
    signature: 'AVG(值1, 值2, ...)',
    description: '计算所有值的平均值',
    category: '数学',
  },
  {
    name: 'MAX',
    signature: 'MAX(值1, 值2, ...)',
    description: '返回最大值',
    category: '数学',
  },
  {
    name: 'MIN',
    signature: 'MIN(值1, 值2, ...)',
    description: '返回最小值',
    category: '数学',
  },
  {
    name: 'ABS',
    signature: 'ABS(数值)',
    description: '返回绝对值',
    category: '数学',
  },
  {
    name: 'ROUND',
    signature: 'ROUND(数值, 小数位)',
    description: '四舍五入到指定小数位',
    category: '数学',
  },
  {
    name: 'CEIL',
    signature: 'CEIL(数值)',
    description: '向上取整',
    category: '数学',
  },
  {
    name: 'FLOOR',
    signature: 'FLOOR(数值)',
    description: '向下取整',
    category: '数学',
  },
]

// ─── 运算符集 ───────────────────────────────────

/** 所有可识别的运算符 */
export const OPERATORS = new Set([
  '+',
  '-',
  '*',
  '/',
  '%',
  '>',
  '<',
  '>=',
  '<=',
  '==',
  '!=',
  '?',
  ':',
  'AND',
  'OR',
  'NOT',
])

/** 需要在两侧加空格的运算符 */
export const SPACED_OPERATORS = new Set([
  '+',
  '-',
  '*',
  '/',
  '%',
  '>',
  '<',
  '>=',
  '<=',
  '==',
  '!=',
  '?',
  ':',
  'AND',
  'OR',
])
