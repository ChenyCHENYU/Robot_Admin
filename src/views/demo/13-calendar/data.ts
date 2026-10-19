/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 日程工作台分类、示例、表单和本地备份契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { CalendarEvent } from '@robot-admin/naive-ui-components/C_FullCalendar'
import type { FormOption } from '@robot-admin/naive-ui-components/C_Form'

export const CALENDAR_STORAGE_KEY = 'robot-admin:calendar-workspace:v2'
export const CATEGORIES = [
  { value: 'meeting', label: '会议协作', color: '#5486e8' },
  { value: 'delivery', label: '项目交付', color: '#9a78dc' },
  { value: 'focus', label: '专注时间', color: '#2caa98' },
  { value: 'personal', label: '个人安排', color: '#c7954b' },
] as const
export type ScheduleCategory = (typeof CATEGORIES)[number]['value']
export interface ScheduleEvent extends CalendarEvent {
  category: ScheduleCategory
  location: string
  description: string
  allDay: boolean
}
export interface ScheduleDraft {
  id: string
  title: string
  category: ScheduleCategory
  start: number | null
  end: number | null
  allDay: boolean
  location: string
  description: string
}

/** 本地日历日期，不把 UTC 日期截断当作本地日期。 */
export const localDay = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
/** 日期型事件按本地零点解析，兼容 FullCalendar 的日期字符串。 */
export const eventDate = (value: Date | string): Date =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value)
/** 全天结束为排他日期，跨天事件也能正确计入选中日。 */
export const occursOnDay = (event: ScheduleEvent, day: string): boolean => {
  const start = eventDate(event.start).getTime()
  const end = event.end
    ? eventDate(event.end).getTime()
    : start + (event.allDay ? 86400000 : 3600000)
  const begin = eventDate(day)
  const next = new Date(
    begin.getFullYear(),
    begin.getMonth(),
    begin.getDate() + 1
  )
  return start < next.getTime() && end > begin.getTime()
}
/** 围绕打开页面的日期生成固定工作时段，避免示例时间落在午夜。 */
export const createScheduleEvents = (now = new Date()): ScheduleEvent[] => {
  const entries: Array<
    [
      string,
      number,
      number,
      number,
      ScheduleCategory,
      string,
      number?,
      boolean?,
    ]
  > = [
    ['产品迭代周会', 0, 9, 10, 'meeting', '线上会议'],
    ['设计方案评审', 0, 14, 15, 'meeting', '设计协作室'],
    ['无打扰 · 专注开发', 0, 16, 18, 'focus', ''],
    ['版本验收与发布', 1, 10, 12, 'delivery', '发布工作区'],
    ['客户需求沟通', 2, 14, 15, 'meeting', '线上会议'],
    ['组件库维护（跨日）', 3, 10, 12, 'focus', '', 1],
    ['个人学习计划', 4, 17, 18, 'personal', ''],
    ['下期里程碑确认（全天）', 6, 0, 0, 'delivery', '项目协作室', 1, true],
    ['代码走查', -1, 14, 16, 'delivery', '线上会议'],
  ]
  return entries.map(
    (
      [
        title,
        offset,
        start,
        end,
        category,
        location,
        endOffset = 0,
        allDay = false,
      ],
      index
    ) => {
      const begin = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + offset,
        start
      )
      const finish = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + offset + endOffset,
        end
      )
      return {
        id: `sample-${index + 1}`,
        title,
        category,
        location,
        description: '',
        allDay,
        start: allDay ? localDay(begin) : begin.toISOString(),
        end: allDay ? localDay(finish) : finish.toISOString(),
        color: CATEGORIES.find(item => item.value === category)!.color,
      }
    }
  )
}
/** 表单的时间单位为本地时间戳；全天模式隐藏时分输入。 */
export const createScheduleFields = (
  allDay: boolean
): FormOption<ScheduleDraft>[] => [
  {
    prop: 'title',
    label: '日程标题',
    type: 'input',
    attrs: { maxlength: 120, placeholder: '例如：产品方案评审' },
    rules: [{ required: true, message: '请输入日程标题', trigger: 'blur' }],
  },
  {
    prop: 'category',
    label: '日程分类',
    type: 'select',
    children: CATEGORIES.map(item => ({
      label: item.label,
      value: item.value,
    })),
  },
  { prop: 'allDay', label: '全天日程', type: 'switch' },
  {
    prop: 'start',
    label: '开始时间',
    type: 'datePicker',
    attrs: {
      type: allDay ? 'date' : 'datetime',
      clearable: false,
      format: allDay ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm',
    },
  },
  {
    prop: 'end',
    label: allDay ? '结束日期（含当天）' : '结束时间',
    type: 'datePicker',
    attrs: {
      type: allDay ? 'date' : 'datetime',
      clearable: false,
      format: allDay ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm',
    },
  },
  {
    prop: 'location',
    label: '地点 / 会议链接',
    type: 'input',
    attrs: { maxlength: 200, placeholder: '选填' },
  },
  {
    prop: 'description',
    label: '日程备注',
    type: 'input',
    attrs: {
      type: 'textarea',
      rows: 3,
      maxlength: 2000,
      placeholder: '议程、准备事项或交付目标',
    },
  },
]
/** 全天日期的结束日转为 FullCalendar 使用的排他边界。 */
const draftRange = (value: ScheduleDraft) => {
  if (value.start === null || value.end === null)
    throw new Error('请选择完整的起止时间')
  const begin = new Date(value.start)
  const end = new Date(value.end)
  if (value.allDay) {
    begin.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    end.setDate(end.getDate() + 1)
  }
  if (
    !Number.isFinite(begin.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    end <= begin
  )
    throw new Error('结束时间必须晚于开始时间')
  return {
    start: value.allDay ? localDay(begin) : begin.toISOString(),
    end: value.allDay ? localDay(end) : end.toISOString(),
  }
}
/** 创建日程时集中规范时间边界与分类颜色。 */
export const buildScheduleEvent = (value: ScheduleDraft): ScheduleEvent => {
  if (!value.title.trim()) throw new Error('请输入日程标题')
  const category = CATEGORIES.find(item => item.value === value.category)
  if (!category) throw new Error('请选择有效分类')
  return {
    id: value.id || crypto.randomUUID(),
    title: value.title.trim(),
    ...draftRange(value),
    allDay: value.allDay,
    category: category.value,
    color: category.color,
    location: value.location.trim(),
    description: value.description.trim(),
  }
}
/** 已有日程映射为表单时，全天结束日期恢复为用户可见的最后一天。 */
export const editScheduleDraft = (event: ScheduleEvent): ScheduleDraft => {
  const end = eventDate(event.end ?? event.start)
  if (event.allDay && event.end) end.setDate(end.getDate() - 1)
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    start: eventDate(event.start).getTime(),
    end: end.getTime(),
    allDay: event.allDay,
    location: event.location,
    description: event.description,
  }
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const validId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 100
const validTitle = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 120
const validStoredTime = (value: unknown): value is string => {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(
      value
    )
  )
    return false
  return (
    localDay(eventDate(value.slice(0, 10))) === value.slice(0, 10) &&
    Number.isFinite(eventDate(value).getTime())
  )
}
const optionalText = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.slice(0, max) : ''
const readStoredRange = (value: Record<string, unknown>) => {
  if (
    !validStoredTime(value.start) ||
    !validStoredTime(value.end) ||
    eventDate(value.end) <= eventDate(value.start)
  )
    throw new Error('日程起止时间不正确')
  if (value.allDay && (value.start.length !== 10 || value.end.length !== 10))
    throw new Error('全天日程必须使用日期格式')
  return { start: value.start, end: value.end }
}
const readScheduleEntry = (value: unknown, ids: Set<string>): ScheduleEvent => {
  if (!isRecord(value) || !validId(value.id) || !validTitle(value.title))
    throw new Error('日程编号或标题不正确')
  if (ids.has(value.id)) throw new Error('日程编号不能重复')
  const category = CATEGORIES.find(entry => entry.value === value.category)
  if (!category || typeof value.allDay !== 'boolean')
    throw new Error('日程分类或全天标记不正确')
  const range = readStoredRange(value)
  ids.add(value.id)
  return {
    id: value.id,
    title: value.title.trim(),
    ...range,
    allDay: value.allDay,
    category: category.value,
    color: category.color,
    location: optionalText(value.location, 200),
    description: optionalText(value.description, 2000),
  }
}
/** 将日历视图的交互结果合并回完整集合，全天拖动后的 Date 恢复为日期字符串。 */
export const mergeScheduleChanges = (
  events: ScheduleEvent[],
  updates: CalendarEvent[]
): ScheduleEvent[] => {
  const changes = new Map(updates.map(event => [event.id, event]))
  return events.map(event => {
    const change = changes.get(event.id)
    if (!change) return event
    const start = eventDate(change.start)
    const end = eventDate(change.end ?? event.end ?? change.start)
    const allDay =
      typeof change.allDay === 'boolean' ? change.allDay : event.allDay
    return {
      ...event,
      ...change,
      allDay,
      start: allDay ? localDay(start) : start.toISOString(),
      end: allDay ? localDay(end) : end.toISOString(),
    }
  })
}
/** 验证备份结构后整体替换，拒绝重复 ID、非法时间与无界数据。 */
export const parseScheduleBackup = (text: string): ScheduleEvent[] => {
  const data: unknown = JSON.parse(text)
  if (
    !isRecord(data) ||
    data.schemaVersion !== 1 ||
    !Array.isArray(data.events) ||
    data.events.length > 1000
  )
    throw new Error('请选择有效的日程备份，最多支持 1000 条')
  const ids = new Set<string>()
  return data.events.map(value => readScheduleEntry(value, ids))
}
