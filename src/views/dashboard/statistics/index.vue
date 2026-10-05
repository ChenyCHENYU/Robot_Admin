<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\dashboard\statistics\index.vue
 * @Description: 真实访问与功能使用观测，明确区分本机记录和全站汇总
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="observatory usage-statistics">
    <header class="obs-header"
      ><div
        ><span class="obs-kicker">PRODUCT OBSERVATORY</span
        ><h1>看见真实的使用轨迹。</h1
        ><p>页面访问、登录与功能使用，来自实际发生的事件。</p></div
      ><div class="obs-controls"
        ><select
          v-model="source"
          class="obs-select"
          aria-label="统计数据范围"
          ><option value="browser">本机记录</option
          ><option
            value="site"
            :disabled="!endpointConfigured"
            >全站汇总</option
          ></select
        ><select
          v-model="days"
          class="obs-select"
          aria-label="统计时间范围"
          ><option :value="1">今天</option
          ><option :value="7">近 7 天</option></select
        ><button
          class="obs-button"
          type="button"
          :disabled="loading"
          @click="refresh"
          ><span class="i-mdi:refresh" />刷新</button
        ><button
          class="obs-button"
          type="button"
          :disabled="!summary"
          @click="exportReport"
          ><span class="i-mdi:download-outline" />导出报告</button
        ></div
      ></header
    >
    <div class="obs-status"
      ><span
        ><i />{{
          source === 'browser'
            ? config.enabled
              ? '本机真实记录 · 实时更新'
              : '本机历史记录 · 采集已停用'
            : loading
              ? '正在查询全站汇总'
              : failed
                ? '全站汇总获取失败，请重试'
                : '服务端全站汇总'
        }}</span
      ><span>{{
        source === 'browser'
          ? '最多保留 7 天 / 1000 条，不代表其他访客'
          : '权限与数据范围由服务端核验'
      }}</span></div
    >
    <div class="obs-metrics"
      ><article
        v-for="metric in metrics"
        :key="metric.label"
        class="obs-metric"
        ><div class="obs-metric__label"
          >{{ metric.label }}<span :class="metric.icon" /></div
        ><strong>{{ metric.value }}</strong
        ><small>{{ metric.note }}</small></article
      ></div
    >
    <div class="obs-grid"
      ><section class="obs-panel"
        ><div class="obs-panel__head"
          ><div
            ><h2>访问与登录趋势</h2
            ><p>按自然日聚合，未记录的日期保持为零。</p></div
          ><div class="obs-legend"
            ><span><i />页面访问</span
            ><span><i class="teal" />登录成功</span></div
          ></div
        ><ObservatoryChart
          :option="trendOption"
          :empty="!summary?.totals.views && !summary?.totals.loginSuccess"
          label="真实页面访问与成功登录的每日趋势"
        /><div class="obs-note"
          >会话指匿名标签页会话；刷新不会再计登录成功，恢复已有会话也不会计为新登录。</div
        ></section
      >
      <section class="obs-panel"
        ><div class="obs-panel__head"
          ><div><h2>事件构成</h2><p>明确埋点的访问、认证与功能操作。</p></div
          ><span class="obs-chip">{{ eventTotal }} events</span></div
        ><div class="event-chart"
          ><ObservatoryChart
            :option="eventsOption"
            :empty="!eventTotal"
            label="已采集事件的类型分布"
          /><div
            v-if="eventTotal"
            class="event-center"
            ><strong>{{ eventTotal }}</strong
            ><span>真实事件</span></div
          ></div
        ></section
      ></div
    >
    <div class="obs-grid"
      ><section class="obs-panel"
        ><div class="obs-panel__head"
          ><div
            ><h2>最常访问的页面</h2
            ><p>只显示当前范围内实际访问过的页面。</p></div
          ><span class="obs-chip">TOP 8</span></div
        ><ObservatoryChart
          :option="pagesOption"
          :empty="!summary?.pages.length"
          label="真实页面访问次数排行"
        /><div class="obs-table-wrap"
          ><table class="obs-table page-timings"
            ><thead
              ><tr
                ><th>页面</th><th class="numeric">PV</th
                ><th class="numeric">P50</th><th class="numeric">P95</th></tr
              ></thead
            ><tbody
              ><tr
                v-for="page in summary?.pages.slice(0, 5)"
                :key="page.route"
                ><td>{{ routeTitle(page.route) }}</td
                ><td class="numeric">{{ page.views }}</td
                ><td class="numeric">{{ formatDuration(page.p50Ms) }}</td
                ><td class="numeric">{{ formatDuration(page.p95Ms) }}</td></tr
              ><tr v-if="!summary?.pages.length"
                ><td
                  colspan="4"
                  class="obs-empty"
                  >还没有页面访问记录</td
                ></tr
              ></tbody
            ></table
          ></div
        ><div class="obs-note"
          >P50 / P95
          为组件解析到导航首帧的样本分位数，不含该守卫之前的认证请求，也不是用户停留时间。</div
        ></section
      >
      <section class="obs-panel collection-panel"
        ><div class="obs-panel__head"
          ><div><h2>采集覆盖</h2><p>让数据来源和接入状态清楚可见。</p></div
          ><span class="obs-chip">OBSERVABILITY</span></div
        >
        <div class="collection-source"
          ><span class="collection-icon i-mdi:monitor-dashboard" /><div
            ><h3>浏览器事件记录</h3
            ><p>访问、登录结果、公司切换、主题与语言切换、仓库入口。</p></div
          ><span class="source-state">{{
            config.enabled ? '采集中' : '已停用'
          }}</span></div
        >
        <div class="collection-source"
          ><span class="collection-icon i-mdi:cloud-outline" /><div
            ><h3>全站汇总接口</h3
            ><p>{{
              endpointConfigured
                ? '已配置统一查询，选择全站汇总后读取。'
                : '尚未连接；接入后可汇总其他访客的数据。'
            }}</p></div
          ><span
            class="source-state"
            :class="{ muted: !endpointConfigured }"
            >{{ endpointConfigured ? '已配置' : '未连接' }}</span
          ></div
        >
        <div class="collection-source"
          ><span class="collection-icon i-mdi:pulse" /><div
            ><h3>Vercel Analytics / Speed Insights</h3
            ><p>{{
              config.vercelEnabled
                ? '生产采集已配置，跨访客与性能报告在 Vercel 控制台查看。'
                : '当前未启用生产采集；本机不会发送 Vercel 事件。'
            }}</p
            ><a
              v-if="config.vercelEnabled"
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              >打开 Vercel 控制台 ↗</a
            ></div
          ><span
            class="source-state"
            :class="{ muted: !config.vercelEnabled }"
            >{{ config.vercelEnabled ? '已配置' : '未启用' }}</span
          ></div
        >
        <div class="device-distribution"
          ><h3>访问窗口分布</h3
          ><div
            v-for="device in summary?.devices"
            :key="device.device"
            ><span>{{ deviceLabels[device.device] }}</span
            ><div class="device-track"
              ><i
                :style="{
                  width: `${summary?.totals.views ? (device.count / summary.totals.views) * 100 : 0}%`,
                }" /></div
            ><strong>{{ device.count }}</strong></div
          ><p>按访问时的窗口宽度分类，不推断设备身份。</p></div
        >
        <div class="collection-summary"
          ><div
            ><span>公司切换</span
            ><strong>{{ summary?.totals.companySwitches ?? '—' }}</strong></div
          ><div
            ><span>功能使用</span
            ><strong>{{ summary?.totals.actions ?? '—' }}</strong></div
          ><div
            ><span>登录失败</span
            ><strong>{{ summary?.totals.loginFailure ?? '—' }}</strong></div
          ></div
        >
      </section></div
    >
    <section
      v-if="source === 'browser'"
      class="obs-panel recent-panel"
      ><div class="obs-panel__head"
        ><div
          ><h2>最近的真实事件</h2
          ><p>不记录账号、密码、令牌、公司名称与 URL 查询参数。</p></div
        ><div class="obs-controls"
          ><select
            v-model="mode"
            class="obs-select"
            aria-label="事件来源"
            ><option value="all">全部来源</option
            ><option value="mock">演示登录</option
            ><option value="remote">远端登录</option></select
          ><select
            v-model="eventFilter"
            class="obs-select"
            aria-label="事件类型"
            ><option value="all">全部事件</option
            ><option
              v-for="(label, type) in eventLabels"
              :key="type"
              :value="type"
              >{{ label }}</option
            ></select
          ></div
        ></div
      ><div class="recent-table obs-table-wrap"
        ><table class="obs-table"
          ><thead
            ><tr
              ><th>发生时间</th><th>事件</th><th>页面 / 功能</th><th>来源</th
              ><th class="numeric">首帧耗时</th></tr
            ></thead
          ><tbody
            ><tr
              v-for="(event, index) in currentEvents"
              :key="`${event.timestamp}-${index}`"
              ><td class="event-time">{{
                new Date(event.timestamp).toLocaleString()
              }}</td
              ><td
                ><span
                  class="event-kind"
                  :class="event.type"
                  >{{ eventLabels[event.type] }}</span
                ></td
              ><td>{{
                event.action
                  ? (actionLabels[event.action] ?? event.action)
                  : routeTitle(event.route)
              }}</td
              ><td
                ><span class="mode-label">{{
                  event.mode === 'mock' ? '演示' : '远端'
                }}</span></td
              ><td class="numeric">{{
                formatDuration(event.durationMs)
              }}</td></tr
            ><tr v-if="!currentEvents.length"
              ><td
                colspan="5"
                class="obs-empty"
                >当前筛选范围内暂无记录</td
              ></tr
            ></tbody
          ></table
        ></div
      ><div class="recent-pagination"
        ><span>{{ filteredEvents.length }} 条记录 · 每页 6 条</span
        ><div
          ><button
            class="obs-button"
            type="button"
            :disabled="eventPage <= 1"
            @click="eventPage--"
            >上一页</button
          ><span>{{ eventPage }} / {{ pageCount }}</span
          ><button
            class="obs-button"
            type="button"
            :disabled="eventPage >= pageCount"
            @click="eventPage++"
            >下一页</button
          ></div
        ></div
      ></section
    >
    <footer class="obs-footer"
      ><span
        >本机记录保存在当前浏览器，清理缓存会重置；全站汇总不会回退为本机数据。</span
      ><span>{{
        summary ? new Date(summary.updatedAt).toLocaleString() : '等待真实数据'
      }}</span></footer
    >
  </div>
