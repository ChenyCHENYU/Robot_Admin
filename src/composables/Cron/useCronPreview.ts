/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\composables\Cron\useCronPreview.ts
 * @Description: Cron 执行时间预测
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { CronValidation } from '@/types/modules/cron'
import type { Ref } from 'vue'

/**
 * 解析 Cron 表达式，预测未来 N 次执行时间
 * 纯逻辑实现，不依赖外部库
 */
export function useCronPreview(
  expression: Ref<string>,
  validation: Ref<CronValidation>,
  count: Ref<number>
) {
  /** 预测的执行时间列表 */
  const nextExecutions = ref<Date[]>([])

  /** 是否正在计算 */
  const computing = ref(false)

  // ─── 匹配检查工具 ───────────────────────────

  /** 检查单个值是否匹配 Cron 字段片段 */
  function matchesPart(value: number, part: string): boolean {
    if (part === '*' || part === '?') return true

    // 步进 x/y
    if (part.includes('/')) {
      const [s, i] = part.split('/')
      const start = s === '*' ? 0 : Number(s)
      const interval = Number(i)
      return value - start >= 0 && (value - start) % interval === 0
    }

    // 范围 x-y
    if (part.includes('-') && !part.includes(',')) {
      const [start, end] = part.split('-').map(Number)
      return value >= start && value <= end
    }

    // 指定值 x,y,z
    return part.split(',').map(Number).includes(value)
  }

  /** 检查日期是否匹配 Cron 表达式 */
  function matchesCron(date: Date, parts: string[]): boolean {
    if (parts.length !== 6) return false

    const [secPart, minPart, hourPart, dayPart, monthPart, weekPart] = parts

    // 月 (1-12)
    if (!matchesPart(date.getMonth() + 1, monthPart)) return false

    // 日/周（互斥）
    if (dayPart !== '?') {
      if (!matchesPart(date.getDate(), dayPart)) return false
    }
    if (weekPart !== '?') {
      // JS: 0=周日, 1=周一… → Cron: 1=周日, 2=周一…
      if (!matchesPart(date.getDay() + 1, weekPart)) return false
    }

    // 时
    if (!matchesPart(date.getHours(), hourPart)) return false
    // 分
    if (!matchesPart(date.getMinutes(), minPart)) return false
    // 秒
    if (!matchesPart(date.getSeconds(), secPart)) return false

    return true
  }

  /** 计算未来 N 次执行时间 */
  function computeNextExecutions(): Date[] {
    const expr = expression.value
    if (!expr || !validation.value.valid) return []

    const parts = expr.trim().split(/\s+/)
    if (parts.length !== 6) return []

    const results: Date[] = []
    const now = new Date()
    const cursor = new Date(now.getTime() + 1000) // 从下一秒开始
    cursor.setMilliseconds(0)

    // 判断是否包含秒级调度（秒字段不是 0）
    const hasSecond = parts[0] !== '0'
    const stepMs = hasSecond ? 1000 : 60_000 // 秒级/分钟级步进

    const maxIterations = 525_600 // 最多遍历 1 年的分钟数
    const target = count.value

    for (let i = 0; i < maxIterations && results.length < target; i++) {
      if (matchesCron(cursor, parts)) {
        results.push(new Date(cursor))
      }
      cursor.setTime(cursor.getTime() + stepMs)
    }

    return results
  }

  // ─── 监听表达式变化自动计算 ─────────────────

  watch(
    [expression, count],
    () => {
      if (!validation.value.valid) {
        nextExecutions.value = []
        return
      }
      computing.value = true
      // 使用 setTimeout 避免阻塞 UI
      setTimeout(() => {
        nextExecutions.value = computeNextExecutions()
        computing.value = false
      }, 0)
    },
    { immediate: true }
  )

  // ─── 格式化输出 ───────────────────────────────
  /** 格式化日期为字符串 */ function formatDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }

  /** 获取日期的中文星期名称 */
  function formatWeekDay(date: Date): string {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[date.getDay()]
  }

  return {
    nextExecutions,
    computing,
    formatDate,
    formatWeekDay,
  }
}
