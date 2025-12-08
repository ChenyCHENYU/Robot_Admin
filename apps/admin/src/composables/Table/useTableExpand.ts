/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-15 19:30:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-04 13:50:18
 * @FilePath: \Robot_Admin\src\composables\Table\useTableExpand.ts
 * @Description: 表格展开功能
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { VNodeChild, Ref } from 'vue'
import { type DataTableRowKey, NSpin, NDataTable } from 'naive-ui/es'
import type {
  TableColumn,
  UseTableExpandOptions,
  UseTableExpandReturn,
  ChildSelectionState,
  DataRecord,
} from '@/types/modules/table'

// ================= 核心状态管理 =================
const useExpandState = <T extends DataRecord, C>(
  options: UseTableExpandOptions<T, C>
) => {
  const expandedKeys = ref<DataTableRowKey[]>([
    ...(options.defaultExpandedKeys || []),
  ])
  const expandDataMap = ref(new Map<DataTableRowKey, any>()) as Ref<
    Map<DataTableRowKey, C[]>
  >
  const loadingMap = ref(new Map<DataTableRowKey, boolean>())

  const checkedKeys = options.enableSelection
    ? ref<DataTableRowKey[]>([...(options.defaultCheckedKeys || [])])
    : ref<DataTableRowKey[]>([])

  const childSelections = options.enableChildSelection
    ? ref(new Map<DataTableRowKey, DataTableRowKey[]>())
    : ref(new Map<DataTableRowKey, DataTableRowKey[]>())

  return {
    expandedKeys,
    expandDataMap,
    loadingMap,
    checkedKeys,
    childSelections,
  } as const
}

// ================= 数据工具函数 =================
const useDataUtils = <T extends DataRecord, C>(
  options: UseTableExpandOptions<T, C>
) => {
  const data = computed(() => unref(options.data))

  const getRowKey = options.rowKey
  const getChildRowKey =
    options.childRowKey || ((child: C): DataTableRowKey => (child as any).id)

  const findRow = (key: DataTableRowKey): T | undefined =>
    data.value.find(row => getRowKey(row) === key)

  const isRowExpandable = options.rowExpandable || ((): boolean => true)
  const isRowCheckable = options.rowCheckable || ((): boolean => true)
  const isChildRowCheckable = options.childRowCheckable || ((): boolean => true)

  return {
    data,
    getRowKey,
    getChildRowKey,
    findRow,
    isRowExpandable,
    isRowCheckable,
    isChildRowCheckable,
  } as const
}

// ================= 展开逻辑 =================
const useExpandLogic = <T extends DataRecord, C>(
  state: ReturnType<typeof useExpandState<T, C>>,
  utils: ReturnType<typeof useDataUtils<T, C>>,
  options: UseTableExpandOptions<T, C>
) => {
  const loadData = async (row: T): Promise<C[]> => {
    if (!options.onLoadData) return []

    const key = utils.getRowKey(row)
    const existingData = state.expandDataMap.value.get(key)
    if (existingData) return existingData

    state.loadingMap.value.set(key, true)

    try {
      const data = await options.onLoadData(row)
      const result = data || []
      state.expandDataMap.value.set(key, result as any)

      // 初始化子选择状态
      if (
        options.enableChildSelection &&
        !state.childSelections.value.has(key)
      ) {
        state.childSelections.value.set(key, [])
      }

      return result
    } catch (error) {
      console.error('加载展开数据失败:', error)
      return []
    } finally {
      state.loadingMap.value.set(key, false)
    }
  }

  // 🔥 关键修复：确保展开时触发数据加载
  const handleRowExpand = async (row: T, expanded: boolean): Promise<void> => {
    const key = utils.getRowKey(row)

    if (expanded) {
      // 展开时确保数据加载
      await loadData(row)
      if (!state.expandedKeys.value.includes(key)) {
        state.expandedKeys.value = [...state.expandedKeys.value, key]
      }
    } else {
      // 收起时移除展开状态
      state.expandedKeys.value = state.expandedKeys.value.filter(k => k !== key)
    }

    options.onExpandChange?.(state.expandedKeys.value)
  }

  const expandAll = async (): Promise<void> => {
    const expandableRows = utils.data.value.filter(utils.isRowExpandable)
    await Promise.allSettled(expandableRows.map(loadData))
    state.expandedKeys.value = expandableRows.map(utils.getRowKey)
    options.onExpandChange?.(state.expandedKeys.value)
  }

  const collapseAll = (): void => {
    state.expandedKeys.value = []
    state.childSelections.value.clear()
    options.onExpandChange?.(state.expandedKeys.value)
  }

  const handleExpandChange = async (keys: DataTableRowKey[]): Promise<void> => {
    const newExpandedKeys = keys.filter(
      key => !state.expandedKeys.value.includes(key)
    )
    const collapsedKeys = state.expandedKeys.value.filter(
      key => !keys.includes(key)
    )

    // 改为并行处理新展开的行
    await Promise.all(
      newExpandedKeys.map(async key => {
        const row = utils.findRow(key)
        if (row) {
          await loadData(row)
        }
      })
    )

    // 处理收起的行
    for (const key of collapsedKeys) {
      state.childSelections.value.delete(key)
    }

    state.expandedKeys.value = keys
    options.onExpandChange?.(keys)
  }

  return {
    loadData,
    handleRowExpand,
    expandAll,
    collapseAll,
    handleExpandChange,
  } as const
}

