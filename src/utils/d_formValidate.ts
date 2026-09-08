/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\src\utils\d_formValidate.ts
 * @Description: form-validate 到 Naive UI 官方规则类型的集中适配边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  NAIVE_COMBOS as formValidateCombos,
  PRESET_RULES as formValidatePresets,
  type NaiveRule,
} from '@robot-admin/form-validate'
import type { FormItemRule } from 'naive-ui'

type AdaptNaiveNamespace<T> = {
  readonly [Key in keyof T]: T[Key] extends (
    ...args: infer Args
  ) => infer Result
    ? (
        ...args: Args
      ) => Result extends readonly NaiveRule[]
        ? FormItemRule[]
        : Result extends NaiveRule
          ? FormItemRule
          : Result
    : T[Key]
}

/**
 * 包运行时产物与 Naive UI 规则结构一致；在唯一边界收敛声明差异，
 * 避免业务页面散落断言或重新包装校验函数。
 */
const adaptNaiveRules = <T>(rules: T): AdaptNaiveNamespace<T> =>
  rules as unknown as AdaptNaiveNamespace<T>

export const PRESET_RULES = adaptNaiveRules(formValidatePresets)
export const NAIVE_COMBOS = adaptNaiveRules(formValidateCombos)
