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
          :aria-expanded="viewsVisible"
          aria-controls="shipping-views"
          :render-icon="actionIcons.clipboardListOutline"
          @click="viewsVisible = !viewsVisible"
          >看板与排班</NButton
        ><NButton
          size="small"
          @click="reportVisible = true"
          :render-icon="actionIcons.chartBoxOutline"
          >发运汇总</NButton
        ><NButton
          size="small"
          :disabled="view.tasks.current?.status !== 'loading'"
          @click="view.depart"
          :render-icon="actionIcons.truckCheckOutline"
          >确认出厂</NButton
        ><NButton
          type="primary"
          size="small"
          :loading="view.vehicle.busy"
          :disabled="
            view.tasks.current?.status !== 'waiting' ||
            view.inventory.missingKg > 0
          "
          @click="view.vehicle.assign"
          :render-icon="actionIcons.clipboardTextOutline"
          >生成装车单</NButton
        ></PageHeading
      >
      <div
        class="shipping-stages"
        aria-label="发运阶段"
        ><button
          type="button"
          :class="{ 'is-active': view.search.stage === null }"
          :aria-pressed="view.search.stage === null"
          @click="view.search.filterStage(null)"
          ><span
            ><component :is="actionIcons.clipboardListOutline" />01 ·
            全部任务</span
          ><strong>{{ view.tasks.allRows.length }}<small>笔</small></strong
          ><p>当前任务池</p></button
        ><button
          v-for="(stage, index) in view.tasks.stages"
          :key="stage.key"
          type="button"
          :class="{ 'is-active': view.search.stage === stage.key }"
          :aria-pressed="view.search.stage === stage.key"
          @click="view.search.filterStage(stage.key)"
          ><span
            ><component :is="stage.icon" />0{{ index + 2 }} ·
            {{ stage.label }}</span
          ><strong>{{ stage.count }}<small>笔</small></strong
          ><p>{{ STAGE_NOTES[stage.key] }}</p></button
        ></div
      >
      <C_FormSearch
        class="ps-search"
        v-model="view.search.query"
        :form-item-list="SHIPPING_FIELDS"
        :config="view.search.config"
      />
      <section
        v-if="viewsVisible"
        id="shipping-views"
        class="ps-panel shipping-views"
        aria-label="发运看板与排班"
      >
        <NSpace
          role="group"
          aria-label="切换发运视图"
          :size="8"
        >
          <NButton
            size="small"
            :type="shippingView === 'board' ? 'primary' : 'default'"
            :aria-pressed="shippingView === 'board'"
            :render-icon="actionIcons.clipboardListOutline"
            @click="shippingView = 'board'"
            >发运看板</NButton
          >
          <NButton
            size="small"
            :type="shippingView === 'schedule' ? 'primary' : 'default'"
            :aria-pressed="shippingView === 'schedule'"
            :render-icon="actionIcons.history"
            @click="shippingView = 'schedule'"
            >装车排班</NButton
          >
        </NSpace>
        <template v-if="shippingView === 'board'">
          <p class="ps-footnote"
            >当前任务 {{ view.tasks.current?.no }} ·
            核对库存与车辆后，可在看板生成装车单或确认出厂。</p
          >
          <C_TaskBoard
            title="发运任务状态"
            :columns="view.board.columns"
            :tasks="view.board.tasks"
            :disabled="view.vehicle.busy"
            :can-move="view.board.canMove"
            draggable
            @move-request="view.board.move"
          >
            <template #card="{ task }">
              <NButton
                size="tiny"
                text
                :disabled="view.vehicle.busy"
                :render-icon="actionIcons.clipboardTextOutline"
                @click.stop="view.tasks.choose(task.key)"
                >{{ task.title }}</NButton
              >
              <span class="shipping-card-customer"
                >{{ task.shipment.customer }} ·
                {{ task.shipment.destination }}</span
              >
            </template>
          </C_TaskBoard>
        </template>
        <template v-else>
          <p class="ps-footnote">
            2026-10-29 · 本地班次预排。选中预约可查看占用与冲突。
            <template
              v-if="view.tasks.allRows.length !== view.schedule.bookings.length"
              >{{
                view.tasks.allRows.length - view.schedule.bookings.length
              }}
              项装车窗口格式无效，未列入排班。</template
            >
          </p>
          <C_ResourceSchedule
            v-model="bookingKey"
            v-model:range="bookingRange"
            title="装车位预约"
            time-zone="Asia/Shanghai"
            :resources="view.schedule.resources"
            :bookings="view.schedule.bookings"
            navigation
          />
        </template>
      </section>
      <div class="shipping-workspace">
        <section
          class="ps-panel shipping-queue"
          aria-label="发运任务池"
          ><header class="ps-panel-heading"
            ><h2>当班发运任务池</h2
            ><span
              >{{ view.tasks.rows.length }} /
              {{ view.tasks.allRows.length }} 笔任务</span
            ></header
          ><div class="ps-toolbar"
            ><C_ActionBar :actions="view.tasks.actions" /></div
          ><C_Table
            :columns="view.tasks.columns"
            :data="view.tasks.rows"
            :row-props="view.tasks.rowProps"
            :config="view.tasks.config"
            @pagination-change="view.tasks.syncPagination"
          >
            <template #empty>
              <NEmpty
                class="shipping-task-empty"
                size="small"
                :description="
                  view.tasks.allRows.length
                    ? '未找到匹配的发运任务'
                    : '暂无发运任务'
                "
              >
                <template
                  v-if="view.tasks.allRows.length"
                  #extra
                >
                  <NButton
                    size="small"
                    secondary
                    :render-icon="actionIcons.restore"
                    @click="view.search.clear"
                    >清除任务筛选</NButton
                  >
                </template>
              </NEmpty>
            </template> </C_Table
          ><p
            v-if="view.tasks.rows.length"
            class="ps-footnote"
            >点击行安排配载，蓝色单号查看详情；已出厂任务保留记录，便于交付追溯。</p
          ></section
        >
        <section
          v-if="view.tasks.current"
          class="ps-panel shipping-vehicle"
          aria-label="车辆安排"
          ><header class="ps-panel-heading"
            ><h2>车辆安排</h2
            ><NSpace :size="6"
              ><NButton
                size="tiny"
                :disabled="
                  view.tasks.current.status !== 'waiting' || view.vehicle.busy
                "
                @click="view.restoreVehicle"
                :render-icon="actionIcons.restore"
                >恢复车辆</NButton
              ><NTag
                :type="SHIPMENT_STATES[view.tasks.current.status].type"
                :bordered="false"
                size="small"
                >{{ SHIPMENT_STATES[view.tasks.current.status].label }}</NTag
              ></NSpace
            ></header
          ><div class="shipping-current"
            ><strong>{{ view.tasks.current.no }}</strong
            ><span
              >{{ view.tasks.current.customer }} →
              {{ view.tasks.current.destination }}</span
            ><b
              >{{ weightCodec.format(view.tasks.current.weightKg / 1000) }}
              <small>t 计划发运</small></b
            ><p
              v-if="view.tasks.outsideFilter"
              class="shipping-context-note"
            >
              当前任务不在筛选结果中，车辆草稿仍保留。
            </p></div
          ><C_Form
            ref="form"
            v-model="view.vehicle.data"
            :options="VEHICLE_FIELDS"
            :config="view.vehicle.config"
            class="ps-form"
          /><div
            v-if="view.tasks.current.status === 'waiting'"
            class="shipping-load-check"
          >
            <strong>装车校核</strong>
            <dl>
              <div
                ><dt>放行库存</dt
                ><dd
                  >{{
                    weightCodec.format(view.inventory.availableKg / 1000)
                  }}
                  t</dd
                ></div
              >
              <div
                ><dt>待配重量</dt
                ><dd
                  >{{
                    weightCodec.format(view.inventory.unallocatedKg / 1000)
                  }}
                  t</dd
                ></div
              >
            </dl>
            <p
              v-if="view.inventory.missingKg"
              class="shipping-load-check__warning"
              data-testid="shipping-stock-gap"
            >
              放行库存不足，还缺
              {{ weightCodec.format(view.inventory.missingKg / 1000) }} t
            </p>
            <p
              v-else-if="view.inventory.overloaded"
              class="shipping-load-check__warning"
            >
              已选库存超过车辆额定载重
            </p>
            <p
              v-else-if="view.inventory.excessKg"
              class="shipping-load-check__warning"
            >
              已选库存超出计划
              {{ weightCodec.format(view.inventory.excessKg / 1000) }} t
            </p>
            <p v-else-if="view.inventory.unallocatedKg"
              >勾选库存后核对车辆载重</p
            >
            <p v-else>重量已匹配，核对车辆信息后可生成装车单</p> </div
          ><p
            v-else
            class="shipping-vehicle-note"
          >
            装车单已建立，车辆资料用于交付追溯。
          </p></section
        >
        <section
          v-if="view.tasks.current"
          class="ps-panel shipping-stock"
          aria-label="库存匹配"
          ><header class="ps-panel-heading"
            ><h2
              >{{ view.tasks.current.no }} ·
              {{
                view.tasks.current.status === 'waiting'
                  ? '库存匹配'
                  : '配载记录'
              }}</h2
            ><span
              >{{ view.tasks.current.grade }} /
              {{ view.tasks.current.destination }}</span
            ></header
          ><div class="ps-toolbar"
            ><NButton
              size="tiny"
              :disabled="
                !view.inventory.rows.length ||
                view.tasks.current.status !== 'waiting'
              "
              @click="view.inventory.recommend"
              :render-icon="actionIcons.playlistCheck"
              >推荐配载</NButton
            ><span v-if="view.tasks.current.status !== 'waiting'"
              >已配
              {{ weightCodec.format(view.tasks.current.weightKg / 1000) }}
              t</span
            ><span v-else-if="view.inventory.rows.length"
              >已选 {{ view.inventory.selected.length }} 批 ·
              {{ weightCodec.format(view.inventory.selectedKg / 1000) }} t /
              计划
              {{ weightCodec.format(view.tasks.current.weightKg / 1000) }}
              t</span
            ><span
              v-else
              data-testid="shipping-no-stock"
              >当前钢种暂无放行库存</span
            ></div
          ><div class="ps-grid shipping-stock-grid"
            ><MachTable
              v-bind="BUSINESS_CONTENT_GRID"
              :ref="view.inventory.grid.ref"
              :row-data="view.inventory.rows"
              :column-defs="view.inventory.columns"
              :locale="STOCK_LOCALE"
              :row-selection="
                view.tasks.current.status === 'waiting' ? 'multiple' : 'none'
              "
              :theme="themeStore.isDark ? 'dark' : 'light'"
              @selection-changed="view.inventory.sync" /></div
          ><p class="ps-footnote"
            >仅匹配当前单据的钢种与质量放行库存；配载数量一致后可生成装车单。</p
          ></section
        >
      </div>
      <p
        role="status"
        class="ps-status-line"
        >{{ view.notice }}</p
      >
      <ShippingReport
        v-model:show="reportVisible"
        :rows="view.tasks.rows"
      />
      <C_FormModal
        :editor="view.tasks.editor"
        :options="SHIPMENT_EDIT_FIELDS"
        :config="BUSINESS_FORM"
        :mask-closable="false"
        create-text="建立任务"
      />
      <NModal
        v-model:show="view.inspection.visible"
        v-if="view.inspection.shipment"
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
            view.inspection.shipment.no
          }}</NDescriptionsItem
          ><NDescriptionsItem label="状态">{{
            SHIPMENT_STATES[view.inspection.shipment.status].label
          }}</NDescriptionsItem>
          <NDescriptionsItem label="客户">{{
            view.inspection.shipment.customer
          }}</NDescriptionsItem
          ><NDescriptionsItem label="目的地">{{
            view.inspection.shipment.destination
          }}</NDescriptionsItem>
          <NDescriptionsItem label="钢种">{{
            view.inspection.shipment.grade
          }}</NDescriptionsItem
          ><NDescriptionsItem label="计划量"
            >{{
              weightCodec.format(view.inspection.shipment.weightKg / 1000)
            }}
            t</NDescriptionsItem
          >
          <NDescriptionsItem label="车辆">{{
            view.inspection.shipment.plate || '待安排'
          }}</NDescriptionsItem
          ><NDescriptionsItem label="窗口">{{
            view.inspection.shipment.window
          }}</NDescriptionsItem>
          <NDescriptionsItem label="驾驶员">{{
            view.inspection.shipment.vehicle?.driver || '待安排'
          }}</NDescriptionsItem
          ><NDescriptionsItem label="装车货位">{{
            view.inspection.shipment.vehicle?.gate || '待安排'
          }}</NDescriptionsItem>
        </NDescriptions>
        <NDivider :style="{ margin: '12px 0' }">交付进程</NDivider
        ><C_Timeline
          :items="[
            { id: 'created', title: '发运任务已建立', status: 'success' },
            {
              id: 'loading',
              title:
                view.inspection.shipment.status === 'waiting'
                  ? '等待库存匹配与车辆配载'
                  : '车辆已安排，装车单已建立',
              status:
                view.inspection.shipment.status === 'waiting'
                  ? 'default'
                  : 'success',
            },
            {
              id: 'departed',
              title:
                view.inspection.shipment.status === 'departed'
                  ? '车辆已确认出厂'
                  : '等待装车及出厂校核',
              status:
                view.inspection.shipment.status === 'departed'
                  ? 'success'
                  : 'default',
            },
          ]"
          size="small"
        />
        <template #footer
          ><NButton
            size="small"
            @click="view.inspection.visible = false"
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
  import {
    BUSINESS_DETAIL,
    BUSINESS_DETAIL_DIALOG,
    BUSINESS_CONTENT_GRID,
    BUSINESS_FORM,
    weightCodec,
  } from '../shared/presentation'
  import { SHIPMENT_EDIT_FIELDS } from './operations'
  import {
    SHIPMENT_STATES,
    SHIPPING_FIELDS,
    VEHICLE_FIELDS,
    STAGE_NOTES,
    STOCK_LOCALE,
    SHIPPING_SHIFT,
  } from './data'
  import { useShippingWorkbench } from './useShippingWorkbench'
  import PageHeading from '../components/PageHeading/index.vue'
  import ShippingReport from './components/ShippingReport/index.vue'
  defineOptions({ name: 'ShippingCollaborationWorkbench' })
  const themeStore = s_themeStore()
  const reportVisible = ref(false)
  const viewsVisible = ref(false)
  const shippingView = ref('board')
  const bookingKey = ref<string | null>(null)
  const bookingRange = ref(SHIPPING_SHIFT)
  const controller = useShippingWorkbench()
  const view = proxyRefs(controller)
  const { form } = controller
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
