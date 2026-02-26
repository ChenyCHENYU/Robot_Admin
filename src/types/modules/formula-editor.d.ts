/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\types\modules\formula-editor.d.ts
 * @Description: 公式编辑器类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

// ─── 变量定义 ───────────────────────────────────

/** 变量数据类型 */
export type FormulaVariableType = 'number' | 'text' | 'boolean'

/** 变量定义 */
export interface FormulaVariable {
  /** 显示名称（如「完成值」「目标额」） */
  name: string
  /** 字段标识（如 'completion_value'），用于存储和求值 */
  field: string
  /** 数据类型 */
  type: FormulaVariableType
  /** 分组名称（如「目标档参数」「目标值」） */
  group?: string
  /** 变量描述 */
  description?: string
}

// ─── 函数定义 ───────────────────────────────────

/** 内置函数定义 */
export interface FormulaFunction {
  /** 函数名（如 'IF'、'SUM'） */
  name: string
  /** 函数签名（如 'IF(条件, 真值, 假值)'） */
  signature: string
  /** 函数描述 */
  description: string
  /** 分类（如「逻辑」「数学」「聚合」） */
  category?: string
}

// ─── Token 定义 ─────────────────────────────────

/** Token 类型 */
export type FormulaTokenType =
  | 'variable'
  | 'operator'
  | 'number'
  | 'function'
  | 'paren'
  | 'comma'
  | 'text'
  | 'space'

/** 公式中的单个 Token */
export interface FormulaToken {
  /** Token 类型 */
  type: FormulaTokenType
  /** 显示值 */
  value: string
  /** 在原始字符串中的起始位置 */
  start: number
  /** 在原始字符串中的结束位置 */
  end: number
}

// ─── 校验结果 ───────────────────────────────────

/** 公式校验结果 */
export interface FormulaValidation {
  /** 是否合法 */
  valid: boolean
  /** 消息 */
  message: string
  /** 错误位置（字符索引） */
  position?: number
}

// ─── 虚拟键盘 ───────────────────────────────────

/** 键盘按键类型 */
export type FormulaKeyType =
  | 'operator'
  | 'number'
  | 'paren'
  | 'logic'
  | 'compare'
  | 'action'

/** 单个键盘按键定义 */
export interface FormulaKeyboardKey {
  /** 按键显示文本 */
  label: string
  /** 按键输出值 */
  value: string
  /** 按键类型 */
  type: FormulaKeyType
  /** 高亮色（可选） */
  color?: 'primary' | 'warning' | 'error' | 'info'
  /** 是否是动作键（如退格、清空） */
  isAction?: boolean
}

// ─── Props / Emits / Expose ─────────────────────

/** 公式编辑器 Props */
export interface FormulaEditorProps {
  /** 公式字符串 (v-model) */
  modelValue?: string
  /** 可选变量列表 */
  variables?: FormulaVariable[]
  /** 可用函数列表（为空则使用内置默认函数） */
  functions?: FormulaFunction[]
  /** 样例数据（用于预览计算结果） */
  sampleData?: Record<string, number | string | boolean>
  /** 是否禁用 */
  disabled?: boolean
  /** 占位文本 */
  placeholder?: string
  /** 容器高度 */
  height?: string | number
  /** 是否显示预览 */
  showPreview?: boolean
  /** 是否显示虚拟键盘 */
  showKeyboard?: boolean
  /** 是否显示变量面板 */
  showVariablePanel?: boolean
}

/** 公式编辑器 Emits */
export interface FormulaEditorEmits {
  'update:modelValue': [value: string]
  change: [value: string]
  'validation-change': [result: FormulaValidation]
}

/** 公式编辑器暴露方法 */
export interface FormulaEditorExpose {
  /** 获取当前公式字符串 */
  getValue: () => string
  /** 设置公式 */
  setValue: (expr: string) => void
  /** 重置为初始值 */
  reset: () => void
  /** 校验公式 */
  validate: () => FormulaValidation
  /** 在光标位置插入文本 */
  insertAtCursor: (text: string) => void
  /** 聚焦输入区 */
  focus: () => void
}
