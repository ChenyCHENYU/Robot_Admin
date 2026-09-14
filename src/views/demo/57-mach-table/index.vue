<template>
  <div class="mach-table-demo">
    <c_vTitle
      title="Mach Table 场景示例"
      icon="mdi:table-large"
      description="框架无关 Core + Vue 适配层：标准 CRUD、按需行内编辑与企业级数据工作台"
    />

    <div class="mach-overview">
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

        <C_ActionBar :actions="featureActions" />
      </div>

      <div class="mach-demo-toolbar">
        <NInput
          v-model:value="quickFilter"
          class="mach-demo-toolbar__search"
          clearable
          placeholder="搜索订单、客户、产品或区域"
        >
          <template #prefix><C_Icon name="mdi:magnify" /></template>
        </NInput>

        <C_ActionBar
          class="mach-demo-toolbar__actions"
          :actions="tableActions"
          :config="{ wrap: true, align: 'right' }"
        />
      </div>

      <NAlert
        class="mach-tip"
        type="info"
        :show-icon="false"
      >
        {{ scenarioTip }}
      </NAlert>

      <div class="mach-grid-shell">
        <MachTable
          v-bind="tableBindings"
          :ref="table.ref"
          class="mach-demo-grid"
          :column-defs="machTableColumns"
          :row-data="displayRows"
          :tree-data="isTreeScenario"
          :default-expand-all="isTreeScenario"
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
      v-model:show="showFeatureDrawer"
      width="min(560px, 94vw)"
      placement="right"
    >
      <NDrawerContent
        title="MachTable 功能配置"
        closable
      >
        <div class="mach-feature-panel">
          <NAlert
            type="info"
            :show-icon="false"
          >
            普通选项会即时、原子地更新当前表格；需要专用列或数据结构的能力单独标识，不会制造无效组合。
          </NAlert>

          <div class="mach-feature-presets">
            <div>
              <strong>场景预设</strong>
              <span>一键体验常见组合，也可以继续逐项调整。</span>
            </div>
            <NSelect
              v-model:value="featurePreset"
              class="mach-feature-presets__select"
              :options="MACH_FEATURE_PRESET_OPTIONS"
              @update:value="applyFeaturePreset"
            />
          </div>

          <div class="mach-feature-preview">
            <div>
              <strong>状态预览</strong>
              <span>直接检查内置加载态、空态和正常数据，不修改业务数据。</span>
            </div>
            <NSelect
              v-model:value="previewState"
              class="mach-feature-preview__select"
              :options="TABLE_PREVIEW_OPTIONS"
            />
          </div>

          <section
            v-for="group in MACH_FEATURE_GROUPS"
            :key="group.key"
            class="mach-feature-group"
          >
            <header>
              <strong>{{ group.title }}</strong>
              <span>{{ group.description }}</span>
            </header>
            <C_Form
              v-model="featureSettings"
              :options="group.options"
              :config="MACH_FEATURE_FORM_CONFIG"
            />
          </section>

          <section class="mach-feature-group">
            <header>
              <strong>结构化与扩展能力</strong>
              <span
                >这些能力需要匹配的数据模型或独立入口，不能伪装成普通开关。</span
              >
            </header>
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
          </section>

          <C_ActionBar
            :actions="featurePanelActions"
            :config="{ align: 'space-between' }"
          />
        </div>
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
  import { defineActions } from '@robot-admin/naive-ui-components/C_ActionBar'
  import '@agile-team/mach-table-vue/styles.css'
  import { s_themeStore } from '@/stores/theme'
  import {
    DEFAULT_MACH_FEATURE_SETTINGS,
    MACH_FEATURE_FORM_CONFIG,
    MACH_FEATURE_GROUPS,
    MACH_FEATURE_PRESET_OPTIONS,
    MACH_FEATURE_PRESETS,
    MACH_SCENE_CAPABILITIES,
    ORDER_FORM_CONFIG,
    ORDER_FORM_OPTIONS,
    ORDER_TABLE_CONFIG,
    TABLE_SCENARIOS,
    TABLE_SCENARIO_TABS,
    TABLE_PREVIEW_OPTIONS,
    createOrderColumns,
    createOrderTreeColumns,
    createOrderTreeRows,
    exportOrderTable,
    toMachFeatureOptions,
    useOrderTable,
    type MachFeaturePreset,
    type MachFeatureSettings,
    type OrderRow,
    type OrderTreeRow,
    type TablePreviewState,
    type TableScenario,
  } from './data'

  defineOptions({ name: 'MachTableDemo' })

  const message = useMessage()
  const dialog = useDialog()
  const themeStore = s_themeStore()
  const orderCrud = useOrderTable()
  const { rows } = orderCrud
  const activeScenario = ref<TableScenario>('crud')
  const previewState = ref<TablePreviewState>('data')
  const treeRows = createOrderTreeRows()
  const showFeatureDrawer = ref(false)
  const featurePreset = ref<MachFeaturePreset>('standard')
  const featureSettings = ref<MachFeatureSettings>({
    ...DEFAULT_MACH_FEATURE_SETTINGS,
  })
  const currentScenario = computed(() => TABLE_SCENARIOS[activeScenario.value])
  const inlineEditMode = computed(() => currentScenario.value.editMode)
  const scenarioTip = computed(() => currentScenario.value.tip)
  const isTreeScenario = computed(() => activeScenario.value === 'tree')
  const countTreeRows = (items: OrderTreeRow[]): number =>
    items.reduce(
      (total, item) => total + 1 + countTreeRows(item.children ?? []),
      0
    )
  const displayRows = computed(() => {
    if (previewState.value === 'empty') return []
    return isTreeScenario.value ? treeRows : rows.value
  })
  const totalRows = computed(() =>
    isTreeScenario.value
      ? countTreeRows(treeRows)
      : previewState.value === 'empty'
        ? 0
        : orderCrud.total.value
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
    if (activeScenario.value !== 'cell') return
    await orderCrud.save({ ...event.data })
  }

  const handleRowEditingStopped = async (
    event: RowEditingStoppedEvent<OrderRow>
  ): Promise<void> => {
    if (activeScenario.value !== 'row') return
    if (event.cancelled) {
      message.info(`订单 ${event.data.orderNo} 的整行修改已取消`)
      return
    }
    if (event.changes.length) await orderCrud.save({ ...event.data })
  }

  const handleScenarioChange = async (): Promise<void> => {
    previewState.value = 'data'
    commands.clearSelection()
    await tableApi.value?.editing.stop({ cancel: true })
  }

  const handleGridError = (event: GridErrorEvent<OrderRow>): void => {
    console.error('[MachTable]', event)
    message.error('表格运行异常，请查看控制台诊断信息')
  }

  const grid = useMachTableController({
    config: ORDER_TABLE_CONFIG,
    loading: () => orderCrud.loading.value || previewState.value === 'loading',
    theme: () => (themeStore.isDark ? 'dark' : 'light'),
    editMode: inlineEditMode,
    onCellValueChanged: handleCellValueChanged,
    onRowEditingStopped: handleRowEditingStopped,
    onGridError: handleGridError,
  })
  const { table, bindings: tableBindings, selectedCount, commands } = grid
  const { api: tableApi, ready } = table
  const quickFilter = grid.search

  const syncFeatureSettings = (): void => {
    const api = tableApi.value
    if (!api) return
    api.batch(currentApi => {
      currentApi.updateOptions(toMachFeatureOptions(featureSettings.value))
      if (featureSettings.value.rowSelection === 'none') {
        currentApi.selection.clear()
      }
    })
  }

  watch(featureSettings, syncFeatureSettings, { deep: true, flush: 'post' })
  watch(ready, isReady => {
    if (isReady) syncFeatureSettings()
  })

  const applyFeaturePreset = (value: string | number | null): void => {
    if (typeof value !== 'string' || !(value in MACH_FEATURE_PRESETS)) return
    const preset = value as MachFeaturePreset
    featurePreset.value = preset
    featureSettings.value = { ...MACH_FEATURE_PRESETS[preset].settings }
    message.success(`已应用“${MACH_FEATURE_PRESETS[preset].label}”配置`)
  }

  const copyFeatureConfig = async (): Promise<void> => {
    try {
      const config = toMachFeatureOptions(featureSettings.value)
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2))
      message.success('当前最小配置已复制')
    } catch {
      message.warning('浏览器未授权剪贴板，请手动复制')
    }
  }

  const resetFeatureSettings = (): void => {
    featurePreset.value = 'standard'
    featureSettings.value = { ...DEFAULT_MACH_FEATURE_SETTINGS }
    message.success('已恢复企业列表推荐配置')
  }

  const featureActions = defineActions([
    {
      key: 'settings',
      onClick: () => {
        showFeatureDrawer.value = true
      },
    },
  ])

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
      onClick: () => openColumnWorkbench(),
    },
    {
      key: 'select-all',
      label: '全选筛选结果',
      icon: 'mdi:select-all',
      show: () => featureSettings.value.rowSelection === 'multiple',
      disabled: () => !ready.value,
      onClick: () => commands.selectAll(),
    },
    {
      key: 'clear-selection',
      label: '清空选择',
      icon: 'mdi:selection-remove',
      show: () => featureSettings.value.rowSelection !== 'none',
      disabled: () => !selectedCount.value,
      onClick: () => commands.clearSelection(),
    },
    {
      key: 'undo',
      label: '撤销编辑',
      icon: 'mdi:undo-variant',
      show: () =>
        activeScenario.value === 'cell' || activeScenario.value === 'row',
      disabled: () => !ready.value,
      onClick: () => undoEdit(),
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

  const featurePanelActions = defineActions([
    {
      key: 'reset',
      label: '恢复推荐配置',
      onClick: resetFeatureSettings,
    },
    {
      key: 'copy-config',
      label: '复制当前配置',
      icon: 'mdi:content-copy',
      type: 'primary',
      onClick: copyFeatureConfig,
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
  const machTableColumns = computed(() =>
    isTreeScenario.value ? treeColumns : orderColumns
  )

  const undoEdit = (): void => {
    if (!commands.undo()) message.info('当前没有可撤销的编辑')
  }

  const openColumnWorkbench = (): void => {
    commands.openColumns()
  }

  const resetTable = (): void => {
    quickFilter.value = ''
    commands.resetView()
    message.success('表格视图已重置')
  }

  const exportCsv = async (): Promise<void> => {
    if (import.meta.env.VITE_DATA_MODE === 'remote') {
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
