/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-15 21:01:38
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-01 22:58:54
 * @FilePath: \Robot_Admin\src\utils\v_verify.ts
 * @Description: 表单校验规则
 */

import type { FormItemRule } from 'naive-ui/es/form'

export type FieldRule = Omit<FormItemRule, 'validator'> & {
  validator: NonNullable<FormItemRule['validator']>
}

// 常用正则表达式
const REGEX_PATTERNS = {
  MOBILE: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/,
  ID_CARD: /^\d{15}$|^\d{18}$|^\d{17}[\dXx]$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,20}$/,
  URL: /^https?:\/\/.+/,
  IP: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
} as const

/**
 * @description: 核心生成器，生成规则
 * @param trigger 触发方式
 * @param validateFn 验证函数
 * @param message 错误消息
 * @return {FieldRule} 规则对象
 */
function createRule(
  trigger: FieldRule['trigger'] = 'blur',
  validateFn: (v: any) => boolean,
  message: string
): FieldRule {
  return {
    trigger,
    validator: async (_: any, value: any) => {
      if (!validateFn(value)) throw new Error(message)
    },
    message,
  }
}

/**
 * @description: 创建异步验证规则
 * @param trigger 触发方式
 * @param validateFn 异步验证函数
 * @param message 错误消息
 * @return {FieldRule} 规则对象
 */
function createAsyncRule(
  trigger: FieldRule['trigger'] = 'blur',
  validateFn: (v: any) => Promise<boolean>,
  message: string
): FieldRule {
  return {
    trigger,
    validator: async (_: any, value: any) => {
      const isValid = await validateFn(value)
      if (!isValid) throw new Error(message)
    },
    message,
  }
}

// 预设规则库 - 增强版
export const PRESET_RULES = {
  /**
   * 必填验证
   * @param field 字段名
   * @param trigger 触发方式
   */
  required: (
    field: string,
    trigger: FieldRule['trigger'] = ['blur', 'input']
  ) =>
    createRule(
      trigger,
      v => {
        if (v === null || v === undefined) return false
        if (typeof v === 'string') return v.trim() !== ''
        if (Array.isArray(v)) return v.length > 0
        if (typeof v === 'object') return Object.keys(v).length > 0
        return !!v
      },
      `${field}不能为空`
    ),

  /**
   * 长度验证
   * @param field 字段名
   * @param min 最小长度
   * @param max 最大长度
   */
  length: (field: string, min: number, max?: number) =>
    createRule(
      'blur',
      v => {
        if (!v) return true // 空值不验证长度
        const len = String(v).length
        if (max !== undefined) {
          return len >= min && len <= max
        }
        return len >= min
      },
      max ? `${field}长度需在${min}-${max}位之间` : `${field}长度至少${min}位`
    ),

  /**
   * 数字范围验证
   * @param field 字段名
   * @param min 最小值
   * @param max 最大值
   */
  range: (field: string, min: number, max: number) =>
    createRule(
      'blur',
      v => {
        if (!v && v !== 0) return true
        const num = Number(v)
        if (isNaN(num)) return false
        return num >= min && num <= max
      },
      `${field}必须在${min}-${max}之间`
    ),

  /**
   * 手机号验证
   * @param field 字段名，默认为"手机号"
   */
  mobile: (field: string = '手机号') =>
    createRule(
      'blur',
      v => !v || REGEX_PATTERNS.MOBILE.test(v),
      `${field}格式错误`
    ),

  /**
   * 身份证验证
   * @param field 字段名，默认为"身份证号"
   */
  idCard: (field: string = '身份证号') =>
    createRule(
      'blur',
      v => !v || REGEX_PATTERNS.ID_CARD.test(v),
      `${field}格式错误`
    ),

  /**
   * 邮箱验证
   * @param field 字段名，默认为"邮箱"
   */
  email: (field: string = '邮箱') =>
    createRule(
      'blur',
      v => !v || REGEX_PATTERNS.EMAIL.test(v),
      `${field}格式错误`
    ),

  /**
   * 用户名验证（字母数字下划线，3-20位）
   * @param field 字段名，默认为"用户名"
   */
  username: (field: string = '用户名') =>
    createRule(
      'blur',
      v => !v || REGEX_PATTERNS.USERNAME.test(v),
      `${field}只能包含字母、数字、下划线，长度3-20位`
    ),

  /**
   * 强密码验证（包含大小写字母和数字，6-20位）
   * @param field 字段名，默认为"密码"
   */
  strongPassword: (field: string = '密码') =>
    createRule(
      'blur',
      v => !v || REGEX_PATTERNS.PASSWORD.test(v),
      `${field}必须包含大小写字母和数字，长度6-20位`
    ),

  /**
   * URL验证
   * @param field 字段名，默认为"链接"
   */
  url: (field: string = '链接') =>
    createRule(
      'blur',
      v => !v || REGEX_PATTERNS.URL.test(v),
      `${field}格式错误`
    ),

  /**
   * IP地址验证
   * @param field 字段名，默认为"IP地址"
   */
  ip: (field: string = 'IP地址') =>
    createRule(
      'blur',
      v => !v || REGEX_PATTERNS.IP.test(v),
      `${field}格式错误`
    ),

  /**
   * 确认密码验证
   * @param field 字段名
   * @param getOriginalValue 获取原密码的函数
   */
  confirmPassword: (field: string, getOriginalValue: () => any) =>
    createRule('blur', v => !v || v === getOriginalValue(), `${field}不一致`),

  /**
   * 自定义正则验证
   * @param field 字段名
   * @param pattern 正则表达式
   * @param message 自定义错误消息
   */
  pattern: (field: string, pattern: RegExp, message?: string) =>
    createRule(
      'blur',
      v => !v || pattern.test(v),
      message || `${field}格式错误`
    ),

  /**
   * 异步验证（如检查用户名是否存在）
   * @param field 字段名
   * @param asyncCheck 异步检查函数
   * @param message 错误消息
   */
  asyncCheck: (
    field: string,
    asyncCheck: (v: any) => Promise<boolean>,
    message?: string
  ) => createAsyncRule('blur', asyncCheck, message || `${field}验证失败`),
}

