/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\tests\activity-log-date.test.ts
 * @Description: 活动日志当地日期筛选边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { activityDateBounds } from '../src/views/account/activity-log/data'

test('活动日志使用当地日历日，含所选末日且排除次日零点', () => {
  const first = new Date(2026, 2, 7, 13, 30)
  const last = new Date(2026, 2, 8, 22, 15)
  const { start, end } = activityDateBounds(first.getTime(), last.getTime())
  expect(start).toBe(new Date(2026, 2, 7).getTime())
  expect(end).toBe(new Date(2026, 2, 9).getTime())
  expect(activityDateBounds(last.getTime())).toEqual({
    start: new Date(2026, 2, 8).getTime(),
    end,
  })
})
