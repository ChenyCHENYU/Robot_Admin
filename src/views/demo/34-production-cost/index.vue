<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\34-production-cost\index.vue
 * @Description: 成本管控室，以一致的演示数据展示预算、偏差和趋势
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    ref="screen"
    class="cost-control-room"
  >
    <header class="cost-heading"
      ><div class="cost-brand"
        ><span class="cost-brand-mark"
          ><span class="i-mdi:chart-timeline-variant" /></span
        ><div
          ><span>COST INTELLIGENCE / ROBOT ADMIN</span
          ><h1>日成本管控室</h1></div
        ></div
      ><div class="cost-heading-actions"
        ><span class="cost-source"
          ><i />演示数据 <b>{{ COST_DEMO_DATE }}</b></span
        ><span class="cost-clock">{{ clock }}</span
        ><button
          type="button"
          aria-label="切换全屏"
          @click="toggleFullscreen"
          ><span class="i-mdi:fullscreen" /></button
        ><button
          type="button"
          @click="router.push('/home')"
          ><span class="i-mdi:arrow-left" />返回工作台</button
        ></div
      ></header
    >
    <section
      class="cost-kpis"
      aria-label="选中范围的成本指标"
      ><article
        ><span>成本中心费用合计</span
        ><div
          ><strong>{{ formatCost(summary.actual) }}</strong
          ><small>万元</small></div
        ><footer>预算 {{ formatCost(summary.standard) }} 万元</footer
        ><span class="kpi-number">01</span></article
      ><article
        ><span>加权吨成本</span
        ><div
          ><strong>{{ formatQuantity(summary.unit, 2) }}</strong
          ><small>元 / 吨</small></div
        ><footer>计量产量 {{ formatQuantity(summary.quantity) }} 吨</footer
        ><span class="kpi-number">02</span></article
      ><article :class="{ warning: summary.difference > 0 }"
        ><span>预算执行率</span
        ><div
          ><strong>{{ (summary.execution * 100).toFixed(2) }}</strong
          ><small>%</small></div
        ><footer
          >{{ summary.difference > 0 ? '超出预算' : '低于预算' }}
          {{ formatCost(Math.abs(summary.difference)) }} 万元</footer
        ><span class="kpi-number">03</span></article
      ><article
        ><span>超预算成本中心</span
        ><div
          ><strong>{{ summary.overBudget }}</strong
          ><small>/ {{ scopeRows.length }} 个</small></div
        ><footer>点击左侧成本中心下钻</footer
        ><span class="kpi-number">04</span></article
      ></section
    >
    <div class="cost-board">
      <aside class="cost-plants cost-panel"
        ><header
          ><span class="panel-index">01</span
          ><div><h2>成本中心</h2><p>选择统计范围</p></div
          ><b>{{ COST_FACTORIES.length }}</b></header
        ><input
          v-model="search"
          aria-label="搜索成本中心"
          placeholder="搜索成本中心"
        /><button
          type="button"
          class="plant-total"
          :class="{ active: selectedId === 'all' }"
          :aria-pressed="selectedId === 'all'"
          @click="selectScope('all')"
          ><span class="i-mdi:factory" /><span>全部成本中心</span
          ><span class="i-mdi:chevron-right" /></button
        ><div class="plant-list"
          ><button
            v-for="plant in filteredPlants"
            :key="plant.id"
            type="button"
            :class="{ active: selectedId === plant.id }"
            :aria-pressed="selectedId === plant.id"
            @click="selectScope(plant.id)"
            ><span
              ><strong>{{ plant.name }}</strong
              ><small>{{ plant.id }} · {{ plant.stage }}</small></span
            ><span :class="{ over: differenceRate(plant) > 0 }"
              >{{ differenceRate(plant) > 0 ? '+' : ''
              }}{{ (differenceRate(plant) * 100).toFixed(1)
              }}<small>%</small></span
            ></button
          ><p
            v-if="!filteredPlants.length"
            class="plant-empty"
            >没有匹配的成本中心</p
          ></div
        ><footer
          ><span class="legend-dot" />绿色低于预算
          <span class="legend-dot over" />橙色超出预算</footer
        ></aside
      >
      <main class="cost-main"
        ><div class="cost-scope-heading"
          ><div
            ><span>CURRENT SCOPE</span><h2>{{ scopeName }}</h2></div
          ><span
            >{{ scopeRows.length }} 个成本中心 · 统计日
            {{ COST_DEMO_DATE }}</span
          ></div
        ><div class="cost-chart-grid"
          ><section class="cost-panel trend-panel"
            ><header
              ><span class="panel-index">02</span
              ><div><h2>吨成本走势</h2><p>近 30 日演示趋势 · 元 / 吨</p></div
              ><span class="trend-legend"><i />实际 <i />预算参考</span></header
            ><ObservatoryChart
              :option="trendOption"
              label="选中范围近30日演示吨成本与当期预算参考" /></section
          ><section class="cost-panel deviation-panel"
            ><header
              ><span class="panel-index">03</span
              ><div><h2>预算偏差</h2><p>按偏差金额排序 · 万元</p></div></header
            ><ObservatoryChart
              :option="deviationOption"
              label="选中范围成本中心的预算偏差金额" /></section></div
        ><section class="cost-panel cost-ledger"
          ><header
            ><span class="panel-index">04</span
            ><div><h2>成本台账</h2><p>金额与单价使用同一口径</p></div
            ><button
              type="button"
              @click="exportLedger"
              ><span class="i-mdi:download-outline" />导出当前范围</button
            ></header
          ><div class="cost-table-scroll"
            ><NConfigProvider :theme="darkTheme"
              ><C_Table
                class="cost-ledger-table"
                flex-height
                :columns="ledgerColumns"
                :data="visibleRows"
                row-key="id"
                :theme-overrides="{
                  thColor: '#0d192b',
                  thColorHover: '#17253a',
                  tdColor: 'transparent',
                  tdColorHover: '#1a2b43',
                  thTextColor: 'var(--cost-muted)',
                  tdTextColor: 'var(--cost-text)',
                  borderColor: 'var(--cost-line)',
                  borderRadius: '0',
                  thFontWeight: '400',
                  fontSizeSmall: 'clamp(11px, 0.65vw, 14px)',
                  lineHeight: '1.35',
                  thPaddingSmall: '10px 18px',
                  tdPaddingSmall: '6px 18px',
                }"
                :config="{
                  toolbar: { show: false },
                  pagination: false,
                  display: {
                    size: 'small',
                    bordered: false,
                    striped: false,
                    scrollX: 780,
                  },
                }" /></NConfigProvider></div
          ><footer
            ><span>共 {{ scopeRows.length }} 个成本中心</span
            ><div
              ><button
                type="button"
                :disabled="page === 1"
                aria-label="上一页台账"
                @click="page--"
                ><span class="i-mdi:chevron-left" /></button
              ><span>{{ page }} / {{ pageCount }}</span
              ><button
                type="button"
                :disabled="page === pageCount"
                aria-label="下一页台账"
                @click="page++"
                ><span
                  class="i-mdi:chevron-right" /></button></div></footer></section
      ></main>
      <aside class="cost-insights"
        ><section class="cost-panel budget-focus"
          ><header
            ><span class="panel-index">05</span
            ><div><h2>预算执行</h2><p>选中范围的费用对照</p></div></header
          ><div
            class="budget-gauge"
            :class="{ over: summary.execution > 1 }"
            :style="{
              '--execution': `${Math.min(summary.execution, 1) * 100}%`,
            }"
            ><div
              ><strong
                >{{ (summary.execution * 100).toFixed(1)
                }}<small>%</small></strong
              ><span>{{
                summary.execution > 1 ? '超出当期预算' : '当期预算内'
              }}</span></div
            ></div
          ><dl
            ><div
              ><dt>实际费用</dt
              ><dd>{{ formatCost(summary.actual) }}<small>万元</small></dd></div
            ><div
              ><dt>预算费用</dt
              ><dd
                >{{ formatCost(summary.standard) }}<small>万元</small></dd
              ></div
            ><div :class="{ over: summary.difference > 0 }"
              ><dt>金额偏差</dt
              ><dd
                >{{ summary.difference > 0 ? '+' : '-'
                }}{{ formatCost(Math.abs(summary.difference))
                }}<small>万元</small></dd
              ></div
            ></dl
          ></section
        ><section class="cost-panel cost-attention"
          ><header
            ><span class="panel-index">06</span
            ><div><h2>关注清单</h2><p>当前范围的超预算项目</p></div></header
          ><button
            v-for="(row, index) in attentionRows"
            :key="row.id"
            type="button"
            @click="selectScope(row.id)"
            ><span>{{ String(index + 1).padStart(2, '0') }}</span
            ><div
              ><strong>{{ row.name }}</strong
              ><small
                >超出 {{ formatCost(row.actual - row.standard) }} 万元</small
              ></div
            ><b>+{{ (differenceRate(row) * 100).toFixed(1) }}%</b></button
          ><p
            v-if="!attentionRows.length"
            class="attention-empty"
            >当前范围没有超预算项目</p
          ></section
        ><div class="cost-method"
          ><span class="i-mdi:information-outline" /><p
            >演示数据由固定样例生成。吨成本 = 实际费用 ÷ 计量产量，偏差率
            =（实际 − 预算）÷ 预算。跨工序计量合计包含重复产量。</p
          ></div
        ></aside
      >
    </div>
    <footer class="cost-footer"
      ><span>ROBOT ADMIN / OPERATIONS DESIGN</span
      ><span>固定演示口径 · 无实时生产数据连接</span></footer
    >
  </div>
