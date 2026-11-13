/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-13
 * @FilePath: \Robot_Admin\tests\components\sales-orders-layout.component.ts
 * @Description: 销售工作台窗口分配与短明细自然高度，保留表单、Tab 和全屏实例
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { beforeEach, afterEach, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { NDialogProvider, NMessageProvider } from 'naive-ui'
import { createDictionaryPlugin } from '@robot-admin/dictionary/vue'
import { C_SplitPane } from '@robot-admin/naive-ui-components/C_SplitPane'
import { C_Form } from '@robot-admin/naive-ui-components/C_Form'
import { C_FormSearch } from '@robot-admin/naive-ui-components/C_FormSearch'
import { C_FormModal } from '@robot-admin/naive-ui-components/C_FormModal'
import { C_ErrorSummary } from '@robot-admin/naive-ui-components/C_ErrorSummary'
import { C_ActionBar } from '@robot-admin/naive-ui-components/C_ActionBar'
import { C_Density } from '@robot-admin/naive-ui-components/C_Density'
import { C_Icon } from '@robot-admin/naive-ui-components/C_Icon'
import dictionaryConfig from '@/config/dictionary'
import SalesOrders from '@/views/production-sales/sales-orders/index.vue'
import * as controllerModule from '@/views/production-sales/sales-orders/data'

vi.mock('@/stores/theme', () => ({ s_themeStore: () => ({ isDark: false }) }))
let instanceCount = 0
beforeEach(() => {
  vi.useFakeTimers()
  instanceCount = 0
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      width: 1206,
      height: 806,
      right: 1206,
      bottom: 806,
      toJSON: () => ({}),
    })
  )
})
afterEach(() => vi.useRealTimers())

/** 实际页面保留真实表单与分栏；只替代表格绘制，记录其挂载身份与公开布局属性。 */
function setup() {
  const factory = vi.spyOn(controllerModule, 'useBusinessWorkbench')
  const Grid = defineComponent({
    name: 'SalesGridProbe',
    inheritAttrs: false,
    props: {
      rowData: { type: Array, default: () => [] },
      domLayout: { type: String, default: 'normal' },
    },
    /** 用稳定身份验证尺寸与 Teleport 不会重建表格。 */
    setup(props, { attrs }) {
      const instance = ++instanceCount
      return () =>
        h(
          'div',
          {
            class: 'sales-grid-probe',
            'data-label': attrs['aria-label'],
            'data-layout': props.domLayout,
            'data-instance': instance,
          },
          JSON.stringify(props.rowData)
        )
    },
  })
  const wrapper = mount(
    defineComponent({
      /** 提供与应用一致的消息、确认和独立字典服务。 */
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () => h(SalesOrders))
        ),
    }),
    {
      global: {
        plugins: [createDictionaryPlugin(dictionaryConfig)],
        components: {
          C_SplitPane,
          C_Form,
          C_FormSearch,
          C_FormModal,
          C_ErrorSummary,
          C_ActionBar,
          C_Density,
          C_Icon,
        },
        stubs: { MachTable: Grid },
      },
    }
  )
  return {
    wrapper,
    view: factory.mock.results[0].value as ReturnType<
      typeof controllerModule.useBusinessWorkbench
    >,
  }
}

test('短明细按内容高度，全屏/空结果保持可用视口；Tab/分栏/窄屏均保留草稿和网格实例', async () => {
  const { wrapper, view } = setup()
  try {
    expect(view.shortLines.value).toBe(false)
    await vi.advanceTimersByTimeAsync(120)
    await flushPromises()
    expect(view.shortLines.value).toBe(true)
    expect(view.shortPayments.value).toBe(true)
    expect(wrapper.find('.workbench-header .c-form').exists()).toBe(true)
    const line = wrapper.get('.sales-grid-probe[data-label="当前订单商品明细"]')
    expect(line.attributes('data-layout')).toBe('autoHeight')
    const identity = line.attributes('data-instance')
    view.header.value.note = '窗口重排仍保留销售草稿'
    const split = wrapper.getComponent(C_SplitPane)
    split.vm.setSize(51)
    view.activeTab.value = 'payments'
    await nextTick()
    view.activeTab.value = 'lines'
    view.stacked.value = true
    await nextTick()
    await flushPromises()
    expect(wrapper.get('.business-workbench').classes()).toContain(
      'business-workbench--stacked'
    )
    expect(view.header.value.note).toBe('窗口重排仍保留销售草稿')
    expect(line.attributes('data-instance')).toBe(identity)
    view.fullscreen.value = true
    await nextTick()
    await flushPromises()
    expect(view.shortLines.value).toBe(false)
    expect(
      document
        .querySelector(
          '.workbench-details--fullscreen .sales-grid-probe[data-label="当前订单商品明细"]'
        )
        ?.getAttribute('data-instance')
    ).toBe(identity)
    view.fullscreen.value = false
    await nextTick()
    await flushPromises()
    expect(
      wrapper
        .get('.sales-grid-probe[data-label="当前订单商品明细"]')
        .attributes('data-layout')
    ).toBe('autoHeight')
    view.lines.value = []
    await nextTick()
    await flushPromises()
    expect(view.shortLines.value).toBe(false)
    expect(
      wrapper
        .get('.sales-grid-probe[data-label="当前订单商品明细"]')
        .attributes('data-layout')
    ).toBe('normal')
    expect(instanceCount).toBe(3)
  } finally {
    wrapper.unmount()
  }
})
