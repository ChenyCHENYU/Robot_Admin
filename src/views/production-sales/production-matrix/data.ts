/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\src\views\production-sales\production-matrix\data.ts
 * @Description: 酸洗检测矩阵的本地工作区控制器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  defineVueTableConfig,
  type GridApi,
  type GridReadyEvent,
  type GridErrorEvent,
} from '@agile-team/mach-table-vue'
import { BUSINESS_DIALOG_BUTTONS } from '../shared/actionIcons'
import { createMatrixColumns, setMatrixRange } from './cell'
import {
  createSlots,
  createMatrixRows,
  createReport,
  type MatrixRow,
  type MatrixReport,
} from './model'
import { downloadReportCsv, downloadReportXlsx, printReport } from './report'

export const RANGE_OPTIONS = [
  { label: '近 7 天', value: 7 },
  { label: '完整 28 天', value: 28 },
]
/** 图标源自 Material Design Icons，许可同 shared/actionIcons。 */
const icon = (path: string) => () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: '1em',
      height: '1em',
      fill: 'currentColor',
      'aria-hidden': 'true',
    },
    [h('path', { d: path })]
  )
export const MATRIX_ICONS = {
  download: icon('M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7z'),
  print: icon(
    'M18 3H6v4h12M6 19v-4h12v4m1-11H5a3 3 0 0 0-3 3v6h4v4h12v-4h4v-6a3 3 0 0 0-3-3m0 4a1 1 0 0 1 0-2a1 1 0 0 1 0 2'
  ),
  redo: icon(
    'M18.4 10.6A10.4 10.4 0 0 0 2 14l2.36.78a7.9 7.9 0 0 1 12.25-2.4L13 16h9V7z'
  ),
}
export const REPORT_COLUMNS = Object.keys(
  createReport(createMatrixRows(createSlots(1)).slice(0, 1), createSlots(1))[0]
).map(field => ({
  field,
  headerName: field,
  minWidth: field === '检测项目' ? 110 : 90,
}))

/** 仅在本页维护本地记录；复合值编辑与撤销历史由 MachTable 负责。 */
export function useProductionMatrix() {
  const message = useMessage()
  const dialog = useDialog()
  let restoreDialog: ReturnType<typeof dialog.warning> | null = null
  const api = shallowRef<GridApi<MatrixRow> | null>(null)
  const allSlots = createSlots(28)
  const rows = createMatrixRows(allSlots)
  const days = ref(7)
  const revision = ref(0)
  const dirty = ref(false)
  const canUndo = ref(false)
  const canRedo = ref(false)
  const report = shallowRef<MatrixReport>([])
  const reportVisible = ref(false)
  const exporting = ref(false)
  let cellEditing = false
  const slots = computed(() => allSlots.slice(0, days.value * 3))
  const columns = createMatrixColumns(allSlots, 7)
  const statistics = computed(() => {
    void revision.value
    const records = createReport(rows, slots.value)
    return {
      total: records.length,
      sampled: records.filter(item => item.检测值 !== null).length,
      warning: records.filter(item => item.判定 === '超出内控').length,
    }
  })
  let syncQueued = false
  /** 合并同一粘贴批次的事件，并在 Core 完成历史入栈后读取撤销状态。 */
  const sync = () => {
    if (syncQueued) return
    syncQueued = true
    queueMicrotask(() => {
      syncQueued = false
      if (!api.value || api.value.isDestroyed()) return
      revision.value++
      dirty.value = api.value.editing.getDirtyRowIds().length > 0
      canUndo.value = api.value.editing.canUndo()
      canRedo.value = api.value.editing.canRedo()
    })
  }
  const grid = defineVueTableConfig<MatrixRow>({
    rowKey: 'id',
    pagination: false,
    rowNumber: true,
    domLayout: 'normal',
    rowHeight: 52,
    headerHeight: 32,
    defaultColDef: {
      align: 'center',
      headerAlign: 'center',
      resizable: true,
      sortable: false,
      filter: false,
    },
    enableRangeSelection: true,
    editableIndicator: 'hover',
    onGridReady: (event: GridReadyEvent<MatrixRow>) => {
      api.value = event.api
      sync()
    },
    onCellValueChanged: sync,
    onDirtyStateChanged: sync,
    onCellEditingStarted: () => {
      cellEditing = true
    },
    onCellEditingStopped: () => {
      cellEditing = false
    },
    onGridError: (event: GridErrorEvent) => {
      const error =
        event.error instanceof Error
          ? event.error.message
          : '请检查检测值与取样时间'
      message.warning(error)
    },
  })
  /** idle stop() 也返回 false；只判断公开事件确认存在的活动编辑会话。 */
  const commitActiveEdit = async (): Promise<boolean> =>
    !cellEditing || (await api.value?.editing.stop()) === true
  /** 日期范围切换先提交在编格；校验不通过时保持当前范围。 */
  const changeDays = async (value: number) => {
    if (!(await commitActiveEdit())) return
    if (api.value) setMatrixRange(api.value, allSlots, value)
    days.value = value
  }
  const undo = async () => {
    await api.value?.editing.stop({ cancel: true })
    api.value?.editing.undo()
    sync()
  }
  const redo = async () => {
    await api.value?.editing.stop({ cancel: true })
    api.value?.editing.redo()
    sync()
  }
  /** 保存所有已编辑日期，当前选定范围只影响查看与报表，不丢弃隐藏日期的修改。 */
  const save = async () => {
    if (!(await commitActiveEdit())) return
    api.value?.editing.markSaved()
    sync()
    message.success('检测记录已保存到当前本地工作区')
  }
  const restore = () => {
    if (restoreDialog) return
    restoreDialog = dialog.warning({
      title: '恢复检测记录',
      content: '放弃本次未保存的修改，恢复至最近一次保存的记录？',
      positiveText: '恢复记录',
      negativeText: '取消',
      ...BUSINESS_DIALOG_BUTTONS,
      onPositiveClick: async () => {
        await api.value?.editing.stop({ cancel: true })
        api.value?.editing.rollback()
        sync()
      },
      onAfterLeave: () => {
        restoreDialog = null
      },
    })
  }
  /** 报表弹窗持有独立快照，导出与打印均使用这份记录，包含未取样的空记录。 */
  const openReport = async () => {
    if (!(await commitActiveEdit())) return
    report.value = createReport(rows, slots.value)
    reportVisible.value = true
  }
  const exportCsv = () => downloadReportCsv(report.value)
  const exportXlsx = async () => {
    exporting.value = true
    try {
      await downloadReportXlsx(report.value)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '导出失败，请重试')
    } finally {
      exporting.value = false
    }
  }
  const print = () => {
    if (!printReport(report.value))
      message.warning('请允许本页打开打印窗口后重试')
  }
  const copy = async () => {
    if (!api.value?.selection.getRange()) {
      message.info('请先在表格中拖选需要复制的检测格')
      return
    }
    if (await api.value.io.copyRange()) message.success('已复制选中的检测记录')
  }
  onScopeDispose(() => {
    restoreDialog?.destroy()
    restoreDialog = null
    cellEditing = false
    api.value = null
  })
  return {
    rows,
    days,
    slots,
    columns,
    grid,
    dirty,
    canUndo,
    canRedo,
    statistics,
    report,
    reportVisible,
    exporting,
    changeDays,
    undo,
    redo,
    save,
    restore,
    openReport,
    exportCsv,
    exportXlsx,
    print,
    copy,
  }
}
