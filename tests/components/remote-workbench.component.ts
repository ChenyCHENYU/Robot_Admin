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
import { useRemoteWorkbench } from '@/views/production-sales/remote-workbench/useRemoteWorkbench'

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
  expect(view.ledger.query.rows.value).toHaveLength(6)
  expect(view.details.query.rows.value.map(row => row.orderId)).toEqual([
    'RO-1',
    'RO-1',
    'RO-1',
    'RO-1',
  ])
  view.details.query.page.value = 3
  const lastPage = view.details.query.reload()
  await advance(320)
  await lastPage
  view.details.query.selectedKeys.value = [view.details.query.rows.value[0].id]
  view.ledger.choose(view.ledger.query.rows.value[1])
  expect(view.details.query.rows.value).toEqual([])
  expect(view.details.query.selectedKeys.value).toEqual([])
  await nextTick()
  expect(view.details.query.page.value).toBe(1)
  expect(view.ledger.query.page.value).toBe(1)
  await advance(320)
  expect(
    view.details.query.rows.value.every(row => row.orderId === 'RO-2')
  ).toBe(true)
})

test('旧后端忽略取消且更晚返回，不能覆盖新字段或行；空响应仍原子换字段', async () => {
  const { view } = setup()
  await advance(560)
  view.exercises.faults.slowNextDetail = true
  view.exercises.faults.ignoreCancellation = true
  view.details.variant = 'quality'
  await nextTick()
  view.ledger.choose(view.ledger.query.rows.value[1])
  view.details.variant = 'delivery'
  await nextTick()
  await advance(320)
  expect(view.details.acceptedVariant).toBe('delivery')
  expect(
    view.details.columns.some(
      column => 'field' in column && column.field === 'warehouse'
    )
  ).toBe(true)
  await advance(1500)
  expect(
    view.details.query.rows.value.every(row => row.orderId === 'RO-2')
  ).toBe(true)
  expect(view.details.acceptedVariant).toBe('delivery')
  expect(
    view.details.columns.some(
      column => 'field' in column && column.field === 'inspectionNo'
    )
  ).toBe(false)
  view.exercises.faults.emptyNextDetail = true
  view.details.variant = 'quality'
  await nextTick()
  await advance(320)
  expect(view.details.query.rows.value).toEqual([])
  expect(view.details.acceptedVariant).toBe('quality')
  expect(
    view.details.columns.some(
      column => 'field' in column && column.field === 'inspectionNo'
    )
  ).toBe(true)
})

test('字典晚到自动翻译原码，不重发业务查询；失败只产生局部状态且可恢复', async () => {
  const { view } = setup()
  await advance(560)
  expect(view.dictionary.status.label(0)).toBe('0')
  expect(view.dictionary.urgent.label(false)).toBe('false')
  expect(view.details.query.rows.value[0].quantity).toBe(0)
  expect(view.details.query.rows.value[0].urgent).toBe(false)
  view.inspection.open(view.ledger.query.rows.value[0])
  await advance(540)
  expect(view.dictionary.status.label(0)).toBe('待下达')
  expect(view.dictionary.urgent.label(false)).toBe('普通交付')
  expect(view.inspection.labels.status).toBe('待下达')
  expect(view.exercises.api.stats.orders).toBe(1)
  expect(view.exercises.api.stats.details).toBe(1)
  view.exercises.run('dictionary')
  await advance(1100)
  expect(view.dictionary.status.error.value).toBeTruthy()
  expect(view.details.query.error.value).toBeNull()
  view.dictionary.retry()
  await advance(1100)
  expect(view.dictionary.status.error.value).toBeNull()
  expect(view.dictionary.status.label(0)).toBe('待下达')
  expect(view.exercises.api.stats.orders).toBe(1)
  expect(view.exercises.api.stats.details).toBe(1)
})

test('坏 schema 不提交新行；主从失败独立，可重试并保留有效快照与草稿', async () => {
  const { view } = setup()
  await advance(560)
  const rows = view.details.query.rows.value
  const { columns } = view.details
  const { getOrderLinesApi } = view.exercises.api
  const badResponse = vi
    .spyOn(view.exercises.api, 'getOrderLinesApi')
    .mockImplementationOnce(async params => {
      const result = await getOrderLinesApi(params)
      result.data.fields[0].title = ''
      return result
    })
  const failed = view.details.query.reload()
  await advance(320)
  await failed
  expect(view.details.query.error.value).toBeTruthy()
  expect(view.details.query.rows.value).toBe(rows)
  expect(view.details.columns).toBe(columns)
  badResponse.mockRestore()
  view.editor.draft.note = '保留这份草稿'
  view.exercises.run('orders')
  await advance(240)
  expect(view.ledger.query.error.value).toBeTruthy()
  expect(view.details.query.rows.value).toBe(rows)
  const retry = view.details.query.retry()
  await advance(320)
  await retry
  expect(view.details.query.error.value).toBeNull()
  expect(view.ledger.query.error.value).toBeTruthy()
  expect(view.editor.draft.note).toBe('保留这份草稿')
  const masterRetry = view.ledger.query.retry()
  await advance(240)
  await masterRetry
  expect(view.ledger.query.error.value).toBeNull()
  expect(view.editor.dirty).toBe(true)
  expect(view.editor.draft.note).toBe('保留这份草稿')
})

