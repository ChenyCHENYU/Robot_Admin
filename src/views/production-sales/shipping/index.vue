<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\shipping\index.vue
 * @Description: 发运协同 — C_Table 任务池、MachTable 库存与车辆配载
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <main
    class="ps-page shipping-page"
    data-testid="shipping-workbench"
  >
    <C_Density density="compact">
      <PageHeading
        title="发运协同指挥台"
        eyebrow="产销业务 / 销售物流"
        description="核对放行库存、配载重量与车辆载重，再生成装车单。"
        ><NButton
          size="small"
          @click="reportVisible = true"
          :render-icon="actionIcons.chartBoxOutline"
          >发运汇总</NButton
        ><NButton
          size="small"
          :disabled="current?.status !== 'loading'"
          @click="depart"
          :render-icon="actionIcons.truckCheckOutline"
          >确认出厂</NButton
        ><NButton
          type="primary"
          size="small"
          :loading="busy"
          :disabled="current?.status !== 'waiting' || missingStockKg > 0"
          @click="assign"
          :render-icon="actionIcons.clipboardTextOutline"
          >生成装车单</NButton
        ></PageHeading
      >
      <div
        class="shipping-stages"
        aria-label="发运阶段"
        ><button
          type="button"
          :class="{ 'is-active': appliedStage === null }"
          :aria-pressed="appliedStage === null"
          @click="filterStage(null)"
          ><span
            ><component :is="actionIcons.clipboardListOutline" />01 ·
            全部任务</span
          ><strong>{{ rows.length }}<small>笔</small></strong
          ><p>当前任务池</p></button
        ><button
          v-for="(stage, index) in stages"
          :key="stage.key"
          type="button"
          :class="{ 'is-active': appliedStage === stage.key }"
          :aria-pressed="appliedStage === stage.key"
          @click="filterStage(stage.key)"
          ><span
            ><component :is="stage.icon" />0{{ index + 2 }} ·
            {{ stage.label }}</span
          ><strong>{{ stage.count }}<small>笔</small></strong
          ><p>{{ STAGE_NOTES[stage.key] }}</p></button
        ></div
      >
      <C_FormSearch
        class="ps-search"
        v-model="query"
        :form-item-list="SHIPPING_FIELDS"
        :config="searchConfig"
      />
      <div class="shipping-workspace">
        <section
          class="ps-panel shipping-queue"
          aria-label="发运任务池"
          ><header class="ps-panel-heading"
            ><h2>当班发运任务池</h2
            ><span
              >{{ visibleRows.length }} / {{ rows.length }} 笔任务</span
            ></header
          ><div class="ps-toolbar"><C_ActionBar :actions="taskActions" /></div
          ><C_Table
            :columns="columns"
            :data="visibleRows"
            :row-props="rowProps"
            :config="taskTableConfig"
            @pagination-change="syncTaskPagination"
          >
            <template #empty>
              <NEmpty
                class="shipping-task-empty"
                size="small"
                :description="
                  rows.length ? '未找到匹配的发运任务' : '暂无发运任务'
                "
              >
                <template
                  v-if="rows.length"
                  #extra
                >
                  <NButton
                    size="small"
                    secondary
                    :render-icon="actionIcons.restore"
                    @click="clearTaskFilters"
                    >清除任务筛选</NButton
                  >
                </template>
              </NEmpty>
            </template> </C_Table
          ><p
            v-if="visibleRows.length"
            class="ps-footnote"
            >点击行安排配载，蓝色单号查看详情；已出厂任务保留记录，便于交付追溯。</p
          ></section
        >
        <section
          v-if="current"
          class="ps-panel shipping-vehicle"
          aria-label="车辆安排"
          ><header class="ps-panel-heading"
            ><h2>车辆安排</h2
            ><NSpace :size="6"
              ><NButton
                size="tiny"
                :disabled="current.status !== 'waiting' || busy"
                @click="restoreVehicle"
                :render-icon="actionIcons.restore"
                >恢复车辆</NButton
              ><NTag
                :type="SHIPMENT_STATES[current.status].type"
                :bordered="false"
                size="small"
                >{{ SHIPMENT_STATES[current.status].label }}</NTag
              ></NSpace
            ></header
          ><div class="shipping-current"
            ><strong>{{ current.no }}</strong
            ><span>{{ current.customer }} → {{ current.destination }}</span
            ><b
              >{{ weightCodec.format(current.weightKg / 1000) }}
              <small>t 计划发运</small></b
            ><p
              v-if="currentOutsideFilter"
              class="shipping-context-note"
            >
              当前任务不在筛选结果中，车辆草稿仍保留。
            </p></div
          ><C_Form
            ref="form"
            v-model="vehicle"
            :options="VEHICLE_FIELDS"
            :config="vehicleConfig"
            class="ps-form"
          /><div
            v-if="current.status === 'waiting'"
            class="shipping-load-check"
          >
            <strong>装车校核</strong>
            <dl>
              <div
                ><dt>放行库存</dt
                ><dd>{{ weightCodec.format(availableKg / 1000) }} t</dd></div
              >
              <div
                ><dt>待配重量</dt
                ><dd>{{ weightCodec.format(unallocatedKg / 1000) }} t</dd></div
              >
            </dl>
            <p
              v-if="missingStockKg"
              class="shipping-load-check__warning"
              data-testid="shipping-stock-gap"
            >
              放行库存不足，还缺
              {{ weightCodec.format(missingStockKg / 1000) }} t
            </p>
            <p
              v-else-if="overloaded"
              class="shipping-load-check__warning"
            >
              已选库存超过车辆额定载重
            </p>
            <p
              v-else-if="excessAllocationKg"
              class="shipping-load-check__warning"
            >
              已选库存超出计划
              {{ weightCodec.format(excessAllocationKg / 1000) }} t
            </p>
            <p v-else-if="unallocatedKg">勾选库存后核对车辆载重</p>
            <p v-else>重量已匹配，核对车辆信息后可生成装车单</p> </div
          ><p
            v-else
            class="shipping-vehicle-note"
          >
            装车单已建立，车辆资料用于交付追溯。
          </p></section
        >
        <section
          v-if="current"
          class="ps-panel shipping-stock"
          aria-label="库存匹配"
          ><header class="ps-panel-heading"
            ><h2
              >{{ current.no }} ·
              {{ current.status === 'waiting' ? '库存匹配' : '配载记录' }}</h2
            ><span
              >{{ current.grade }} / {{ current.destination }}</span
            ></header
          ><div class="ps-toolbar"
            ><NButton
              size="tiny"
              :disabled="!lots.length || current.status !== 'waiting'"
              @click="recommend"
              :render-icon="actionIcons.playlistCheck"
              >推荐配载</NButton
            ><span v-if="current.status !== 'waiting'"
              >已配 {{ weightCodec.format(current.weightKg / 1000) }} t</span
            ><span v-else-if="lots.length"
              >已选 {{ selectedLots.length }} 批 ·
              {{ weightCodec.format(selectedKg / 1000) }} t / 计划
              {{ weightCodec.format(current.weightKg / 1000) }} t</span
            ><span
              v-else
              data-testid="shipping-no-stock"
              >当前钢种暂无放行库存</span
            ></div
          ><div class="ps-grid shipping-stock-grid"
            ><MachTable
              v-bind="BUSINESS_CONTENT_GRID"
              :ref="stock.ref"
              :row-data="lots"
              :column-defs="lotColumns"
              :locale="STOCK_LOCALE"
              :row-selection="
                current.status === 'waiting' ? 'multiple' : 'none'
              "
              :theme="themeStore.isDark ? 'dark' : 'light'"
              @selection-changed="syncLots" /></div
          ><p class="ps-footnote"
            >仅匹配当前单据的钢种与质量放行库存；配载数量一致后可生成装车单。</p
          ></section
        >
      </div>
      <p
        role="status"
        class="ps-status-line"
        >{{ notice }}</p
      >
      <ShippingReport
        v-model:show="reportVisible"
        :rows="visibleRows"
      />
      <C_FormModal
        :editor="taskEditor"
        :options="SHIPMENT_EDIT_FIELDS"
        :config="BUSINESS_FORM"
        :mask-closable="false"
        create-text="建立任务"
      />
      <NModal
        v-model:show="detailVisible"
        v-if="detailShipment"
        preset="card"
        title="发运单详情"
        size="small"
        :bordered="false"
        :style="{
          width: 'min(800px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 48px)',
        }"
        v-bind="BUSINESS_DETAIL_DIALOG"
        class="ps-detail-modal"
      >
        <NDescriptions
          v-bind="BUSINESS_DETAIL"
          :column="2"
        >
          <NDescriptionsItem label="发运单号">{{
            detailShipment.no
          }}</NDescriptionsItem
          ><NDescriptionsItem label="状态">{{
            SHIPMENT_STATES[detailShipment.status].label
          }}</NDescriptionsItem>
          <NDescriptionsItem label="客户">{{
            detailShipment.customer
          }}</NDescriptionsItem
          ><NDescriptionsItem label="目的地">{{
            detailShipment.destination
          }}</NDescriptionsItem>
          <NDescriptionsItem label="钢种">{{
            detailShipment.grade
          }}</NDescriptionsItem
          ><NDescriptionsItem label="计划量"
            >{{
              weightCodec.format(detailShipment.weightKg / 1000)
            }}
            t</NDescriptionsItem
          >
          <NDescriptionsItem label="车辆">{{
            detailShipment.plate || '待安排'
          }}</NDescriptionsItem
          ><NDescriptionsItem label="窗口">{{
            detailShipment.window
          }}</NDescriptionsItem>
          <NDescriptionsItem label="驾驶员">{{
            detailShipment.vehicle?.driver || '待安排'
          }}</NDescriptionsItem
          ><NDescriptionsItem label="装车货位">{{
            detailShipment.vehicle?.gate || '待安排'
          }}</NDescriptionsItem>
        </NDescriptions>
        <NDivider :style="{ margin: '12px 0' }">交付进程</NDivider
        ><C_Timeline
          :items="[
            { id: 'created', title: '发运任务已建立', status: 'success' },
            {
              id: 'loading',
              title:
                detailShipment.status === 'waiting'
                  ? '等待库存匹配与车辆配载'
                  : '车辆已安排，装车单已建立',
              status:
                detailShipment.status === 'waiting' ? 'default' : 'success',
            },
            {
              id: 'departed',
              title:
                detailShipment.status === 'departed'
                  ? '车辆已确认出厂'
                  : '等待装车及出厂校核',
              status:
                detailShipment.status === 'departed' ? 'success' : 'default',
            },
          ]"
          size="small"
        />
        <template #footer
          ><NButton
            size="small"
            @click="detailVisible = false"
            :render-icon="actionIcons.close"
            >关闭详情</NButton
          ></template
        >
      </NModal>
    </C_Density>
  </main>
