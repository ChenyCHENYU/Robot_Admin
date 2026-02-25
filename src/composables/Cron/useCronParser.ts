/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\composables\Cron\useCronParser.ts
 * @Description: Cron 表达式解析 & 生成引擎
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  CronFieldMeta,
  CronFieldType,
  CronFieldValue,
  CronValidation,
  CronValue,
} from '@/types/modules/cron'
import {
  CRON_FIELD_META,
  DEFAULT_CRON_VALUE,
} from '@/components/global/C_Cron/constants'

// ─── 字段顺序 ──────────────────────────────────

const FIELD_ORDER: CronFieldType[] = [
  'second',
  'minute',
  'hour',
  'day',
  'month',
  'week',
]

/**
 * Cron 解析 & 生成引擎
 */
export function useCronParser() {
  /** 当前 Cron 对象 */
  const cronValue = ref<CronValue>(structuredClone(DEFAULT_CRON_VALUE))

  // ─── 单字段 → 表达式片段 ──────────────────────

  /** 将单个字段值转为 Cron 表达式片段 */
  function fieldToExpression(field: CronFieldValue): string {
    switch (field.mode) {
      case 'every':
        return '*'
      case 'range':
        return `${field.rangeStart}-${field.rangeEnd}`
      case 'step':
        return `${field.stepStart}/${field.stepInterval}`
      case 'specific':
        return field.specificValues.length > 0
          ? field.specificValues.sort((a, b) => a - b).join(',')
          : '*'
      case 'none':
        return '?'
      default:
        return '*'
    }
  }

  // ─── 表达式片段 → 单字段 ──────────────────────

  /** 创建默认字段值 */
  function createFieldValue(
    meta: CronFieldMeta,
    mode: CronFieldValue['mode'],
    overrides: Partial<CronFieldValue> = {}
  ): CronFieldValue {
    return {
      mode,
      rangeStart: meta.min,
      rangeEnd: meta.max,
      stepStart: meta.min,
      stepInterval: 1,
      specificValues: [],
      ...overrides,
    }
  }

  /** 解析步进表达式为字段值 */
  function parseStepExpr(expr: string, meta: CronFieldMeta): CronFieldValue {
    const [start, interval] = expr.split('/').map(Number)
    return createFieldValue(meta, 'step', {
      stepStart: isNaN(start) ? meta.min : start,
      stepInterval: isNaN(interval) ? 1 : interval,
    })
  }

  /** 解析范围表达式为字段值 */
  function parseRangeExpr(expr: string, meta: CronFieldMeta): CronFieldValue {
    const [start, end] = expr.split('-').map(Number)
    return createFieldValue(meta, 'range', {
      rangeStart: isNaN(start) ? meta.min : start,
      rangeEnd: isNaN(end) ? meta.max : end,
    })
  }

  /** 将 Cron 表达式片段解析为字段值对象 */
  function expressionToField(
    expr: string,
    type: CronFieldType
  ): CronFieldValue {
    const meta = CRON_FIELD_META.find(m => m.type === type)!

    if (expr === '?') return createFieldValue(meta, 'none')
    if (expr === '*') return createFieldValue(meta, 'every')
    if (expr.includes('/')) return parseStepExpr(expr, meta)
    if (expr.includes('-') && !expr.includes(','))
      return parseRangeExpr(expr, meta)

    // x,y,z 或单个数字（指定值）
    const values = expr
      .split(',')
      .map(Number)
      .filter(n => !isNaN(n))
    if (values.length > 0)
      return createFieldValue(meta, 'specific', { specificValues: values })

    return createFieldValue(meta, 'every')
  }

  // ─── CronValue → 完整表达式 ──────────────────

  /** 由 CronValue 生成完整 Cron 表达式 */
  function generate(): string {
    return FIELD_ORDER.map(type =>
      fieldToExpression(cronValue.value[type])
    ).join(' ')
  }

  // ─── 完整表达式 → CronValue ──────────────────

  /** 解析 Cron 表达式字符串为 CronValue */
  function parse(expression: string): void {
    const parts = expression.trim().split(/\s+/)
    if (parts.length < 6) return

    FIELD_ORDER.forEach((type, index) => {
      cronValue.value[type] = expressionToField(parts[index], type)
    })
  }

  // ─── 日/周互斥处理 ───────────────────────────

  /** 日/周互斥：修改一方时另一方自动设为 ? */
  function handleDayWeekExclusion(changedField: 'day' | 'week'): void {
    if (changedField === 'day') {
      if (cronValue.value.day.mode !== 'none') {
        cronValue.value.week = { ...cronValue.value.week, mode: 'none' }
      }
    } else {
      if (cronValue.value.week.mode !== 'none') {
        cronValue.value.day = { ...cronValue.value.day, mode: 'none' }
      }
    }
  }

  // ─── 校验 ────────────────────────────────────

  /** 校验 Cron 表达式合法性 */
  function validate(expression?: string): CronValidation {
    const expr = expression ?? generate()
    const parts = expr.trim().split(/\s+/)

    if (parts.length !== 6) {
      return {
        valid: false,
        message: `表达式应包含 6 个字段，当前为 ${parts.length} 个`,
      }
    }

    // 日和周必须有一个为 ?
    const dayPart = parts[3]
    const weekPart = parts[5]
    if (dayPart !== '?' && weekPart !== '?') {
      return {
        valid: false,
        message: '日和周不能同时指定，其中一个必须为 ?',
        field: 'day',
      }
    }
    if (dayPart === '?' && weekPart === '?') {
      return {
        valid: false,
        message: '日和周不能同时为 ?，至少指定一个',
        field: 'day',
      }
    }

    // 逐字段校验
    for (let i = 0; i < FIELD_ORDER.length; i++) {
      const type = FIELD_ORDER[i]
      const part = parts[i]
      const meta = CRON_FIELD_META.find(m => m.type === type)!
      const result = validateField(part, meta)
      if (!result.valid) {
        return { ...result, field: type }
      }
    }

    return { valid: true, message: '表达式合法' }
  }

  /** 校验步进表达式 */
  function validateStep(part: string, meta: CronFieldMeta): CronValidation {
    const [s, i] = part.split('/')
    const start = s === '*' ? meta.min : Number(s)
    const interval = Number(i)
    if (isNaN(start) || isNaN(interval))
      return { valid: false, message: `${meta.label}字段步进格式错误` }
    if (start < meta.min || start > meta.max)
      return {
        valid: false,
        message: `${meta.label}字段步进起始值超出范围 (${meta.min}-${meta.max})`,
      }
    if (interval < 1)
      return { valid: false, message: `${meta.label}字段步进间隔必须大于 0` }
    return { valid: true, message: '' }
  }

  /** 校验范围表达式 */
  function validateRange(part: string, meta: CronFieldMeta): CronValidation {
    const [s, e] = part.split('-').map(Number)
    if (isNaN(s) || isNaN(e))
      return { valid: false, message: `${meta.label}字段范围格式错误` }
    if (s < meta.min || e > meta.max)
      return {
        valid: false,
        message: `${meta.label}字段范围超出 (${meta.min}-${meta.max})`,
      }
    if (s > e)
      return { valid: false, message: `${meta.label}字段范围起始不能大于结束` }
    return { valid: true, message: '' }
  }

  /** 校验指定值表达式 */
  function validateSpecific(part: string, meta: CronFieldMeta): CronValidation {
    const values = part.split(',').map(Number)
    if (values.some(isNaN))
      return { valid: false, message: `${meta.label}字段包含非数字字符` }
    if (values.some(v => v < meta.min || v > meta.max)) {
      return {
        valid: false,
        message: `${meta.label}字段值超出范围 (${meta.min}-${meta.max})`,
      }
    }
    return { valid: true, message: '' }
  }

  /** 校验单个字段表达式 */
  function validateField(part: string, meta: CronFieldMeta): CronValidation {
    if (part === '*' || part === '?') return { valid: true, message: '' }
    if (part.includes('/')) return validateStep(part, meta)
    if (part.includes('-') && !part.includes(','))
      return validateRange(part, meta)
    return validateSpecific(part, meta)
  }

  // ─── 计算属性：自动生成表达式 ────────────────

  const expression = computed(() => generate())

  // ─── 校验结果 ────────────────────────────────

  const validation = computed(() => validate())

  return {
    cronValue,
    expression,
    validation,
    parse,
    generate,
    validate,
    handleDayWeekExclusion,
  }
}
