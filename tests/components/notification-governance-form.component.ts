/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 消息治理真实表单输入、默认模型、模板回填与保存契约回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { beforeEach, expect, test, vi } from 'vitest'
import { DOMWrapper, mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, reactive } from 'vue'
import { NDialogProvider, NMessageProvider, NSelect } from 'naive-ui'
import { C_Form } from '@robot-admin/naive-ui-components/C_Form'
import { C_Table } from '@robot-admin/naive-ui-components/C_Table'
import type {
  NotificationDispatchDraft,
  NotificationTemplateDraft,
} from '@/api/notifications.contract'
import Governance from '@/views/account/messages/components/c_messageGovernance/index.vue'

const state = vi.hoisted(() => ({ store: {} as Record<string, unknown> }))
vi.mock('@/stores/notification', () => ({
  s_notificationStore: () => state.store,
}))

/** 提供接口契约一致的 Store，仅替换网络和持久化，不替换真实表单。 */
const makeStore = () =>
  reactive({
    mode: 'demo',
    scopeKey: 'mock:tenant:company',
    capabilities: { manage: true },
    governanceLoading: false,
    templates: [
      {
        id: 'template-a',
        revision: 4,
        name: '发布模板',
        title: '已有模板标题',
        content: '已有模板正文',
        category: 'system',
        priority: 'high',
        channels: ['inbox', 'email'],
        enabled: true,
        updatedAt: '2026-10-18T00:00:00Z',
      },
    ],
    dispatches: [],
    deliveries: [],
    audit: [],
    saveDispatch: vi.fn<(draft: NotificationDispatchDraft) => Promise<void>>(
      async () => undefined
    ),
    saveTemplate: vi.fn<(draft: NotificationTemplateDraft) => Promise<void>>(
      async () => undefined
    ),
  })
let store: ReturnType<typeof makeStore>
beforeEach(() => {
  store = makeStore()
  state.store = store
})

/** 挂载实际治理 SFC 与正式包表单、表格，保持 Modal 和 Provider 的真实接入。 */
const setup = (section: 'sending' | 'templates' = 'sending') =>
  mount(
    defineComponent({
      name: 'NotificationGovernanceFormHarness',
      /** 使用真实交互组件，不通过 setFields 或直调提交控制器绕过绑定。 */
      setup() {
        return () =>
          h(
            NMessageProvider,
            {},
            {
              default: () =>
                h(
                  NDialogProvider,
                  {},
                  { default: () => h(Governance, { section }) }
                ),
            }
          )
      },
    }),
    { attachTo: document.body, global: { components: { C_Form, C_Table } } }
  )

/** 从实际弹窗 DOM 定位用户编辑表单。 */
const getEditor = () =>
  new DOMWrapper(document.querySelector('.message-editor-modal') as HTMLElement)
/** 根据表单可见标签查找输入框，确保输入事件经过真实 C_Form。 */
const inputFor = (label: string) => fieldFor(label).get('input,textarea')
/** 定位实际表单项，供文本和键盘选择共享。 */
const fieldFor = (label: string) =>
  getEditor()
    .findAll('.n-form-item')
    .find(
      item =>
        item.find('.n-form-item-label').exists() &&
        item.find('.n-form-item-label').text().includes(label)
    )!
/** 以原生键盘完成选择，避免无布局环境的虚拟列表尺寸依赖。 */
const chooseNext = async (label: string): Promise<void> => {
  const select = fieldFor(label).get('.n-base-selection')
  await select.trigger('keydown', { key: 'ArrowDown' })
  await flushPromises()
  await select.trigger('keydown', { key: 'ArrowDown' })
  await select.trigger('keydown', { key: 'Enter' })
  await select.trigger('keydown', { key: 'Escape' })
  await flushPromises()
}
/** 点击真实按钮后等待组件的异步校验与提交链。 */
const click = async (
  container: DOMWrapper<Element> | ReturnType<typeof mount>,
  label: string
): Promise<void> => {
  await container
    .findAll('button')
    .find(button => button.text() === label)!
    .trigger('click')
  await flushPromises()
}

