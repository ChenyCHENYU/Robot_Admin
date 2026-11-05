<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-05
 * @FilePath: \Robot_Admin\src\views\production-sales\shipping\c_report\index.vue
 * @Description: 按任务池筛选范围查看发运汇总并追溯原始任务
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <NModal
    v-model:show="visible"
    preset="card"
    title="发运汇总"
    size="small"
    :bordered="false"
    :style="{
      width: 'min(1000px, calc(100vw - 32px))',
      maxHeight: 'calc(100dvh - 48px)',
    }"
    v-bind="BUSINESS_DETAIL_DIALOG"
    @after-leave="activeKey = null"
  >
    <div
      class="shipping-report"
      data-testid="shipping-report"
    >
      <p class="shipping-report__scope">
        统计范围为任务池中符合已应用筛选的全部任务，共
        {{ totals.count }} 笔。
      </p>
      <dl class="shipping-report__totals">
        <div>
          <dt>计划重量 (t)</dt>
          <dd>{{ formatWeight(totals.plannedKg) }}</dd>
        </div>
        <div>
          <dt>已出厂重量 (t)</dt>
          <dd>{{ formatWeight(totals.departedKg) }}</dd>
        </div>
        <div>
          <dt>已出厂任务</dt>
          <dd>{{ totals.departedCount }} / {{ totals.count }}</dd>
        </div>
      </dl>
      <div class="shipping-report__filters">
        <span id="shipping-report-dimensions">分组维度</span>
        <NCheckboxGroup
          v-model:value="selectedDimensions"
          aria-labelledby="shipping-report-dimensions"
          @update:value="activeKey = null"
        >
          <NSpace :size="[12, 4]">
            <NCheckbox
              v-for="dimension in REPORT_DIMENSIONS"
              :key="dimension.key"
              :value="dimension.key"
              :label="dimension.label"
              size="small"
            />
          </NSpace>
        </NCheckboxGroup>
        <span class="shipping-report__hint">清空维度时仅显示总计</span>
      </div>
      <template v-if="activeGroup">
        <div class="shipping-report__drill">
          <NButton
            size="tiny"
            @click="activeKey = null"
            >返回分组汇总</NButton
          >
          <strong>{{ activeLabel }} · {{ activeGroup.count }} 笔任务</strong>
        </div>
        <C_Table
          :columns="taskColumns"
          :data="activeGroup.tasks"
          row-key="id"
          :config="taskConfig"
        />
      </template>
      <C_Table
        v-else
        :columns="columns"
        :data="groups"
        row-key="key"
        :config="groupConfig"
      >
        <template #empty>
          <NEmpty
            description="当前筛选暂无发运任务"
            size="small"
          />
        </template>
      </C_Table>
    </div>
    <template #footer>
      <div class="shipping-report__footer">
        <NButton
          size="small"
          @click="visible = false"
          >关闭汇总</NButton
        >
      </div>
    </template>
  </NModal>
</template>
<script setup lang="ts">
  import {
    defineTableColumns,
    defineTableConfig,
    type TableColumn,
  } from '@robot-admin/naive-ui-components/C_Table'
  import { SHIPMENT_STATES, type Shipment } from '../data'
  import {
    BUSINESS_DETAIL_DIALOG,
    statusTag,
    weightCodec,
  } from '../../shared/presentation'
  import {
    REPORT_DIMENSIONS,
    summarizeShipments,
    type ReportDimension,
    type ShipmentGroup,
  } from './data'

  defineOptions({ name: 'ShippingSummaryReport' })
  const props = defineProps<{ rows: readonly Shipment[] }>()
  const visible = defineModel<boolean>('show', { required: true })
  const selectedDimensions = ref<ReportDimension[]>(['destination', 'status'])
  const activeKey = ref<string | null>(null)
  const dimensions = computed(() =>
    REPORT_DIMENSIONS.filter(({ key }) =>
      selectedDimensions.value.includes(key)
    )
  )
  const summary = computed(() =>
    summarizeShipments(
      props.rows,
      dimensions.value.map(({ key }) => key)
    )
  )
  const totals = computed(() => summary.value.totals)
  const groups = computed(() => summary.value.groups)
  const activeGroup = computed(() =>
    activeKey.value === null
      ? undefined
      : groups.value.find(group => group.key === activeKey.value)
  )
  const activeLabel = computed(
    () =>
      activeGroup.value?.dimensions
        .map((value, index) =>
          dimensions.value[index]?.key === 'status'
            ? SHIPMENT_STATES[value as Shipment['status']].label
            : value
        )
        .join(' / ') || '全部任务'
  )
  const formatWeight = (kg: number) => weightCodec.format(kg / 1000)
  const renderStatus = (value: Shipment['status']) => {
    const { label, type } = SHIPMENT_STATES[value]
    return statusTag(label, type)
  }
  const dimensionColumns = computed<TableColumn<ShipmentGroup>[]>(() =>
    dimensions.value.length > 0
      ? dimensions.value.map(({ key, label }, index) => ({
          key,
          title: label,
          width: 112,
          render: (group: ShipmentGroup) =>
            key === 'status'
              ? renderStatus(group.dimensions[index] as Shipment['status'])
              : group.dimensions[index],
        }))
      : [
          {
            key: 'total',
            title: '汇总范围',
            width: 112,
            render: () => '全部任务',
          },
        ]
  )
  const indexColumn = { type: 'index' as const, title: '序号', width: 48 }
  const columns = computed<TableColumn<ShipmentGroup>[]>(() => [
    indexColumn,
    ...dimensionColumns.value,
    { key: 'count', title: '发运任务', width: 88 },
    { key: 'departedCount', title: '已出厂任务', width: 94 },
    {
      key: 'plannedKg',
      title: '计划重量 (t)',
      width: 116,
      render: group => formatWeight(group.plannedKg),
    },
    {
      key: 'departedKg',
      title: '已出厂重量 (t)',
      width: 126,
      render: group => formatWeight(group.departedKg),
    },
    {
      key: 'detail',
      title: '明细',
      width: 72,
      render: group =>
        h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            onClick: () => {
              activeKey.value = group.key
            },
          },
          () => '查看'
        ),
    },
  ])
  const taskColumns = defineTableColumns<Shipment>([
    indexColumn,
    { key: 'no', title: '发运单号', width: 154 },
    { key: 'customer', title: '客户', width: 116 },
    { key: 'destination', title: '目的地', width: 108 },
    { key: 'grade', title: '钢种', width: 94 },
    {
      key: 'status',
      title: '任务状态',
      width: 94,
      render: row => renderStatus(row.status),
    },
    {
      key: 'weightKg',
      title: '计划重量 (t)',
      width: 112,
      render: row => formatWeight(row.weightKg),
    },
  ])
  const display = {
    striped: true,
    singleLine: false,
    bordered: true,
    maxHeight: 320,
  }
  const groupConfig = computed(() =>
    defineTableConfig<ShipmentGroup>({
      density: 'compact',
      pagination: false,
      toolbar: { show: false },
      display: {
        ...display,
        scrollX: 544 + dimensionColumns.value.length * 112,
      },
    })
  )
  const taskConfig = defineTableConfig<Shipment>({
    density: 'compact',
    pagination: false,
    toolbar: { show: false },
    display: { ...display, scrollX: 726 },
  })
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
