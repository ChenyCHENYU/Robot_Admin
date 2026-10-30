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
        description="从发运任务到库存匹配、车辆配载与出厂，围绕交付组织每一步。"
        ><NButton
          size="small"
          :disabled="current.status !== 'loading'"
          @click="depart"
          >确认出厂</NButton
        ><NButton
          type="primary"
          size="small"
          :loading="busy"
          :disabled="current.status !== 'waiting'"
          @click="assign"
          >生成装车单</NButton
        ></PageHeading
      >
      <div
        class="shipping-stages"
        aria-label="发运阶段"
        ><button
          type="button"
          :class="{ 'is-active': query.status === null }"
          @click="filterStage(null)"
          ><span>01 · 全部任务</span
          ><strong>{{ rows.length }}<small>笔发运任务</small></strong
          ><p>围绕当班装车窗口推进交付</p></button
        ><button
          v-for="(stage, index) in stages"
          :key="stage.key"
          type="button"
          :class="{ 'is-active': query.status === stage.key }"
          @click="filterStage(stage.key)"
          ><span>0{{ index + 2 }} · {{ stage.label }}</span
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
            ><span>{{ visibleRows.length }} 笔 · 点击行安排配载</span></header
          ><div class="ps-toolbar"
            ><C_ActionBar
              :actions="taskActions"
              :config="{ compact: true, size: 'tiny' }" /></div
          ><C_Table
            :columns="columns"
            :data="visibleRows"
            :row-props="rowProps"
            row-key="id"
            :config="SHIPMENT_TABLE_CONFIG"
          /><p class="ps-footnote"
            >点击行安排配载，蓝色单号查看详情；已出厂任务保留记录，便于交付追溯。</p
          ></section
        >
        <section
          class="ps-panel shipping-vehicle"
          aria-label="车辆安排"
          ><header class="ps-panel-heading"
            ><h2>车辆安排</h2
            ><NSpace :size="6"
              ><NButton
                size="tiny"
                :disabled="current.status !== 'waiting' || busy"
                @click="restoreVehicle"
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
            ></div
          ><C_Form
            ref="form"
            v-model="vehicle"
            :options="VEHICLE_FIELDS"
            :config="vehicleConfig"
            class="ps-form"
          /><div class="shipping-vehicle-note"
            ><span class="shipping-signal"></span
            >车辆、库存与发运计划重量须一致</div
          ></section
        >
        <section
          class="ps-panel shipping-stock"
          aria-label="库存匹配"
          ><header class="ps-panel-heading"
            ><h2>{{ current.no }} · 库存匹配</h2
            ><span
              >{{ current.grade }} / {{ current.destination }}</span
            ></header
          ><div class="ps-toolbar"
            ><NButton
              size="tiny"
              @click="recommend"
              >推荐配载</NButton
            ><span
              >已选 {{ selectedLots.length }} 批 ·
              {{ weightCodec.format(selectedKg / 1000) }} t / 计划
              {{ weightCodec.format(current.weightKg / 1000) }} t</span
            ></div
          ><div class="ps-grid shipping-stock-grid"
            ><MachTable
              v-bind="BUSINESS_GRID"
              :ref="stock.ref"
              :row-data="lots"
              :column-defs="lotColumns"
              row-selection="multiple"
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
        content-style="min-height: 0; overflow: auto"
        class="ps-detail-modal"
      >
        <NDescriptions
          :column="2"
          bordered
          size="small"
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
        <NDivider>交付进程</NDivider
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
            >关闭详情</NButton
          ></template
        >
      </NModal>
    </C_Density>
  </main>
</template>
<script setup lang="ts">
  import '@agile-team/mach-table-vue/styles.css'
  import { MachTable } from '@agile-team/mach-table-vue'
  import { s_themeStore } from '@/stores/theme'
  import PageHeading from '../components/c_pageHeading/index.vue'
  import {
    BUSINESS_GRID,
    BUSINESS_FORM,
    weightCodec,
  } from '../shared/presentation'
  import { SHIPMENT_EDIT_FIELDS } from './operations'
  import {
    useShippingWorkbench,
    SHIPMENT_STATES,
    SHIPPING_FIELDS,
    VEHICLE_FIELDS,
    SHIPMENT_TABLE_CONFIG,
    STAGE_NOTES,
  } from './data'
  defineOptions({ name: 'ShippingCollaborationWorkbench' })
  const themeStore = s_themeStore()
  const {
    rows,
    current,
    query,
    searchConfig,
    visibleRows,
    stages,
    form,
    vehicle,
    vehicleConfig,
    stock,
    lots,
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