</template>
<script setup lang="ts">
  import ObservatoryChart from '../shared/c_chart/index.vue'
  import { useProjectReport } from '../shared/useProjectReport'
  import { formatDuration } from '../shared/d_format'
  import { translateText } from '@/utils/d_i18n'
  import { observabilityConfig as config } from '@/config/observability'
  import type { TelemetryEventType } from '@/types/observability'
  import { useUsageStats } from './useUsageStats'
  import {
    eventLabels,
    actionLabels,
    deviceLabels,
    createTrendOption,
    createPagesOption,
    createEventsOption,
  } from './data'
  defineOptions({ name: 'UsageStatistics' })
  const { report } = useProjectReport()
  const {
    source,
    days,
    mode,
    samples,
    summary,
    endpointConfigured,
    failed,
    loading,
    refresh,
    exportReport,
  } = useUsageStats()
  const eventFilter = ref<TelemetryEventType | 'all'>('all')
  const eventPage = ref(1)
  const filteredEvents = computed(() =>
    [...samples.value]
      .reverse()
      .filter(
        event => eventFilter.value === 'all' || event.type === eventFilter.value
      )
  )
  const pageCount = computed(() =>
    Math.max(1, Math.ceil(filteredEvents.value.length / 6))
  )
  const currentEvents = computed(() =>
    filteredEvents.value.slice((eventPage.value - 1) * 6, eventPage.value * 6)
  )
  const metrics = computed(() => [
    {
      label: '页面访问 PV',
      value: summary.value?.totals.views.toLocaleString() ?? '—',
      note: '成功进入页面计一次访问',
      icon: 'i-mdi:eye-outline',
    },
    {
      label: '匿名会话',
      value: summary.value?.totals.sessions.toLocaleString() ?? '—',
      note: '标签页会话，不等同于独立用户',
      icon: 'i-mdi:account-multiple-outline',
    },
    {
      label: '登录成功',
      value: summary.value?.totals.loginSuccess.toLocaleString() ?? '—',
      note: '完整公司会话与权限路由就绪',
      icon: 'i-mdi:shield-check-outline',
    },
    {
      label: '功能使用',
      value: summary.value?.totals.actions.toLocaleString() ?? '—',
      note: '仓库、主题、语言与报告操作',
      icon: 'i-mdi:cursor-default-click-outline',
    },
  ])
  /** 使用菜单标题显示公开路由名，不能识别的事件仍保留其稳定名称。 */
  const routeTitle = (route: string) =>
    translateText(
      report.value?.inventory.routeNames.find(item => item.name === route)
        ?.title ??
        (route === 'login'
          ? '登录页'
          : route === 'application'
            ? '全局功能'
            : route)
    )
  const eventTotal = computed(
    () => summary.value?.events.reduce((sum, item) => sum + item.count, 0) ?? 0
  )
  const trendOption = computed(() => createTrendOption(summary.value))
  const pagesOption = computed(() =>
    createPagesOption(summary.value, routeTitle)
  )
  const eventsOption = computed(() => createEventsOption(summary.value))
  watch([eventFilter, mode, days], () => {
    eventPage.value = 1
  })
  watch(pageCount, count => {
    eventPage.value = Math.min(eventPage.value, count)
  })
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
