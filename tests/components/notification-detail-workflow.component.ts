/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\components\notification-detail-workflow.component.ts
 * @Description: 审批详情的真实交互、普通待办隔离、失败恢复和跨身份竞态回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { beforeEach, expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, reactive } from 'vue'
import type { DialogOptions } from 'naive-ui'
import type {
  NotificationRecord,
  NotificationWorkflowAction,
  NotificationWorkflowCommand,
  NotificationWorkflowRelationship,
  NotificationWorkflowStatus,
} from '@/api/notifications.contract'
import { useMessageDetail } from '@/views/account/messages/components/c_messageDetail/useMessageDetail'
import MessageDetail from '@/views/account/messages/components/c_messageDetail/index.vue'
import { deferred } from './d_deferred'

const state = vi.hoisted(() => ({
  store: {} as Record<string, unknown>,
  success: vi.fn(),
  error: vi.fn(),
  destroy: vi.fn(),
  confirm: vi.fn(),
}))
vi.mock('@/stores/notification', () => ({
  s_notificationStore: () => state.store,
}))
vi.mock('@/api/notifications.attachments', () => ({
  downloadNotificationAttachment: vi.fn(),
}))
vi.mock('naive-ui', async importOriginal => ({
  ...(await importOriginal<typeof import('naive-ui')>()),
  useMessage: () => ({ success: state.success, error: state.error }),
  useDialog: () => ({ warning: state.confirm }),
}))

/** 生成不同参与关系的待审批记录，默认已读避免无关写入。 */
const record = (
  id = 'workflow-a',
  relationship: NotificationWorkflowRelationship = 'assignee',
  status: NotificationWorkflowStatus = 'pending'
): NotificationRecord => ({
  id,
  title: '采购申请审批',
  summary: '设备采购',
  content: '申请采购开发设备。',
  contentType: 'text',
  kind: 'task',
  category: 'business',
  topic: 'workflow',
  source: '采购流程',
  priority: 'high',
  createdAt: '2026-10-18T00:00:00Z',
  updatedAt: '2026-10-18T00:00:00Z',
  readAt: '2026-10-18T00:01:00Z',
  archivedAt: null,
  starred: false,
  taskStatus: status === 'pending' ? 'pending' : 'done',
  revision: 3,
  workflow: {
    instanceId: `instance-${id}`,
    processName: '设备采购审批',
    businessNo: 'CG-2026-001',
    initiator: '陈雨',
    currentNode: '部门主管审批',
    relationship,
    status,
    dueAt: '2026-10-17T23:59:00Z',
    history: [
      {
        id: 'submit-1',
        action: 'submit',
        actor: '陈雨',
        at: '2026-10-18T00:00:00Z',
        node: '提交申请',
        comment: '新员工设备采购',
      },
    ],
  },
})
const outcomes: Record<NotificationWorkflowAction, NotificationWorkflowStatus> =
  {
    approve: 'approved',
    reject: 'rejected',
    return: 'returned',
    withdraw: 'withdrawn',
  }
let current: NotificationRecord
const makeStore = () =>
  reactive({
    scopeKey: 'alice:tenant:company',
    mode: 'demo',
    capabilities: { workflow: true },
    loadDetail: vi.fn(async (id: string) =>
      structuredClone({ ...current, id })
    ),
    mutate: vi.fn(async (action: string) => {
      if (action === 'read') current.readAt = '2026-10-18T01:00:00Z'
      if (action === 'start-task') current.taskStatus = 'in_progress'
      if (action === 'complete-task') current.taskStatus = 'done'
      if (action === 'cancel-task') current.taskStatus = 'cancelled'
      current.revision++
    }),
    workflowAction: vi.fn(
      async (command: Omit<NotificationWorkflowCommand, 'operationId'>) => {
        current.workflow!.status = outcomes[command.action]
        current.taskStatus = 'done'
        current.revision++
        current.workflow!.history.push({
          id: 'handled-1',
          action: command.action,
          actor: '当前用户',
          at: '2026-10-18T02:00:00Z',
          node: '部门主管审批',
          comment: command.comment,
        })
        return structuredClone(current)
      }
    ),
  })
