/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-30
 * @FilePath: \Robot_Admin\tests\components\production-sales-editors.component.ts
 * @Description: 用真实 Provider 与正式编辑器验证页面启动、草稿隔离和迟到提交约束
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NMessageProvider, NDialogProvider } from 'naive-ui'
import { useProductionPlan } from '@/views/production-sales/production-plan/data'
import { useProductionActual } from '@/views/production-sales/production-actual/data'
import { useBusinessWorkbench } from '@/views/production-sales/sales-orders/data'
import { useShippingWorkbench } from '@/views/production-sales/shipping/data'

/** 保留真实包运行时校验，不 mock 掉编辑器必需的数据源契约。 */
function mountController<T>(create: () => T) {
  let controller!: T
  const Child = defineComponent({
    name: 'ProductionSalesEditorHarness',
    /** 在真实 Vue 作用域内创建页面控制器。 */
    setup() {
      controller = create()
      return () => h('div')
    },
  })
  const wrapper = mount(
    defineComponent({
      name: 'ProductionSalesProviderHarness',
      /** 消息和确认服务与应用保持一致。 */
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () => h(Child))
        ),
    })
  )
  return { controller, wrapper }
}

test('四类页面使用真实已发布编辑器可启动，无需配置远端请求', () => {
  const plan = mountController(useProductionPlan)
  const actual = mountController(useProductionActual)
  const sales = mountController(useBusinessWorkbench)
  const shipping = mountController(useShippingWorkbench)
  expect(plan.controller.editor.visible.value).toBe(false)
  expect(actual.controller.reviewEditor.visible.value).toBe(false)
  expect(sales.controller.orderEditor.visible.value).toBe(false)
  expect(sales.controller.lineEditor.visible.value).toBe(false)
  expect(shipping.controller.taskEditor.visible.value).toBe(false)
  for (const instance of [plan, actual, sales, shipping])
    instance.wrapper.unmount()
})

test('计划编辑副本取消不污染源记录，状态在弹窗打开后变化仍拒绝提交', async () => {
  const { controller: plan } = mountController(useProductionPlan)
  const source = { ...plan.rows.value[0] }
  plan.editor.openEdit(plan.rows.value[0])
  plan.editor.setModel({ ...source, customer: '尚未提交' })
  plan.editor.close()
  expect(plan.rows.value[0]).toEqual(source)
  plan.editor.openEdit(plan.rows.value[0])
  plan.rows.value[0] = { ...plan.rows.value[0], status: 'running' }
  expect(await plan.editor.submit({ ...source, customer: '迟到的修改' })).toBe(
    false
  )
  expect(plan.rows.value[0].customer).toBe(source.customer)
  expect(plan.editor.visible.value).toBe(true)
})

test('明细弹窗绑定原订单，切换上下文后的提交不写另一个订单', async () => {
  vi.useFakeTimers()
  const { controller: sales } = mountController(useBusinessWorkbench)
  await vi.advanceTimersByTimeAsync(120)
  await flushPromises()
  await sales.lineActions.value[0].onClick?.()
  const draft = { ...sales.lineEditor.model.value!, product: '迟到明细' }
  await sales.chooseOrder('ORDER-2')
  expect(await sales.lineEditor.submit(draft)).toBe(false)
  await vi.advanceTimersByTimeAsync(120)
  await flushPromises()
  expect(sales.lines.value.every(row => row.product !== '迟到明细')).toBe(true)
  expect(sales.activeId.value).toBe('ORDER-2')
})

test('复核弹窗打开后又修改实绩，拒绝复核并保留真实测量', async () => {
  const { controller: actual } = mountController(useProductionActual)
  actual.reviewEditor.openCreate()
  actual.model.value.carbon = 0.6
  expect(
    await actual.reviewEditor.submit({
      ...actual.reviewEditor.model.value!,
      note: '尚未保存，不能复核',
    })
  ).toBe(false)
  expect(actual.historyItems.value).toEqual([])
  expect(actual.model.value.carbon).toBe(0.6)
  expect(actual.locked.value).toBe(false)
})
