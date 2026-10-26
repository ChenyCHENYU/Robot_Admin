/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-27
 * @FilePath: \Robot_Admin\tests\components\mach-table-large-data.component.ts
 * @Description: 千万行演示的定位代次与真实 KeepAlive 生命周期回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, KeepAlive, nextTick, ref, shallowRef } from 'vue'
import type {
  GridApi,
  GridAsyncOptions,
  InfiniteGetRowsParams,
} from '@agile-team/mach-table-vue'
import { useLargeData } from '@/views/demo/57-mach-table/components/c_largeData/useLargeData'
import {
  LARGE_COLUMNS,
  type LargeDataRow,
} from '@/views/demo/57-mach-table/components/c_largeData/data'
import { deferred } from './d_deferred'

const bridge = vi.hoisted(() => ({
  table: undefined as unknown,
  narrow: undefined as unknown,
}))
vi.mock('@agile-team/mach-table-vue', () => ({
  useMachTable: () => bridge.table,
  defineVueTableConfig: (value: unknown) => value,
}))
vi.mock('@vueuse/core', () => ({ useMediaQuery: () => bridge.narrow }))

/** 保留真实等待和信号，故意忽略取消以模拟迟到的宿主传输。 */
function createApi() {
  const jobs: Array<{
    start: number
    end: number
    signal?: AbortSignal
    result: ReturnType<typeof deferred<void>>
  }> = []
  const snapshot = vi.fn(() => ({
    cachedBlockCount: 1,
    cachedRowCount: 200,
    loadingBlockCount: 0,
    activeRequestCount: 0,
    queuedRequestCount: 0,
    hitCount: 2,
    missCount: 1,
    evictionCount: 0,
  }))
  const scroll = vi.fn()
  const root = document.createElement('div')
  const viewport = document.createElement('div')
  viewport.className = 'mach-body-viewport--scroll'
  Object.defineProperty(viewport, 'scrollHeight', { value: 16_000_000 })
  root.append(viewport)
  const api = {
    isDestroyed: () => false,
    rows: {
      ensureLoaded: (
        start: number,
        end: number,
        options?: GridAsyncOptions
      ) => {
        const result = deferred<void>()
        jobs.push({ start, end, signal: options?.signal, result })
        return result.promise
      },
      getCacheSnapshot: snapshot,
    },
    view: { scrollToRow: scroll, getRoot: () => root },
  } as unknown as GridApi<LargeDataRow>
  return { api, jobs, snapshot, scroll }
}

/** 用真实 Vue 生命周期挂载局部控制器，不需要运行真实表格渲染。 */
function harness(api: GridApi<LargeDataRow>, cached = false) {
  const table = {
    ref: ref(null),
    api: shallowRef(api),
    ready: shallowRef(true),
  }
  bridge.table = table
  const narrow = ref(false)
  bridge.narrow = narrow
  let controller!: ReturnType<typeof useLargeData>
  const active = ref(true)
  const Child = defineComponent({
    name: 'LargeDataControllerHarness',
    /** 控制器和组件共享同一个 scope，以验证停用与卸载回调。 */
    setup() {
      controller = useLargeData()
      return () => h('div')
    },
  })
  const wrapper = mount(
    cached
      ? defineComponent({
          name: 'LargeDataCacheHarness',
          setup: () => () =>
            h(
              KeepAlive,
              {},
              { default: () => (active.value ? h(Child) : h('span')) }
            ),
        })
      : Child
  )
  return { controller, table, active, wrapper, narrow }
}