/**
 * 自定义规则构造器
 * @param validateFn 验证函数
 * @param message 错误消息
 * @param trigger 触发方式
 */
export const customRule = (
  validateFn: (v: any) => boolean,
  message: string,
  trigger: FieldRule['trigger'] = 'blur'
) => createRule(trigger, validateFn, message)

/**
 * 异步自定义规则构造器
 * @param validateFn 异步验证函数
 * @param message 错误消息
 * @param trigger 触发方式
 */
export const customAsyncRule = (
  validateFn: (v: any) => Promise<boolean>,
  message: string,
  trigger: FieldRule['trigger'] = 'blur'
) => createAsyncRule(trigger, validateFn, message)

/**
 * @description: 合并多条规则为一个串行validator，只显示第一个未通过的提示
 * @param rules 规则数组
 * @return {FormItemRule[]}
 */
export function _mergeRules(rules: FormItemRule[]): FormItemRule[] {
  if (rules.length <= 1) return rules

  return [
    {
      trigger: ['blur', 'input'],
      validator: async (_, value) => {
        for (const rule of rules) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await rule.validator?.(rule, value, () => {}, {}, {})
          } catch (error) {
            // 遇到第一个错误就停止并抛出
            console.error(error)
            throw error
          }
        }
      },
    },
  ]
}

/**
 * @description: 常用规则组合
 */
export const RULE_COMBOS = {
  /**
   * 用户名规则组合
   */
  username: (field: string = '用户名') => [
    PRESET_RULES.required(field),
    PRESET_RULES.username(field),
  ],

  /**
   * 密码规则组合
   */
  password: (field: string = '密码') => [
    PRESET_RULES.required(field),
    PRESET_RULES.strongPassword(field),
  ],

  /**
   * 邮箱规则组合
   */
  email: (field: string = '邮箱') => [
    PRESET_RULES.required(field),
    PRESET_RULES.email(field),
  ],

  /**
   * 手机号规则组合
   */
  mobile: (field: string = '手机号') => [
    PRESET_RULES.required(field),
    PRESET_RULES.mobile(field),
  ],

  /**
   * 确认密码规则组合
   */
  confirmPassword: (field: string, getOriginalValue: () => any) => [
    PRESET_RULES.required(field),
    PRESET_RULES.confirmPassword(field, getOriginalValue),
  ],
}

// 导出类型和常量
export { REGEX_PATTERNS }
export type { FormItemRule }

//TAG: 使用示例可以参考 @/views/login/data.ts 文件中的使用示例
