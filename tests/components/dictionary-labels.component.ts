/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\tests\components\dictionary-labels.component.ts
 * @Description: 真实组件验证详情复用字段与页面/应用共享源，不建立独立字典缓存
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref, provide } from 'vue'
import { NMessageProvider, NDialogProvider } from 'naive-ui'
import {
  C_Form,
  type FormOption,
} from '@robot-admin/naive-ui-components/C_Form'
import { DICTIONARY_PROVIDER_KEY } from '@robot-admin/naive-ui-components/config'
import { createDictionaryProvider } from '@robot-admin/dictionary'
import { useDictLabels } from '@/composables/useDictLabels'
import { getDictionaryOptionsApi } from '@/api/dictionary-options'
import {
  APP_DICTIONARY_KEY,
  createAppDictionaries,
} from '@/utils/d_dictionaryContext'

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

test('未登记的后端原码在表单与详情共用一次接口，不需要新增配置文件', async () => {
  vi.mocked(getDictionaryOptionsApi).mockClear()
  const app = createAppDictionaries()
  app.setScope('tenant-B')
  const model = ref({ status: '0' })
  const options: FormOption<{ status: string }>[] = [
    {
      prop: 'status',
      label: '后台状态',
      type: 'select',
      dictionary: 'backend_only',
    },
  ]
  const Root = defineComponent({
    name: 'RemoteDictionaryHarness',
    /** 表单和详情直接使用原码，Provider 负责加载合并。 */
    setup() {
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
  const wrapper = mount(Root, {
    global: {
      provide: {
        [APP_DICTIONARY_KEY as symbol]: app,
        [DICTIONARY_PROVIDER_KEY as symbol]: app,
      },
    },
  })
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
  wrapper.unmount()
  app.destroy()
})

test.each([false, true])(
  '复用字段、页面覆盖和全局兜底与真实表单一致（同层提供器：%s）',
  async sameLevel => {
    const app = createAppDictionaries(() => false)
    const local = {
      getDictionary: (name: string) =>
        name === 'user_status'
          ? { getOptions: () => [{ value: '1', label: '本页启用' }] }
          : undefined,
    }
    const provider = createDictionaryProvider(local, app)
    const model = ref<RecordModel>({ status: 0, account: '1' })
    /** 同层显式复用 Provider，子组件继承最近 Provider。 */
    const createChild = (own: boolean) =>
      defineComponent({
        name: 'DictionaryLabelsHarness',
        /** 在真实 Vue 作用域内绑定复用字段。 */
        setup() {
          if (own) provide(DICTIONARY_PROVIDER_KEY, provider)
          const { labels } = useDictLabels(
            model,
            fields,
            own ? { provider } : {}
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
    const Child = createChild(sameLevel)
    const Root = sameLevel
      ? Child
      : defineComponent({
          name: 'DictionaryPageProviderHarness',
          /** 祖先提供器与同层提供器使用同一个组合实例。 */
          setup() {
            provide(DICTIONARY_PROVIDER_KEY, provider)
            return () => h(Child)
          },
        })
    const Harness = defineComponent({
      name: 'DictionaryFeedbackHarness',
      /** 保留表单使用的真实反馈上下文。 */
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () => h(Root))
        ),
    })
    const wrapper = mount(Harness, {
      global: { provide: { [APP_DICTIONARY_KEY as symbol]: app } },
    })
    await Promise.resolve()
    expect(wrapper.get('[data-testid="translated"]').text()).toBe(
      '待下达 / 本页启用'
    )
    expect(
      wrapper.findAll('.n-base-selection-label').map(element => element.text())
    ).toEqual(['待下达', '本页启用'])
    model.value = { status: 1, account: '1' }
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-testid="translated"]').text()).toBe(
      '执行中 / 本页启用'
    )
    expect(model.value).toEqual({ status: 1, account: '1' })
    wrapper.unmount()
    app.destroy()
  }
)
