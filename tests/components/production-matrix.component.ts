/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\tests\components\production-matrix.component.ts
 * @Description: 使用真实 MachTable 验证复合格焦点、键盘、粘贴、撤销及横向虚拟化
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { afterEach, describe, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import {
  NDialogProvider,
  NMessageProvider,
  useDialog,
  useDialogReactiveList,
} from 'naive-ui'
import { createGrid, type GridApi } from '@agile-team/mach-table-vue'
import {
  createMatrixColumns,
  setMatrixRange,
} from '@/views/production-sales/production-matrix/cell'
import {
  createMatrixRows,
  createSlots,
  createReport,
  type MatrixRow,
} from '@/views/production-sales/production-matrix/model'
import { printReport } from '@/views/production-sales/production-matrix/report'
import { useProductionMatrix } from '@/views/production-sales/production-matrix/data'

const active: GridApi<MatrixRow>[] = []
afterEach(() => {
  active.splice(0).forEach(api => api.destroy())
})

/** 固定宿主尺寸；不伪造 Core 的编辑状态或返回值。 */
function createHost() {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.classList.contains('mach-body-viewport--scroll') ? 550 : 1000
    }
  )
  const host = document.createElement('div')
  Object.defineProperty(host, 'clientWidth', {
    value: 1000,
    configurable: true,
  })
  Object.defineProperty(host, 'clientHeight', {
    value: 400,
    configurable: true,
  })
  document.body.append(host)
  return host
}

/** 固定宿主尺寸，表格仍使用真实 Core 编辑与输入处理管道。 */
function matrix(days = 7) {
  const host = createHost()
  const slots = createSlots(days)
  const rows = createMatrixRows(slots)
  const api = createGrid<MatrixRow>(host, {
    rowKey: 'id',
    rowData: rows,
    columnDefs: createMatrixColumns(slots),
    rowHeight: 52,
    headerHeight: 32,
    enableRangeSelection: true,
    pagination: false,
  })
  active.push(api)
  return { host, slots, rows, api }
}

/** 真实 Provider、页面控制器和 Core 通过公开 grid 回调联动。 */
async function controllerMatrix() {
  let view!: ReturnType<typeof useProductionMatrix>
  const Child = defineComponent({
    /** 页面创建控制器，生命周期由真实 Vue scope 管理。 */
    setup() {
      view = useProductionMatrix()
      return () => h('div')
    },
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () => h(Child))
        ),
    })
  )
  const host = createHost()
  const api = createGrid<MatrixRow>(host, {
    ...view.grid,
    rowData: view.rows,
    columnDefs: view.columns,
  })
  active.push(api)
  await api.whenReady()
  return { host, api, view, wrapper }
}

/** 操作通过页面公开方法触发，不能用底层 stop() 替代业务入口。 */
async function runAction(
  view: ReturnType<typeof useProductionMatrix>,
  action: 'changeDays' | 'openReport' | 'save'
) {
  if (action === 'changeDays') await view.changeDays(28)
  else await view[action]()
}
/** 等待校验承诺与表格提交收尾，不使用动画时长等待。 */
async function settle() {
  await Promise.resolve()
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
}
/** 触发真实可冒泡键盘事件。 */
function key(target: Element, value: string, shiftKey = false) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: value,
      shiftKey,
      bubbles: true,
      cancelable: true,
    })
  )
}

