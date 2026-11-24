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
import { useProductionPlan } from '@/views/production-sales/production-plan/useProductionPlan'
import { useProductionActual } from '@/views/production-sales/production-actual/useProductionActual'
import { useBusinessWorkbench } from '@/views/production-sales/sales-orders/useBusinessWorkbench'
import type { OrderHeader } from '@/views/production-sales/sales-orders/data'
import { useShippingWorkbench } from '@/views/production-sales/shipping/useShippingWorkbench'
import { createDictionaryPlugin } from '@robot-admin/dictionary/vue'
import type { DescriptionField } from '@robot-admin/naive-ui-components/C_Descriptions'
import dictionaryConfig from '@/config/dictionary'

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
    {
      global: {
        stubs: { transition: false },
        plugins: [createDictionaryPlugin(dictionaryConfig)],
      },
    }
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
  expect(plan.controller.editing.editor.visible.value).toBe(false)
  expect(actual.controller.review.reviewEditor.visible.value).toBe(false)
  expect(sales.controller.ledger.editor.visible.value).toBe(false)
  expect(sales.controller.lines.editor.visible.value).toBe(false)
  expect(shipping.controller.tasks.editor.visible.value).toBe(false)
  for (const instance of [plan, actual, sales, shipping])
    instance.wrapper.unmount()
})

test('详情字段绑定随查看记录切换自动翻译，保留原始订单编码', async () => {
  const { controller: sales, wrapper } = mountController(useBusinessWorkbench)
  const statusField: DescriptionField<OrderHeader> =
    sales.inspection.descriptions.find(field => field.key === 'status')!
  const formattedStatus = () => {
    const order = sales.inspection.order
    return order ? statusField.format?.(order.header) : undefined
  }
  expect(sales.inspection.order).toBeNull()
  const pending = sales.ledger.rows.find(row => row.status === 0)!
  const running = sales.ledger.rows.find(row => row.status === 1)!
  await sales.ledger.openDetail(pending)
  expect(formattedStatus()).toBe('待下达')
  await sales.ledger.openDetail(running)
  expect(formattedStatus()).toBe('执行中')
  expect(sales.inspection.order?.header.status).toBe(1)
  expect(pending.status).toBe(0)
  expect(running.status).toBe(1)
  wrapper.unmount()
})

test('计划编辑副本取消不污染源记录，状态在弹窗打开后变化仍拒绝提交', async () => {
  const { controller: plan } = mountController(useProductionPlan)
  const source = { ...plan.ledger.allRows[0] }
  plan.editing.editor.openEdit(plan.ledger.allRows[0])
  plan.editing.editor.setModel({ ...source, customer: '尚未提交' })
  plan.editing.editor.close()
  expect(plan.ledger.allRows[0]).toEqual(source)
  plan.editing.editor.openEdit(plan.ledger.allRows[0])
  plan.ledger.allRows[0] = { ...plan.ledger.allRows[0], status: 'running' }
  expect(
    await plan.editing.editor.submit({ ...source, customer: '迟到的修改' })
  ).toBe(false)
  expect(plan.ledger.allRows[0].customer).toBe(source.customer)
  expect(plan.editing.editor.visible.value).toBe(true)
})

test('明细弹窗绑定原订单，切换上下文后的提交不写另一个订单', async () => {
  vi.useFakeTimers()
  const { controller: sales } = mountController(useBusinessWorkbench)
  await vi.advanceTimersByTimeAsync(120)
  await flushPromises()
  await sales.lines.actions[0].onClick?.()
  const draft = { ...sales.lines.editor.model.value!, product: '迟到明细' }
  await sales.draft.chooseOrder('ORDER-2')
  expect(await sales.lines.editor.submit(draft)).toBe(false)
  await vi.advanceTimersByTimeAsync(120)
  await flushPromises()
  expect(sales.lines.rows.every(row => row.product !== '迟到明细')).toBe(true)
  expect(sales.draft.activeId).toBe('ORDER-2')
})

test('复核弹窗打开后又修改实绩，拒绝复核并保留真实测量', async () => {
  const { controller: actual } = mountController(useProductionActual)
  actual.review.reviewEditor.openCreate()
  actual.entry.model.carbon = 0.6
  expect(
    await actual.review.reviewEditor.submit({
      ...actual.review.reviewEditor.model.value!,
      note: '尚未保存，不能复核',
    })
  ).toBe(false)
  expect(actual.review.historyItems).toEqual([])
  expect(actual.entry.model.carbon).toBe(0.6)
  expect(actual.review.locked).toBe(false)
})

