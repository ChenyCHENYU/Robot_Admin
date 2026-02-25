/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\composables\Cron\useCronDescription.ts
 * @Description: Cron 中文描述生成
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { CronValidation } from '@/types/modules/cron'
import type { Ref } from 'vue'
import { MONTH_LABELS, WEEK_LABELS } from '@/components/global/C_Cron/constants'

/** 获取周名称 */
function weekLabel(n: number | string): string {
  return WEEK_LABELS[Number(n)] || `周${n}`
}

/**
 * 将 Cron 表达式自动转换为中文可读描述
 */
export function useCronDescription(
  expression: Ref<string>,
  validation: Ref<CronValidation>
) {
  /** 中文描述 */
  const description = computed(() => {
    if (!validation.value.valid) return '表达式不合法'
    return generateDescription(expression.value)
  })

  // ─── 核心转换 ────────────────────────────────
  /** 将完整 Cron 表达式转为中文描述 */ function generateDescription(
    expr: string
  ): string {
    const parts = expr.trim().split(/\s+/)
    if (parts.length !== 6) return '表达式格式错误'

    const [sec, min, hour, day, month, week] = parts

    const fragments: string[] = []

    // 月
    fragments.push(describeMonth(month))
    // 周 or 日
    if (week !== '?') {
      fragments.push(describeWeek(week))
    } else {
      fragments.push(describeDay(day))
    }
    // 时
    fragments.push(describeHour(hour))
    // 分
    fragments.push(describeMinute(min))
    // 秒
    fragments.push(describeSecond(sec))

    return fragments.filter(Boolean).join(' ') + ' 执行'
  }

  // ─── 各字段描述 ──────────────────────────────
  /** 描述秒字段 */ function describeSecond(part: string): string {
    if (part === '0') return ''
    if (part === '*') return '每秒'
    return describeFieldGeneric(part, '秒')
  }

  /** 描述分字段 */
  function describeMinute(part: string): string {
    if (part === '*') return '每分钟'
    if (part === '0') return ''
    return describeFieldGeneric(part, '分')
  }

  /** 描述时字段 */
  function describeHour(part: string): string {
    if (part === '*') return '每小时'
    // 固定值 → 格式化为 HH:MM
    if (/^\d+$/.test(part)) return `${part.padStart(2, '0')}:`
    return describeFieldGeneric(part, '时')
  }

  /** 描述日字段 */
  function describeDay(part: string): string {
    if (part === '*' || part === '?') return '每天'
    if (/^\d+$/.test(part)) return `每月 ${part} 号`
    if (part.includes('/')) {
      const [s, i] = part.split('/')
      return `从 ${s} 号开始每 ${i} 天`
    }
    if (part.includes('-')) {
      const [s, e] = part.split('-')
      return `${s} 号到 ${e} 号`
    }
    if (part.includes(',')) {
      return `每月 ${part} 号`
    }
    return ''
  }

  /** 描述月字段 */
  function describeMonth(part: string): string {
    if (part === '*') return ''
    if (/^\d+$/.test(part)) {
      const n = Number(part)
      return MONTH_LABELS[n] ? `${MONTH_LABELS[n]}` : `${n} 月`
    }
    if (part.includes('/')) {
      const [s, i] = part.split('/')
      return `从 ${s} 月开始每 ${i} 个月`
    }
    if (part.includes('-')) {
      const [s, e] = part.split('-')
      return `${s} 月到 ${e} 月`
    }
    if (part.includes(',')) {
      const months = part
        .split(',')
        .map(n => MONTH_LABELS[Number(n)] || `${n}月`)
        .join('、')
      return months
    }
    return ''
  }

  /** 描述周字段 */
  function describeWeek(part: string): string {
    if (part === '*' || part === '?') return ''
    if (/^\d+$/.test(part)) return `每${weekLabel(part)}`
    if (part.includes('/'))
      return `从${weekLabel(part.split('/')[0])}开始每 ${part.split('/')[1]} 天`
    if (part.includes('-'))
      return `${weekLabel(part.split('-')[0])}到${weekLabel(part.split('-')[1])}`
    if (part.includes(','))
      return `每${part.split(',').map(weekLabel).join('、')}`
    return ''
  }

  /** 通用字段描述 */
  function describeFieldGeneric(part: string, unit: string): string {
    if (part.includes('/')) {
      const [s, i] = part.split('/')
      const startDesc = s === '*' || s === '0' ? '' : `从第 ${s} ${unit}开始`
      return `${startDesc}每 ${i} ${unit}`
    }
    if (part.includes('-')) {
      const [s, e] = part.split('-')
      return `${s} ${unit}到 ${e} ${unit}`
    }
    if (part.includes(',')) {
      return `第 ${part} ${unit}`
    }
    if (/^\d+$/.test(part)) {
      return `${part.padStart(2, '0')}`
    }
    return ''
  }

  return {
    description,
  }
}