describe('复合矩阵真实表格交互', () => {
  test('槽位合并保留首格真实文本和三行高度，覆盖格使用隐藏语义', () => {
    const { host, rows } = matrix()
    const cells = [
      ...host.querySelectorAll<HTMLElement>(
        '.mach-pane--left .mach-cell[data-col-id="tank"]'
      ),
    ]
    expect(cells.length).toBeGreaterThan(0)
    for (const cell of cells) {
      const row = cell.closest<HTMLElement>('.mach-row')!
      const index = Number(row.dataset.index)
      if (row.style.display === 'none' || index < 0 || index >= rows.length)
        continue
      expect(cell.textContent).toBe(rows[index].tank)
      if (index % 3 === 0) {
        expect(cell.style.display).not.toBe('none')
        expect(cell.getAttribute('aria-hidden')).not.toBe('true')
        expect(Number.parseFloat(cell.style.height)).toBe(156)
        expect(cell.getAttribute('aria-rowspan')).toBe('3')
      } else {
        expect(cell.style.display).toBe('none')
        expect(cell.getAttribute('aria-hidden')).toBe('true')
      }
    }
  })
  test('空闲时允许切日期、打开报表和保存，不把idle stop=false误判为校验失败', async () => {
    const { view, api, host } = await controllerMatrix()
    expect(await api.editing.stop()).toBe(false)
    await view.changeDays(28)
    expect(view.days.value).toBe(28)
    await view.openReport()
    expect(view.reportVisible.value).toBe(true)
    expect(view.report.value).toHaveLength(1008)
    api.editing.startCell({ rowIndex: 0, colId: '2026-11-06_0' })
    host.querySelector<HTMLInputElement>(
      '[data-testid="matrix-value-input"]'
    )!.value = '0'
    host.querySelector<HTMLInputElement>(
      '[data-testid="matrix-time-input"]'
    )!.value = '00:00'
    await api.editing.stop()
    expect(api.editing.getChanges()).toHaveLength(1)
    await view.save()
    expect(api.editing.getChanges()).toHaveLength(0)
  })
  test.each(['changeDays', 'openReport', 'save'] as const)(
    '%s先提交有效的活动复合格，再继续页面操作',
    async action => {
      const { view, api, host } = await controllerMatrix()
      const slot = '2026-11-06_0'
      expect(api.editing.startCell({ rowIndex: 0, colId: slot })).toBe(true)
      host.querySelector<HTMLInputElement>(
        '[data-testid="matrix-value-input"]'
      )!.value = '0'
      host.querySelector<HTMLInputElement>(
        '[data-testid="matrix-time-input"]'
      )!.value = '00:00'
      await runAction(view, action)
      expect(view.rows[0].samples[slot]).toEqual({ value: 0, time: '00:00' })
      expect(
        host.querySelector('[data-testid="matrix-value-input"]')
      ).toBeNull()
      if (action === 'changeDays') expect(view.days.value).toBe(28)
      if (action === 'openReport')
        expect(view.report.value[0]).toMatchObject({
          检测值: 0,
          取样时间: '00:00',
        })
      if (action === 'save') expect(api.editing.getChanges()).toHaveLength(0)
    }
  )
  test.each(['changeDays', 'openReport', 'save'] as const)(
    '%s遇到非法活动复合格时保留编辑并阻止后续操作',
    async action => {
      const { view, api, host } = await controllerMatrix()
      const slot = '2026-11-06_0'
      const original = view.rows[0].samples[slot]
      api.editing.startCell({ rowIndex: 1, colId: slot })
      host.querySelector<HTMLInputElement>(
        '[data-testid="matrix-value-input"]'
      )!.value = '0'
      host.querySelector<HTMLInputElement>(
        '[data-testid="matrix-time-input"]'
      )!.value = '00:00'
      await api.editing.stop()
      const priorChanges = api.editing.getChanges()
      expect(priorChanges).toHaveLength(1)
      api.editing.startCell({ rowIndex: 0, colId: slot })
      host.querySelector<HTMLInputElement>(
        '[data-testid="matrix-value-input"]'
      )!.value = '12.50'
      host.querySelector<HTMLInputElement>(
        '[data-testid="matrix-time-input"]'
      )!.value = ''
      await runAction(view, action)
      expect(view.rows[0].samples[slot]).toBe(original)
      expect(view.days.value).toBe(7)
      expect(view.reportVisible.value).toBe(false)
      expect(api.editing.getChanges()).toEqual(priorChanges)
      expect(
        host.querySelector('[data-testid="matrix-value-input"]')
      ).not.toBeNull()
    }
  )
  test('恢复确认框单例，路由Child卸载而全局Provider保留时只清理本页弹窗', async () => {
    let view!: ReturnType<typeof useProductionMatrix>
    let dialogs!: ReturnType<typeof useDialogReactiveList>
    let openOther!: () => ReturnType<ReturnType<typeof useDialog>['info']>
    const visible = ref(true)
    const Child = defineComponent({
      /** 控制器随路由卸载，外层全局 Provider 保留。 */
      setup() {
        view = useProductionMatrix()
        dialogs = useDialogReactiveList()
        const dialog = useDialog()
        openOther = () =>
          dialog.info({ title: '外部提示', content: '由其他流程持有' })
        return () => h('div')
      },
    })
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(NMessageProvider, null, () =>
            h(NDialogProvider, null, () =>
              visible.value
                ? h(Child)
                : h('div', { 'data-testid': 'other-route' })
            )
          ),
      }),
      { global: { stubs: { transition: false } } }
    )
    view.restore()
    view.restore()
    await flushPromises()
    expect(dialogs.value).toHaveLength(1)
    const own = dialogs.value[0]
    const destroy = vi.spyOn(own, 'destroy')
    const other = openOther()
    await flushPromises()
    visible.value = false
    await flushPromises()
    expect(wrapper.find('[data-testid="other-route"]').exists()).toBe(true)
    expect(destroy).toHaveBeenCalledOnce()
    await vi.waitFor(() => expect(dialogs.value).toHaveLength(1))
    expect(dialogs.value[0].key).toBe(other.key)
    wrapper.unmount()
  })
  test('Tab 在数值和时间之间移动，Esc 同时取消两个字段；提交后撤销与重做完整恢复', async () => {
    const { api, host, rows, slots } = matrix()
    const old = rows[0].samples[slots[0].id]
    expect(api.editing.startCell({ rowIndex: 0, colId: slots[0].id })).toBe(
      true
    )
    const value = host.querySelector<HTMLInputElement>(
      '[data-testid="matrix-value-input"]'
    )!
    const time = host.querySelector<HTMLInputElement>(
      '[data-testid="matrix-time-input"]'
    )!
    expect(document.activeElement).toBe(value)
    value.value = '0'
    key(value, 'Tab')
    expect(document.activeElement).toBe(time)
    time.value = '09:45'
    key(time, 'Tab', true)
    expect(document.activeElement).toBe(value)
    key(value, 'Escape')
    await settle()
    expect(rows[0].samples[slots[0].id]).toBe(old)
    expect(api.editing.getChanges()).toHaveLength(0)
    api.editing.startCell({ rowIndex: 0, colId: slots[0].id })
    host.querySelector<HTMLInputElement>(
      '[data-testid="matrix-value-input"]'
    )!.value = '0'
    host.querySelector<HTMLInputElement>(
      '[data-testid="matrix-time-input"]'
    )!.value = '09:45'
    expect(await api.editing.stop()).toBe(true)
    expect(rows[0].samples[slots[0].id]).toEqual({ value: 0, time: '09:45' })
    expect(api.editing.undo()).toBe(true)
    expect(rows[0].samples[slots[0].id]).toBe(old)
    expect(api.editing.redo()).toBe(true)
    expect(rows[0].samples[slots[0].id]).toEqual({ value: 0, time: '09:45' })
  })
  test('Tab 边界提交完整格并进入下一班；无时间时阻止离开并保留原值', async () => {
    const { api, host, rows, slots } = matrix()
    const old = rows[0].samples[slots[0].id]
    api.editing.startCell({ rowIndex: 0, colId: slots[0].id })
    host.querySelector<HTMLInputElement>(
      '[data-testid="matrix-value-input"]'
    )!.value = '55.25'
    const time = host.querySelector<HTMLInputElement>(
      '[data-testid="matrix-time-input"]'
    )!
    time.value = ''
    key(time, 'Tab')
    await settle()
    expect(rows[0].samples[slots[0].id]).toBe(old)
    expect(
      host.querySelector('.mach-cell--editing')?.getAttribute('data-col-id')
    ).toBe(slots[0].id)
    time.value = '10:05'
    key(time, 'Tab')
    await settle()
    expect(rows[0].samples[slots[0].id]).toEqual({
      value: 55.25,
      time: '10:05',
    })
    expect(
      host.querySelector('.mach-cell--editing')?.getAttribute('data-col-id')
    ).toBe(slots[1].id)
  })
  test('批量粘贴拒绝同一行中的部分错误，合法双格一次撤销，横向 DOM 有界', async () => {
    const { api, host, rows, slots } = matrix(28)
    const first = rows[0].samples[slots[0].id]
    const second = rows[0].samples[slots[1].id]
    const cell = host.querySelector<HTMLElement>(
      `.mach-row[data-index="0"] .mach-cell[data-col-id="${slots[0].id}"]`
    )!
    cell.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, button: 0 })
    )
    const paste = (text: string) => {
      const event = new Event('paste', { bubbles: true, cancelable: true })
      Object.defineProperty(event, 'clipboardData', {
        value: { getData: () => text },
      })
      host.querySelector('.mach-root')!.dispatchEvent(event)
    }
    paste('11.25 @ 08:30\t12.50 @ 99:00')
    await settle()
    expect(rows[0].samples[slots[0].id]).toBe(first)
    expect(rows[0].samples[slots[1].id]).toBe(second)
    paste('0.00 @ 00:00\t12.50 @ 16:30')
    await settle()
    expect(rows[0].samples[slots[0].id]).toEqual({ value: 0, time: '00:00' })
    expect(rows[0].samples[slots[1].id]).toEqual({ value: 12.5, time: '16:30' })
    expect(api.editing.undo()).toBe(true)
    expect(rows[0].samples[slots[0].id]).toBe(first)
    expect(rows[0].samples[slots[1].id]).toBe(second)
    expect(host.querySelectorAll('.matrix-reading').length).toBeLessThan(400)
  })
  test('打印读取完整报表快照而非虚拟窗口，零值/空值/时间与导出字段对应', () => {
    const { rows, slots } = matrix(28)
    const report = createReport(rows, slots)
    const doc = document.implementation.createHTMLDocument('report')
    const print = vi.fn()
    vi.spyOn(window, 'open').mockReturnValue({
      document: doc,
      print,
      focus: vi.fn(),
      opener: window,
    } as unknown as Window)
    expect(printReport(report)).toBe(true)
    expect(doc.querySelectorAll('tbody tr')).toHaveLength(report.length)
    expect(doc.querySelectorAll('thead th')).toHaveLength(
      Object.keys(report[0]).length
    )
    expect(doc.querySelectorAll('tbody tr')[3].textContent).toContain('0')
    expect(doc.body.textContent).toContain(report.at(-1)!.日期)
    expect(print).toHaveBeenCalledOnce()
  })
  test('隐藏日期不丢失修改、dirty及撤销历史，Delete清空两个字段后可整体撤销', async () => {
    const { api, rows, slots, host } = matrix(28)
    const hiddenSlot = slots[30]
    const original = rows[0].samples[hiddenSlot.id]
    const viewport = host.querySelector<HTMLElement>(
      '.mach-body-viewport--scroll'
    )!
    viewport.scrollLeft = 30 * 116
    viewport.dispatchEvent(new Event('scroll'))
    api.view.flush()
    await settle()
    api.editing.startCell({ rowIndex: 0, colId: hiddenSlot.id })
    host.querySelector<HTMLInputElement>(
      '[data-testid="matrix-value-input"]'
    )!.value = '66.5'
    host.querySelector<HTMLInputElement>(
      '[data-testid="matrix-time-input"]'
    )!.value = '08:40'
    await api.editing.stop()
    setMatrixRange(api, slots, 7)
    expect(api.editing.getDirtyRowIds()).toEqual([rows[0].id])
    expect(api.editing.canUndo()).toBe(true)
    expect(api.editing.undo()).toBe(true)
    expect(rows[0].samples[hiddenSlot.id]).toBe(original)
    expect(api.editing.getDirtyRowIds()).toHaveLength(0)
    expect(api.editing.redo()).toBe(true)
    setMatrixRange(api, slots, 28)
    expect(rows[0].samples[hiddenSlot.id]).toEqual({
      value: 66.5,
      time: '08:40',
    })
    const first = rows[0].samples[slots[0].id]
    viewport.scrollLeft = 0
    viewport.dispatchEvent(new Event('scroll'))
    api.view.flush()
    await settle()
    const cell = host.querySelector<HTMLElement>(
      `.mach-row[data-index="0"] .mach-cell[data-col-id="${slots[0].id}"]`
    )!
    cell.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, button: 0 })
    )
    key(host.querySelector('.mach-root')!, 'Delete')
    await settle()
    expect(rows[0].samples[slots[0].id]).toBeNull()
    expect(
      api.editing
        .getChanges()
        .find(row => row.rowId === rows[0].id)
        ?.cells.find(cell => cell.colId === slots[0].id)?.value
    ).toBeNull()
    api.editing.undo()
    expect(rows[0].samples[slots[0].id]).toBe(first)
    api.editing.redo()
    expect(rows[0].samples[slots[0].id]).toBeNull()
    api.editing.rollback()
    expect(rows[0].samples[slots[0].id]).toBe(first)
    expect(api.editing.getChanges()).toHaveLength(0)
    key(host.querySelector('.mach-root')!, 'Delete')
    await settle()
    expect(rows[0].samples[slots[0].id]).toBeNull()
    api.editing.markSaved()
    expect(api.editing.getChanges()).toHaveLength(0)
    api.editing.rollback()
    expect(rows[0].samples[slots[0].id]).toBeNull()
  })
})
