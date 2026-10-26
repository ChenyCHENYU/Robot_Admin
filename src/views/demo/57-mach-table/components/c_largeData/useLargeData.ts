/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-27
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\components\c_largeData\useLargeData.ts
 * @Description: 超大数据演示的定位、快照与组件资源生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  defineVueTableConfig,
  useMachTable,
  type GridApi,
  type RemoteBlockCacheSnapshot,
} from '@agile-team/mach-table-vue'
import { useMediaQuery } from '@vueuse/core'
import {
  createLargeDataSource,
  LARGE_BLOCK_SIZE,
  LARGE_COLUMNS,
  LARGE_ROW_COUNT,
  LARGE_ROW_HEIGHT,
  normalizeLargeRow,
  type LargeDataRow,
} from './data'

/** 页面局部控制器，不接入订单 CRUD，也不持有父页面 API。 */
export function useLargeData() {
  const table = useMachTable<LargeDataRow>()
  const source = createLargeDataSource()
  const narrow = useMediaQuery('(max-width: 640px)')
  const columnDefs = computed(() =>
    narrow.value
      ? LARGE_COLUMNS.map(column => {
          if (!column.pinned) return column
          const width =
            column.field === 'orderNo'
              ? 112
              : column.field === 'sequence'
                ? 64
                : 80
          return {
            ...column,
            pinned: column.field === 'orderNo' ? ('left' as const) : false,
            width,
            minWidth: width,
          }
        })
      : LARGE_COLUMNS
  )
  const targetRow = ref<number | null>(1)
  const locating = ref(false)
  const notice = ref('拖动滚动条，或输入行号精确定位；中间列可横向滚动。')
  const snapshot = shallowRef<RemoteBlockCacheSnapshot | null>(null)
  const physicalHeight = ref(0)
  const sampledAt = ref('尚未采样')
  let active = true
  let disposed = false
  let epoch = 0
  let operation: AbortController | null = null

  /** 仅活动、未销毁的当前实例可以执行演示命令。 */
  const activeApi = (): GridApi<LargeDataRow> | null => {
    const api = table.api.value
    return active && !disposed && api && !api.isDestroyed() ? api : null
  }
  /** 取消不走业务错误提示；其他错误在当前场景就地展示。 */
  const errorText = (error: unknown): string =>
    error instanceof Error ? error.message : '模拟数据加载失败，请重试。'

  /** 读取当前实例的真实快照和 DOM 高度，不维护第二套缓存或定时轮询。 */
  const refreshSnapshot = (api = table.api.value): void => {
    if (!api || activeApi() !== api) return
    snapshot.value = api.rows.getCacheSnapshot()
    physicalHeight.value =
      api.view
        .getRoot()
        ?.querySelector<HTMLElement>('.mach-body-viewport--scroll')
        ?.scrollHeight ?? 0
    sampledAt.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  }

  /** 请求只能更新它发起时的组件、API 和操作代次。 */
  const current = (api: GridApi<LargeDataRow>, revision: number): boolean =>
    epoch === revision && activeApi() === api

  /** 取消旧等待；数据块由表格管理，模拟传输另外在暂停时统一释放。 */
  const cancelOperation = (): void => {
    epoch++
    operation?.abort()
    operation = null
    locating.value = false
  }

  /** API 接收 0 基逻辑位置；等待目标块后才发布本次定位结果与快照。 */
  const locateRow = async (value = targetRow.value): Promise<void> => {
    const row = normalizeLargeRow(value)
    if (row == null) {
      cancelOperation()
      notice.value = '请输入 1 至 10,000,000 之间的行号。'
      return
    }
    const api = activeApi()
    if (!api) return
    cancelOperation()
    const revision = epoch
    const controller = new AbortController()
    operation = controller
    targetRow.value = row
    locating.value = true
    notice.value = `正在定位第 ${row.toLocaleString()} 行…`
    api.view.scrollToRow(row - 1, row === LARGE_ROW_COUNT ? 'bottom' : 'top')
    try {
      await api.rows.ensureLoaded(row - 1, row, { signal: controller.signal })
      if (!current(api, revision)) return
      refreshSnapshot(api)
      notice.value = `已定位第 ${row.toLocaleString()} 行，仅加载当前位置附近的数据块。`
    } catch (error) {
      if (current(api, revision) && !controller.signal.aborted) {
        notice.value = errorText(error)
      }
    } finally {
      if (current(api, revision)) {
        locating.value = false
        operation = null
      }
    }
  }

  const config = defineVueTableConfig<LargeDataRow>({
    columnDefs: LARGE_COLUMNS,
    rowData: [],
    rowKey: 'id',
    rowHeight: LARGE_ROW_HEIGHT,
    rowBuffer: 2,
    datasourceMode: 'block',
    datasourceRowCount: LARGE_ROW_COUNT,
    datasource: source.datasource,
    blockSize: LARGE_BLOCK_SIZE,
    maxBlocksInCache: 8,
    datasourceMaxConcurrentRequests: 2,
    blockPrefetch: 0,
    datasourceRetryCount: 0,
    columnLayout: 'normal',
    defaultColDef: { sortable: false, filter: false, editable: false },
    pagination: false,
    persistence: false,
    rowSelection: 'none',
    enableRangeSelection: false,
    showSummary: false,
    statusBar: false,
    columnMenu: false,
    onModelUpdated: () => refreshSnapshot(),
    onGridError: ({ error }) => {
      if (active && !disposed) notice.value = errorText(error)
    },
  })

  onDeactivated(() => {
    active = false
    cancelOperation()
    source.pause()
  })
  onActivated(() => {
    if (active || disposed) return
    active = true
    source.resume()
    void locateRow()
  })
  onScopeDispose(() => {
    disposed = true
    active = false
    cancelOperation()
    source.dispose()
  })
  watch(table.ready, ready => {
    if (ready) refreshSnapshot()
  })

  return {
    table,
    config,
    narrow,
    columnDefs,
    targetRow,
    locating,
    notice,
    snapshot,
    physicalHeight,
    sampledAt,
    locateRow,
    refreshSnapshot,
  }
}