test('撰写消息的真实输入提交非空快照，并保留分类、优先级和站内通道默认值', async () => {
  const wrapper = setup()
  await click(wrapper, '撰写消息')
  expect(getEditor().text()).toContain('业务消息')
  expect(getEditor().text()).toContain('普通')
  expect(getEditor().text()).toContain('站内信')
  expect(inputFor('消息标题').attributes('maxlength')).toBe('120')
  expect(inputFor('消息正文').element.tagName).toBe('TEXTAREA')
  expect(inputFor('消息正文').attributes('maxlength')).toBe('6000')
  await click(getEditor(), '保存草稿')
  expect(store.saveDispatch).not.toHaveBeenCalled()
  await inputFor('消息标题').setValue('真实输入的公告')
  await inputFor('消息正文').setValue('通过实际输入事件提交的消息正文。')
  await click(getEditor(), '保存草稿')
  await vi.waitFor(() => expect(store.saveDispatch).toHaveBeenCalledOnce())
  expect(store.saveDispatch.mock.calls[0]![0]).toMatchObject({
    title: '真实输入的公告',
    content: '通过实际输入事件提交的消息正文。',
    category: 'business',
    priority: 'normal',
    channels: ['inbox'],
    audience: 'self',
    scheduledAt: null,
  })
})

test('编辑模板按真实 C_Form 回填既有字段，修改后携带正确实体版本保存', async () => {
  const wrapper = setup('templates')
  await click(wrapper, '编辑')
  expect((inputFor('模板名称').element as HTMLInputElement).value).toBe(
    '发布模板'
  )
  expect((inputFor('消息标题').element as HTMLInputElement).value).toBe(
    '已有模板标题'
  )
  expect((inputFor('消息正文').element as HTMLTextAreaElement).value).toBe(
    '已有模板正文'
  )
  expect(getEditor().text()).toContain('系统通知')
  expect(getEditor().text()).toContain('邮件')
  await inputFor('消息标题').setValue('更新后的模板标题')
  await inputFor('消息正文').setValue('更新后的模板正文。')
  await fieldFor('启用模板').get('[role="switch"]').trigger('click')
  await click(getEditor(), '保存模板')
  await vi.waitFor(() => expect(store.saveTemplate).toHaveBeenCalledOnce())
  expect(store.saveTemplate.mock.calls[0]![0]).toMatchObject({
    id: 'template-a',
    revision: 4,
    name: '发布模板',
    title: '更新后的模板标题',
    content: '更新后的模板正文。',
    category: 'system',
    priority: 'high',
    channels: ['inbox', 'email'],
    enabled: false,
  })
})

test('实际键盘选择分类、优先级与多通道后，提交使用用户选择而非初始默认值', async () => {
  const wrapper = setup()
  await click(wrapper, '撰写消息')
  await inputFor('消息标题').setValue('变更分类的公告')
  await inputFor('消息正文').setValue('用于验证实际下拉选择与多通道同步。')
  await chooseNext('消息分类')
  await chooseNext('优先级')
  await chooseNext('投递通道')
  await click(getEditor(), '保存草稿')
  await vi.waitFor(() => expect(store.saveDispatch).toHaveBeenCalledOnce())
  expect(store.saveDispatch.mock.calls[0]![0]).toMatchObject({
    category: 'alarm',
    priority: 'high',
    channels: ['inbox', 'email'],
  })
})

test('使用模板替换编辑模型后，表单显示和实际草稿提交保持同一数据源', async () => {
  const wrapper = setup()
  await click(wrapper, '撰写消息')
  const picker = wrapper
    .findAllComponents(NSelect)
    .find(select => select.element.closest('.template-picker'))!
  picker.vm.$emit('update:value', 'template-a')
  await flushPromises()
  await click(getEditor(), '使用模板')
  expect((inputFor('消息标题').element as HTMLInputElement).value).toBe(
    '已有模板标题'
  )
  expect((inputFor('消息正文').element as HTMLTextAreaElement).value).toBe(
    '已有模板正文'
  )
  await click(getEditor(), '保存草稿')
  await vi.waitFor(() => expect(store.saveDispatch).toHaveBeenCalledOnce())
  expect(store.saveDispatch.mock.calls[0]![0]).toMatchObject({
    templateId: 'template-a',
    title: '已有模板标题',
    content: '已有模板正文',
    category: 'system',
    priority: 'high',
    channels: ['inbox', 'email'],
  })
})