// ================= 选择逻辑 =================
const useSelectionLogic = <T extends DataRecord, C>(
  state: ReturnType<typeof useExpandState<T, C>>,
  utils: ReturnType<typeof useDataUtils<T, C>>,
  options: UseTableExpandOptions<T, C>
) => {
  const selectableRows = computed(() =>
    utils.data.value.filter(utils.isRowCheckable)
  )

  const selectedRowsCount = computed(() => state.checkedKeys.value.length)

  const selectAll = (): void => {
    if (!options.enableSelection) return

    const keys = selectableRows.value.map(utils.getRowKey)
    const finalKeys = options.maxSelection
      ? keys.slice(0, options.maxSelection)
      : keys

    state.checkedKeys.value = finalKeys

    const selectedRows = selectableRows.value.filter(row =>
      finalKeys.includes(utils.getRowKey(row))
    )

    options.onSelectionChange?.(
      finalKeys,
      selectedRows,
      state.childSelections.value
    )
  }

  const clearSelection = (): void => {
    if (!options.enableSelection) return

    state.checkedKeys.value = []
    options.onSelectionChange?.([], [], state.childSelections.value)
  }

  const handleSelectionChange = (keys: DataTableRowKey[]): void => {
    if (!options.enableSelection) return

    state.checkedKeys.value = keys
    const selectedRows = utils.data.value.filter(row =>
      keys.includes(utils.getRowKey(row))
    )
    options.onSelectionChange?.(keys, selectedRows, state.childSelections.value)
  }

  return {
    selectAll,
    clearSelection,
    handleSelectionChange,
    selectedRowsCount,
    selectableRows,
  } as const
}

// ================= 父子联动逻辑 =================
const useParentChildLink = <T extends DataRecord, C>(
  state: ReturnType<typeof useExpandState<T, C>>,
  options: UseTableExpandOptions<T, C>
) => {
  const isLinkEnabled = Boolean(
    options.enableParentChildLink &&
      options.enableSelection &&
      options.enableChildSelection
  )

  const handleParentChildLink = (
    parentKey: DataTableRowKey,
    selectedChildKeys: DataTableRowKey[],
    totalChildren: number
  ): void => {
    if (!isLinkEnabled) return

    const shouldSelectParent =
      options.parentChildLinkMode === 'strict'
        ? selectedChildKeys.length === totalChildren && totalChildren > 0
        : selectedChildKeys.length > 0

    const currentKeys = [...state.checkedKeys.value]
    const isParentSelected = currentKeys.includes(parentKey)

    if (shouldSelectParent && !isParentSelected) {
      state.checkedKeys.value = [...currentKeys, parentKey]
    } else if (!shouldSelectParent && isParentSelected) {
      state.checkedKeys.value = currentKeys.filter(k => k !== parentKey)
    }
  }

  return {
    handleParentChildLink,
    isLinkEnabled,
  } as const
}

// ================= 子选择逻辑 =================
const useChildSelectionLogic = <T extends DataRecord, C>(
  state: ReturnType<typeof useExpandState<T, C>>,
  utils: ReturnType<typeof useDataUtils<T, C>>,
  parentChildLink: ReturnType<typeof useParentChildLink<T, C>>,
  options: UseTableExpandOptions<T, C>
) => {
  const totalChildSelections = computed(() => {
    if (!options.enableChildSelection) return 0
    return Array.from(state.childSelections.value.values()).reduce(
      (total, keys) => total + keys.length,
      0
    )
  })

  const clearAllSelections = (): void => {
    state.checkedKeys.value = []
    state.childSelections.value.clear()
    options.onSelectionChange?.([], [], state.childSelections.value)
  }

  const handleChildSelectionChange = (
    parentKey: DataTableRowKey,
    childKeys: DataTableRowKey[]
  ): void => {
    if (!options.enableChildSelection) return

    state.childSelections.value.set(parentKey, childKeys)

    const expandData = state.expandDataMap.value.get(parentKey) || []
    const selectedChildren = expandData.filter((child: any) =>
      childKeys.includes(utils.getChildRowKey(child as C))
    ) as C[]

    options.onChildSelectionChange?.(parentKey, childKeys, selectedChildren)

    // 触发父子联动
    if (parentChildLink.isLinkEnabled) {
      parentChildLink.handleParentChildLink(
        parentKey,
        childKeys,
        expandData.length
      )
    }
  }

  return {
    totalChildSelections,
    clearAllSelections,
    handleChildSelectionChange,
  } as const
}