test('复制计划仅确认后新增独立待下达记录，取消不占号且重复确认不重复新增', async () => {
  const { controller: plan, dialogs } = mountController(useProductionPlan)
  const source = plan.ledger.allRows[2]
  const original = { ...source }
  plan.editing.copy(source)
  plan.editing.copy(source)
  await flushPromises()
  expect(plan.editing.editor.visible.value).toBe(false)
  expect(dialogs.value).toHaveLength(1)
  expect(dialogs.value[0].title).toBe('复制生产计划')
  expect(plan.ledger.allRows).toHaveLength(18)
  await clickDialog('复制生产计划', '取消')
  await vi.waitFor(() => expect(dialogs.value).toHaveLength(0))
  expect(plan.ledger.allRows).toHaveLength(18)

  plan.editing.copy(source)
  await clickDialog('复制生产计划', '确认复制', 2)
  expect(plan.ledger.allRows).toHaveLength(19)
  const copy = plan.ledger.allRows.at(-1)!
  expect(copy).toMatchObject({
    ...original,
    id: 'PLAN-19',
    planNo: 'PP-20261029-019',
    status: 'draft',
  })
  expect(copy).not.toBe(source)
  expect(plan.ledger.allRows.find(row => row.id === source.id)).toEqual(
    original
  )
  expect(plan.editing.editor.visible.value).toBe(false)
  expect(plan.heats.plan?.id).toBe(copy.id)

  plan.editing.edit(copy)
  expect(
    await plan.editing.editor.submit({ ...copy, customer: '副本客户' })
  ).toBe(true)
  expect(plan.ledger.allRows.find(row => row.id === source.id)).toEqual(
    original
  )
  expect(plan.ledger.allRows.find(row => row.id === copy.id)?.customer).toBe(
    '副本客户'
  )
})

test('计划确认前源记录删除或页面卸载，晚到的确认都不能新增', async () => {
  const removed = mountController(useProductionPlan)
  const source = removed.controller.ledger.allRows[0]
  removed.controller.editing.copy(source)
  await flushPromises()
  const removedConfirm = removed.dialogs.value[0].onPositiveClick!
  removed.controller.ledger.allRows = removed.controller.ledger.allRows.filter(
    row => row.id !== source.id
  )
  await removedConfirm(new MouseEvent('click'))
  expect(removed.controller.ledger.allRows).toHaveLength(17)
  removed.wrapper.unmount()

  const disposed = mountController(useProductionPlan)
  disposed.controller.editing.copy(disposed.controller.ledger.allRows[0])
  await flushPromises()
  const disposedConfirm = disposed.dialogs.value[0].onPositiveClick!
  disposed.wrapper.unmount()
  await disposedConfirm(new MouseEvent('click'))
  expect(disposed.controller.ledger.allRows).toHaveLength(18)
})

test('下达确认只更新原计划中仍待下达的记录，实际下达数与台账一致', async () => {
  const {
    controller: plan,
    wrapper,
    dialogs,
  } = mountController(useProductionPlan)
  try {
    const [first, second] = plan.ledger.allRows.filter(
      row => row.status === 'draft'
    )
    plan.ledger.selectedIds = [first.id, second.id]
    expect(plan.release.readyCount).toBe(2)
    plan.release.confirm()
    plan.ledger.allRows = plan.ledger.allRows.map(row =>
      row.id === first.id ? { ...row, status: 'running' } : row
    )
    await dialogs.value[0].onPositiveClick!(new MouseEvent('click'))
    expect(plan.ledger.allRows.find(row => row.id === first.id)?.status).toBe(
      'running'
    )
    expect(plan.ledger.allRows.find(row => row.id === second.id)?.status).toBe(
      'issued'
    )
    expect(plan.notice.value).toContain('已下达 1 项')
  } finally {
    wrapper.unmount()
  }
})

