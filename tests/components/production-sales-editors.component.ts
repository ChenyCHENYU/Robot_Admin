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
import {
  NMessageProvider,
  NDialogProvider,
  useDialogReactiveList,
} from 'naive-ui'
import { useProductionPlan } from '@/views/production-sales/production-plan/data'
import { useProductionActual } from '@/views/production-sales/production-actual/data'
import { useBusinessWorkbench } from '@/views/production-sales/sales-orders/data'
import { useShippingWorkbench } from '@/views/production-sales/shipping/data'

/** 保留真实包运行时校验，不 mock 掉编辑器必需的数据源契约。 */
function mountController<T>(create: () => T) {
  let controller!: T
  let dialogs!: ReturnType<typeof useDialogReactiveList>
  const Child = defineComponent({
    name: 'ProductionSalesEditorHarness',
    /** 在真实 Vue 作用域内创建页面控制器。 */
    setup() {
      dialogs = useDialogReactiveList()
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
    }),
    // 确认框依赖离场钩子释放会话；保留真实 Transition，避免默认 stub 吞掉 afterLeave。
    { global: { stubs: { transition: false } } }
  )
  return { controller, wrapper, dialogs }
}

/** 正常操作走真实确认按钮，异步离场后的回调另由公开 DialogReactive 协议验证。 */
async function clickDialog(
  title: string,
  text: string,
  clicks = 1
): Promise<void> {
  await flushPromises()
  const dialog = [...document.body.querySelectorAll('.n-dialog')]
    .filter(element => element.textContent?.includes(title))
    .at(-1)
  expect(dialog, `应显示 ${title} 确认弹窗`).toBeDefined()
  const button = [...dialog!.querySelectorAll('button')].find(
    element => element.textContent?.trim() === text
  )
  expect(button, `应提供 ${text} 按钮`).toBeDefined()
  for (let index = 0; index < clicks; index++) button!.click()
  await flushPromises()
}

