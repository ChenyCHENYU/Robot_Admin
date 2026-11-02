/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\tests\components\dictionary-labels.component.ts
 * @Description: 真实插件验证表单详情同源、局部覆盖、认证暂停与应用上下文隔离
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import {
  defineComponent,
  h,
  ref,
  reactive,
  provide,
  type Component,
  type Plugin,
} from 'vue'
import { NMessageProvider, NDialogProvider } from 'naive-ui'
import {
  C_Form,
  type FormOption,
} from '@robot-admin/naive-ui-components/C_Form'
import { createDictionaryProvider } from '@robot-admin/dictionary'
import {
  createDictionaryPlugin,
  DICTIONARY_PROVIDER_KEY,
  useDictionaries,
} from '@robot-admin/dictionary/vue'
import { useDictLabels } from '@/composables/useDictLabels'
import { getDictionaryOptionsApi } from '@/api/dictionary-options'
import dictionaryConfig from '@/config/dictionary'
import { setupDictionaries } from '@/plugins/dictionary'

interface SessionUser {
  token: string
  userInfo: { id: string }
  activeContext: { tenantId: string; companyId: string }
}
interface SessionLanguage {
  currentLang: string
}
const session = vi.hoisted(() => ({
  user: undefined as SessionUser | undefined,
  language: undefined as SessionLanguage | undefined,
}))
vi.mock('@/stores/user', () => ({ s_userStore: () => session.user }))
vi.mock('@/stores/language', () => ({
  s_languageStore: () => session.language,
}))
vi.mock('@/api/dictionary-options', () => ({
  getDictionaryOptionsApi: vi.fn(async (name: string) => [
    { value: '0', label: `${name} 接口标签` },
  ]),
}))

interface RecordModel {
  status: number
  account: string
}
const fields: FormOption<RecordModel>[] = [
  {
    prop: 'status',
    label: '订单状态',
    type: 'select',
    dictionary: 'order-status',
  },
  {
    prop: 'account',
    label: '账户状态',
    type: 'select',
    dictionary: 'user_status',
  },
]

/** 插件按真实应用安装；测试无需手工导入组件库 key 或提供私有实例。 */
function mountWithDictionary(root: Component, plugin: Plugin) {
  const Harness = defineComponent({
    name: 'DictionaryFeedbackHarness',
    /** 保留表单真实的消息与确认上下文。 */
    setup: () => () =>
      h(NMessageProvider, null, () => h(NDialogProvider, null, () => h(root))),
  })
  return mount(Harness, { global: { plugins: [plugin] } })
}

test('应用只安装字典插件，未登记原码在表单与详情共享一次接口', async () => {
  const model = ref({ status: '0' })
  const options: FormOption<{ status: string }>[] = [
    {
      prop: 'status',
      label: '后台状态',
      type: 'select',
      dictionary: 'backend_only',
    },
  ]
  let dictionaries!: ReturnType<typeof useDictionaries>
  const Root = defineComponent({
    name: 'RemoteDictionaryHarness',
    /** 由独立 SDK 取应用 Store，表单和详情读取同一个插件来源。 */
    setup() {
      dictionaries = useDictionaries()
      const { labels } = useDictLabels(model, options)
      return () =>
        h('section', [
          h(C_Form<{ status: string }>, {
            modelValue: model.value,
            options,
            config: { showActions: false },
          }),
          h('p', { 'data-testid': 'remote-label' }, labels.value.status),
        ])
    },
  })
  const wrapper = mountWithDictionary(
    Root,
    createDictionaryPlugin({
      ...dictionaryConfig,
      scope: 'tenant-B',
    })
  )
  await flushPromises()
  expect(wrapper.get('[data-testid="remote-label"]').text()).toBe(
    'backend_only 接口标签'
  )
  expect(wrapper.get('.n-base-selection-label').text()).toBe(
    'backend_only 接口标签'
  )
  expect(getDictionaryOptionsApi).toHaveBeenCalledOnce()
  expect(getDictionaryOptionsApi).toHaveBeenCalledWith('backend_only', {
    scope: 'tenant-B',
    signal: expect.any(AbortSignal),
  })
  expect(model.value.status).toBe('0')
  const source = dictionaries.getDictionary('backend_only')!
  wrapper.unmount()
  await expect(source.load()).rejects.toThrow('销毁')
})

