/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @Description: 正式组件包在表单与搜索演示页中的密度联动及草稿保留回归。
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NButton, NDataTable, NForm, NInput, NMessageProvider } from 'naive-ui'
import { C_Density } from '@robot-admin/naive-ui-components/C_Density'
import { C_Form } from '@robot-admin/naive-ui-components/C_Form'
import { C_FormSearch } from '@robot-admin/naive-ui-components/C_FormSearch'
import { C_ActionBar } from '@robot-admin/naive-ui-components/C_ActionBar'
import { C_AutoComplete } from '@robot-admin/naive-ui-components/C_AutoComplete'
import { C_Table } from '@robot-admin/naive-ui-components/C_Table'
import FormDemo from '@/views/demo/07-form/index.vue'
import SearchDemo from '@/views/demo/09-form-search/index.vue'

// 图标资源不属于密度协议；隔离远端图标请求，表单、操作栏与候选输入仍使用正式组件。
vi.mock('@iconify/vue', () => ({
  Icon: { render: () => null },
  getIcon: () => ({ body: '', width: 16, height: 16 }),
  loadIcons: () => () => {},
}))

/** 挂载真实页面与正式组件，富文本示例由另一个独立页面负责验证。 */
const mountDemo = (page: typeof FormDemo | typeof SearchDemo) =>
  mount(
    defineComponent({
      setup: () => () => h(NMessageProvider, null, { default: () => h(page) }),
    }),
    {
      global: {
        components: {
          C_Density,
          C_Form,
          C_FormSearch,
          C_ActionBar,
          C_AutoComplete,
          C_Table,
        },
        stubs: { Demo07FormDefaultLayout: true, c_vTitle: true, Icon: true },
      },
    }
  )

test('表单页的局部密度上下文同步布局表单与操作栏，切换密度保留草稿', async () => {
  const wrapper = mountDemo(FormDemo)
  const inline = wrapper
    .findAll('.layout-btn')
    .find(button => button.text().includes('内联'))!
  await inline.trigger('click')
  await flushPromises()
  const form = wrapper.findComponent(C_Form)
  await vi.waitFor(() => expect(form.find('input').exists()).toBe(true))
  const nativeForm = form.findComponent(NForm)
  expect(nativeForm.props('size')).toBe('small')
  const input = form.get('input')
  await input.setValue('未提交的员工草稿')
  const original = form.element
  await wrapper
    .findAll('.n-radio-button')
    .find(button => button.text() === '舒适')!
    .get('input')
    .setValue(true)
  await flushPromises()
  expect(nativeForm.props('size')).toBe('large')
  expect(form.element).toBe(original)
  expect(form.get('input').element).toBe(input.element)
  expect((input.element as HTMLInputElement).value).toBe('未提交的员工草稿')
  await wrapper
    .findAll('.layout-btn')
    .find(button => button.text().includes('步骤'))!
    .trigger('click')
  await flushPromises()
  const actions = wrapper
    .get('.steps-demo .action-buttons')
    .findComponent(C_ActionBar)
  expect(actions.findAllComponents(NButton).length).toBeGreaterThan(0)
  expect(
    actions
      .findAllComponents(NButton)
      .every(button => button.props('size') === 'large')
  ).toBe(true)
  expect(wrapper.get('.form-demo').element.tagName).toBe('DIV')
})

test('搜索页切换密度同步搜索与结果表格，并保留已填写的查询条件', async () => {
  const wrapper = mountDemo(SearchDemo)
  await flushPromises()
  const search = wrapper.findAllComponents(C_FormSearch)[0]
  const table = wrapper.findAllComponents(C_Table)[0]
  const input = search.get('input')
  await input.setValue('张三')
  const initial = search.element
  await wrapper
    .findAll('.n-radio-button')
    .find(button => button.text() === '舒适')!
    .get('input')
    .setValue(true)
  await flushPromises()
  expect(search.findComponent(NInput).props('size')).toBe('large')
  expect(table.findComponent(NDataTable).props('size')).toBe('large')
  expect(search.element).toBe(initial)
  expect(search.get('input').element).toBe(input.element)
  expect((input.element as HTMLInputElement).value).toBe('张三')
})

test('姓名建议使用正式输入组件，本地过滤、自由输入和清空均直接驱动结果表格', async () => {
  const wrapper = mountDemo(SearchDemo)
  await flushPromises()
  const section = wrapper.get('.suggestion-search-demo')
  const suggestion = section.findComponent(C_AutoComplete)
  const table = section.findComponent(NDataTable)
  expect(table.props('data')).toHaveLength(3)
  const input = suggestion.get('input')
  await input.setValue('张')
  await input.trigger('focus')
  await flushPromises()
  expect(table.props('data')).toMatchObject([{ name: '张三' }])
  await input.trigger('keydown', { key: 'ArrowDown', code: 'ArrowDown' })
  await input.trigger('keydown', { key: 'Enter', code: 'Enter' })
  await flushPromises()
  expect((input.element as HTMLInputElement).value).toBe('张三')
  await input.setValue('尚未登记的姓名')
  await flushPromises()
  expect(table.props('data')).toEqual([])
  await input.setValue('')
  await flushPromises()
  expect(table.props('data')).toHaveLength(3)
})
