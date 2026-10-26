/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-27
 * @FilePath: \Robot_Admin\tests\components\mach-table-import.component.ts
 * @Description: 官方 MachTable 导入预览、类型与生命周期消费回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, KeepAlive, ref } from 'vue'
import { MachTable, type GridApi } from '@agile-team/mach-table-vue'
import * as importEntry from '@agile-team/mach-table-vue/import'
import ImportValidation from '@/views/demo/57-mach-table/components/c_importValidation/index.vue'
import {
  IMPORT_SAMPLES,
  type ImportDemoRow,
} from '@/views/demo/57-mach-table/components/c_importValidation/data'
import { deferred } from './d_deferred'

vi.mock('@agile-team/mach-table-vue/import', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@agile-team/mach-table-vue/import')>()
  return { ...actual, createImportPlan: vi.fn(actual.createImportPlan) }
})

/** 挂载完整子组件并等待真实 Grid API 就绪。 */
async function openDemo(): Promise<VueWrapper> {
  const wrapper = mount(ImportValidation, { props: { theme: 'light' } })
  await vi.waitFor(() => expect(wrapper.text()).toContain('Grid Ready'))
  return wrapper
}

/** 使用可见按钮文本触发真实组件事件。 */
async function click(wrapper: VueWrapper, label: string): Promise<void> {
  const button = wrapper.findAll('button').find(item => item.text() === label)
  if (!button) throw new Error(`缺少按钮：${label}`)
  await button.trigger('click')
  await flushPromises()
}

/** 官方组件暴露的 API 仅用于核对实际模型及值类型。 */
function gridApi(wrapper: VueWrapper): GridApi<ImportDemoRow> {
  return (
    wrapper.findComponent(MachTable).vm as unknown as {
      getApi(): GridApi<ImportDemoRow>
    }
  ).getApi()
}

test('预览不改原表，确认保留编号及规范类型，主题更新不回写初始数组', async () => {
  const wrapper = await openDemo()
  const api = gridApi(wrapper)
  await click(wrapper, '校验预览')
  expect(wrapper.attributes('data-status')).toBe('ready')
  expect(api.rows.getAt(0)?.id).toBe('BASE-0001')
  expect(wrapper.get('.mach-import-preview').text()).toContain('Date')
  await click(wrapper, '确认导入')
  expect(api.rows.getCount()).toBe(2)
  const row = api.rows.getById('900719925474099312345')!.data!
  expect(row).toMatchObject({
    id: '900719925474099312345',
    quantity: 8,
    amount: 2460.8,
    enabled: false,
  })
  expect(row.deliveryDate).toBeInstanceOf(Date)
  expect(api.rows.getById('000001')).toBeDefined()
  await wrapper.setProps({ theme: 'dark' })
  await flushPromises()
  expect(api.rows.getCount()).toBe(2)
  expect(api.rows.getById('BASE-0001')).toBeUndefined()
  await click(wrapper, '查看类型化导出')
  expect(wrapper.get('.mach-import-export').text()).toContain('交付日期：Date')
  expect(wrapper.get('.mach-import-export').text()).toContain('启用：boolean')
  expect(api.io.exportMatrix({ target: 'xlsx' })[1][2]).toBe(12)
})

test.each([
  ['错误样例', '启用的订单金额必须大于 0'],
  ['重复编号样例', '编号为空、批内重复'],
])('%s 保留原表并呈现校验原因', async (label, message) => {
  const wrapper = await openDemo()
  const api = gridApi(wrapper)
  await click(wrapper, label)
  await click(wrapper, '校验预览')
  expect(wrapper.attributes('data-status')).toBe('invalid')
  expect(wrapper.get('.mach-import-issues').text()).toContain(message)
  expect(api.rows.getCount()).toBe(1)
})

test('空白行被跳过后预览保留原始数据行号', async () => {
  const wrapper = await openDemo()
  const api = gridApi(wrapper)
  await wrapper
    .get('textarea')
    .setValue(JSON.stringify([Array(6).fill(''), IMPORT_SAMPLES.valid[0]]))
  await click(wrapper, '校验预览')
  expect(wrapper.attributes('data-status')).toBe('ready')
  expect(wrapper.get('.mach-import-preview tbody td').text()).toBe('2')
  await click(wrapper, '确认导入')
  expect(api.rows.getAt(0)?.id).toBe('000001')
})

test('追加保留原有数据，改输入使预览失效，重置恢复独立初始模型', async () => {
  const wrapper = await openDemo()
  const api = gridApi(wrapper)
  await wrapper.get('input[value="append"]').setValue(true)
  await click(wrapper, '校验预览')
  await click(wrapper, '确认导入')
  expect(api.rows.getCount()).toBe(3)
  expect(api.rows.getById('BASE-0001')).toBeDefined()
  await wrapper.setProps({ theme: 'dark' })
  await flushPromises()
  expect(api.rows.getCount()).toBe(3)
  expect(api.rows.getById('900719925474099312345')).toBeDefined()
  await click(wrapper, '正常样例')
  await click(wrapper, '校验预览')
  expect(wrapper.attributes('data-status')).toBe('invalid')
  await wrapper.get('textarea').setValue('[]')
  expect(wrapper.attributes('data-status')).toBe('idle')
  await click(wrapper, '重置本地数据')
  expect(api.rows.getCount()).toBe(1)
})

test.each(['input', 'mode', 'deactivate', 'unmount'] as const)(
  '迟到预览在 %s 后销毁且不回写状态',
  async change => {
    const pending = deferred<importEntry.ImportPreview>()
    const destroy = vi.fn()
    vi.mocked(importEntry.createImportPlan).mockReturnValueOnce({
      preview: () => pending.promise,
      commit: vi.fn(),
      destroy,
    })
    const active = ref(true)
    const wrapper = mount(
      defineComponent({
        name: 'ImportLifecycleHarness',
        /** 保留真实 KeepAlive 停用边界。 */
        setup: () => () =>
          h(
            KeepAlive,
            {},
            {
              default: () =>
                active.value
                  ? h(ImportValidation, { theme: 'light' })
                  : h('div', '其他场景'),
            }
          ),
      })
    )
    await vi.waitFor(() => expect(wrapper.text()).toContain('Grid Ready'))
    const demo = wrapper.findComponent(ImportValidation)
    await click(wrapper, '校验预览')
    if (change === 'input') await wrapper.get('textarea').setValue('[]')
    if (change === 'mode')
      await wrapper.get('input[value="append"]').setValue(true)
    if (change === 'deactivate') {
      active.value = false
      await flushPromises()
    }
    if (change === 'unmount') wrapper.unmount()
    expect(destroy).toHaveBeenCalledOnce()
    pending.resolve({ status: 'ready', rowCount: 1, cells: [], issues: [] })
    await flushPromises()
    if (change === 'deactivate') {
      active.value = true
      await flushPromises()
    }
    if (change !== 'unmount')
      expect(demo.attributes('data-status')).toBe('idle')
  }
)