</template>
<script setup lang="ts">
  import { actionIcons } from '../shared/actionIcons'
  import '@agile-team/mach-table-vue/styles.css'
  import { MachTable } from '@agile-team/mach-table-vue'
  import { s_themeStore } from '@/stores/theme'
  import PageHeading from '../components/c_pageHeading/index.vue'
  import ShippingReport from './c_report/index.vue'
  import {
    BUSINESS_DETAIL,
    BUSINESS_DETAIL_DIALOG,
    BUSINESS_CONTENT_GRID,
    BUSINESS_FORM,
    weightCodec,
  } from '../shared/presentation'
  import { SHIPMENT_EDIT_FIELDS } from './operations'
  import {
    useShippingWorkbench,
    SHIPMENT_STATES,
    SHIPPING_FIELDS,
    VEHICLE_FIELDS,
    STAGE_NOTES,
    STOCK_LOCALE,
  } from './data'
  defineOptions({ name: 'ShippingCollaborationWorkbench' })
  const themeStore = s_themeStore()
  const reportVisible = ref(false)
  const {
    rows,
    current,
    query,
    appliedStage,
    searchConfig,
    clearTaskFilters,
    visibleRows,
    currentOutsideFilter,
    taskTableConfig,
    syncTaskPagination,
    stages,
    form,
    vehicle,
    vehicleConfig,
    stock,
    lots,
    availableKg,
    missingStockKg,
    unallocatedKg,
    excessAllocationKg,
    overloaded,
    selectedLots,
    selectedKg,
    columns,
    rowProps,
    detailShipment,
    lotColumns,
    busy,
    notice,
    filterStage,
    syncLots,
    recommend,
    assign,
    depart,
    restoreVehicle,
    taskEditor,
    taskActions,
    detailVisible,
  } = useShippingWorkbench()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
