/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-27
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\components\c_importValidation\useImportValidation.ts
 * @Description: 导入预览、确认与失效计划的单一生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { useMachTable, type GridApi } from '@agile-team/mach-table-vue'
import {
  createImportPlan,
  type ImportPlan,
  type ImportPreview,
  type ImportResult,
} from '@agile-team/mach-table-vue/import'
import {
  createInitialImportRows,
  formatImportMatrix,
  IMPORT_FIELDS,
  IMPORT_LABELS,
  IMPORT_SAMPLES,
  importValueType,
  readImportMatrix,
  type ImportDemoRow,
  type ImportMode,
} from './data'

/** API 唯一持有确认后的模型；宿主不回写旧数组，替换与追加使用同一预览契约。 */
export function useImportValidation() {
  const table = useMachTable<ImportDemoRow>()
  const initialRows = createInitialImportRows()
  const input = ref(formatImportMatrix(IMPORT_SAMPLES.valid))
  const mode = ref<ImportMode>('replace')
  const phase = ref<
    | 'idle'
    | 'previewing'
    | 'ready'
    | 'invalid'
    | 'committing'
    | 'applied'
    | 'stale'
  >('idle')
  const preview = shallowRef<ImportPreview | null>(null)
  const error = ref('')
  const count = ref(initialRows.length)
  const importedCount = ref(0)
  const exported = shallowRef<unknown[][] | null>(null)
  const exportCount = ref(0)
  let plan: ImportPlan | null = null
  let generation = 0
  let removeModelListener = () => {}

  /** 输入、模式或宿主变化即失效；不等待旧校验合作取消。 */
  const invalidate = (): void => {
    generation++
    plan?.destroy()
    plan = null
    preview.value = null
    error.value = ''
    phase.value = 'idle'
  }
  watch([input, mode], invalidate, { flush: 'sync' })
  watch(
    table.api,
    api => {
      invalidate()
      removeModelListener()
      const update = (): void => {
        count.value = api?.rows.getCount() ?? 0
      }
      removeModelListener = api?.on('modelUpdated', update) ?? (() => {})
      update()
    },
    { flush: 'sync' }
  )
  onDeactivated(invalidate)
  onScopeDispose(() => {
    invalidate()
    removeModelListener()
  })

  /** 只允许当前计划和当前表格发布异步结果。 */
  const owns = (
    api: GridApi<ImportDemoRow>,
    owner: ImportPlan,
    serial: number
  ): boolean =>
    generation === serial &&
    plan === owner &&
    table.api.value === api &&
    !api.isDestroyed()

  /** 确认结果只更新展示状态，模型仍由表格 API 唯一维护。 */
  const acceptResult = (result: ImportResult): void => {
    importedCount.value = result.importedRowCount
    phase.value =
      result.status === 'applied'
        ? 'applied'
        : result.status === 'invalid'
          ? 'invalid'
          : 'stale'
    if (result.issues.length)
      preview.value = {
        ...preview.value!,
        status: 'invalid',
        issues: result.issues,
      }
    exported.value = null
  }

  /** 校验不写入模型，解析后的值和所有规则错误由包返回。 */
  const inspect = async (): Promise<void> => {
    const api = table.api.value
    if (!api || !table.ready.value) return
    invalidate()
    const serial = generation
    try {
      const owner = createImportPlan(
        api,
        { kind: 'matrix', rows: readImportMatrix(input.value) },
        {
          mode: mode.value,
          columns: IMPORT_FIELDS,
          headerRowIndex: -1,
          coerceNumbers: false,
        }
      )
      plan = owner
      phase.value = 'previewing'
      const result = await owner.preview()
      if (!owns(api, owner, serial)) return
      preview.value = result
      phase.value =
        result.status === 'ready'
          ? 'ready'
          : result.status === 'invalid'
            ? 'invalid'
            : 'stale'
    } catch (reason) {
      if (generation !== serial) return
      error.value =
        reason instanceof Error ? reason.message : '导入校验失败，请重新校验'
      phase.value = 'invalid'
    }
  }

  /** 仅确认成功预览；同一计划消费一次，失效或不合格均不替换原表。 */
  const commit = async (): Promise<void> => {
    const api = table.api.value,
      owner = plan,
      serial = generation
    if (!api || !owner || phase.value !== 'ready') return
    phase.value = 'committing'
    try {
      const result = await owner.commit()
      if (!owns(api, owner, serial)) return
      acceptResult(result)
    } catch (reason) {
      if (!owns(api, owner, serial)) return
      error.value = reason instanceof Error ? reason.message : '确认导入失败'
      phase.value = 'invalid'
    } finally {
      if (owns(api, owner, serial)) {
        owner.destroy()
        plan = null
      }
    }
  }

  /** 样例只修改候选输入，显式使旧预览不可确认。 */
  const sample = (key: keyof typeof IMPORT_SAMPLES): void => {
    invalidate()
    input.value = formatImportMatrix(IMPORT_SAMPLES[key])
  }
  /** 重置本地表格并取消计划，不触及父页面或业务接口。 */
  const reset = (): void => {
    invalidate()
    table.api.value?.rows.setData(createInitialImportRows())
    exported.value = null
  }
  /** 导出读取完整模型，界面只保留前 20 行及对应原始类型。 */
  const showExport = (): void => {
    const matrix = table.api.value?.io.exportMatrix({
      target: 'xlsx',
      includeHeader: true,
    })
    if (!matrix) return
    exportCount.value = Math.max(0, matrix.length - 1)
    exported.value = matrix.slice(0, 21)
  }
  const normalizedRows = computed(() => {
    const rows = new Map<number, unknown[]>()
    const ensure = (index: number): unknown[] => {
      if (!rows.has(index))
        rows.set(index, Array<unknown>(IMPORT_FIELDS.length))
      return rows.get(index)!
    }
    for (const cell of preview.value?.cells ?? []) {
      const index = IMPORT_FIELDS.findIndex(field => field === cell.colId)
      if (index >= 0) ensure(cell.rowIndex)[index] = cell.value
    }
    for (const issue of preview.value?.issues ?? [])
      if (issue.rowIndex >= 0) ensure(issue.rowIndex)
    return [...rows]
      .sort(([left], [right]) => left - right)
      .map(([rowIndex, values]) => ({ rowIndex, values }))
  })
  const exportTypes = computed(() =>
    IMPORT_LABELS.map(
      (label, index) =>
        `${label}：${[...new Set(exported.value?.slice(1).map(row => importValueType(row[index])))].join(' / ')}`
    )
  )
  const busy = computed(
    () => phase.value === 'previewing' || phase.value === 'committing'
  )
  const status = computed(
    () =>
      ({
        idle: '填写或选择样例，再校验预览；当前表格尚未改变。',
        previewing: '正在解析与校验…',
        ready: `预览通过，共 ${preview.value?.rowCount ?? 0} 行；确认后才写入本地表格。`,
        invalid: '校验未通过，原表数据保持不变。',
        committing: '正在确认导入…',
        applied: `已${mode.value === 'replace' ? '替换' : '追加'} ${importedCount.value} 行，仅更新本地表格。`,
        stale: '输入或表格已变化，请重新校验。',
      })[phase.value]
  )
  return {
    table,
    initialRows,
    input,
    mode,
    phase,
    preview,
    error,
    count,
    exported,
    exportCount,
    exportTypes,
    normalizedRows,
    busy,
    status,
    sample,
    inspect,
    commit,
    reset,
    showExport,
  }
}
