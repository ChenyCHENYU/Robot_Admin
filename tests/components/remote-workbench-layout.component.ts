/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-13
 * @FilePath: \Robot_Admin\tests\components\remote-workbench-layout.component.ts
 * @Description: 真实分栏与表单组合在尺寸、折叠和响应式变化时保留业务实例
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { NDialogProvider, NMessageProvider } from 'naive-ui'
import { C_SplitPane } from '@robot-admin/naive-ui-components/C_SplitPane'
import { C_Form } from '@robot-admin/naive-ui-components/C_Form'
import { C_FormSearch } from '@robot-admin/naive-ui-components/C_FormSearch'
import { C_Icon } from '@robot-admin/naive-ui-components/C_Icon'
import RemoteWorkbench from '@/views/production-sales/remote-workbench/index.vue'
import * as apiModule from '@/views/production-sales/remote-workbench/api'

let instances = 0
const observed: Array<{ target?: Element; callback: ResizeObserverCallback }> =
  []

beforeEach(() => {
  vi.useFakeTimers()
  instances = 0
  observed.length = 0
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
  vi.stubGlobal(
    'ResizeObserver',
    class {
      item: (typeof observed)[number]
      /** 保留真实订阅目标，以便仅调整页面宽度而不是劫持分栏测量。 */
      constructor(callback: ResizeObserverCallback) {
        this.item = { callback }
        observed.push(this.item)
      }
      /** 记录目标，让响应式宽度变化只送给页面观察器。 */
      observe(target: Element) {
        this.item.target = target
      }
      /** 不保留浏览器原生观察资源。 */
      unobserve() {}
      /** 生命周期清理由组件实际调用，本测试无需额外句柄。 */
      disconnect() {}
    }
  )
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

/** 表格渲染已由浏览器验收；这里仅记录挂载身份与正常受控数据，保留真实分栏和表单。 */
function mountPage() {
  const factory = vi.spyOn(apiModule, 'createRemoteOrderDemoApi')
  const Grid = defineComponent({
    name: 'LayoutGridProbe',
    inheritAttrs: false,
    props: { rowData: { type: Array, default: () => [] } },
    /** 尺寸变化不能以重建表格来实现。 */
    setup(props) {
      const id = ++instances
      return () =>
        h(
          'div',
          { class: 'layout-grid-probe', 'data-instance': id },
          JSON.stringify(props.rowData)
        )
    },
  })
  const wrapper = mount(
    defineComponent({
      /** 沿用应用实际服务，确认与字段状态不依赖特殊测试 Provider。 */
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () => h(RemoteWorkbench))
        ),
    }),
    {
      global: {
        components: {
          C_SplitPane,
          C_Form,
          C_FormSearch,
          C_Icon,
          MachTable: Grid,
        },
      },
    }
  )
  return {
    wrapper,
    api: factory.mock.results[0].value as ReturnType<
      typeof apiModule.createRemoteOrderDemoApi
    >,
  }
}

test('两级分栏尺寸/折叠/窄屏切换保留表格实例、草稿与主从查询结果', async () => {
  const { wrapper, api } = mountPage()
  try {
    await vi.advanceTimersByTimeAsync(560)
    await flushPromises()
    const grids = wrapper.findAll('.layout-grid-probe')
    expect(grids).toHaveLength(2)
    const identities = grids.map(grid => grid.attributes('data-instance'))
    const rows = grids.map(grid => grid.text())
    await wrapper
      .get('input[aria-label="订单备注"]')
      .setValue('分栏调整后的草稿必须保留')
    const splits = wrapper.findAllComponents(C_SplitPane)
    expect(splits).toHaveLength(2)
    const outer = wrapper.get(
      '[role="separator"][aria-label="订单列表与单据协同分栏"]'
    )
    const inner = wrapper.get(
      '[role="separator"][aria-label="订单主档与商品明细分栏"]'
    )
    await outer.trigger('keydown', { key: 'ArrowRight' })
    await inner.trigger('keydown', { key: 'ArrowDown' })
    splits[0].vm.collapse('first')
    await nextTick()
    splits[0].vm.expand()
    await nextTick()
    const pageObserver = observed.find(item =>
      item.target?.classList.contains('remote-page')
    )!
    pageObserver.callback(
      [{ contentRect: { width: 700 } } as ResizeObserverEntry],
      {} as ResizeObserver
    )
    await nextTick()
    await flushPromises()
    expect(wrapper.get('.remote-page').classes()).toContain(
      'remote-page--stacked'
    )
    expect(outer.attributes('aria-orientation')).toBe('horizontal')
    expect(wrapper.get('input[aria-label="订单备注"]').element).toHaveProperty(
      'value',
      '分栏调整后的草稿必须保留'
    )
    expect(
      wrapper
        .findAll('.layout-grid-probe')
        .map(grid => grid.attributes('data-instance'))
    ).toEqual(identities)
    expect(
      wrapper.findAll('.layout-grid-probe').map(grid => grid.text())
    ).toEqual(rows)
    expect(api.stats.orders).toBe(1)
    expect(api.stats.details).toBe(1)
  } finally {
    wrapper.unmount()
  }
})