/** 销售页面已有本地异步明细加载，按真实定时协议等待而不替换资源组件。 */
async function settleSales(): Promise<void> {
  await vi.advanceTimersByTimeAsync(150)
  await flushPromises()
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

test('复制计划仅确认后新增独立待下达记录，取消不占号且重复确认不重复新增', async () => {
  const { controller: plan, dialogs } = mountController(useProductionPlan)
  const source = plan.rows.value[2]
  const original = { ...source }
  plan.copyPlan(source)
  plan.copyPlan(source)
  await flushPromises()
  expect(plan.editor.visible.value).toBe(false)
  expect(dialogs.value).toHaveLength(1)
  expect(dialogs.value[0].title).toBe('复制生产计划')
  expect(plan.rows.value).toHaveLength(18)
  await clickDialog('复制生产计划', '取消')
  await vi.waitFor(() => expect(dialogs.value).toHaveLength(0))
  expect(plan.rows.value).toHaveLength(18)

  plan.copyPlan(source)
  await clickDialog('复制生产计划', '确认复制', 2)
  expect(plan.rows.value).toHaveLength(19)
  const copy = plan.rows.value.at(-1)!
  expect(copy).toMatchObject({
    ...original,
    id: 'PLAN-19',
    planNo: 'PP-20261029-019',
    status: 'draft',
  })
  expect(copy).not.toBe(source)
  expect(plan.rows.value.find(row => row.id === source.id)).toEqual(original)
  expect(plan.editor.visible.value).toBe(false)
  expect(plan.current.value.id).toBe(copy.id)

  plan.editPlan(copy)
  expect(await plan.editor.submit({ ...copy, customer: '副本客户' })).toBe(true)
  expect(plan.rows.value.find(row => row.id === source.id)).toEqual(original)
  expect(plan.rows.value.find(row => row.id === copy.id)?.customer).toBe(
    '副本客户'
  )
})

test('计划确认前源记录删除或页面卸载，晚到的确认都不能新增', async () => {
  const removed = mountController(useProductionPlan)
  const source = removed.controller.rows.value[0]
  removed.controller.copyPlan(source)
  await flushPromises()
  const removedConfirm = removed.dialogs.value[0].onPositiveClick!
  removed.controller.rows.value = removed.controller.rows.value.filter(
    row => row.id !== source.id
  )
  await removedConfirm(new MouseEvent('click'))
  expect(removed.controller.rows.value).toHaveLength(17)
  removed.wrapper.unmount()

  const disposed = mountController(useProductionPlan)
  disposed.controller.copyPlan(disposed.controller.rows.value[0])
  await flushPromises()
  const disposedConfirm = disposed.dialogs.value[0].onPositiveClick!
  disposed.wrapper.unmount()
  await disposedConfirm(new MouseEvent('click'))
  expect(disposed.controller.rows.value).toHaveLength(18)
})

test('复制销售订单重建草稿和明细身份，保留零与三位金额，后续新增不携带复制明细', async () => {
  vi.useFakeTimers()
  const { controller: sales, dialogs } = mountController(useBusinessWorkbench)
  await settleSales()
  await sales.chooseOrder('ORDER-3')
  await settleSales()
  const source = sales.filteredOrders.value.find(row => row.id === 'ORDER-3')!
  const original = { ...sales.header.value }
  const originalLines = sales.lines.value
  await sales.copyOrder(source)
  await sales.copyOrder(source)
  await flushPromises()
  expect(dialogs.value).toHaveLength(1)
  expect(dialogs.value[0].title).toBe('复制销售订单')
  expect(sales.orderEditor.visible.value).toBe(false)
  await clickDialog('复制销售订单', '取消')
  await vi.waitFor(() => expect(dialogs.value).toHaveLength(0))
  expect(sales.filteredOrders.value).toHaveLength(18)

  await sales.copyOrder(source)
  await clickDialog('复制销售订单', '确认复制')
  await settleSales()
  expect(sales.filteredOrders.value).toHaveLength(19)
  expect(sales.header.value).toMatchObject({
    ...original,
    id: 'ORDER-19',
    orderNo: 'SO-2026-019',
    status: 0,
    progress: 0,
  })
  expect(sales.orderEditor.visible.value).toBe(false)
  expect(sales.lines.value.map(row => row.id)).toEqual([
    'ORDER-19-L01',
    'ORDER-19-L02',
    'ORDER-19-L03',
  ])
  expect(sales.lines.value[0]).toMatchObject({ quantity: '0', amount: '1.005' })
  expect(sales.lines.value[2].quantity).toBeNull()
  for (const [index, row] of sales.lines.value.entries())
    expect(row).not.toBe(originalLines[index])
  sales.header.value.note = '副本自己的修改'
  sales.lines.value[0].amount = '2.005'
  await sales.chooseOrder('ORDER-3')
  await sales.discardAndSwitch()
  await settleSales()
  expect(sales.header.value).toEqual(original)
  expect(sales.lines.value[0].amount).toBe('1.005')

  await sales.orderActions.value[0].onClick?.()
  expect(sales.orderEditor.visible.value).toBe(true)
  expect(sales.orderEditor.model.value?.id).toBe('ORDER-20')
  expect(
    await sales.orderEditor.submit({
      ...sales.orderEditor.model.value!,
      customer: original.customer,
      contractNo: original.contractNo,
      section: original.section,
    })
  ).toBe(true)
  await settleSales()
  expect(sales.lines.value).toEqual([])
})

test('销售复制在打开前及确认期间检查未保存草稿，不清空原输入或占用编号', async () => {
  vi.useFakeTimers()
  const { controller: sales, dialogs } = mountController(useBusinessWorkbench)
  await settleSales()
  const source = sales.filteredOrders.value[0]
  sales.header.value.note = '先保留我的输入'
  await sales.copyOrder(source)
  expect(dialogs.value).toHaveLength(0)
  expect(sales.notice.value).toContain('请先保存或恢复当前订单')
  expect(sales.header.value.note).toBe('先保留我的输入')
  expect(sales.filteredOrders.value).toHaveLength(18)

  sales.restore()
  await settleSales()
  await sales.copyOrder(source)
  await flushPromises()
  expect(dialogs.value).toHaveLength(1)
  sales.header.value.note = '确认期间又填写的内容'
  await clickDialog('复制销售订单', '确认复制')
  expect(sales.filteredOrders.value).toHaveLength(18)
  expect(sales.header.value.note).toBe('确认期间又填写的内容')
  expect(sales.notice.value).toContain('请先保存或恢复当前订单')
  sales.restore()
  await settleSales()
  await sales.orderActions.value[0].onClick?.()
  expect(sales.orderEditor.model.value?.id).toBe('ORDER-19')
})

test('销售复制确认只消费一次，源记录删除或页面卸载后回调不写入', async () => {
  vi.useFakeTimers()
  const {
    controller: sales,
    wrapper,
    dialogs,
  } = mountController(useBusinessWorkbench)
  await settleSales()
  const source = sales.filteredOrders.value[0]
  await sales.copyOrder(source)
  await clickDialog('复制销售订单', '确认复制', 2)
  await settleSales()
  await vi.waitFor(() => expect(dialogs.value).toHaveLength(0))
  expect(sales.filteredOrders.value).toHaveLength(19)
  expect(sales.orderEditor.visible.value).toBe(false)

  await sales.copyOrder(source)
  await flushPromises()
  const removedConfirm = dialogs.value.at(-1)!.onPositiveClick!
  sales.removeOrder(source)
  await clickDialog('删除草稿订单', '确认删除')
  expect(sales.filteredOrders.value).toHaveLength(18)
  await removedConfirm(new MouseEvent('click'))
  expect(sales.filteredOrders.value).toHaveLength(18)

  await sales.copyOrder(sales.filteredOrders.value[0])
  await flushPromises()
  const lateConfirm = dialogs.value.at(-1)!.onPositiveClick!
  wrapper.unmount()
  await lateConfirm(new MouseEvent('click'))
  expect(sales.filteredOrders.value).toHaveLength(18)
})