test.each([false, true])(
  '复用字段、页面覆盖和全局兜底与真实表单一致（同层提供器：%s）',
  async sameLevel => {
    const local = {
      getDictionary: (name: string) =>
        name === 'user_status'
          ? { getOptions: () => [{ value: '1', label: '本页启用' }] }
          : undefined,
    }
    const model = ref<RecordModel>({ status: 0, account: '1' })
    let provider!: ReturnType<typeof createDictionaryProvider>
    const Child = defineComponent({
      name: 'DictionaryLabelsHarness',
      /** 同层显式传来源，子组件自然继承祖先；Vue 不读取本层新 provide。 */
      setup() {
        if (sameLevel) provide(DICTIONARY_PROVIDER_KEY, provider)
        const { labels } = useDictLabels(
          model,
          fields,
          sameLevel ? { provider } : {}
        )
        return () =>
          h('section', [
            h(C_Form<RecordModel>, {
              modelValue: model.value,
              options: fields,
              config: { showActions: false },
            }),
            h(
              'p',
              { 'data-testid': 'translated' },
              `${labels.value.status} / ${labels.value.account}`
            ),
          ])
      },
    })
    const Page = defineComponent({
      name: 'DictionaryPageProviderHarness',
      /** 组合一次局部和应用来源，所有控件共用。 */
      setup() {
        provider = createDictionaryProvider(local, useDictionaries())
        if (!sameLevel) provide(DICTIONARY_PROVIDER_KEY, provider)
        return () => h(Child)
      },
    })
    const wrapper = mountWithDictionary(
      Page,
      createDictionaryPlugin(dictionaryConfig)
    )
    await flushPromises()
    expect(wrapper.get('[data-testid="translated"]').text()).toBe(
      '待下达 / 本页启用'
    )
    expect(
      wrapper.findAll('.n-base-selection-label').map(element => element.text())
    ).toEqual(['待下达', '本页启用'])
    expect(getDictionaryOptionsApi).not.toHaveBeenCalled()
    model.value = { status: 1, account: '1' }
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-testid="translated"]').text()).toBe(
      '执行中 / 本页启用'
    )
    expect(model.value).toEqual({ status: 1, account: '1' })
  }
)

test('真实应用插件暂停未认证消费，恢复后加载当前公司且不伪装成功空字典', async () => {
  const user = reactive<SessionUser>({
    token: '',
    userInfo: { id: 'user-A' },
    activeContext: { tenantId: 'tenant-A', companyId: 'company-A' },
  })
  const language = reactive<SessionLanguage>({ currentLang: 'zh-CN' })
  session.user = user
  session.language = language
  const model = ref({ account: '0' })
  const options: FormOption<{ account: string }>[] = [
    {
      prop: 'account',
      label: '账户状态',
      type: 'select',
      dictionary: 'user_status',
    },
  ]
  let dictionaries!: ReturnType<typeof useDictionaries>
  const Root = defineComponent({
    name: 'DictionaryAuthHarness',
    /** 与应用页面相同的表单和精简详情绑定。 */
    setup() {
      dictionaries = useDictionaries()
      const details = useDictLabels(model, options)
      return () =>
        h('section', [
          h(C_Form<{ account: string }>, {
            modelValue: model.value,
            options,
            config: { showActions: false },
          }),
          h(
            'p',
            { 'data-testid': 'account-label' },
            details.labels.value.account
          ),
          h(
            'p',
            { 'data-testid': 'account-error' },
            String(details.error.value ?? '')
          ),
        ])
    },
  })
  const wrapper = mountWithDictionary(Root, { install: setupDictionaries })
  await flushPromises()
  const source = dictionaries.getDictionary('user_status')!
  expect(getDictionaryOptionsApi).not.toHaveBeenCalled()
  expect(source.getState()).toMatchObject({
    status: 'idle',
    updatedAt: null,
    error: null,
  })
  expect(wrapper.get('[data-testid="account-error"]').text()).toBe('')
  user.token = 'authenticated'
  await flushPromises()
  expect(getDictionaryOptionsApi).toHaveBeenCalledOnce()
  expect(getDictionaryOptionsApi).toHaveBeenLastCalledWith('user_status', {
    signal: expect.any(AbortSignal),
    scope: JSON.stringify(['user-A', 'tenant-A', 'company-A', 'zh-CN', true]),
  })
  expect(wrapper.get('[data-testid="account-label"]').text()).toBe(
    'user_status 接口标签'
  )
  expect(wrapper.get('.n-base-selection-label').text()).toBe(
    'user_status 接口标签'
  )
  user.token = ''
  user.activeContext.companyId = 'company-B'
  await flushPromises()
  expect(getDictionaryOptionsApi).toHaveBeenCalledOnce()
  expect(source.getState()).toMatchObject({
    status: 'idle',
    updatedAt: null,
    error: null,
  })
  expect(wrapper.get('[data-testid="account-error"]').text()).toBe('')
  // 即使宿主全局引用换成另一个应用，已安装插件也继续使用先捕获的 Store。
  session.user = {
    token: 'another-app',
    userInfo: { id: 'other' },
    activeContext: { tenantId: 'other', companyId: 'other' },
  }
  session.language = { currentLang: 'en-US' }
  user.token = 'restored'
  await flushPromises()
  expect(getDictionaryOptionsApi).toHaveBeenCalledTimes(2)
  expect(getDictionaryOptionsApi).toHaveBeenLastCalledWith('user_status', {
    signal: expect.any(AbortSignal),
    scope: JSON.stringify(['user-A', 'tenant-A', 'company-B', 'zh-CN', true]),
  })
  expect(model.value.account).toBe('0')
  wrapper.unmount()
  language.currentLang = 'zh-TW'
  user.activeContext.companyId = 'company-C'
  await flushPromises()
  expect(getDictionaryOptionsApi).toHaveBeenCalledTimes(2)
  await expect(source.load()).rejects.toThrow('销毁')
})
