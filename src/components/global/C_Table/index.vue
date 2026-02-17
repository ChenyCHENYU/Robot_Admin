<!--
 * @Description: 超级表格组件（薄 UI 壳）
 *
 *   使用侧 API：
 *   <C_Table :columns="cols" :data="data" :loading="loading" :config="tableConfig" />
 *
 *   config 收拢了所有功能配置：edit / selection / expand / pagination / dynamicRows / toolbar / display
 *   列处理 → composables/Table/useTableColumns.ts
 *   配置解析 → composables/Table/useTableConfig.ts
 *   编辑/展开/动态行 → composables/Table/useTableManager.ts
 -->

<template>
  <div class="c-table-wrapper">
    <!-- 动态行工具栏 -->
    <component
      v-if="tableManager.dynamicRowsState"
      :is="tableManager.dynamicRowsState.renderToolbar()"
    />

    <!-- 表格工具栏 -->
    <div
      v-if="resolved.showToolbar"
      class="table-toolbar"
    >
      <div class="toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right" />
        <C_Icon
          v-if="resolved.enableColumnSettings"
          name="mdi:cog"
          size="18"
          title="表格设置"
          clickable
          class="column-settings-btn"
          @click="showSettingsPanel = true"
        />
      </div>
    </div>

    <!-- 表格主体 -->
    <NDataTable
      ref="tableRef"
      v-bind="{ ...computedTableProps, ...$attrs }"
      :columns="computedColumns"
      :data="normalizedData"
      :loading="normalizedLoading"
      :row-key="rowKey"
      :expanded-row-keys="tableManager.expandedKeys.value"
      :checked-row-keys="tableManager.checkedKeys.value"
      @update:expanded-row-keys="tableManager.expandState?.handleExpandChange"
      @update:checked-row-keys="tableManager.expandState?.handleSelectionChange"
      :scroll-x="computedScrollX"
      style="width: 100%"
    />

    <!-- 分页 -->
    <NPagination
      v-if="pagination.paginationConfig.value"
      v-bind="pagination.paginationConfig.value"
      class="pagination-wrapper"
    />

    <!-- 编辑弹窗 -->
    <NModal
      v-if="resolved.editMode === 'modal' || resolved.editMode === 'both'"
      v-model:show="modalVisible"
      :title="resolved.modalTitle"
      :width="resolved.modalWidth"
      preset="card"
      :mask-closable="false"
      :close-on-esc="false"
      class="w60%"
      :closable="false"
    >
      <C_Form
        v-if="modalVisible && formOptions.length"
        ref="editFormRef"
        :key="formKey"
        v-model="localEditingData"
        :options="formOptions"
        :config="{
          layout: 'grid',
          grid: { cols: 2, xGap: 16, yGap: 16 },
          showActions: false,
        }"
      />
      <template #action>
        <NSpace justify="end">
          <NButton @click="handleModalCancel">取消</NButton>
          <NButton
            type="primary"
            :loading="modalSubmitLoading"
            @click="handleModalSave"
          >
            保存
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 动态行确认删除弹窗 -->
    <component
      v-if="tableManager.dynamicRowsState"
      :is="tableManager.dynamicRowsState.renderConfirmModal()"
    />

    <!-- 列设置抽屉 -->
    <NDrawer
      v-model:show="showSettingsPanel"
      :width="420"
      placement="right"
      :mask-closable="true"
    >
      <NDrawerContent
        title="列设置"
        closable
      >
        <ColumnSettings
          :columns="reactiveColumns"
          @change="onColumnSettingsChange"
        />
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ inheritAttrs: false })

  import type { ComponentPublicInstance } from 'vue'
  import type { DataTableRowKey } from 'naive-ui/es'
  import type {
    TableColumn,
    TableEmits,
    DataRecord,
    MaybeRefLike,
  } from '@/types/modules/table'
  import {
    resolveConfig,
    createEditModeChecker,
    type TableConfig,
    type CrudBinding,
  } from '@/composables/Table/useTableConfig'
  import { useTableManager } from '@/composables/Table/useTableManager'
  import { usePagination } from '@/composables/Table/usePagination'
  import { useTableActions } from '@/composables/Table/useTableActions'
  import { useTableColumns } from '@/composables/Table/useTableColumns'
  import { generateFormOptions } from './data'
  import ColumnSettings from './components/ColumnSettings/index.vue'
  import C_Icon from '@/components/global/C_Icon/index.vue'

  // ================= Props（极简 API） =================

  const props = withDefaults(
    defineProps<{
      /** 列配置（crud 模式下可省略） */
      columns?: TableColumn[]
      /** 数据源（crud 模式下可省略） */
      data?: MaybeRefLike<DataRecord[]>
      /** 加载状态 */
      loading?: MaybeRefLike<boolean>
      /** 行唯一键 */
      rowKey?: (row: DataRecord) => DataTableRowKey
      /** 统一功能配置（edit / selection / expand / pagination / dynamicRows / toolbar / display） */
      config?: TableConfig
      /** CRUD 绑定 — 传入 useTableCrud() 的返回值，自动接管 data/columns/loading/actions/pagination/events */
      crud?: CrudBinding
    }>(),
    {
      loading: false,
      rowKey: (row: DataRecord) => row.id as DataTableRowKey,
      config: () => ({}),
    }
  )

  const emit = defineEmits<
    TableEmits & {
      'row-add': [newRow: DataRecord]
      'row-delete': [deletedRow: DataRecord, index: number]
      'row-copy': [originalRow: DataRecord, newRow: DataRecord]
      'row-move': [row: DataRecord, fromIndex: number, toIndex: number]
      'row-selection-change': [
        selectedKey: DataTableRowKey | null,
        selectedRow: DataRecord | null,
      ]
      'pagination-change': [page: number, pageSize: number]
      'view-detail': [data: DataRecord]
      'column-change': [columns: TableColumn[]]
    }
  >()

  // ================= CRUD 桥接 =================

  /** 包装 emit：在触发事件的同时自动调用 crud 对应的方法 */
  const bridgedEmit: typeof emit = (event: any, ...args: any[]) => {
    ;(emit as any)(event, ...args)

    if (!props.crud) return
    const handlers: Record<string, ((...a: any[]) => void) | undefined> = {
      save: props.crud.save,
      cancel: props.crud.handleCancel,
      'pagination-change': props.crud.handlePaginationChange,
      'row-delete': props.crud.handleRowDelete,
      'view-detail': props.crud.detail?.show,
    }
    handlers[event]?.(...args)
  }

  // ================= 有效值（crud 优先 → props 覆盖） =================

  /** 合并 crud 返回的 actions/pagination 到用户 config */
  const effectiveConfig = computed<TableConfig>(() => {
    if (!props.crud) return props.config || {}
    const fromCrud: Partial<TableConfig> = {}
    if (props.crud.actions) fromCrud.actions = props.crud.actions.value
    if (props.crud.pagination) fromCrud.pagination = props.crud.pagination.value
    // 用户 config 覆盖 crud 提取值
    return { ...fromCrud, ...props.config }
  })

  const effectiveColumns = computed<TableColumn[]>(
    () => props.columns ?? props.crud?.columns.value ?? []
  )

  // ================= 配置解析 =================

  const resolved = computed(() => resolveConfig(effectiveConfig.value))
  const editModeChecker = computed(() => createEditModeChecker(resolved.value))

  // ================= 数据规范化（兼容跨实例 Ref） =================

  const unwrapRef = <T,>(val: MaybeRefLike<T> | undefined): T | undefined =>
    val && typeof val === 'object' && 'value' in val ? val.value : (val as T)

  const normalizedData = computed<DataRecord[]>(
    () => unwrapRef(props.data) ?? props.crud?.data.value ?? []
  )

  const normalizedLoading = computed<boolean>(
    () => unwrapRef(props.loading) ?? props.crud?.loading.value ?? false
  )

  // ================= Hooks =================

  const pagination = usePagination({
    data: normalizedData,
    config: computed(() => resolved.value.pagination),
    emit: bridgedEmit,
  })

  const tableManager = useTableManager({
    config: resolved.value,
    data: () => normalizedData.value,
    rowKey: props.rowKey,
    emit: bridgedEmit,
  })

  const tableActions = useTableActions({
    actions: computed(() => effectiveConfig.value.actions || {}),
    config: resolved,
    tableManager,
    rowKey: props.rowKey,
    emit: bridgedEmit,
    onViewDetail: (data: DataRecord) => bridgedEmit('view-detail', data),
  })

  const columnState = useTableColumns({
    rawColumns: effectiveColumns,
    config: resolved,
    columnWidth: resolved.value.columnWidth,
    scrollX: resolved.value.scrollX,
    rowKey: props.rowKey,
    tableManager,
    actionsRenderer: tableActions.renderActions,
    editModeChecker,
  })

  const {
    showSettingsPanel,
    reactiveColumns,
    computedColumns,
    computedScrollX,
  } = columnState

  // ================= 表格属性 =================

  const tableRef = ref<ComponentPublicInstance>()

  const computedTableProps = computed(() => ({
    striped: resolved.value.striped,
    bordered: resolved.value.bordered,
    singleLine: resolved.value.singleLine,
    size: resolved.value.size,
    maxHeight: resolved.value.maxHeight,
  }))

  // ================= 编辑弹窗 =================

  const editFormRef = ref<any>()
  const modalSubmitLoading = ref(false)
  const localEditingData = ref<DataRecord>({})

  const modalVisible = computed({
    get: () => tableManager.editStates.modalEdit.isModalVisible.value,
    set: (val: boolean) => {
      tableManager.editStates.modalEdit.isModalVisible.value = val
    },
  })

  const editableColumns = computed(() =>
    effectiveColumns.value.filter(
      (col): col is TableColumn => col.editable !== false
    )
  )

  const formKey = computed(
    () =>
      `edit-form-${tableManager.editStates.modalEdit.editingRowKey.value || 'new'}`
  )

  const formOptions = computed(() => generateFormOptions(editableColumns.value))

  watch(
    () => tableManager.editStates.modalEdit.editingData.value,
    newData => {
      if (newData && Object.keys(newData).length > 0) {
        localEditingData.value = JSON.parse(JSON.stringify(newData))
      }
    },
    { immediate: true, deep: true }
  )

  let modalCloseTimer: ReturnType<typeof setTimeout> | null = null

  watch(modalVisible, visible => {
    if (!visible) {
      modalCloseTimer = setTimeout(() => {
        localEditingData.value = {}
        modalCloseTimer = null
      }, 300)
    }
  })

  const handleModalSave = async () => {
    if (!editFormRef.value) return
    modalSubmitLoading.value = true
    try {
      await editFormRef.value.validate()
      await tableManager.editStates.modalEdit.saveEdit(localEditingData.value)
    } catch {
      // 表单验证错误由组件内联显示
    } finally {
      modalSubmitLoading.value = false
    }
  }

  const handleModalCancel = () => {
    localEditingData.value = {}
    tableManager.editStates.modalEdit.cancelEdit()
  }

  // ================= 列设置 =================

  const onColumnSettingsChange = (columns: TableColumn[]) => {
    columnState.handleColumnChange(columns)
    emit('column-change', columnState.reactiveColumns.value)
  }

  // ================= Expose =================

  const { edit, expand, selection, dynamicRows } = tableManager.stateManager

  const exposedApi = {
    startEdit: edit.start,
    expandAll: expand.all,
    collapseAll: expand.collapseAll,
    selectAll: selection.all,
    clearSelection: selection.clear,
    clearAllSelections: tableManager.stateManager.clearAllSelections,
    clearRowSelection: dynamicRows?.clearSelection,
    resetToFirstPage: pagination.resetToFirstPage,
    getSelectedRows: selection.getSelected,
    getEditingData: edit.getEditingData,
    isEditing: edit.isEditing,
    isExpanded: expand.isExpanded,
    getManager: () => tableManager.stateManager,
  }

  defineExpose(exposedApi)

  // 自动连接 crud.tableRef（省去手动写 ref="table.tableRef"）
  onMounted(() => {
    const crudRef = props.crud?.tableRef
    if (crudRef) crudRef.value = exposedApi
  })

  onBeforeUnmount(() => {
    if (modalCloseTimer) clearTimeout(modalCloseTimer)
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