describe('超大数据定位作用域', () => {
  test('232px窄容器仅固定订单编号并保留120px中心，桌面恢复原列引用', () => {
    const { controller, narrow } = harness(createApi().api)
    expect(controller.columnDefs.value).toBe(LARGE_COLUMNS)
    narrow.value = true
    const columns = controller.columnDefs.value
    expect(
      columns
        .filter(column => column.pinned === 'left')
        .map(column => column.field)
    ).toEqual(['orderNo'])
    expect(columns.filter(column => column.pinned === 'right')).toHaveLength(0)
    const pinned = columns.filter(column => column.pinned)
    const total = pinned.reduce(
      (sum, column) =>
        sum + Math.max(column.minWidth ?? 80, column.width ?? 150),
      0
    )
    expect(total).toBe(112)
    expect(232 - total).toBeGreaterThanOrEqual(120)
    expect(columns.filter(column => !column.pinned)).toHaveLength(48)
    for (const column of LARGE_COLUMNS.filter(column => !column.pinned))
      expect(columns).toContain(column)
    expect(columns.find(column => column.field === 'sequence')).toMatchObject({
      pinned: false,
      width: 64,
      minWidth: 64,
    })
    expect(columns.find(column => column.field === 'status')).toMatchObject({
      pinned: false,
      width: 80,
      minWidth: 80,
    })
    expect(
      LARGE_COLUMNS.filter(column => column.pinned).map(column => column.width)
    ).toEqual([100, 170, 110])
    narrow.value = false
    expect(controller.columnDefs.value).toBe(LARGE_COLUMNS)
  })
  test('连续定位取消旧等待，旧结果不覆盖新行号、提示与真实快照', async () => {
    const grid = createApi(),
      { controller } = harness(grid.api)
    const first = controller.locateRow(5_000_000)
    const last = controller.locateRow(10_000_000)
    expect(grid.scroll.mock.calls).toEqual([
      [4_999_999, 'top'],
      [9_999_999, 'bottom'],
    ])
    expect(grid.jobs[0]!.signal?.aborted).toBe(true)
    grid.jobs[1]!.result.resolve()
    await last
    expect(controller.notice.value).toContain('10,000,000')
    expect(controller.physicalHeight.value).toBe(16_000_000)
    const notice = controller.notice.value
    grid.jobs[0]!.result.resolve()
    await first
    expect(controller.notice.value).toBe(notice)
    expect(controller.targetRow.value).toBe(10_000_000)
    expect(grid.snapshot).toHaveBeenCalledTimes(1)
  })

  test('API 身份替换后旧失败不能清掉新操作的等待或错误状态', async () => {
    const old = createApi(),
      next = createApi()
    const { controller, table } = harness(old.api)
    const stale = controller.locateRow(123)
    table.api.value = next.api
    const current = controller.locateRow(456)
    old.jobs[0]!.result.reject(new Error('旧 API 的迟到失败'))
    await stale
    expect(controller.locating.value).toBe(true)
    expect(controller.notice.value).toContain('456')
    expect(controller.notice.value).not.toContain('旧 API')
    next.jobs[0]!.result.resolve()
    await current
    expect(controller.locating.value).toBe(false)
    expect(next.snapshot).toHaveBeenCalledTimes(1)
    expect(old.snapshot).not.toHaveBeenCalled()
  })

  test('无效的新输入使旧完成结果失效，而不是把空值偷偷定位到首行', async () => {
    const grid = createApi(),
      { controller } = harness(grid.api)
    const pending = controller.locateRow(20)
    await controller.locateRow(null)
    expect(grid.jobs[0]!.signal?.aborted).toBe(true)
    grid.jobs[0]!.result.resolve()
    await pending
    expect(controller.notice.value).toContain('请输入')
    expect(grid.scroll).toHaveBeenCalledTimes(1)
    expect(grid.snapshot).not.toHaveBeenCalled()
  })

  test('KeepAlive 停用和最终卸载均清理真实模拟计时器，恢复可重新定位', async () => {
    vi.useFakeTimers()
    const grid = createApi(),
      { controller, active, wrapper } = harness(grid.api, true)
    const makeRequest = (): InfiniteGetRowsParams<LargeDataRow> => ({
      startRow: 0,
      endRow: 200,
      sortModel: [],
      filterModel: {},
      advancedFilterModel: null,
      quickFilterText: null,
      signal: new AbortController().signal,
      onSuccess: vi.fn(),
      fail: vi.fn(),
    })
    const params = makeRequest()
    controller.config.datasource!.getRows(params)
    const pending = controller.locateRow(500)
    expect(vi.getTimerCount()).toBe(1)
    active.value = false
    await nextTick()
    expect(vi.getTimerCount()).toBe(0)
    expect(params.fail).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'AbortError' })
    )
    expect(grid.jobs[0]!.signal?.aborted).toBe(true)
    grid.jobs[0]!.result.resolve()
    await pending
    expect(grid.snapshot).not.toHaveBeenCalled()
    active.value = true
    await nextTick()
    expect(grid.jobs).toHaveLength(2)
    grid.jobs[1]!.result.resolve()
    await flushPromises()
    const last = makeRequest()
    controller.config.datasource!.getRows(last)
    expect(vi.getTimerCount()).toBe(1)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
    expect(last.fail).toHaveBeenCalledTimes(1)
    expect(last.onSuccess).not.toHaveBeenCalled()
  })
})