// ================= 渲染辅助函数 =================
const createChildSelectionState = <T extends DataRecord, C>(
  parentKey: DataTableRowKey,
  state: ReturnType<typeof useExpandState<T, C>>,
  utils: ReturnType<typeof useDataUtils<T, C>>,
  childLogic: ReturnType<typeof useChildSelectionLogic<T, C>>,
  options: UseTableExpandOptions<T, C>
): ChildSelectionState | undefined => {
  if (!options.enableChildSelection) return undefined

  const selectedKeys = state.childSelections.value.get(parentKey) || []
  const expandData = state.expandDataMap.value.get(parentKey) || []
  const parent = utils.findRow(parentKey)

  if (!parent) return undefined

  const checkableChildren = expandData.filter((child: any) =>
    utils.isChildRowCheckable(child as C, parent)
  )

  const isAllChecked =
    checkableChildren.length > 0 &&
    checkableChildren.every((child: any) =>
      selectedKeys.includes(utils.getChildRowKey(child as C))
    )

  return {
    selectedKeys,
    isAllChecked,
    selectAll: () => {
      const allKeys = checkableChildren.map((child: any) =>
        utils.getChildRowKey(child as C)
      )
      childLogic.handleChildSelectionChange(parentKey, allKeys)
    },
    clearAll: () => {
      childLogic.handleChildSelectionChange(parentKey, [])
    },
  }
}

const createLoadingView = (): VNodeChild => {
  return h('div', { class: 'flex justify-center items-center py-8' }, [
    h(NSpin, { size: 'small' }),
    h('span', { class: 'ml-2 text-gray-500' }, '加载中...'),
  ])
}

const createEmptyView = (): VNodeChild => {
  return h('div', { class: 'text-center py-8 text-gray-400' }, '暂无数据')
}

const createDefaultColumns = (expandData: any[]): any[] => {
  if (!expandData.length) return []

  const firstItem = expandData[0]
  if (!firstItem || typeof firstItem !== 'object') return []

  const dataKeys = Object.keys(firstItem).filter(
    key => !['id', 'key'].includes(key)
  )

  return [
    {
      title: '序号',
      key: '_index',
      width: 60,
      render: (_: any, index: number) => index + 1,
    },
    ...dataKeys.map(key => ({
      key,
      title: key.charAt(0).toUpperCase() + key.slice(1),
      width: 120,
      ellipsis: { tooltip: true },
    })),
  ]
}

const createDefaultTable = <T extends DataRecord, C>(
  key: DataTableRowKey,
  expandData: any[],
  childSelection: ChildSelectionState | undefined,
  utils: ReturnType<typeof useDataUtils<T, C>>,
  childLogic: ReturnType<typeof useChildSelectionLogic<T, C>>,
  options: UseTableExpandOptions<T, C>
): VNodeChild => {
  const columns: any[] = []

  if (options.enableChildSelection) {
    columns.push({ type: 'selection', multiple: true })
  }

  columns.push(...createDefaultColumns(expandData))

  return h('div', { class: 'p-4 bg-gray-50' }, [
    h(
      'div',
      { class: 'mb-2 text-sm text-gray-600' },
      `详细信息 (${expandData.length} 条)`
    ),
    h(NDataTable, {
      data: expandData,
      columns,
      size: 'small',
      striped: true,
      checkedRowKeys: childSelection?.selectedKeys || [],
      rowKey: (row: any) => utils.getChildRowKey(row as C),
      onUpdateCheckedRowKeys: options.enableChildSelection
        ? (keys: DataTableRowKey[]) => {
            childLogic.handleChildSelectionChange(key, keys)
          }
        : undefined,
    }),
  ])
}

