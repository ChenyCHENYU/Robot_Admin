<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\production-actual\index.vue
 * @Description: 炉次实绩工作台 — 炉次切换、密集表单、成分对标与过程时间线
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <main
    ref="container"
    class="ps-page actual-page"
    data-testid="production-actual"
  >
    <C_Density density="compact">
      <PageHeading
        title="炉次实绩记录"
        eyebrow="产销业务 / 生产中心"
        description="按炉次录入实绩，核对成分偏差并完成复核追溯。"
      >
        <NTag
          :type="entry.dirty ? 'warning' : 'success'"
          size="small"
          :bordered="false"
          >{{ entry.dirty ? '有未保存实绩' : '已保存' }}</NTag
        ><NButton
          v-if="!trace.visible"
          size="small"
          :disabled="entry.saving || review.locked"
          @click="entry.restore"
          :render-icon="actionIcons.restore"
          >恢复记录</NButton
        ><NButton
          v-if="!trace.visible"
          type="primary"
          size="small"
          :loading="entry.saving"
          :disabled="review.locked"
          @click="entry.save"
          :render-icon="actionIcons.contentSaveOutline"
          >保存实绩</NButton
        >
      </PageHeading>
      <div class="ps-panel ps-toolbar"
        ><C_ActionBar
          :actions="review.reviewActions"
          :config="{ compact: true, size: 'small' }"
        /><NSpace :size="8">
          <NButton
            size="small"
            :type="trace.visible ? 'primary' : 'default'"
            :aria-pressed="trace.visible"
            @click="trace.visible = !trace.visible"
            :render-icon="actionIcons.chartTimelineVariant"
            >工序追踪</NButton
          ><NButton
            size="small"
            :disabled="!comparison.previous"
            @click="comparison.visible = true"
            :render-icon="actionIcons.history"
            >上一炉参考</NButton
          >
        </NSpace></div
      >
      <div class="actual-workspace">
        <aside class="actual-sidebar">
          <section class="ps-panel"
            ><header class="ps-panel-heading"
              ><h2>当班炉次</h2><span>{{ heats.items.length }} 炉</span></header
            ><C_RecordList
              class="actual-heat-list"
              :items="heats.items"
              :item-key="heats.key"
              :item-view="heats.describe"
              :model-value="heats.current.id"
              aria-label="当班炉次列表"
              selectable
              @update:model-value="heats.select"
            />
            ></section
          >
          <div
            v-show="!trace.visible"
            class="ps-panel actual-section-nav"
            ><C_SectionNav
              :items="entry.sections"
              v-model="entry.activeSection"
              aria-label="实绩分区导航"
              @select="entry.navigate"
          /></div>
        </aside>
        <div class="actual-main">
          <section class="actual-context ps-panel"
            ><div
              ><span class="actual-context__label">当前炉次</span
              ><h2>{{ heats.current.no }}</h2
              ><p
                >{{ heats.current.furnace }} · {{ heats.current.grade }} · 连铸
                1 号机</p
              ></div
            ><dl
              ><div
                ><dt>出钢量</dt
                ><dd>{{ entry.model.output ?? '—' }}<small>t</small></dd></div
              ><div
                ><dt>出钢温度</dt
                ><dd
                  >{{ entry.model.temperature ?? '—' }}<small>℃</small></dd
                ></div
              ><div
                ><dt>成分偏差</dt
                ><dd
                  :class="{
                    'is-warning': chemistry.deviations.length > 0,
                  }"
                  >{{ chemistry.deviations.length }}<small>项待复核</small></dd
                ></div
              ></dl
            ></section
          >
          <section
            v-for="(group, index) in entry.groups"
            v-show="!trace.visible"
            :key="group.key"
            :data-section="group.key"
            class="ps-panel actual-form-section"
            :aria-label="group.title"
            tabindex="-1"
          >
            <header class="ps-panel-heading"
              ><h2
                ><span class="actual-section-index">0{{ index + 1 }}</span
                >{{ group.title }}</h2
              ><span>{{ group.caption }}</span></header
            >
            <C_Form
              class="ps-form"
              :ref="instance => entry.setForm(group.key, instance)"
              v-model="entry.model"
              :options="group.fields"
              :config="entry.config"
            />
            <template v-if="group.key === 'chemistry'">
              <div class="actual-comparison-heading">
                <h3>关联实绩对照</h3>
                <p>{{ comparison.caption }}</p>
              </div>
              <div class="actual-comparisons">
                <article
                  v-for="section in comparison.data.groups"
                  :key="section.key"
                  class="actual-comparison-card"
                  :data-comparison="section.key"
                  :aria-label="`${section.title}实绩对照`"
                >
                  <header>
                    <h4>{{ section.title }}</h4>
                    <span>{{ section.rows.length }} 项</span>
                  </header>
                  <div class="actual-comparison-table">
                    <MachTable
                      preset="detail"
                      row-key="id"
                      :row-data="section.rows"
                      :column-defs="comparison.summaryColumns"
                      :theme="themeStore.isDark ? 'dark' : 'light'"
                    />
                  </div>
                </article>
              </div>
              <div class="actual-chemistry-toolbar">
                <div>
                  <h3>内控标准核对</h3>
                  <p
                    >已检测 {{ chemistry.total - chemistry.pendingCount }} /
                    {{ chemistry.total }} 项 ·
                    {{ chemistry.deviations.length }} 项偏差</p
                  >
                </div>
                <NButton
                  size="small"
                  :type="chemistry.onlyDeviations ? 'primary' : 'default'"
                  :aria-pressed="chemistry.onlyDeviations"
                  :render-icon="
                    chemistry.onlyDeviations
                      ? actionIcons.restore
                      : actionIcons.filterOutline
                  "
                  @click="chemistry.onlyDeviations = !chemistry.onlyDeviations"
                  >{{
                    chemistry.onlyDeviations ? '显示全部项目' : '仅看成分偏差'
                  }}</NButton
                >
              </div>
              <div class="ps-grid actual-chemistry-grid">
                <MachTable
                  row-key="id"
                  dom-layout="autoHeight"
                  :max-body-height="330"
                  :pagination="false"
                  :row-data="chemistry.rows"
                  :locale="chemistry.locale"
                  :column-defs="chemistry.columns"
                  :row-style-rules="chemistry.rowStyles"
                  :theme="themeStore.isDark ? 'dark' : 'light'"
                />
              </div>
            </template>
          </section>
          <section
            v-if="trace.visible"
            class="ps-panel"
            aria-label="工序轨迹"
            ><header class="ps-panel-heading"
              ><h2>工序轨迹</h2
              ><span>本地过程记录 · {{ heats.current.no }}</span></header
            ><ProcessTrace
              :heat="heats.current"
              @navigate="entry.navigate"
            />
          </section>
          <section
            v-if="trace.visible"
            class="ps-panel"
            aria-label="上下游关系"
          >
            <header class="ps-panel-heading">
              <h2>上下游关系</h2>
              <span>演示样本 · {{ heats.current.no }}</span>
            </header>
            <C_RelationshipExplorer
              class="actual-relations"
              v-model="trace.record"
              :nodes="trace.nodes"
              :edges="trace.edges"
              trace-from="heat"
            />
          </section>
        </div>
      </div>
      <p
        role="status"
        class="ps-status-line"
        >{{ entry.notice }}</p
      >
      <C_FormModal
        :editor="review.reviewEditor"
        :options="review.fields"
        :config="BUSINESS_FORM"
        :mask-closable="false"
        create-text="提交复核"
      />
      <NModal
        v-model:show="review.historyVisible"
        preset="card"
        title="炉次复核记录"
        size="small"
        :bordered="false"
        :style="{
          width: 'min(720px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 48px)',
        }"
        v-bind="BUSINESS_DETAIL_DIALOG"
        class="ps-detail-modal"
      >
        <NDescriptions
          v-bind="BUSINESS_DETAIL"
          :column="1"
          ><NDescriptionsItem label="炉号">{{
            heats.current.no
          }}</NDescriptionsItem
          ><NDescriptionsItem label="当前状态">{{
            review.stateOf(heats.current.id, heats.current.state)
          }}</NDescriptionsItem
          ><NDescriptionsItem
            v-if="review.latest"
            label="最近意见"
            >{{ review.latest.note }}</NDescriptionsItem
          ></NDescriptions
        >
        <NDivider :style="{ margin: '12px 0' }">复核追溯</NDivider
        ><C_Timeline
          v-if="review.historyItems.length"
          :items="review.historyItems"
          size="small"
        /><NEmpty
          v-else
          description="当前炉次暂无本地复核记录"
        />
        <template #footer
          ><NButton
            size="small"
            @click="review.historyVisible = false"
            :render-icon="actionIcons.close"
            >关闭记录</NButton
          ></template
        >
      </NModal>
      <NModal
        v-model:show="comparison.visible"
        preset="card"
        title="上一炉实绩参考"
        size="small"
        :bordered="false"
        :style="{
          width: 'min(900px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 48px)',
        }"
        v-bind="BUSINESS_DETAIL_DIALOG"
        class="ps-detail-modal"
      >
        <NAlert
          type="info"
          :show-icon="false"
          >参考
          {{ comparison.previous?.no }}
          的已保存值；核对后请录入当前炉次的真实测量。</NAlert
        >
        <div class="actual-reference-grid"
          ><MachTable
            preset="detail"
            row-key="id"
            :row-data="comparison.data.rows"
            :column-defs="comparison.columns"
            :theme="themeStore.isDark ? 'dark' : 'light'"
        /></div>
        <template #footer
          ><NButton
            size="small"
            @click="comparison.visible = false"
            :render-icon="actionIcons.close"
            >关闭参考</NButton
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
    BUSINESS_FORM,
    BUSINESS_DETAIL,
    BUSINESS_DETAIL_DIALOG,
  } from '../shared/presentation'
  import { useProductionActual } from './useProductionActual'
  import PageHeading from '../components/PageHeading/index.vue'
  import ProcessTrace from './components/ProcessTrace/index.vue'

  defineOptions({ name: 'ProductionActualWorkbench' })
  const themeStore = s_themeStore()
  const { heats, entry, chemistry, comparison, review, trace } =
    useProductionActual()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
