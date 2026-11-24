<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-10
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\index.vue
 * @Description: MachTable 业务场景与即时功能配置演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="mach-table-demo">
    <c_vTitle
      title="Mach Table 场景示例"
      icon="mdi:table-large"
      :description="`CRUD、行内编辑、树形与顺序调整，体验 v${machTableVersion} 的导入校验和千万行视口`"
    />

    <div
      v-if="showOrderGrid"
      class="mach-overview"
    >
      <div class="mach-overview__item">
        <span>当前版本</span>
        <strong>v{{ machTableVersion }}</strong>
      </div>
      <div class="mach-overview__item">
        <span>数据规模</span>
        <strong>{{ totalRows.toLocaleString() }} 行</strong>
      </div>
      <div class="mach-overview__item">
        <span>已选择</span>
        <strong>{{ selectedCount }} 行</strong>
      </div>
      <div class="mach-overview__item">
        <span>运行状态</span>
        <strong :class="{ 'is-ready': ready }">
          {{ ready ? 'Grid Ready' : '初始化中' }}
        </strong>
      </div>
    </div>

    <NCard
      class="mach-card"
      :bordered="false"
    >
      <div class="mach-scenario-bar">
        <C_Tabs
          v-model="activeScenario"
          class="mach-scenario-tabs"
          :items="TABLE_SCENARIO_TABS"
          type="segment"
          tabs-only
          @change="handleScenarioChange"
        />

        <C_ActionBar
          v-if="showOrderGrid"
          :actions="feature.openActions"
          :config="{ size: 'tiny' }"
        />
      </div>

      <div
        v-if="showOrderGrid"
        class="mach-demo-toolbar"
      >
        <NInput
          v-model:value="quickFilter"
          class="mach-demo-toolbar__search"
          size="small"
          clearable
          placeholder="搜索订单、客户、产品或区域"
        >
          <template #prefix>
            <C_Icon
              type="unocss"
              :name="'i-mdi-magnify'"
            />
          </template>
        </NInput>

        <label
          v-if="isReorderScenario"
          class="mach-reorder-save-control"
        >
          <span>模拟保存</span>
          <NSelect
            v-model:value="reorder.saveMode"
            class="mach-reorder-save-control__select"
            :options="ORDER_REORDER_SAVE_OPTIONS"
            :disabled="reorder.busy"
            aria-label="模拟排序保存结果"
            size="small"
          />
        </label>

        <C_ActionBar
          class="mach-demo-toolbar__actions"
          :actions="tableActions"
          :config="{ wrap: true, align: 'right', size: 'tiny' }"
        />
      </div>

      <NAlert
        v-if="showOrderGrid"
        class="mach-tip"
        type="info"
        :show-icon="false"
      >
        {{ currentScenario.tip }}
      </NAlert>

      <div
        v-if="isReorderScenario"
        class="mach-reorder-status"
        :data-status="reorder.state.status"
        :aria-busy="reorder.busy"
      >
        <div class="mach-reorder-status__preview">
          <span>顺序预览</span>
          <strong>{{ reorder.preview }}</strong>
        </div>
        <span
          role="status"
          aria-live="polite"
        >
          {{ reorder.statusText }}
        </span>
        <small class="mach-reorder-status__details">
          客户端 r{{ reorder.clientRevision }} · 模拟服务器 r{{
            reorder.serverRevision
          }}
          · 仅本地模拟，不写业务接口
        </small>
      </div>

      <ImportValidation
        v-if="currentScenario.kind === 'import'"
        :theme="themeStore.isDark ? 'dark' : 'light'"
      />
      <LargeData
        v-else-if="currentScenario.kind === 'large'"
        :theme="themeStore.isDark ? 'dark' : 'light'"
      />
      <div
        v-else
        class="mach-grid-shell"
      >
        <MachTable
          v-bind="tableProps"
          :key="isReorderScenario ? 'reorder' : 'orders'"
          :ref="table.ref"
          class="mach-demo-grid"
        />
      </div>
    </NCard>

    <c_detail :crud="orderCrud" />

    <C_FormModal
      :editor="orderCrud.editor"
      :options="ORDER_FORM_OPTIONS"
      :config="ORDER_FORM_CONFIG"
      create-text="创建订单"
      save-text="保存修改"
      class="mach-record-modal"
    />

    <NDrawer
      v-model:show="feature.open"
      width="min(600px, 100vw)"
      placement="right"
    >
      <NDrawerContent
        class="mach-feature-drawer"
        closable
      >
        <template #header>
          <div class="mach-feature-heading">
            <span class="mach-feature-heading__icon">
              <C_Icon
                type="unocss"
                :name="'i-mdi-tune-variant'"
                :size="22"
              />
            </span>
            <div>
              <strong>功能配置</strong>
              <span>打造适合当前任务的表格视图</span>
            </div>
          </div>
        </template>

        <div class="mach-feature-panel">
          <div class="mach-feature-context">
            <span>{{ currentScenario.label }}</span>
            <span class="mach-feature-context__live">修改即时生效</span>
          </div>

          <section class="mach-feature-presets">
            <header class="mach-feature-section-title">
              <strong>从预设开始</strong>
              <span>{{ feature.presetLabel }}</span>
            </header>
            <div class="mach-feature-preset-grid">
              <button
                v-for="preset in MACH_FEATURE_PRESET_OPTIONS"
                :key="preset.value"
                type="button"
                class="mach-feature-preset"
                :class="{ 'is-active': feature.preset === preset.value }"
                :aria-pressed="feature.preset === preset.value"
                @click="feature.applyPreset(preset.value)"
              >
                <C_Icon
                  type="unocss"
                  :name="preset.icon"
                />
                <span>
                  <strong>{{ preset.label }}</strong>
                  <small>{{ preset.description }}</small>
                </span>
                <C_Icon
                  v-if="feature.preset === preset.value"
                  class="mach-feature-preset__check"
                  type="unocss"
                  :name="'i-mdi-check-circle'"
                  :size="14"
                />
              </button>
            </div>
          </section>

          <div class="mach-feature-preview">
            <div>
              <strong>状态预览</strong>
              <span>检查表格在不同数据状态下的呈现</span>
            </div>
            <NSelect
              v-model:value="previewState"
              class="mach-feature-preview__select"
              size="small"
              :options="TABLE_PREVIEW_OPTIONS"
            />
          </div>

          <section
            v-for="group in MACH_FEATURE_GROUPS"
            :key="group.key"
            class="mach-feature-group"
          >
            <header>
              <span class="mach-feature-group__icon">
                <C_Icon
                  type="unocss"
                  :name="group.icon"
                  :size="17"
                />
              </span>
              <div>
                <strong>{{ group.title }}</strong>
                <span>{{ group.description }}</span>
              </div>
              <small>{{ group.options.length }} 项</small>
            </header>
            <C_Form
              v-model="feature.settings"
              :options="group.options"
              :config="MACH_FEATURE_FORM_CONFIG"
            />
          </section>

          <details class="mach-capabilities">
            <summary>
              <span>
                <C_Icon
                  type="unocss"
                  :name="'i-mdi-puzzle-outline'"
                />
                <strong>场景与扩展能力</strong>
              </span>
              <C_Icon
                class="mach-capabilities__chevron"
                type="unocss"
                :name="'i-mdi-chevron-down'"
              />
            </summary>
            <p class="mach-capabilities__description">
              以下能力需要对应的数据结构或独立入口，查看接入说明。
            </p>
            <div class="mach-capability-list">
              <article
                v-for="capability in MACH_SCENE_CAPABILITIES"
                :key="capability.key"
                class="mach-capability-item"
              >
                <div>
                  <strong>{{ capability.title }}</strong>
                  <p>{{ capability.description }}</p>
                </div>
                <NTag
                  size="small"
                  :type="capability.state.includes('已') ? 'success' : 'info'"
                  :bordered="false"
                >
                  {{ capability.state }}
                </NTag>
              </article>
            </div>
          </details>
        </div>

        <template #footer>
          <div class="mach-feature-footer">
            <span>配置仅作用于当前演示</span>
            <C_ActionBar
              :actions="feature.panelActions"
              :config="{ align: 'space-between', size: 'small', wrap: true }"
            />
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<script setup lang="ts">
  import {
    MachTable,
    version as machTableVersion,
    type CellRendererParams,
    type CellValueChangedEvent,
    type GridErrorEvent,
    type RowEditingStoppedEvent,
  } from '@agile-team/mach-table-vue'
  import { useMachTableController } from '@agile-team/mach-table-vue/workflows'
  import { useScopedMachTableConfig } from '@/composables/useScopedMachTableConfig'
  import { defineActions } from '@robot-admin/naive-ui-components/C_ActionBar'
  import '@agile-team/mach-table-vue/styles.css'
  import { s_themeStore } from '@/stores/theme'
  import {
    ORDER_TABLE_CONFIG,
    createOrderColumns,
    createOrderReorderColumns,
    createOrderTreeColumns,
  } from './columns'
  import { createOrderTreeRows, type OrderRow, type OrderTreeRow } from './data'
  import {
    MACH_FEATURE_FORM_CONFIG,
    MACH_FEATURE_GROUPS,
    MACH_FEATURE_PRESET_OPTIONS,
  } from './features'
  import {
    MACH_SCENE_CAPABILITIES,
    TABLE_PREVIEW_OPTIONS,
    TABLE_SCENARIOS,
    TABLE_SCENARIO_TABS,
    type TablePreviewState,
    type TableScenario,
  } from './scenes'
  import { useMachTableFeatures } from './useMachTableFeatures'
  import {
    ORDER_REORDER_SAVE_OPTIONS,
    useOrderReorderDemo,
  } from './useOrderReorderDemo'
  import {
    ORDER_FORM_CONFIG,
    ORDER_FORM_OPTIONS,
    exportOrderTable,
    useOrderTable,
  } from './useOrderTable'

  defineOptions({ name: 'MachTableDemo' })

  const ImportValidation = defineAsyncComponent(
    () => import('./components/ImportValidation/index.vue')
  )
  const LargeData = defineAsyncComponent(
    () => import('./components/LargeData/index.vue')
  )
  const message = useMessage()
  const dialog = useDialog()
  const themeStore = s_themeStore()
  const orderCrud = useOrderTable()
  const activeScenario = ref<TableScenario>('crud')
  const previewState = ref<TablePreviewState>('data')
  const currentScenario = computed(() => TABLE_SCENARIOS[activeScenario.value])
  const inlineEditMode = computed(() => currentScenario.value.editMode)
  const isReorderScenario = computed(
    () => currentScenario.value.kind === 'reorder'
  )
  const showOrderGrid = computed(
    () =>
      currentScenario.value.kind !== 'import' &&
      currentScenario.value.kind !== 'large'
  )
  const reorder = useOrderReorderDemo(() =>
    isReorderScenario.value ? tableApi.value : null
  )

  const handleView = async (
    params: CellRendererParams<OrderRow>
  ): Promise<void> => {
    const record = params.data
    if (!record) return
    await orderCrud.getDetail(record)
  }

  const handleDelete = (params: CellRendererParams<OrderRow>): void => {
    const record = params.data
    if (!record) return
    dialog.warning({
      title: '删除订单',
      content: `确认删除订单 ${record.orderNo}？此操作不可撤销。`,
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: () => orderCrud.remove(record),
    })
  }

  const handleCopyOrderNo = async (
    params: CellRendererParams<OrderRow>
  ): Promise<void> => {
    const record = params.data
    if (!record) return
    try {
      await navigator.clipboard.writeText(record.orderNo)
      message.success(`已复制 ${record.orderNo}`)
    } catch {
      message.warning('浏览器未授权剪贴板，请手动复制')
    }
  }

  const handleCellValueChanged = async (
    event: CellValueChangedEvent<OrderRow>
  ): Promise<void> => {
    if (inlineEditMode.value !== 'cell') return
    await orderCrud.save({ ...event.data })
  }

  const handleRowEditingStopped = async (
    event: RowEditingStoppedEvent<OrderRow>
  ): Promise<void> => {
    if (inlineEditMode.value !== 'row') return
    if (event.cancelled) {
      message.info(`订单 ${event.data.orderNo} 的整行修改已取消`)
      return
    }
    if (event.changes.length) await orderCrud.save({ ...event.data })
  }

  /** 切换场景时关闭旧配置、取消保存，并结束旧表格的编辑事务。 */
  const handleScenarioChange = async (): Promise<void> => {
    reorder.cancelPending()
    feature.open = false
    previewState.value = 'data'
    quickFilter.value = ''
    commands.clearSelection()
    await tableApi.value?.editing.stop({ cancel: true })
  }

  /** 重建演示数据，恢复最初的人工顺序，同时清除搜索以完整展示结果。 */
  const restoreOrder = (): void => {
    quickFilter.value = ''
    commands.clearSelection()
    reorder.reset()
  }

  const handleGridError = (event: GridErrorEvent<OrderRow>): void => {
    console.error('[MachTable]', event)
    message.error('表格运行异常，请查看控制台诊断信息')
  }

  const grid = useMachTableController({
    config: useScopedMachTableConfig(ORDER_TABLE_CONFIG),
    loading: () =>
      (!isReorderScenario.value && orderCrud.loading.value) ||
      previewState.value === 'loading',
    theme: () => (themeStore.isDark ? 'dark' : 'light'),
    editMode: inlineEditMode,
    onCellValueChanged: handleCellValueChanged,
    onRowEditingStopped: handleRowEditingStopped,
    onGridError: handleGridError,
  })
  const { table, bindings: tableBindings, selectedCount, commands } = grid
  const { api: tableApi, ready } = table
  const quickFilter = grid.search
  const feature = useMachTableFeatures(tableApi, ready, isReorderScenario)
  watch(ready, isReady => {
    if (isReady && isReorderScenario.value) reorder.refreshState()
  })

  const tableActions = defineActions([
    {
      key: 'add',
      show: () => activeScenario.value === 'crud',
      onClick: orderCrud.editor.openCreate,
    },
    {
      key: 'columns',
      show: () => activeScenario.value === 'workspace',
      disabled: () => !ready.value,
      onClick: () => commands.openColumns(),
    },
    {
      key: 'select-all',
      label: '全选筛选结果',
      icon: 'mdi:select-all',
      show: () =>
        isReorderScenario.value || feature.settings.rowSelection === 'multiple',
      disabled: () => !ready.value || (isReorderScenario.value && reorder.busy),
      onClick: () => commands.selectAll(),
    },
    {
      key: 'clear-selection',
      label: '清空选择',
      icon: 'mdi:selection-remove',
      show: () =>
        isReorderScenario.value || feature.settings.rowSelection !== 'none',
      disabled: () =>
        !selectedCount.value || (isReorderScenario.value && reorder.busy),
      onClick: () => commands.clearSelection(),
    },
    {
      key: 'undo',
      label: '撤销编辑',
      icon: 'mdi:undo-variant',
      show: () => inlineEditMode.value !== 'none',
      disabled: () => !ready.value,
      onClick: () => undoEdit(),
    },
    {
      key: 'select-order-sample',
      label: '选中两项订单',
      icon: 'mdi:checkbox-multiple-marked-outline',
      show: () => isReorderScenario.value,
      disabled: () => !ready.value || reorder.busy,
      onClick: reorder.selectSample,
    },
    {
      key: 'undo-order',
      label: '撤销顺序',
      icon: 'mdi:undo-variant',
      show: () => isReorderScenario.value,
      disabled: () => !ready.value || reorder.busy || !reorder.state.canUndo,
      onClick: () => reorder.restore('undo'),
    },
    {
      key: 'redo-order',
      label: '重做顺序',
      icon: 'mdi:redo-variant',
      show: () => isReorderScenario.value,
      disabled: () => !ready.value || reorder.busy || !reorder.state.canRedo,
      onClick: () => reorder.restore('redo'),
    },
    {
      key: 'reload-order',
      label: '重新加载服务器顺序',
      icon: 'mdi:reload',
      show: () => isReorderScenario.value,
      disabled: () =>
        !ready.value ||
        reorder.busy ||
        reorder.clientRevision === reorder.serverRevision,
      onClick: reorder.reload,
    },
    {
      key: 'restore-order',
      label: '恢复初始顺序',
      icon: 'mdi:sort-restore',
      show: () => isReorderScenario.value,
      disabled: () => !ready.value || reorder.busy || !reorder.changed,
      onClick: restoreOrder,
    },
    {
      key: 'reset',
      label: '重置视图',
      disabled: () => !ready.value,
      onClick: () => resetTable(),
    },
    {
      key: 'export',
      label: '导出 CSV',
      type: 'primary',
      disabled: () => !ready.value,
      onClick: () => exportCsv(),
    },
  ])

  const orderColumns = createOrderColumns(() => inlineEditMode.value, {
    onView: handleView,
    onEdit: params => {
      if (params.data) orderCrud.editor.openEdit(params.data)
    },
    onDelete: handleDelete,
    extraActions: [
      {
        id: 'copy-order-no',
        icon: 'copy',
        label: '复制订单号',
        onClick: handleCopyOrderNo,
      },
    ],
  })
  const treeColumns = createOrderTreeColumns()
  const reorderColumns = createOrderReorderColumns()
  const treeRows = createOrderTreeRows()
  /** 树形分页的概览使用节点总数，各层均计入。 */
  const countTreeRows = (rows: OrderTreeRow[]): number =>
    rows.reduce(
      (total, row) => total + 1 + countTreeRows(row.children ?? []),
      0
    )
  const treeTotal = countTreeRows(treeRows)
  const currentData = computed(() => {
    if (currentScenario.value.kind === 'tree') {
      return {
        rows: treeRows,
        columns: treeColumns,
        total: treeTotal,
        tree: true,
      }
    }
    if (isReorderScenario.value) {
      return {
        rows: reorder.rows,
        columns: reorderColumns,
        total: reorder.rows.length,
        tree: false,
      }
    }
    return {
      rows: orderCrud.rows.value,
      columns: orderColumns,
      total: orderCrud.total.value,
      tree: false,
    }
  })
  const totalRows = computed(() =>
    previewState.value === 'empty' ? 0 : currentData.value.total
  )
  const tableProps = computed(() => {
    const data = currentData.value
    return {
      ...tableBindings.value,
      rowData: previewState.value === 'empty' ? [] : data.rows,
      columnDefs: data.columns,
      treeData: data.tree,
      defaultExpandAll: data.tree,
      ...(isReorderScenario.value && {
        ...reorder.bindings,
        rowSelection: 'multiple' as const,
        pagination: false as const,
        persistence: false as const,
      }),
    }
  })

  const undoEdit = (): void => {
    if (!commands.undo()) message.info('当前没有可撤销的编辑')
  }

  const resetTable = (): void => {
    quickFilter.value = ''
    commands.resetView()
    message.success('表格视图已重置')
  }

  const exportCsv = async (): Promise<void> => {
    if (
      import.meta.env.VITE_DATA_MODE === 'remote' &&
      !isReorderScenario.value
    ) {
      await exportOrderTable()
      return
    }

    const exported = commands.exportCsv(
      `mach-table-orders-${new Date().toISOString().slice(0, 10)}.csv`
    )
    if (!exported) {
      message.warning('当前没有可导出的数据')
    }
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
