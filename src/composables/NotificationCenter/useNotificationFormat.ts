/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\composables\NotificationCenter\useNotificationFormat.ts
 * @Description: 通知时间格式化
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 时间单位阈值 */
const MINUTE = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

/** 单例缓存 */
let _instance: ReturnType<typeof createNotificationFormat> | null = null

/**
 * 通知时间格式化（单例）
 *
 * 将 ISO 时间戳格式化为人类友好的相对时间描述，
 * 如 "刚刚"、"5分钟前"、"昨天 14:30" 等。
 */
export function useNotificationFormat() {
  if (!_instance) _instance = createNotificationFormat()
  return _instance
}

/**
 * 创建格式化工具实例
 */
function createNotificationFormat() {
  /**
   * 格式化相对时间
   * @param timestamp ISO 8601 时间字符串
   */
  function formatRelativeTime(timestamp: string): string {
    const date = new Date(timestamp)
    const now = Date.now()
    const diff = now - date.getTime()

    if (diff < 0) return '刚刚'
    if (diff < MINUTE) return '刚刚'
    if (diff < HOUR) return `${Math.floor(diff / MINUTE)}分钟前`
    if (diff < DAY) return `${Math.floor(diff / HOUR)}小时前`

    // 判断是否是昨天
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today.getTime() - DAY)

    if (date >= yesterday && date < today) {
      return `昨天 ${padTime(date.getHours())}:${padTime(date.getMinutes())}`
    }

    if (diff < WEEK) return `${Math.floor(diff / DAY)}天前`
    if (diff < MONTH) return `${Math.floor(diff / WEEK)}周前`
    if (diff < YEAR) return `${Math.floor(diff / MONTH)}个月前`

    return formatFullDate(date)
  }

  /**
   * 格式化完整日期时间
   * @param date Date 对象
   */
  function formatFullDate(date: Date): string {
    const y = date.getFullYear()
    const m = padTime(date.getMonth() + 1)
    const d = padTime(date.getDate())
    const h = padTime(date.getHours())
    const min = padTime(date.getMinutes())
    return `${y}-${m}-${d} ${h}:${min}`
  }

  /**
   * 补零
   * @param n 数字
   */
  function padTime(n: number): string {
    return n < 10 ? `0${n}` : String(n)
  }

  return {
    formatRelativeTime,
    formatFullDate,
  }
}