let store: ReturnType<typeof makeStore>
beforeEach(() => {
  current = record()
  store = makeStore()
  state.store = store
  state.confirm.mockReset().mockReturnValue({ destroy: state.destroy })
  state.destroy.mockReset()
  state.success.mockReset()
  state.error.mockReset()
})

/** 通过真实 Vue 生命周期访问详情控制器，不绕开 watch 或提交锁。 */
const setup = () => {
  let view!: ReturnType<typeof useMessageDetail>
  const Harness = defineComponent({
    name: 'WorkflowDetailHarness',
    props: { id: { type: String, default: 'workflow-a' } },
    /** 挂载真实详情引擎。 */
    setup(props) {
      view = useMessageDetail(props)
      return () => h('div', view.detail.value?.content)
    },
  })
  const wrapper = mount(Harness)
  return { wrapper, view }
}

/** 执行最近弹出的实际确认回调。 */
const accept = async () => {
  const options = state.confirm.mock.calls.at(-1)?.[0] as DialogOptions
  return options.onPositiveClick?.(new MouseEvent('click'))
}

test('读取审批只标记已读，审批状态、时间线及普通完成命令保持独立', async () => {
  current.readAt = null
  const { view } = setup()
  await flushPromises()
  expect(store.mutate).toHaveBeenCalledExactlyOnceWith('read', ['workflow-a'])
  expect(view.detail.value?.workflow?.status).toBe('pending')
  expect(view.detail.value?.workflow?.history).toHaveLength(1)
  expect(store.workflowAction).not.toHaveBeenCalled()
  await view.change('complete-task')
  expect(store.mutate).toHaveBeenCalledTimes(1)
  expect(view.taskActions.value).toEqual([])
})

test.each([
  ['assignee', 'pending', ['approve', 'reject', 'return']],
  ['initiator', 'pending', ['withdraw']],
  ['cc', 'pending', []],
  ['assignee', 'approved', []],
  ['assignee', 'rejected', []],
  ['assignee', 'returned', []],
  ['initiator', 'withdrawn', []],
  ['assignee', 'cancelled', []],
] as const)(
  '参与关系 %s、流程状态 %s 只暴露合法操作',
  async (relation, status, expected) => {
    current = record('workflow-a', relation, status)
    const { view } = setup()
    await flushPromises()
    expect(view.workflowActions.value).toEqual(expected)
  }
)

test('缺审批能力或已归档时不允许办理', async () => {
  const { view } = setup()
  await flushPromises()
  store.capabilities.workflow = false
  view.confirmWorkflow('approve')
  expect(view.workflowActions.value).toEqual([])
  store.capabilities.workflow = true
  view.detail.value!.archivedAt = '2026-10-18T01:00:00Z'
  view.confirmWorkflow('approve')
  expect(state.confirm).not.toHaveBeenCalled()
})

test('驳回和退回意见必填；明确确认后携带版本和意见，成功重取详情', async () => {
  const { view } = setup()
  await flushPromises()
  view.confirmWorkflow('reject')
  expect(state.confirm).not.toHaveBeenCalled()
  expect(view.commandError.value).toContain('填写审批意见')
  view.workflowComment.value = '请补充预算明细'
  view.confirmWorkflow('return')
  expect(store.workflowAction).not.toHaveBeenCalled()
  await accept()
  expect(store.workflowAction).toHaveBeenCalledExactlyOnceWith({
    recordId: 'workflow-a',
    action: 'return',
    comment: '请补充预算明细',
    revision: 3,
  })
  expect(view.detail.value?.workflow?.status).toBe('returned')
  expect(view.detail.value?.workflow?.history.at(-1)?.comment).toBe(
    '请补充预算明细'
  )
  expect(view.workflowComment.value).toBe('')
  expect(store.loadDetail).toHaveBeenCalledTimes(2)
})

