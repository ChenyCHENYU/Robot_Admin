/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @Description: 组织工作台消费正式人员选择器的筛选、确认及取消回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { C_UserPicker } from '@robot-admin/naive-ui-components/C_UserPicker'
import OrgWorkspace from '@/views/demo/56-orgchart/index.vue'
import { useOrgWorkspace } from '@/views/demo/56-orgchart/useOrgWorkspace'

/** 挂载真实页面控制器，在组件公开来源协议上验证组织与分页组合。 */
const mountDirectory = () => {
  let workspace!: ReturnType<typeof useOrgWorkspace>
  const wrapper = mount(
    defineComponent({
      name: 'OrgDirectoryHarness',
      /** 组织索引只在当前页面作用域创建。 */
      setup() {
        workspace = useOrgWorkspace()
        return () => h('div')
      },
    })
  )
  return { workspace, wrapper }
}

/** 使用候选表格的公开选择方法；happy-dom 不计算虚拟列表视口几何。 */
async function choosePerson(
  wrapper: ReturnType<typeof mount>,
  key: string,
  deselect = false
): Promise<void> {
  await vi.waitFor(() =>
    expect(wrapper.findComponent({ name: 'C_Table' }).exists()).toBe(true)
  )
  const table = wrapper.getComponent({ name: 'C_Table' }).vm
  // Vue 公开实例代理只转发 get；通过值检查调用公开方法，不重复构造实例类型。
  const selectRow: unknown = Reflect.get(table, 'selectRow')
  const unselectRow: unknown = Reflect.get(table, 'unselectRow')
  if (typeof selectRow !== 'function' || typeof unselectRow !== 'function')
    throw new Error('候选表格未提供公开选择接口')
  if (deselect) unselectRow(key)
  else selectRow(key)
  await flushPromises()
}

/** 点击真实弹窗操作，确保页面事件桥接和关闭行为一起执行。 */
async function clickDialogButton(label: string): Promise<void> {
  const button = [
    ...document.querySelectorAll('.c-data-picker__modal button'),
  ].find(element => element.textContent?.trim() === label)
  expect(button).toBeDefined()
  if (!(button instanceof HTMLButtonElement))
    throw new Error(`缺少按钮：${label}`)
  button.click()
  await flushPromises()
}

test('同一组织目录覆盖子部门、模糊搜索、分页、回显与取消信号', async () => {
  const { workspace } = mountDirectory()
  const { signal } = new AbortController()
  const result = await workspace.memberSource.request({
    search: '前端',
    page: 1,
    pageSize: 2,
    signal,
    filters: { organizationId: '2' },
  })
  expect(result.total).toBe(4)
  expect(result.rows.map(row => row.name)).toEqual(['王主管', '赵工'])
  const outside = await workspace.memberSource.request({
    search: '前端',
    page: 1,
    pageSize: 20,
    signal,
    filters: { organizationId: '3' },
  })
  expect(outside.rows).toEqual([])
  expect(await workspace.memberSource.resolve!(['9'], signal)).toMatchObject([
    { id: '9', name: '赵工', department: '前端组' },
  ])
  const aborted = new AbortController()
  aborted.abort()
  await expect(
    workspace.memberSource.request({
      search: '',
      page: 1,
      pageSize: 20,
      signal: aborted.signal,
    })
  ).rejects.toMatchObject({ name: 'AbortError' })
})

test('真实人员弹窗确认后展示结果，取消草稿不改已确认成员，空选可以清空', async () => {
  const wrapper = mount(OrgWorkspace, {
    attachTo: document.body,
    global: { components: { C_UserPicker }, stubs: { C_OrgChart: true } },
  })
  const trigger = wrapper
    .findAll('button')
    .find(button => button.text().includes('选择协作成员'))!
  await trigger.trigger('click')
  await flushPromises()
  expect(
    document.querySelector('.c-user-picker__organization-heading')?.textContent
  ).toContain('组织范围')
  await choosePerson(wrapper, '9')
  await clickDialogButton('确定')
  expect(wrapper.get('.org-collaborators').text()).toContain('已确认 1 名')
  expect(wrapper.get('.org-collaborators__members').text()).toContain('赵工')

  await trigger.trigger('click')
  await flushPromises()
  await choosePerson(wrapper, '5')
  await clickDialogButton('取消')
  expect(wrapper.get('.org-collaborators').text()).toContain('已取消本次选择')
  expect(wrapper.get('.org-collaborators__members').text()).toContain('赵工')
  expect(wrapper.get('.org-collaborators__members').text()).not.toContain(
    '王主管'
  )

  await trigger.trigger('click')
  await flushPromises()
  await choosePerson(wrapper, '9', true)
  await clickDialogButton('确定')
  expect(wrapper.get('.org-collaborators').text()).toContain('已清空协作成员')
  expect(wrapper.get('.org-collaborators__members').text()).toBe('')
})
