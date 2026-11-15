/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-16
 * @Description: 表单演示响应式配置与搜索重置的正式组件消费回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NDataTable, NGrid, NMessageProvider, NSwitch } from 'naive-ui'
import { C_Form } from '@robot-admin/naive-ui-components/C_Form'
import { C_FormSearch } from '@robot-admin/naive-ui-components/C_FormSearch'
import { C_AutoComplete } from '@robot-admin/naive-ui-components/C_AutoComplete'
import { C_Table } from '@robot-admin/naive-ui-components/C_Table'
import GridLayout from '@/views/demo/07-form/layouts/GridLayout/index.vue'
import SearchDemo from '@/views/demo/09-form-search/index.vue'

vi.mock('@iconify/vue', () => ({
  Icon: { render: () => null },
  getIcon: () => ({ body: '', width: 16, height: 16 }),
  loadIcons: () => () => {},
}))

test('网格响应式开关更新正式表单配置且保留当前表单实例与草稿', async () => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(NMessageProvider, null, {
          default: () => h(GridLayout, { modelValue: { name: '未提交草稿' } }),
        }),
    }),
    { global: { components: { C_Form }, stubs: { Icon: true } } }
  )
  await flushPromises()
  const form = wrapper.getComponent(C_Form)
  const identity = form.vm.$.uid
  await vi.waitFor(() => expect(form.findComponent(NGrid).exists()).toBe(true))
  const grid = form.getComponent(NGrid)
  const input = form.get<HTMLInputElement>('input[placeholder="请输入姓名"]')
  expect(input.element.value).toBe('未提交草稿')
  expect(grid.props('responsive')).toBe('screen')
  const control = wrapper.getComponent(NSwitch)
  control.vm.$emit('update:value', false)
  await flushPromises()
  expect(grid.props('responsive')).toBe('self')
  expect(wrapper.getComponent(C_Form).vm.$.uid).toBe(identity)
  expect(form.get('input[placeholder="请输入姓名"]').element).toBe(
    input.element
  )
  expect(input.element.value).toBe('未提交草稿')
  control.vm.$emit('update:value', true)
  await flushPromises()
  expect(grid.props('responsive')).toBe('screen')
})

test('多选搜索重置经同一查询入口提交一次并恢复默认布尔条件', async () => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(NMessageProvider, null, { default: () => h(SearchDemo) }),
    }),
    {
      global: {
        components: { C_FormSearch, C_AutoComplete, C_Table },
        stubs: { c_vTitle: true },
      },
    }
  )
  await flushPromises()
  const section = wrapper.get('.selection-search-demo')
  const search = section.getComponent(C_FormSearch)
  search.vm.$emit('update:modelValue', { statuses: [1], enabled: true })
  await flushPromises()
  await search.get('form').trigger('submit')
  await flushPromises()
  expect(search.emitted('search')).toHaveLength(1)
  expect(
    JSON.parse(section.get('[data-testid="selection-submitted"]').text())
  ).toEqual({ statuses: [1], enabled: true })
  await search.get('button[aria-label="重置"]').trigger('click')
  await flushPromises()
  expect(search.emitted('reset')).toHaveLength(1)
  expect(search.emitted('search')).toHaveLength(2)
  expect(search.emitted('search')?.[1]).toEqual([
    { statuses: [], enabled: false },
  ])
  expect(
    JSON.parse(section.get('[data-testid="selection-submitted"]').text())
  ).toEqual({ statuses: [], enabled: false })
  expect(section.getComponent(NDataTable).props('data')).toHaveLength(2)
})
