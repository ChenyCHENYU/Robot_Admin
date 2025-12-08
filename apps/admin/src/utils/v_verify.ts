/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-15 21:01:38
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-08
 * @FilePath: \Robot_Admin\apps\admin\src\utils\v_verify.ts
 * @Description: 表单校验规则 - 使用 @robot/shared 工具
 */

import type { FormItemRule } from 'naive-ui/es/form'
import {
  isEmpty,
  isLength,
  isInRange,
  isMobile,
  isIdCard,
  isEmail,
  isUsername,
  isStrongPassword,
  isUrl,
  isIP,
} from '@robot/shared'

export type FieldRule = Omit<FormItemRule, 'validator'> & {
  validator: NonNullable<FormItemRule['validator']>
}

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
    createRule(trigger, v => !isEmpty(v), `${field}不能为空`),

  /**
   * 长度验证
   * @param field 字段名
   * @param min 最小长度
   * @param max 最大长度
   */
  length: (field: string, min: number, max?: number) =>
    createRule(
      'blur',
      v => !v || isLength(String(v), min, max),
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
      v => !v && v !== 0 ? true : isInRange(Number(v), min, max),
      `${field}必须在${min}-${max}之间`
    ),

  /**
   * 手机号验证
   * @param field 字段名，默认为"手机号"
   */
  mobile: (field: string = '手机号') =>
    createRule('blur', v => !v || isMobile(v), `${field}格式错误`),

  /**
   * 身份证验证
   * @param field 字段名，默认为"身份证号"
   */
  idCard: (field: string = '身份证号') =>
    createRule('blur', v => !v || isIdCard(v), `${field}格式错误`),

  /**
   * 邮箱验证
   * @param field 字段名，默认为"邮箱"
   */
  email: (field: string = '邮箱') =>
    createRule('blur', v => !v || isEmail(v), `${field}格式错误`),

  /**
   * 用户名验证（字母数字下划线，3-20位）
   * @param field 字段名，默认为"用户名"
   */
  username: (field: string = '用户名') =>
    createRule(
      'blur',
      v => !v || isUsername(v),
      `${field}只能包含字母、数字、下划线，长度3-20位`
    ),

  /**
   * 强密码验证（包含大小写字母和数字，6-20位）
   * @param field 字段名，默认为"密码"
   */
  strongPassword: (field: string = '密码') =>
    createRule(
      'blur',
      v => !v || isStrongPassword(v),
      `${field}必须包含大小写字母和数字，长度6-20位`
    ),

  /**
   * URL验证
   * @param field 字段名，默认为"链接"
   */
  url: (field: string = '链接') =>
    createRule('blur', v => !v || isUrl(v), `${field}格式错误`),

  /**
   * IP地址验证
   * @param field 字段名，默认为"IP地址"
   */
  ip: (field: string = 'IP地址') =>
    createRule('blur', v => !v || isIP(v), `${field}格式错误`),

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