test('审批失败保留意见与正文，不伪造办结；再次确认可以恢复', async () => {
  store.workflowAction.mockRejectedValueOnce(new Error('当前离线'))
  const { view, wrapper } = setup()
  await flushPromises()
  view.workflowComment.value = '同意采购'
  view.confirmWorkflow('approve')
  await accept()
  expect(view.workflowComment.value).toBe('同意采购')
  expect(wrapper.text()).toContain('申请采购开发设备')
  expect(view.detail.value?.workflow?.status).toBe('pending')
  expect(view.commandError.value).toBe('当前离线')
  expect(view.busy.value).toBe(false)
  view.confirmWorkflow('approve')
  await accept()
  expect(view.detail.value?.workflow?.status).toBe('approved')
})

test('审批成功而重取失败保留已确认结果，重试只查询而不重复审批', async () => {
  const { view } = setup()
  await flushPromises()
  store.loadDetail.mockRejectedValueOnce(new Error('详情查询超时'))
  view.workflowComment.value = '预算已核实'
  view.confirmWorkflow('approve')
  await accept()
  expect(view.detail.value?.workflow?.status).toBe('approved')
  expect(view.commandError.value).toContain('操作已提交，详情同步失败')
  expect(view.syncRequired.value).toBe(true)
  expect(view.workflowComment.value).toBe('')
  await view.retryCommandSync()
  expect(view.syncRequired.value).toBe(false)
  expect(view.commandError.value).toBe('')
  expect(store.workflowAction).toHaveBeenCalledTimes(1)
})

test('待确认时切换消息会销毁旧对话框，旧确认不能提交新事项', async () => {
  const { view, wrapper } = setup()
  await flushPromises()
  view.confirmWorkflow('approve')
  const options = state.confirm.mock.calls[0]![0] as DialogOptions
  await wrapper.setProps({ id: 'workflow-b' })
  await flushPromises()
  await options.onPositiveClick?.(new MouseEvent('click'))
  expect(state.destroy).toHaveBeenCalled()
  expect(store.workflowAction).not.toHaveBeenCalled()
  expect(view.detail.value?.id).toBe('workflow-b')
})

test('进行中的审批阻止二次提交，身份切换后的迟到响应不污染新详情', async () => {
  const pending = deferred<NotificationRecord>()
  store.workflowAction.mockReturnValueOnce(pending.promise)
  const { view } = setup()
  await flushPromises()
  view.confirmWorkflow('approve')
  const first = accept()
  view.confirmWorkflow('approve')
  await accept()
  expect(store.workflowAction).toHaveBeenCalledTimes(1)
  expect(view.busy.value).toBe(true)
  store.scopeKey = 'bob:tenant:company'
  current = { ...record(), content: '新身份的正文' }
  await flushPromises()
  pending.resolve({ ...record(), content: '旧身份迟到的正文' })
  await first
  expect(view.detail.value?.content).toBe('新身份的正文')
  expect(view.busy.value).toBe(false)
  expect(state.success).not.toHaveBeenCalled()
})

test('旧消息审批结束不能解除新消息正在提交的锁', async () => {
  const first = deferred<NotificationRecord>()
  const second = deferred<NotificationRecord>()
  store.workflowAction
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise)
  const { view, wrapper } = setup()
  await flushPromises()
  view.confirmWorkflow('approve')
  const firstRun = accept()
  await wrapper.setProps({ id: 'workflow-b' })
  await flushPromises()
  view.confirmWorkflow('approve')
  const secondRun = accept()
  first.resolve(record('workflow-a', 'assignee', 'approved'))
  await firstRun
  expect(view.detail.value?.id).toBe('workflow-b')
  expect(view.busy.value).toBe(true)
  expect(state.success).not.toHaveBeenCalled()
  current = record('workflow-b', 'assignee', 'approved')
  second.resolve(structuredClone(current))
  await secondRun
  expect(view.busy.value).toBe(false)
  expect(state.success).toHaveBeenCalledTimes(1)
})

