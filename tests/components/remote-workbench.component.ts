/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\tests\components\remote-workbench.component.ts
 * @Description: 真实 query hook 与独立字典组合的主从竞态、快照和草稿回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import {
  NDialogProvider,
  NMessageProvider,
  useDialogReactiveList,
  useDialog,
} from 'naive-ui'
import { useRemoteWorkbench } from '@/views/production-sales/remote-workbench/data'

const wrappers: Array<{ unmount(): void }> = []

/** 真实 Provider 下挂载业务组合，不 mock query 或字典生命周期。 */
function setup() {
  let view!: ReturnType<typeof useRemoteWorkbench>
  let dialogs!: ReturnType<typeof useDialogReactiveList>
  let dialogService!: ReturnType<typeof useDialog>
  const childVisible = ref(true)
  const Child = defineComponent({
    name: 'RemoteWorkbenchHarness',
    /** 控制器在真实 Vue 作用域中创建。 */
    setup() {
      view = useRemoteWorkbench()
      dialogs = useDialogReactiveList()
      dialogService = useDialog()
      return () => h('div')
    },
  })
  const wrapper = mount(
    defineComponent({
      /** 保留实际确认框协议及消息容器。 */
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () =>
            childVisible.value ? h(Child) : h('div')
          )
        ),
    }),
    { global: { stubs: { transition: false } } }
  )
  wrappers.push(wrapper)
  return {
    view,
    dialogs,
    wrapper,
    dialogService,
    unmountChild: () => {
      childVisible.value = false
    },
  }
}

/** 有界异步接口使用真实计时协议，测试仅推进时钟。 */
async function advance(ms: number) {
  await vi.advanceTimersByTimeAsync(ms)
  await flushPromises()
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  vi.useRealTimers()
})

test('主从各自分页；换单立即取消旧明细、清选择、回首页，不显示前一订单行', async () => {
  const { view } = setup()
  await advance(560)
  expect(view.orders.rows.value).toHaveLength(6)
  expect(view.details.rows.value.map(row => row.orderId)).toEqual([
    'RO-1',
    'RO-1',
    'RO-1',
    'RO-1',
  ])
  view.details.page.value = 3
  const lastPage = view.details.reload()
  await advance(320)
  await lastPage
  view.details.selectedKeys.value = [view.details.rows.value[0].id]
  view.chooseOrder(view.orders.rows.value[1])
  expect(view.details.rows.value).toEqual([])
  expect(view.details.selectedKeys.value).toEqual([])
  await nextTick()
  expect(view.details.page.value).toBe(1)
  expect(view.orders.page.value).toBe(1)
  await advance(320)
  expect(view.details.rows.value.every(row => row.orderId === 'RO-2')).toBe(
    true
  )
})

test('旧后端忽略取消且更晚返回，不能覆盖新字段或行；空响应仍原子换字段', async () => {
  const { view } = setup()
  await advance(560)
  view.faults.slowNextDetail = true
  view.faults.ignoreCancellation = true
  view.variant.value = 'quality'
  await nextTick()
  view.chooseOrder(view.orders.rows.value[1])
  view.variant.value = 'delivery'
  await nextTick()
  await advance(320)
  expect(view.acceptedVariant.value).toBe('delivery')
  expect(
    view.detailColumns.value.some(
      column => 'field' in column && column.field === 'warehouse'
    )
  ).toBe(true)
  await advance(1500)
  expect(view.details.rows.value.every(row => row.orderId === 'RO-2')).toBe(
    true
  )
  expect(view.acceptedVariant.value).toBe('delivery')
  expect(
    view.detailColumns.value.some(
      column => 'field' in column && column.field === 'inspectionNo'
    )
  ).toBe(false)
  view.faults.emptyNextDetail = true
  view.variant.value = 'quality'
  await nextTick()
  await advance(320)
  expect(view.details.rows.value).toEqual([])
  expect(view.acceptedVariant.value).toBe('quality')
  expect(
    view.detailColumns.value.some(
      column => 'field' in column && column.field === 'inspectionNo'
    )
  ).toBe(true)
})

test('字典晚到自动翻译原码，不重发业务查询；失败只产生局部状态且可恢复', async () => {
  const { view } = setup()
  await advance(560)
  expect(view.status.label(0)).toBe('0')
  expect(view.urgent.label(false)).toBe('false')
  expect(view.details.rows.value[0].quantity).toBe(0)
  expect(view.details.rows.value[0].urgent).toBe(false)
  view.openDetail(view.orders.rows.value[0])
  await advance(540)
  expect(view.status.label(0)).toBe('待下达')
  expect(view.urgent.label(false)).toBe('普通交付')
  expect(view.detailLabels.value.status).toBe('待下达')
  expect(view.api.stats.orders).toBe(1)
  expect(view.api.stats.details).toBe(1)
  view.exercise('dictionary')
  await advance(1100)
  expect(view.status.error.value).toBeTruthy()
  expect(view.details.error.value).toBeNull()
  view.retryDictionary()
  await advance(1100)
  expect(view.status.error.value).toBeNull()
  expect(view.status.label(0)).toBe('待下达')
  expect(view.api.stats.orders).toBe(1)
  expect(view.api.stats.details).toBe(1)
})

