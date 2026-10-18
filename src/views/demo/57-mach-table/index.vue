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

        <C_ActionBar
          :actions="featureActions"
          :config="{ size: 'small' }"
        />
      </div>

      <div class="mach-demo-toolbar">
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

        <C_ActionBar
          class="mach-demo-toolbar__actions"
          :actions="tableActions"
          :config="{ wrap: true, align: 'right', size: 'small' }"
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
              <span>{{ currentFeaturePresetLabel }}</span>
            </header>
            <div class="mach-feature-preset-grid">
              <button
                v-for="preset in MACH_FEATURE_PRESET_OPTIONS"
                :key="preset.value"
                type="button"
                class="mach-feature-preset"
                :class="{ 'is-active': featurePreset === preset.value }"
                :aria-pressed="featurePreset === preset.value"
                @click="applyFeaturePreset(preset.value)"
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
                  v-if="featurePreset === preset.value"
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
              v-model="featureSettings"
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
              :actions="featurePanelActions"
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
  const featureSettings = ref<MachFeatureSettings>({
    ...DEFAULT_MACH_FEATURE_SETTINGS,
  })
  const featurePreset = computed(
    () =>
      MACH_FEATURE_PRESET_OPTIONS.find(preset =>
        (
          Object.keys(
            DEFAULT_MACH_FEATURE_SETTINGS
          ) as (keyof MachFeatureSettings)[]
        ).every(key => featureSettings.value[key] === preset.settings[key])
      )?.value
  )
  const currentFeaturePresetLabel = computed(() =>
    featurePreset.value
      ? `当前：${MACH_FEATURE_PRESETS[featurePreset.value].label}`
      : '当前：自定义配置'
  )
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
  const totalRows = computed(() => {
    if (previewState.value === 'empty') return 0
    return isTreeScenario.value
      ? countTreeRows(treeRows)
      : orderCrud.total.value
  })

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
