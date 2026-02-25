/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Cron\constants.ts
 * @Description: Cron 表达式编辑器常量
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  CronFieldMeta,
  CronFieldValue,
  CronTemplate,
  CronValue,
} from '@/types/modules/cron'

// ─── 字段元数据 ──────────────────────────────────

export const CRON_FIELD_META: CronFieldMeta[] = [
  { type: 'second', label: '秒', min: 0, max: 59 },
  { type: 'minute', label: '分', min: 0, max: 59 },
  { type: 'hour', label: '时', min: 0, max: 23 },
  { type: 'day', label: '日', min: 1, max: 31 },
  { type: 'month', label: '月', min: 1, max: 12 },
  {
    type: 'week',
    label: '周',
    min: 1,
    max: 7,
    valueLabels: {
      1: '周日',
      2: '周一',
      3: '周二',
      4: '周三',
      5: '周四',
      6: '周五',
      7: '周六',
    },
  },
]

// ─── 默认字段值 ──────────────────────────────────

export const DEFAULT_FIELD_VALUE: CronFieldValue = {
  mode: 'every',
  rangeStart: 0,
  rangeEnd: 0,
  stepStart: 0,
  stepInterval: 1,
  specificValues: [],
}

// ─── 默认 Cron 值（每秒执行） ──────────────────

export const DEFAULT_CRON_VALUE: CronValue = {
  second: { ...DEFAULT_FIELD_VALUE, rangeEnd: 59 },
  minute: { ...DEFAULT_FIELD_VALUE, rangeEnd: 59 },
  hour: { ...DEFAULT_FIELD_VALUE, rangeEnd: 23 },
  day: { ...DEFAULT_FIELD_VALUE, rangeStart: 1, rangeEnd: 31 },
  month: { ...DEFAULT_FIELD_VALUE, rangeStart: 1, rangeEnd: 12 },
  week: { ...DEFAULT_FIELD_VALUE, mode: 'none', rangeStart: 1, rangeEnd: 7 },
}

// ─── 默认表达式 ─────────────────────────────────

export const DEFAULT_CRON_EXPRESSION = '0 0 0 * * ?'

// ─── 常用模板 ───────────────────────────────────

export const CRON_TEMPLATES: CronTemplate[] = [
  {
    label: '每秒执行',
    value: '* * * * * ?',
    description: '每秒执行一次',
    icon: 'mdi:timer-sand',
  },
  {
    label: '每分钟执行',
    value: '0 * * * * ?',
    description: '每分钟第 0 秒执行',
    icon: 'mdi:clock-outline',
  },
  {
    label: '每小时执行',
    value: '0 0 * * * ?',
    description: '每小时整点执行',
    icon: 'mdi:clock-time-twelve-outline',
  },
  {
    label: '每天 0 点',
    value: '0 0 0 * * ?',
    description: '每天凌晨 00:00 执行',
    icon: 'mdi:weather-night',
  },
  {
    label: '每天 8:30',
    value: '0 30 8 * * ?',
    description: '每天早上 08:30 执行',
    icon: 'mdi:weather-sunny',
  },
  {
    label: '每天 12:00',
    value: '0 0 12 * * ?',
    description: '每天中午 12:00 执行',
    icon: 'mdi:food',
  },
  {
    label: '工作日 9:00',
    value: '0 0 9 ? * 2-6',
    description: '周一至周五 09:00 执行',
    icon: 'mdi:briefcase-outline',
  },
  {
    label: '每周一 0 点',
    value: '0 0 0 ? * 2',
    description: '每周一凌晨 00:00 执行',
    icon: 'mdi:calendar-week',
  },
  {
    label: '每月 1 号 0 点',
    value: '0 0 0 1 * ?',
    description: '每月 1 号凌晨 00:00 执行',
    icon: 'mdi:calendar-month',
  },
  {
    label: '每 5 分钟',
    value: '0 0/5 * * * ?',
    description: '每隔 5 分钟执行一次',
    icon: 'mdi:timer-5',
  },
  {
    label: '每 30 分钟',
    value: '0 0/30 * * * ?',
    description: '每隔 30 分钟执行一次',
    icon: 'mdi:timer-30',
  },
  {
    label: '每 2 小时',
    value: '0 0 0/2 * * ?',
    description: '每隔 2 小时执行一次',
    icon: 'mdi:timer-2',
  },
]

// ─── 月份名称 ───────────────────────────────────

export const MONTH_LABELS: Record<number, string> = {
  1: '一月',
  2: '二月',
  3: '三月',
  4: '四月',
  5: '五月',
  6: '六月',
  7: '七月',
  8: '八月',
  9: '九月',
  10: '十月',
  11: '十一月',
  12: '十二月',
}

// ─── 周名称 ─────────────────────────────────────

export const WEEK_LABELS: Record<number, string> = {
  1: '周日',
  2: '周一',
  3: '周二',
  4: '周三',
  5: '周四',
  6: '周五',
  7: '周六',
}
