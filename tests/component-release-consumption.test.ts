/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @FilePath: \Robot_Admin\tests\component-release-consumption.test.ts
 * @Description: 正式组件包消费侧的跨日、全天与弹性表格配置回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { getTableColumns } from '../src/views/demo/10-table/data'
import {
  dataColumns,
  childColumnsConfig,
  defaultConfig,
} from '../src/views/demo/11-table-expand/data'
import {
  createScheduleEvents,
  editScheduleDraft,
  buildScheduleEvent,
  mergeScheduleChanges,
} from '../src/views/demo/13-calendar/data'

test('父表功能列使用默认列宽，父子业务列均留有承接剩余空间的弹性列', () => {
  expect(defaultConfig.density).toBe('compact')
  for (const column of dataColumns) {
    if (
      'type' in column &&
      ['selection', 'expand', 'index'].includes(column.type)
    )
      expect(column.width).toBeUndefined()
  }
  expect(
    dataColumns.some(
      column => !('type' in column) && column.width === undefined
    )
  ).toBe(true)
  for (const columns of Object.values(childColumnsConfig))
    expect(columns.some(column => column.width === undefined)).toBe(true)
})

test('跨日和全天示例修改标题后，起止语义完整往返', () => {
  const events = createScheduleEvents(new Date(2026, 9, 19))
  const multiDay = events.find(event => event.title.includes('跨日'))!
  const allDay = events.find(event => event.allDay)!
  expect(
    new Date(multiDay.end!).getDate() - new Date(multiDay.start).getDate()
  ).toBe(1)
  for (const event of [multiDay, allDay]) {
    const changed = buildScheduleEvent({
      ...editScheduleDraft(event),
      title: '修改标题',
    })
    expect(changed.start).toBe(event.start)
    expect(changed.end).toBe(event.end)
    expect(changed.allDay).toBe(event.allDay)
  }
})

test('原生拖动切换全天标记后，合并依据最新标记规范日期', () => {
  const event = createScheduleEvents(new Date(2026, 9, 19))[0]
  const allDay = mergeScheduleChanges(
    [event],
    [
      {
        ...event,
        allDay: true,
        start: new Date(2026, 9, 20),
        end: new Date(2026, 9, 22),
      },
    ]
  )[0]
  expect(allDay).toMatchObject({
    allDay: true,
    start: '2026-10-20',
    end: '2026-10-22',
  })
  const timed = mergeScheduleChanges(
    [allDay],
    [
      {
        ...allDay,
        allDay: false,
        start: new Date(2026, 9, 20, 9),
        end: new Date(2026, 9, 21, 17),
      },
    ]
  )[0]
  expect(timed.allDay).toBe(false)
  expect(new Date(timed.start).getHours()).toBe(9)
  expect(timed.end).toContain('T')
})

test('编辑表格使用组件默认功能列，校验规则只在业务列维护一份', () => {
  const columns = getTableColumns()
  expect(columns.slice(0, 2)).toEqual([
    { type: 'selection' },
    { type: 'index' },
  ])
  const name = columns.find(column => column.key === 'name')!
  const email = columns.find(column => column.key === 'email')!
  expect(name.required).toBe(true)
  expect(name.editProps?.rules).toHaveLength(1)
  expect(email.required).toBe(true)
  expect(email.editProps?.rules).toHaveLength(1)
})