test('复制销售订单重建草稿和明细身份，保留零与三位金额，后续新增不携带复制明细', async () => {
  vi.useFakeTimers()
  const { controller: sales, dialogs } = mountController(useBusinessWorkbench)
  await settleSales()
  await sales.draft.chooseOrder('ORDER-3')
  await settleSales()
  const source = sales.ledger.rows.find(row => row.id === 'ORDER-3')!
  const original = { ...sales.draft.header }
  const originalLines = sales.lines.rows
  await sales.ledger.copy(source)
  await sales.ledger.copy(source)
  await flushPromises()
  expect(dialogs.value).toHaveLength(1)
  expect(dialogs.value[0].title).toBe('复制销售订单')
  expect(sales.ledger.editor.visible.value).toBe(false)
  await clickDialog('复制销售订单', '取消')
  await vi.waitFor(() => expect(dialogs.value).toHaveLength(0))
  expect(sales.ledger.rows).toHaveLength(18)

  await sales.ledger.copy(source)
  await clickDialog('复制销售订单', '确认复制')
  await settleSales()
  expect(sales.ledger.rows).toHaveLength(19)
  expect(sales.draft.header).toMatchObject({
    ...original,
    id: 'ORDER-19',
    orderNo: 'SO-2026-019',
    status: 0,
    progress: 0,
  })
  expect(sales.ledger.editor.visible.value).toBe(false)
  expect(sales.lines.rows.map(row => row.id)).toEqual([
    'ORDER-19-L01',
    'ORDER-19-L02',
    'ORDER-19-L03',
  ])
  expect(sales.lines.rows[0]).toMatchObject({ quantity: '0', amount: '1.005' })
  expect(sales.lines.rows[2].quantity).toBeNull()
  for (const [index, row] of sales.lines.rows.entries())
    expect(row).not.toBe(originalLines[index])
  sales.draft.header.note = '副本自己的修改'
  sales.lines.rows[0].amount = '2.005'
  await sales.draft.chooseOrder('ORDER-3')
  await sales.draft.discardAndSwitch()
  await settleSales()
  expect(sales.draft.header).toEqual(original)
  expect(sales.lines.rows[0].amount).toBe('1.005')

  await sales.ledger.actions[0].onClick?.()
  expect(sales.ledger.editor.visible.value).toBe(true)
  expect(sales.ledger.editor.model.value?.id).toBe('ORDER-20')
  expect(
    await sales.ledger.editor.submit({
      ...sales.ledger.editor.model.value!,
      customer: original.customer,
      contractNo: original.contractNo,
      section: original.section,
    })
  ).toBe(true)
  await settleSales()
  expect(sales.lines.rows).toEqual([])
})

test('销售复制在打开前及确认期间检查未保存草稿，不清空原输入或占用编号', async () => {
  vi.useFakeTimers()
  const { controller: sales, dialogs } = mountController(useBusinessWorkbench)
  await settleSales()
  const source = sales.ledger.rows[0]
  sales.draft.header.note = '先保留我的输入'
  await sales.ledger.copy(source)
  expect(dialogs.value).toHaveLength(0)
  expect(sales.draft.notice).toContain('请先保存或恢复当前订单')
  expect(sales.draft.header.note).toBe('先保留我的输入')
  expect(sales.ledger.rows).toHaveLength(18)

  sales.draft.restore()
  await settleSales()
  await sales.ledger.copy(source)
  await flushPromises()
  expect(dialogs.value).toHaveLength(1)
  sales.draft.header.note = '确认期间又填写的内容'
  await clickDialog('复制销售订单', '确认复制')
  expect(sales.ledger.rows).toHaveLength(18)
  expect(sales.draft.header.note).toBe('确认期间又填写的内容')
  expect(sales.draft.notice).toContain('请先保存或恢复当前订单')
  sales.draft.restore()
  await settleSales()
  await sales.ledger.actions[0].onClick?.()
  expect(sales.ledger.editor.model.value?.id).toBe('ORDER-19')
})

test('销售复制确认只消费一次，源记录删除或页面卸载后回调不写入', async () => {
  vi.useFakeTimers()
  const {
    controller: sales,
    wrapper,
    dialogs,
  } = mountController(useBusinessWorkbench)
  await settleSales()
  const source = sales.ledger.rows[0]
  await sales.ledger.copy(source)
  await clickDialog('复制销售订单', '确认复制', 2)
  await settleSales()
  await vi.waitFor(() => expect(dialogs.value).toHaveLength(0))
  expect(sales.ledger.rows).toHaveLength(19)
  expect(sales.ledger.editor.visible.value).toBe(false)

  await sales.ledger.copy(source)
  await flushPromises()
  const removedConfirm = dialogs.value.at(-1)!.onPositiveClick!
  sales.ledger.remove(source)
  await clickDialog('删除草稿订单', '确认删除')
  expect(sales.ledger.rows).toHaveLength(18)
  await removedConfirm(new MouseEvent('click'))
  expect(sales.ledger.rows).toHaveLength(18)

  await sales.ledger.copy(sales.ledger.rows[0])
  await flushPromises()
  const lateConfirm = dialogs.value.at(-1)!.onPositiveClick!
  wrapper.unmount()
  await lateConfirm(new MouseEvent('click'))
  expect(sales.ledger.rows).toHaveLength(18)
})