</template>
<script setup lang="ts">
  import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
  import { darkTheme } from 'naive-ui'
  const ledgerColumns: TableColumn<FactoryData>[] = [
    {
      title: '成本中心',
      key: 'name',
      width: 180,
      render: row =>
        h(
          'button',
          {
            type: 'button',
            class: 'cost-ledger-link',
            onClick: () => selectScope(row.id),
          },
          [row.name, h('small', row.id)]
        ),
    },
    {
      title: '计量产量 / 吨',
      key: 'quantity',
      width: 120,
      render: row => formatQuantity(row.quantity),
    },
    {
      title: '实际 / 万元',
      key: 'actual',
      width: 120,
      render: row => formatCost(row.actual),
    },
    {
      title: '预算 / 万元',
      key: 'standard',
      width: 120,
      render: row => formatCost(row.standard),
    },
    {
      title: '吨成本 / 元',
      key: 'unit',
      width: 120,
      render: row => formatQuantity(row.actual / row.quantity, 2),
    },
    {
      title: '预算偏差',
      key: 'difference',
      width: 120,
      render: row =>
        h(
          'span',
          {
            style: {
              color:
                row.actual > row.standard
                  ? 'var(--cost-over)'
                  : 'var(--cost-accent)',
            },
          },
          `${row.actual > row.standard ? '+' : ''}${(differenceRate(row) * 100).toFixed(2)}%`
        ),
    },
  ]

  import type { EChartsCoreOption } from 'echarts/core'
  import ObservatoryChart from '@/views/dashboard/shared/c_chart/index.vue'
  import {
    type FactoryData,
    COST_DEMO_DATE,
    COST_FACTORIES,
    summarizeCosts,
    createCostTrend,
    differenceRate,
    formatCost,
    formatQuantity,
  } from './data'
  defineOptions({ name: 'Demo34ProductionCost' })
  const router = useRouter()
  const screen = ref<HTMLElement>()
  const selectedId = ref('all')
  const search = ref('')
  const page = ref(1)
  const pageSize = 5
  const clock = ref(
    new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  )
  let timer: ReturnType<typeof setInterval> | undefined
  const scopeRows = computed(() =>
    selectedId.value === 'all'
      ? COST_FACTORIES
      : COST_FACTORIES.filter(row => row.id === selectedId.value)
  )
  const summary = computed(() => summarizeCosts(scopeRows.value))
  const scopeName = computed(() =>
    selectedId.value === 'all'
      ? '全部成本中心'
      : scopeRows.value[0]?.name || '未选择成本中心'
  )
  const filteredPlants = computed(() =>
    COST_FACTORIES.filter(row =>
      `${row.name} ${row.id} ${row.stage}`
        .toLowerCase()
        .includes(search.value.trim().toLowerCase())
    )
  )
  const attentionRows = computed(() =>
    scopeRows.value
      .filter(row => row.actual > row.standard)
      .sort((a, b) => b.actual - b.standard - (a.actual - a.standard))
      .slice(0, 3)
  )
  const pageCount = computed(() =>
    Math.max(1, Math.ceil(scopeRows.value.length / pageSize))
  )
  const visibleRows = computed(() =>
    scopeRows.value.slice((page.value - 1) * pageSize, page.value * pageSize)
  )
  /** 切换统计范围时重置台账页码，所有指标同步重算。 */
  const selectScope = (id: string) => {
    selectedId.value = id
    page.value = 1
  }
  const trendOption = computed<EChartsCoreOption>(() => {
    const points = createCostTrend(summary.value)
    return {
      grid: { left: 58, right: 22, top: 28, bottom: 40 },
      tooltip: {
        trigger: 'axis',
        valueFormatter: (value: number) =>
          `${formatQuantity(Number(value), 2)} 元/吨`,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: points.map(point => point.date.slice(5)),
        axisLabel: { color: '#869bb8', fontSize: 11, interval: 5 },
        axisLine: { lineStyle: { color: '#293950' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: { color: '#869bb8', fontSize: 11 },
        splitLine: { lineStyle: { color: '#1f2d42', type: 'dashed' } },
      },
      series: [
        {
          name: '实际吨成本',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: points.map(point => point.value),
          lineStyle: { color: '#5ccdc1', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#5ccdc13a' },
                { offset: 1, color: '#5ccdc100' },
              ],
            },
          },
        },
        {
          name: '预算参考',
          type: 'line',
          showSymbol: false,
          data: points.map(() => summary.value.standardUnit),
          lineStyle: { color: '#dca963', width: 1.5, type: 'dashed' },
        },
      ],
    }
  })
  const deviationOption = computed<EChartsCoreOption>(() => {
    const rows = [...scopeRows.value]
      .sort(
        (a, b) =>
          Math.abs(b.actual - b.standard) - Math.abs(a.actual - a.standard)
      )
      .slice(0, 6)
      .reverse()
    return {
      grid: { top: 18, left: 100, right: 24, bottom: 30 },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#869bb8', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1f2d42', type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: rows.map(row => row.name),
        axisLabel: { color: '#b6c4d8', fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          name: '预算偏差 / 万元',
          barMaxWidth: 15,
          data: rows.map(row => ({
            value: Number(((row.actual - row.standard) / 10000).toFixed(2)),
            itemStyle: {
              color: row.actual > row.standard ? '#dca963' : '#5ccdc1',
              borderRadius: 3,
            },
          })),
        },
      ],
    }
  })
  /** 下载当前筛选范围的可复核样例数据。 */
  const exportLedger = () => {
    const data = {
      source: 'deterministic-demo',
      date: COST_DEMO_DATE,
      scope: scopeName.value,
      units: { quantity: '吨', actual: '元', standard: '元' },
      summary: summary.value,
      rows: scopeRows.value,
    }
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `cost-demo-${selectedId.value}.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  /** 全屏由浏览器显式点击触发，不影响其他页面布局。 */
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await screen.value?.requestFullscreen()
    } catch {
      /* 浏览器不支持时保留当前大屏布局。 */
    }
  }
  onMounted(() => {
    timer = setInterval(() => {
      clock.value = new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }, 30000)
  })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
