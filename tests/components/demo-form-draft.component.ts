/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\tests\components\demo-form-draft.component.ts
 * @Description: 标签与步骤布局使用真实操作栏保存和恢复独立草稿
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { NMessageProvider } from 'naive-ui'
import { C_Form, type FormModel } from '@robot-admin/naive-ui-components/C_Form'
import { C_ActionBar } from '@robot-admin/naive-ui-components/C_ActionBar'
import TabsLayout from '@/views/demo/07-form/components/TabsLayout/index.vue'
import StepsLayout from '@/views/demo/07-form/components/StepsLayout/index.vue'

vi.mock('@iconify/vue', () => ({
  Icon: { render: () => null },
  getIcon: () => ({ body: '', width: 16, height: 16 }),
  loadIcons: () => () => {},
}))

test('标签与步骤能保存并多次恢复各自的快照，零值和 false 保持原样', async () => {
  const tabs = ref<FormModel>({ realName: '标签草稿', subscribe: false })
  const steps = ref<FormModel>({ username: '步骤草稿', skillLevel: 0 })
  const wrapper = mount(
    defineComponent({
      /** 保持两个布局同时挂载，验证实例之间没有共享草稿。 */
      setup: () => () =>
        h(NMessageProvider, null, () => [
          h(TabsLayout, {
            modelValue: tabs.value,
            'onUpdate:modelValue': (model: FormModel) => {
              tabs.value = model
            },
          }),
          h(StepsLayout, {
            modelValue: steps.value,
            'onUpdate:modelValue': (model: FormModel) => {
              steps.value = model
            },
          }),
        ]),
    }),
    { global: { components: { C_Form, C_ActionBar } } }
  )
  const button = (
    layout: typeof TabsLayout | typeof StepsLayout,
    label: string
  ) =>
    wrapper
      .getComponent(layout)
      .findAll('button')
      .find(item => item.text() === label)!
  try {
    await flushPromises()
    await button(TabsLayout, '保存草稿').trigger('click')
    await button(StepsLayout, '保存草稿').trigger('click')
    tabs.value.realName = '新的标签输入'
    steps.value.username = '新的步骤输入'
    tabs.value.subscribe = true
    steps.value.skillLevel = 10
    await nextTick()

    await button(TabsLayout, '加载草稿').trigger('click')
    expect(tabs.value.realName).toBe('标签草稿')
    expect(tabs.value.subscribe).toBe(false)
    expect(steps.value.username).toBe('新的步骤输入')
    tabs.value.realName = '再次编辑'
    await button(TabsLayout, '加载草稿').trigger('click')
    expect(tabs.value.realName).toBe('标签草稿')

    await button(StepsLayout, '加载草稿').trigger('click')
    expect(steps.value.username).toBe('步骤草稿')
    expect(steps.value.skillLevel).toBe(0)
  } finally {
    wrapper.unmount()
  }
})