test('切单确认取消保留草稿，确认放弃才换单；详情查看不改变当前订单', async () => {
  const { view, dialogs } = setup()
  await advance(560)
  const second = view.ledger.query.rows.value[1]
  view.editor.draft.note = '尚未保存'
  view.inspection.open(second)
  expect(view.editor.order?.id).toBe('RO-1')
  expect(view.inspection.record?.id).toBe('RO-2')
  view.ledger.choose(second)
  await flushPromises()
  expect(view.editor.order?.id).toBe('RO-1')
  expect(dialogs.value).toHaveLength(1)
  dialogs.value[0].onAfterLeave?.()
  dialogs.value[0].destroy()
  expect(view.editor.draft.note).toBe('尚未保存')
  view.ledger.choose(second)
  await flushPromises()
  dialogs.value.at(-1)!.onPositiveClick?.(new MouseEvent('click'))
  await nextTick()
  await advance(320)
  expect(view.editor.order?.id).toBe('RO-2')
  expect(view.editor.dirty).toBe(false)
  expect(view.editor.draft.note).toBe('')
})

test('本地保存保持原始 false，刷新同单不会重发明细；过滤空结果明确保留协同', async () => {
  const { view } = setup()
  await advance(560)
  view.editor.draft.owner = '新的业务人员'
  view.editor.draft.urgent = false
  const saving = view.editor.save()
  await advance(220)
  await saving
  expect(view.editor.dirty).toBe(false)
  expect(view.editor.order?.owner).toBe('新的业务人员')
  expect(view.editor.order?.urgent).toBe(false)
  expect(view.exercises.api.stats.details).toBe(1)
  await view.search.config.onSearch?.({
    keyword: '不存在的订单',
    status: null,
    urgent: null,
  })
  await advance(240)
  expect(view.ledger.query.rows.value).toEqual([])
  expect(view.ledger.currentOutsidePage).toBe(true)
  expect(view.editor.order?.id).toBe('RO-1')
  expect(view.details.query.rows.value).toHaveLength(4)
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
  view.editor.draft.owner = '校验后的业务人员'
  const saving = view.editor.save()
  expect(view.editor.busy).toBe(true)
  view.ledger.choose(view.ledger.query.rows.value[1])
  expect(view.editor.order?.id).toBe('RO-1')
  approve()
  await advance(220)
  await saving
  expect(view.editor.order?.owner).toBe('校验后的业务人员')
  expect(view.ledger.query.rows.value[1].owner).toBe('林珊')
  expect(view.editor.busy).toBe(false)
})

test('校验期间变更草稿时不会提交未经校验的最新版，输入可再次保存', async () => {
  const { view } = setup()
  await advance(560)
  const saveApi = vi.spyOn(view.exercises.api, 'saveOrderDraftApi')
  let approve!: () => void
  view.form.value = {
    validate: () =>
      new Promise<void>(resolve => {
        approve = resolve
      }),
  } as NonNullable<typeof view.form.value>
  view.editor.draft.note = '提交前快照'
  const saving = view.editor.save()
  view.editor.draft.note = '校验时的新输入'
  approve()
  await saving
  expect(saveApi).not.toHaveBeenCalled()
  expect(view.editor.dirty).toBe(true)
  expect(view.editor.draft.note).toBe('校验时的新输入')
  expect(view.editor.busy).toBe(false)
})

test('删除仅待下达本地订单，取消无变化，有草稿禁删；确认后重载并选择有效首项', async () => {
  const { view, dialogs } = setup()
  await advance(560)
  const first = view.ledger.query.rows.value[0]
  view.editor.draft.note = '不要丢失'
  view.ledger.remove(first)
  expect(dialogs.value).toHaveLength(0)
  view.editor.restore()
  view.ledger.remove(first)
  await flushPromises()
  expect(view.ledger.query.total.value).toBe(13)
  dialogs.value[0].onAfterLeave?.()
  dialogs.value[0].destroy()
  expect(view.ledger.query.rows.value[0].id).toBe('RO-1')
  view.ledger.remove(first)
  await flushPromises()
  const deleting = dialogs.value
    .at(-1)!
    .onPositiveClick?.(new MouseEvent('click'))
  await advance(220)
  expect(view.editor.order).toBeNull()
  await advance(560)
  await deleting
  expect(view.ledger.query.total.value).toBe(12)
  expect(view.ledger.query.rows.value.some(row => row.id === 'RO-1')).toBe(
    false
  )
  expect(view.editor.order?.id).toBe('RO-2')
  expect(
    view.details.query.rows.value.every(row => row.orderId === 'RO-2')
  ).toBe(true)
})

test('仅卸载页面子组件时关闭本页确认，保留全局 Provider 和其他来源确认框', async () => {
  const { view, dialogs, wrapper, dialogService, unmountChild } = setup()
  await advance(560)
  view.editor.draft.note = '尚未保存'
  view.ledger.choose(view.ledger.query.rows.value[1])
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
  expect(view.editor.order?.id).toBe('RO-1')
  foreign.destroy()
})
