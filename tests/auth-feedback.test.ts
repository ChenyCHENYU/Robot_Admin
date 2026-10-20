/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @FilePath: \Robot_Admin\tests\auth-feedback.test.ts
 * @Description: 问候时段、已激活公司与退出原因的提示边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import {
  createLoginFeedback,
  createLogoutFeedback,
} from '../src/utils/d_authFeedback'

for (const [hour, greeting] of [
  [0, '夜深了'],
  [5, '夜深了'],
  [6, '早上好'],
  [11, '早上好'],
  [12, '中午好'],
  [14, '下午好'],
  [18, '晚上好'],
  [22, '夜深了'],
] as const) {
  test(`${hour} 时的问候与本机时间一致`, () => {
    const feedback = createLoginFeedback(
      ' CHENY ',
      '实际激活公司',
      new Date(2026, 9, 20, hour)
    )
    expect(feedback.title).toBe(`${greeting}，CHENY`)
    expect(feedback.content).toContain('实际激活公司')
    expect(feedback.duration).toBeGreaterThanOrEqual(4500)
    expect(feedback.keepAliveOnHover).toBe(true)
  })
}
test('主动退出与会话过期采用不同文案，缺少姓名时仍自然可读', () => {
  expect(createLogoutFeedback('CHENY').content).toContain('CHENY，辛苦了')
  expect(createLogoutFeedback('').content).not.toContain('undefined')
  expect(createLogoutFeedback('CHENY', true)).toMatchObject({
    title: '登录已到期',
    content: '请重新登录后继续工作。',
  })
  expect(createLogoutFeedback('CHENY', true).content).not.toContain('辛苦了')
})