test('发起人可以明确撤回自己的待审申请，抄送方不能提交撤回', async () => {
  current = record('workflow-a', 'initiator')
  const { view } = setup()
  await flushPromises()
  view.workflowComment.value = '申请信息需要调整'
  view.confirmWorkflow('withdraw')
  await accept()
  expect(view.detail.value?.workflow?.status).toBe('withdrawn')
  expect(store.workflowAction).toHaveBeenCalledExactlyOnceWith({
    recordId: 'workflow-a',
    action: 'withdraw',
    comment: '申请信息需要调整',
    revision: 3,
  })
})

test('普通待办支持开始、完成和取消，终态不再提交办理命令', async () => {
  current = { ...record(), topic: 'general', workflow: undefined }
  const { view } = setup()
  await flushPromises()
  expect(view.taskActions.value).toEqual([
    'start-task',
    'complete-task',
    'cancel-task',
  ])
  view.confirmTask('start-task')
  await accept()
  expect(view.detail.value?.taskStatus).toBe('in_progress')
  expect(view.taskActions.value).toEqual(['complete-task', 'cancel-task'])
  view.confirmComplete()
  await accept()
  expect(view.detail.value?.taskStatus).toBe('done')
  view.confirmTask('cancel-task')
  await view.change('cancel-task')
  expect(store.mutate).toHaveBeenCalledTimes(2)
  expect(store.workflowAction).not.toHaveBeenCalled()
})

test('普通待办取消需要确认，取消后保留正文并停止办理', async () => {
  current = { ...record(), topic: 'general', workflow: undefined }
  const { view } = setup()
  await flushPromises()
  view.confirmTask('cancel-task')
  expect(store.mutate).not.toHaveBeenCalled()
  await accept()
  expect(store.mutate).toHaveBeenCalledExactlyOnceWith('cancel-task', [
    'workflow-a',
  ])
  expect(view.detail.value?.taskStatus).toBe('cancelled')
  expect(view.detail.value?.content).toBe('申请采购开发设备。')
  expect(view.taskActions.value).toEqual([])
})

test('真实详情SFC显示独立阅读标签、业务单号和时间线，审批意见输入可实际提交', async () => {
  const Drawer = defineComponent({
    name: 'DetailDrawerStub',
    /** 仅替换传送门与动画，保留实际内容、输入及按钮组件。 */
    setup(_, { slots }) {
      return () => h('aside', slots.default?.())
    },
  })
  const wrapper = mount(MessageDetail, {
    props: { id: 'workflow-a' },
    global: { stubs: { Drawer, DrawerContent: Drawer } },
  })
  await flushPromises()
  expect(wrapper.text()).toContain('已读')
  expect(wrapper.text()).toContain('审批中')
  expect(wrapper.text()).toContain('CG-2026-001')
  expect(wrapper.text()).toContain('新员工设备采购')
  expect(wrapper.text()).toContain('本地审批演示')
  expect(wrapper.text()).toContain('已逾期')
  expect(wrapper.get('textarea').attributes('aria-label')).toBe('审批意见')
  expect(wrapper.get('textarea').attributes('id')).toBe('workflow-comment')
  await wrapper.get('textarea').setValue('预算符合要求')
  const approve = wrapper
    .findAll('button')
    .find(button => button.text() === '同意')!
  await approve.trigger('click')
  await accept()
  await flushPromises()
  expect(wrapper.text()).toContain('已通过')
  expect(wrapper.text()).toContain('预算符合要求')
  expect(wrapper.find('textarea').exists()).toBe(false)
  expect(store.workflowAction).toHaveBeenCalledExactlyOnceWith({
    recordId: 'workflow-a',
    action: 'approve',
    comment: '预算符合要求',
    revision: 3,
  })
})