test('坏 schema 不提交新行；主从失败独立，可重试并保留有效快照与草稿', async () => {
  const { view } = setup()
  await advance(560)
  const rows = view.details.rows.value
  const columns = view.detailColumns.value
  const original = view.api.getOrderLinesApi
  const badResponse = vi
    .spyOn(view.api, 'getOrderLinesApi')
    .mockImplementationOnce(async params => {
      const result = await original(params)
      result.data.fields[0].title = ''
      return result
    })
  const failed = view.details.reload()
  await advance(320)
  await failed
  expect(view.details.error.value).toBeTruthy()
  expect(view.details.rows.value).toBe(rows)
  expect(view.detailColumns.value).toBe(columns)
  badResponse.mockRestore()
  view.draft.value.note = '保留这份草稿'
  view.exercise('orders')
  await advance(240)
  expect(view.orders.error.value).toBeTruthy()
  expect(view.details.rows.value).toBe(rows)
  const retry = view.details.retry()
  await advance(320)
  await retry
  expect(view.details.error.value).toBeNull()
  expect(view.orders.error.value).toBeTruthy()
  expect(view.draft.value.note).toBe('保留这份草稿')
  const masterRetry = view.orders.retry()
  await advance(240)
  await masterRetry
  expect(view.orders.error.value).toBeNull()
  expect(view.dirty.value).toBe(true)
  expect(view.draft.value.note).toBe('保留这份草稿')
})

test('切单确认取消保留草稿，确认放弃才换单；详情查看不改变当前订单', async () => {
  const { view, dialogs } = setup()
  await advance(560)
  const second = view.orders.rows.value[1]
  view.draft.value.note = '尚未保存'
  view.openDetail(second)
  expect(view.activeOrder.value?.id).toBe('RO-1')
  expect(view.detailRecord.value?.id).toBe('RO-2')
  view.chooseOrder(second)
  await flushPromises()
  expect(view.activeOrder.value?.id).toBe('RO-1')
  expect(dialogs.value).toHaveLength(1)
  dialogs.value[0].onAfterLeave?.()
  dialogs.value[0].destroy()
  expect(view.draft.value.note).toBe('尚未保存')
  view.chooseOrder(second)
  await flushPromises()
  dialogs.value.at(-1)!.onPositiveClick?.(new MouseEvent('click'))
  await nextTick()
  await advance(320)
  expect(view.activeOrder.value?.id).toBe('RO-2')
  expect(view.dirty.value).toBe(false)
  expect(view.draft.value.note).toBe('')
})

test('本地保存保持原始 false，刷新同单不会重发明细；过滤空结果明确保留协同', async () => {
  const { view } = setup()
  await advance(560)
  view.draft.value.owner = '新的业务人员'
  view.draft.value.urgent = false
  const saving = view.saveDraft()
  await advance(220)
  await saving
  expect(view.dirty.value).toBe(false)
  expect(view.activeOrder.value?.owner).toBe('新的业务人员')
  expect(view.activeOrder.value?.urgent).toBe(false)
  expect(view.api.stats.details).toBe(1)
  await view.searchConfig.onSearch?.({
    keyword: '不存在的订单',
    status: null,
    urgent: null,
  })
  await advance(240)
  expect(view.orders.rows.value).toEqual([])
  expect(view.currentOutsidePage.value).toBe(true)
  expect(view.activeOrder.value?.id).toBe('RO-1')
  expect(view.details.rows.value).toHaveLength(4)
})

test('保存从异步校验起锁住上下文，不让切单穿过校验写错订单', async () => {
  const { view } = setup()
  await advance(560)
  let approve!: () => void
  view.form.value = {
    validate: () =>
      new Promise<void>(resolve => {
        approve = resolve
      }),
  } as NonNullable<typeof view.form.value>
  view.draft.value.owner = '校验后的业务人员'
  const saving = view.saveDraft()
  expect(view.busy.value).toBe(true)
  view.chooseOrder(view.orders.rows.value[1])
  expect(view.activeOrder.value?.id).toBe('RO-1')
  approve()
  await advance(220)
  await saving
  expect(view.activeOrder.value?.owner).toBe('校验后的业务人员')
  expect(view.orders.rows.value[1].owner).toBe('林珊')
  expect(view.busy.value).toBe(false)
})

test('删除仅待下达本地订单，取消无变化，有草稿禁删；确认后重载并选择有效首项', async () => {
  const { view, dialogs } = setup()
  await advance(560)
  const first = view.orders.rows.value[0]
  view.draft.value.note = '不要丢失'
  view.removeOrder(first)
  expect(dialogs.value).toHaveLength(0)
  view.restoreDraft()
  view.removeOrder(first)
  await flushPromises()
  expect(view.orders.total.value).toBe(13)
  dialogs.value[0].onAfterLeave?.()
  dialogs.value[0].destroy()
  expect(view.orders.rows.value[0].id).toBe('RO-1')
  view.removeOrder(first)
  await flushPromises()
  const deleting = dialogs.value
    .at(-1)!
    .onPositiveClick?.(new MouseEvent('click'))
  await advance(220)
  expect(view.activeOrder.value).toBeNull()
  await advance(560)
  await deleting
  expect(view.orders.total.value).toBe(12)
  expect(view.orders.rows.value.some(row => row.id === 'RO-1')).toBe(false)
  expect(view.activeOrder.value?.id).toBe('RO-2')
  expect(view.details.rows.value.every(row => row.orderId === 'RO-2')).toBe(
    true
  )
})

test('仅卸载页面子组件时关闭本页确认，保留全局 Provider 和其他来源确认框', async () => {
  const { view, dialogs, wrapper, dialogService, unmountChild } = setup()
  await advance(560)
  view.draft.value.note = '尚未保存'
  view.chooseOrder(view.orders.rows.value[1])
  const foreign = dialogService.info({
    title: '其他业务确认',
    content: '由其他业务持有',
  })
  await flushPromises()
  expect(dialogs.value).toHaveLength(2)
  unmountChild()
  await advance(400)
  expect(wrapper.findComponent(NDialogProvider).exists()).toBe(true)
  expect(dialogs.value.map(item => item.title)).toEqual(['其他业务确认'])
  expect(view.activeOrder.value?.id).toBe('RO-1')
  foreign.destroy()
})