// ================= 渲染逻辑 =================
const useRenderer = <T extends DataRecord, C>(
  state: ReturnType<typeof useExpandState<T, C>>,
  utils: ReturnType<typeof useDataUtils<T, C>>,
  childLogic: ReturnType<typeof useChildSelectionLogic<T, C>>,
  expandLogic: ReturnType<typeof useExpandLogic<T, C>>,
  options: UseTableExpandOptions<T, C>
) => {
  // 🔥 关键修复：确保展开时触发数据加载
  const renderExpandContent = (row: T): VNodeChild => {
    const key = utils.getRowKey(row)
    const expandData = state.expandDataMap.value.get(key) || []
    const loading = state.loadingMap.value.get(key) || false

    // 🔥 关键修复：如果展开了但没有数据也没在加载，主动加载
    if (
      !expandData.length &&
      !loading &&
      state.expandedKeys.value.includes(key)
    ) {
      // 使用 nextTick 避免在渲染过程中修改状态
      nextTick(() => {
        expandLogic.loadData(row)
      })
    }

    const childSelection = createChildSelectionState(
      key,
      state,
      utils,
      childLogic,
      options
    )

    // 如果有自定义渲染函数，使用自定义渲染
    if (options.renderContent) {
      return options.renderContent(
        row,
        expandData as C[],
        loading,
        childSelection
      )
    }

    // 加载状态
    if (loading) return createLoadingView()

    // 空数据状态
    if (!expandData.length) return createEmptyView()

    // 默认表格渲染
    return createDefaultTable(
      key,
      expandData,
      childSelection,
      utils,
      childLogic,
      options
    )
  }

  // getTableColumns 方法
  const getTableColumns = (originalColumns: TableColumn<T>[]): any[] => {
    return originalColumns.map(column => {
      // 增强选择列
      if (column.type === 'selection' && options.enableSelection) {
        return {
          type: 'selection',
          disabled: (row: T) => !utils.isRowCheckable(row),
          multiple: !options.maxSelection || options.maxSelection > 1,
        }
      }

      // 增强展开列
      if (
        column.type === 'expand' &&
        (options.onLoadData || options.renderContent)
      ) {
        return {
          type: 'expand',
          expandable: utils.isRowExpandable,
          renderExpand: renderExpandContent,
        }
      }

      // 普通列直接返回
      return column
    })
  }

  return {
    getTableColumns,
  } as const
}

// ================= 主函数 =================
/**
 * @description: 表格展开和选择功能组合
 * @return {*}
 */
export function useTableExpand<
  T extends DataRecord = Record<string, any>,
  C = any,
>(options: UseTableExpandOptions<T, C>): UseTableExpandReturn<T, C> {
  // 创建各个模块
  const state = useExpandState(options)
  const utils = useDataUtils(options)
  const expandLogic = useExpandLogic(state, utils, options)
  const selectionLogic = useSelectionLogic(state, utils, options)
  const parentChildLink = useParentChildLink(state, options)
  const childLogic = useChildSelectionLogic(
    state,
    utils,
    parentChildLink,
    options
  )
  const renderer = useRenderer(state, utils, childLogic, expandLogic, options)

  // 监听选择变化
  if (options.onSelectionChange && options.enableSelection) {
    watchEffect(() => {
      if (!options.onSelectionChange) return

      const selectedRows = utils.data.value.filter(row =>
        state.checkedKeys.value.includes(utils.getRowKey(row))
      )

      // 避免初始化时的无意义调用
      const hasSelection = state.checkedKeys.value.length > 0
      const hasData = utils.data.value.length > 0

      if (hasSelection || !hasData) {
        options.onSelectionChange(
          state.checkedKeys.value,
          selectedRows,
          state.childSelections.value
        )
      }
    })
  }

  // 单行展开方法
  const expandRow = async (key: DataTableRowKey): Promise<void> => {
    if (state.expandedKeys.value.includes(key)) return

    const row = utils.findRow(key)
    if (!row) return

    await expandLogic.loadData(row)
    state.expandedKeys.value = [...state.expandedKeys.value, key]
    options.onExpandChange?.(state.expandedKeys.value, row, true)
  }

  // 初始化数据加载
  const initializeData = async (): Promise<void> => {
    const keysToLoad = options.defaultExpandedKeys || []
    if (keysToLoad.length === 0) return

    const loadPromises = keysToLoad.map(async key => {
      const row = utils.findRow(key)
      if (row && !state.expandDataMap.value.has(key)) {
        await expandLogic.loadData(row)
      }
    })

    await Promise.allSettled(loadPromises)
  }

  // 使用 nextTick 确保组件挂载后执行
  if (options.defaultExpandedKeys?.length) {
    nextTick(initializeData)
  }

  return {
    // 基础状态
    expandedKeys: state.expandedKeys,
    checkedKeys: state.checkedKeys,
    childSelections: state.childSelections,

    // 计算属性
    selectedRowsCount: selectionLogic.selectedRowsCount,
    totalChildSelections: childLogic.totalChildSelections,

    // 展开方法
    expandAll: expandLogic.expandAll,
    collapseAll: expandLogic.collapseAll,
    expandRow,
    handleExpandChange: expandLogic.handleExpandChange,

    // 选择方法
    selectAll: selectionLogic.selectAll,
    clearSelection: selectionLogic.clearSelection,
    clearAllSelections: childLogic.clearAllSelections,
    handleSelectionChange: selectionLogic.handleSelectionChange,

    // 渲染方法
    getTableColumns: renderer.getTableColumns,

    // 数据映射
    expandDataMap: state.expandDataMap,
    loadingMap: state.loadingMap,
  }
}
