/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\types\modules\cron.d.ts
 * @Description: Cron 表达式编辑器类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** Cron 字段类型 */
export type CronFieldType =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'month'
  | 'week'

/** 单字段编辑模式 */
export type CronFieldMode = 'every' | 'range' | 'step' | 'specific' | 'none'

/** 单字段值 */
export interface CronFieldValue {
  /** 编辑模式 */
  mode: CronFieldMode
  /** 范围-起始 */
  rangeStart: number
  /** 范围-结束 */
  rangeEnd: number
  /** 步进-起始 */
  stepStart: number
  /** 步进间隔 */
  stepInterval: number
  /** 指定具体值列表 */
  specificValues: number[]
}

/** 完整 Cron 对象（6 字段） */
export interface CronValue {
  second: CronFieldValue
  minute: CronFieldValue
  hour: CronFieldValue
  day: CronFieldValue
  month: CronFieldValue
  week: CronFieldValue
}

/** 字段元数据 */
export interface CronFieldMeta {
  /** 字段类型 */
  type: CronFieldType
  /** 中文名称 */
  label: string
  /** 最小值 */
  min: number
  /** 最大值 */
  max: number
  /** 可选值映射（用于周） */
  valueLabels?: Record<number, string>
}

/** 常用模板 */
export interface CronTemplate {
  /** 模板名称 */
  label: string
  /** Cron 表达式 */
  value: string
  /** 描述说明 */
  description: string
  /** 图标 */
  icon?: string
}

/** 校验结果 */
export interface CronValidation {
  /** 是否合法 */
  valid: boolean
  /** 错误信息 */
  message: string
  /** 出错字段 */
  field?: CronFieldType
}

/** 组件 Props */
export interface CronProps {
  /** 当前 Cron 表达式 (v-model) */
  modelValue?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 预览未来执行次数 */
  previewCount?: number
  /** 是否显示模板面板 */
  showTemplates?: boolean
  /** 是否显示预览面板 */
  showPreview?: boolean
  /** 是否显示秒字段 */
  showSecond?: boolean
  /** 容器高度 */
  height?: string | number
}

/** 组件暴露方法 */
export interface CronExpose {
  /** 获取当前表达式 */
  getValue: () => string
  /** 设置表达式 */
  setValue: (expression: string) => void
  /** 重置为默认 */
  reset: () => void
  /** 校验当前表达式 */
  validate: () => CronValidation
}

/** 组件事件 */
export interface CronEmits {
  /** 表达式变更 */
  'update:modelValue': [value: string]
  /** 值变更 */
  change: [value: string]
  /** 校验状态变更 */
  'validation-change': [result: CronValidation]
}
