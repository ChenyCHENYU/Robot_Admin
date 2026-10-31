/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\e2e\dictionary-http.pw.ts
 * @Description: 真实业务构建的字典 HTTP 合同回归，响应由隔离 fixture 控制，不代表真实后端 UAT
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test.use({ baseURL: 'http://127.0.0.1:4174' })

test('接口字典失败局部可见且无重复消息，重试恢复并跨弹窗复用缓存', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await installMockAdminSession(page)
  let requests = 0
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/sys/dictionaries')) {
      requests++
      return route.fulfill({
        json:
          requests === 1
            ? { code: 503, data: null, msg: '隔离测试的一次字典失败' }
            : {
                code: 0,
                data: [
                  {
                    id: 'user_status',
                    type: 'type',
                    code: 'user_status',
                    typeCode: 'user_status',
                    name: '用户状态',
                    sort: 1,
                    status: 1,
                    children: [
                      {
                        id: 'normal',
                        type: 'item',
                        code: 'normal',
                        name: '正常 HTTP',
                        value: '1',
                        sort: 1,
                        status: 1,
                      },
                      {
                        id: 'disabled',
                        type: 'item',
                        code: 'disabled',
                        name: '停用 HTTP',
                        value: '0',
                        sort: 2,
                        status: 0,
                      },
                    ],
                  },
                ],
                msg: '成功',
              },
      })
    }
    const data = path.endsWith('/auth/menu-list')
      ? [
          {
            path: '/production-sales/sales-orders',
            name: 'dictionary-contract-sales',
            component: '/production-sales/sales-orders/index',
            meta: { title: '销售订单协同', keepAlive: true },
          },
        ]
      : path.endsWith('/auth/button-list')
        ? {}
        : []
    return route.fulfill({ json: { code: 0, data, msg: '成功' } })
  })
  await page.goto('/#/production-sales/sales-orders')
  await expect(page.getByTestId('business-workbench')).toBeVisible()
  await page.getByRole('button', { name: '字典联动体验', exact: true }).click()
  const experience = page.getByTestId('dictionary-experience')
  await expect(experience).toContainText('选项加载失败')
  expect(requests).toBe(1)
  await expect(
    page.locator('.n-message--error-type,.n-notification--error-type')
  ).toHaveCount(0)
  await experience.getByRole('button', { name: '重试', exact: true }).click()
  await expect(experience.getByTestId('dictionary-form')).toContainText(
    '停用 HTTP'
  )
  await expect(experience).not.toContainText('选项加载失败')
  expect(requests).toBe(2)
  await page.getByRole('button', { name: '关闭体验', exact: true }).click()
  await expect(experience).toHaveCount(0)
  await page.getByRole('button', { name: '字典联动体验', exact: true }).click()
  await expect(experience.getByTestId('dictionary-form')).toContainText(
    '停用 HTTP'
  )
  expect(requests).toBe(2)
  await expect(
    page.locator('.n-message--error-type,.n-notification--error-type')
  ).toHaveCount(0)
  expect(errors).toEqual([])
})
