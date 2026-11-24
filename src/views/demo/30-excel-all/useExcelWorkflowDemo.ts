/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-20
 * @Description: Excel 演示的本地预检和异步导出任务
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { useExcel, type ExcelRow } from '@robot-admin/file-utils'
import type {
  ImportWizardAdapter,
  ImportWizardField,
  ImportWizardIssue,
} from '@robot-admin/naive-ui-components/C_ImportWizard'
import type { TaskPanelTask } from '@robot-admin/naive-ui-components/C_TaskPanel'

type Field = 'code' | 'quantity' | 'note'
type ImportRow = {
  row: number
  code: string
  quantity: number
  note: string
  problem?: string
}

export const importFields: ImportWizardField<Field>[] = [
  { key: 'code', label: '物料编码', required: true },
  { key: 'quantity', label: '数量', required: true },
  { key: 'note', label: '备注' },
]

const sampleRows = [
  { 物料编码: '000781', 数量: 12, 备注: '正常记录' },
  { 物料编码: '', 数量: 5, 备注: '缺少物料编码' },
  { 物料编码: '000781', 数量: 2, 备注: '重复编码' },
  { 物料编码: '000782', 数量: 3, 备注: '正常记录' },
]

/** 将导入校验与导出队列留在当前工作台的本地演示。 */
export function useExcelWorkflowDemo() {
  // 向导与工作簿预览独立，切换场景不会覆盖已打开的工作簿。
  const { readFile, exportToExcel } = useExcel()
  const message = useMessage()
  const workbooks = new WeakMap<File, Record<string, ExcelRow[]>>()
  const adapter: ImportWizardAdapter<Field, ImportRow[]> = {
    /** 读取一次文件，将工作表和列留给用户映射。 */
    async read(file, signal) {
      const workbook = await readFile(file, { signal })
      workbooks.set(file, workbook)
      return Object.entries(workbook).map(([key, rows]) => ({
        key,
        label: key,
        columns: [...new Set(rows.flatMap(Object.keys))].map(column => ({
          key: column,
          label: column,
        })),
      }))
    },
    /** 按已选工作表校验编码与数量，保留可接受的记录。 */
    async preview({ file, sheetKey, mapping }, signal) {
      signal.throwIfAborted()
      const rows = workbooks.get(file)?.[sheetKey]
      if (!Array.isArray(rows)) throw new Error('请重新选择工作簿')
      const columns = new Map(
        mapping.map(({ field, column }) => [field, column])
      )
      const codeColumn = columns.get('code') ?? ''
      const quantityColumn = columns.get('quantity') ?? ''
      const noteColumn = columns.get('note') ?? ''
      const seen = new Set<string>()
      const issues: ImportWizardIssue[] = []
      const plan = rows.map((item, index) => {
        const row = index + 1
        const code = String(item[codeColumn] ?? '').trim()
        const quantity = Number(String(item[quantityColumn] ?? ''))
        const note = String(item[noteColumn] ?? '').trim()
        const problem = !code
          ? '缺少物料编码'
          : seen.has(code)
            ? '编码与前面的记录重复'
            : !Number.isFinite(quantity) || quantity <= 0
              ? '数量必须大于零'
              : undefined
        if (problem)
          issues.push({
            level: 'warning',
            message: `第 ${row} 条数据：${problem}，该条将跳过`,
          })
        else seen.add(code)
        return { row, code, quantity, note, problem }
      })
      const rowCount = plan.length - issues.length
      if (!rowCount)
        issues.push({ level: 'error', message: '没有符合条件的记录' })
      return { rowCount, issues, plan }
    },
    /** 返回预检计划的分项结果，演示不写业务数据。 */
    async commit(plan, signal) {
      signal.throwIfAborted()
      return plan.map(item => ({
        key: item.row,
        status: item.problem ? 'skipped' : 'success',
        message:
          item.problem ??
          `已接受物料 ${item.code} × ${item.quantity}${item.note ? ` · ${item.note}` : ''}`,
      }))
    },
  }

  const tasks = shallowRef<TaskPanelTask[]>([])
  const pendingKeys = ref<string[]>([])
  const failOnce = ref(false)
  const timers = new Set<ReturnType<typeof setTimeout>>()
  const scheduled = new Map<string, ExcelRow[]>()
  let sequence = 0
  const later = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.delete(timer)
      callback()
    }, delay)
    timers.add(timer)
  }
  const update = (key: string, change: Partial<TaskPanelTask>) => {
    tasks.value = tasks.value.map(task =>
      task.key === key ? { ...task, ...change } : task
    )
  }
  const runTask = (key: string, shouldFail: boolean) => {
    update(key, {
      status: 'queued',
      message: undefined,
      retryable: false,
      progress: undefined,
    })
    later(() => update(key, { status: 'running', progress: 35 }), 250)
    later(
      () =>
        update(
          key,
          shouldFail
            ? {
                status: 'failed',
                message: '演示生成失败，可重试此任务',
                retryable: true,
              }
            : {
                status: 'success',
                progress: 100,
                downloadable: true,
                message: '工作簿已准备好',
              }
        ),
      1100
    )
  }
  const queueExport = (rows: readonly ExcelRow[]) => {
    const key = String(++sequence)
    const snapshot = (rows.length ? rows : sampleRows).map(row => ({ ...row }))
    scheduled.set(key, snapshot)
    tasks.value = [
      { key, title: `工作簿导出 · ${snapshot.length} 行`, status: 'queued' },
      ...tasks.value,
    ]
    runTask(key, failOnce.value)
    failOnce.value = false
  }
  const retry = (task: TaskPanelTask) => {
    if (task.status === 'failed') runTask(String(task.key), false)
  }
  const download = async (task: TaskPanelTask) => {
    const key = String(task.key)
    const rows = scheduled.get(key)
    if (!rows || pendingKeys.value.includes(key)) return
    pendingKeys.value.push(key)
    try {
      await exportToExcel(rows, {
        fileName: `演示导出-${key}`,
        sheetName: '数据',
      })
    } catch {
      message.error('下载工作簿失败，请重试')
    } finally {
      pendingKeys.value = pendingKeys.value.filter(item => item !== key)
    }
  }
  const downloadSample = async () => {
    try {
      await exportToExcel(sampleRows, {
        fileName: '导入向导演示',
        sheetName: '物料',
      })
    } catch {
      message.error('下载导入样本失败，请重试')
    }
  }
  onBeforeUnmount(() => timers.forEach(clearTimeout))
  return {
    adapter,
    tasks,
    pendingKeys,
    failOnce,
    queueExport,
    retry,
    download,
    downloadSample,
  }
}
