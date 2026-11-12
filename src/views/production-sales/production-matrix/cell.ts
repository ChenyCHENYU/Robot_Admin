/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\src\views\production-sales\production-matrix\cell.ts
 * @Description: 单个检测格的结果与取样时间编辑器，生命周期由 MachTable 管理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  CellEditorFactory,
  ColDef,
  ColDefOrGroup,
  GridApi,
} from '@agile-team/mach-table-vue'
import {
  EMPTY_READING,
  parseReading,
  serializeReading,
  validateReading,
  type MatrixRow,
  type MatrixSlot,
  type SampleReading,
} from './model'

/** 复合格悬浮提示只呈现业务值，避免默认对象格式显示 JSON。 */
function readingDescription(
  reading: SampleReading | null,
  row: MatrixRow | null
): string {
  if (reading?.value == null) return '未取样'
  return `${row?.indicator ?? '检测值'}：${reading.value.toFixed(row?.precision ?? 2)} ${row?.unit ?? ''} / ${reading.time}`
}

/** 一个编辑器一次返回完整结果，内部 Tab 只在两个输入之间移动，边界交给表格。 */
export const readingEditor: CellEditorFactory = params => {
  const row = params.data as MatrixRow
  const original = (params.value as SampleReading | undefined) ?? EMPTY_READING
  const root = document.createElement('div')
  root.className = 'matrix-reading-editor'
  const number = document.createElement('input')
  number.type = 'text'
  number.inputMode = 'decimal'
  number.setAttribute('aria-label', `${row.indicator}检测值（${row.unit}）`)
  number.dataset.testid = 'matrix-value-input'
  number.value =
    params.keyPress && /^[\d.]$/.test(params.keyPress)
      ? params.keyPress
      : original.value === null
        ? ''
        : original.value.toFixed(row.precision)
  number.placeholder = row.unit
  const time = document.createElement('input')
  time.type = 'text'
  time.inputMode = 'numeric'
  time.setAttribute('aria-label', '取样时间（HH:mm）')
  time.dataset.testid = 'matrix-time-input'
  time.value = original.time
  time.placeholder = 'HH:mm'
  root.append(number, time)
  const onTab = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || event.isComposing) return
    if (
      (event.target === number && !event.shiftKey) ||
      (event.target === time && event.shiftKey)
    ) {
      event.preventDefault()
      event.stopPropagation()
      const target = event.shiftKey ? number : time
      target.focus({ preventScroll: true })
      target.select()
    }
  }
  // 子输入先处理内部 Tab；不能挂在根上，否则会抢先于表格的根监听器。
  number.addEventListener('keydown', onTab)
  time.addEventListener('keydown', onTab)
  return {
    el: root,
    getValue: () => ({
      value:
        number.value.trim() === ''
          ? null
          : /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(number.value.trim())
            ? Number(number.value)
            : Number.NaN,
      time: time.value.trim(),
    }),
    focus: () => {
      number.focus({ preventScroll: true })
      number.select()
    },
    destroy: () => {
      number.removeEventListener('keydown', onTab)
      time.removeEventListener('keydown', onTab)
    },
  }
}

/** 固定身份列与日期/班次分组列共享原生编辑、粘贴、撤销及校验管道。 */
export function createMatrixColumns(
  slots: readonly MatrixSlot[],
  visibleDays = slots.length / 3
): ColDefOrGroup<MatrixRow>[] {
  const dates = [...new Set(slots.map(slot => slot.date))]
  return [
    {
      field: 'tank',
      headerName: '槽位',
      width: 112,
      pinned: 'left',
      autoRowSpan: true,
    },
    { field: 'indicator', headerName: '检测项目', width: 104, pinned: 'left' },
    {
      colId: 'standard',
      headerName: '内控范围 / 单位',
      width: 154,
      pinned: 'left',
      valueGetter: params =>
        params.data
          ? `${params.data.lower}～${params.data.upper} ${params.data.unit}`
          : '',
    },
    ...dates.map(date => ({
      groupId: date,
      headerName: date.slice(5).replace('-', '月') + '日',
      children: slots
        .filter(slot => slot.date === date)
        .map((slot): ColDef<MatrixRow, SampleReading | null> => ({
          colId: slot.id,
          hide: slots.indexOf(slot) >= visibleDays * 3,
          headerName: slot.shift,
          width: 116,
          minWidth: 100,
          editable: true,
          sortable: false,
          filter: false,
          cellEditor: readingEditor,
          valueGetter: params => params.data?.samples[slot.id] ?? null,
          valueParser: params => parseReading(params.value, params.oldValue),
          validate: (value, params) =>
            validateReading(value ?? EMPTY_READING, params.data.precision),
          valueSetter: params => {
            params.data.samples[slot.id] = params.newValue
            return true
          },
          valueSerializer: params =>
            serializeReading(
              params.value ?? EMPTY_READING,
              params.data?.precision ?? 2
            ),
          tooltipValueGetter: params =>
            readingDescription(params.value, params.data),
          cellRenderer: params => {
            const row = params.data as MatrixRow
            const reading =
              (params.value as SampleReading | undefined) ?? EMPTY_READING
            const root = document.createElement('div')
            root.className = 'matrix-reading'
            root.classList.toggle('is-empty', reading.value === null)
            root.classList.toggle(
              'is-warning',
              reading.value !== null &&
                (reading.value < row.lower || reading.value > row.upper)
            )
            const value = document.createElement('strong')
            value.textContent =
              reading.value === null
                ? '—'
                : reading.value.toFixed(row.precision)
            const time = document.createElement('small')
            time.textContent = reading.time || '未取样'
            root.append(value, time)
            root.title = readingDescription(reading, row)
            return root
          },
        })),
    })),
  ]
}

/** 只改变列可见性，保持日期列身份与撤销记录；整批状态避免逐列重复重排。 */
export function setMatrixRange(
  api: GridApi<MatrixRow>,
  slots: readonly MatrixSlot[],
  days: number
): void {
  const slotIds = new Set(slots.map(slot => slot.id))
  const visible = new Set(slots.slice(0, days * 3).map(slot => slot.id))
  api.columns.setState(
    api.columns
      .getState()
      .map(state =>
        slotIds.has(state.colId)
          ? { ...state, hide: !visible.has(state.colId) }
          : state
      )
  )
}
