/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 日程备份与本地全天、跨天日期边界回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, test } from 'bun:test'
import {
  createScheduleEvents,
  buildScheduleEvent,
  editScheduleDraft,
  mergeScheduleChanges,
  localDay,
  occursOnDay,
  parseScheduleBackup,
  type ScheduleEvent,
} from '../src/views/demo/13-calendar/data'

const wrap = (events: unknown[]) => JSON.stringify({ schemaVersion: 1, events })
describe('日程工作台数据边界', () => {
  test('示例在当地工作时间生成，导出后可完整恢复', () => {
    const events = createScheduleEvents(new Date(2026, 9, 18))
    expect(events).toHaveLength(9)
    expect(new Date(events[0].start).getHours()).toBe(9)
    expect(
      events.filter(event => occursOnDay(event, '2026-10-18'))
    ).toHaveLength(3)
    expect(parseScheduleBackup(wrap(events))).toEqual(events)
  })
  test('全天结束日期排他，跨天日程不会漏计中间日期', () => {
    const event: ScheduleEvent = {
      ...createScheduleEvents()[0],
      allDay: true,
      start: '2026-10-18',
      end: '2026-10-21',
    }
    expect(occursOnDay(event, '2026-10-17')).toBe(false)
    expect(occursOnDay(event, '2026-10-18')).toBe(true)
    expect(occursOnDay(event, '2026-10-20')).toBe(true)
    expect(occursOnDay(event, '2026-10-21')).toBe(false)
    const midnight = {
      ...event,
      allDay: false,
      start: '2026-10-18T23:00:00',
      end: '2026-10-19T01:00:00',
    }
    expect(occursOnDay(midnight, '2026-10-19')).toBe(true)
    expect(localDay(new Date(2026, 9, 18, 0, 1))).toBe('2026-10-18')
  })
  test('非法备份、重复编号与反向时间不能替换有效日程', () => {
    const event = createScheduleEvents()[0]
    for (const value of [
      'null',
      '{}',
      '{"schemaVersion":2,"events":[]}',
      wrap([event, event]),
      wrap([{ ...event, end: event.start }]),
      wrap([{ ...event, category: 'unknown' }]),
      wrap([{ ...event, title: ' ' }]),
      wrap([{ ...event, start: 'invalid' }]),
    ]) {
      expect(() => parseScheduleBackup(value)).toThrow()
    }
    expect(() =>
      parseScheduleBackup(wrap(Array.from({ length: 1001 }, () => event)))
    ).toThrow()
    expect(parseScheduleBackup(wrap([]))).toEqual([])
  })
  test('全天表单使用包含结束日，备份与日历统一为排他结束边界', () => {
    const event = buildScheduleEvent({
      id: 'whole-day',
      title: '全天交付',
      category: 'delivery',
      start: new Date(2026, 9, 18).getTime(),
      end: new Date(2026, 9, 20).getTime(),
      allDay: true,
      location: '',
      description: '',
    })
    expect([event.start, event.end]).toEqual(['2026-10-18', '2026-10-21'])
    expect(localDay(new Date(editScheduleDraft(event).end!))).toBe('2026-10-20')
    const malformed = { ...event, start: '2026-02-31' }
    expect(() => parseScheduleBackup(wrap([malformed]))).toThrow()
    expect(() =>
      parseScheduleBackup(wrap([{ ...event, start: '2026-10-18T00:00:00' }]))
    ).toThrow()
  })
  test('过滤后的拖动结果保留隐藏分类，全天 Date 导出后仍能恢复', () => {
    const events = createScheduleEvents(new Date(2026, 9, 18))
    const wholeDay: ScheduleEvent = {
      ...events[0],
      allDay: true,
      start: '2026-10-18',
      end: '2026-10-19',
    }
    const source = [wholeDay, ...events.slice(1)]
    const result = mergeScheduleChanges(source, [
      { ...wholeDay, start: new Date(2026, 9, 20), end: new Date(2026, 9, 21) },
    ])
    expect(result).toHaveLength(9)
    expect(result[0].start).toBe('2026-10-20')
    expect(result[0].end).toBe('2026-10-21')
    expect(result.slice(1)).toEqual(source.slice(1))
    expect(parseScheduleBackup(wrap(result))).toEqual(result)
  })
})
