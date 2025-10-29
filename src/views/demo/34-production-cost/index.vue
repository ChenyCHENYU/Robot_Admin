<template>
  <div class="jingang-dashboard">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <h1>{{ pageConfig.title }}</h1>
      <div class="header-info">
        <span class="date"
          >{{ pageConfig.headerInfo.datePrefix }} {{ currentDate }}</span
        >
        <span class="time">{{ currentTime }}</span>
        <span class="temp">{{ pageConfig.headerInfo.temperature }}</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 分厂列表 -->
        <div class="panel-container">
          <div class="panel-title">{{ pageConfig.panels.factoryTitle }}</div>
          <div class="factory-header">
            <div class="factory-name-header">{{ factoryHeaders.name }}</div>
            <div class="factory-data-header">
              <span
                v-for="label in factoryHeaders.labels"
                :key="label"
                class="progress-label"
              >
                {{ label }}
              </span>
            </div>
          </div>
          <div
            ref="factoryListRef"
            class="factory-list"
            @mouseenter="pauseScroll"
            @mouseleave="resumeScroll"
          >
            <div
              v-if="apiData.length === 0"
              class="no-data-placeholder"
            >
              暂无数据
            </div>
            <div
              v-else
              class="factory-list-content"
            >
              <div
                v-for="(factory, index) in doubleFactories"
                :key="`${factory.costCenterDesc}-${index}`"
                class="factory-item"
                :class="{
                  active: selectedFactory?.costCenter === factory.costCenter,
                }"
                @click="handleFactorySelect(factory)"
              >
                <NTooltip
                  :disabled="factory.costCenterDesc.length <= 8"
                  placement="right"
                >
                  <template #trigger>
                    <div class="factory-name">{{ factory.costCenterDesc }}</div>
                  </template>
                  {{ factory.costCenterDesc }}
                </NTooltip>
                <div class="factory-data">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{
                        width: getProgressWidth(factory, 'actual') + '%',
                      }"
                    >
                      <span class="progress-text"
                        >{{ getProgressWidth(factory, 'actual') }}%</span
                      >
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill cyan"
                      :style="{
                        width: getProgressWidth(factory, 'standard') + '%',
                      }"
                    >
                      <span class="progress-text"
                        >{{ getProgressWidth(factory, 'standard') }}%</span
                      >
                    </div>
                  </div>
                  <span class="status-indicator">{{
                    factory.amtUnitDiff.toFixed(2)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 关键指标 -->
        <div class="panel-container">
          <div class="panel-title">{{
            pageConfig.panels.keyIndicatorsTitle
          }}</div>
          <div class="key-indicators">
            <div class="indicators-grid">
              <div
                v-for="(indicator, index) in realKeyIndicators"
                :key="index"
                class="indicator-card"
              >
                <div class="indicator-icon">{{ indicator.icon }}</div>
                <div class="indicator-content">
                  <div class="indicator-value-line">
                    <div class="indicator-value">{{ indicator.value }}</div>
                    <div class="indicator-unit">{{ indicator.unit }}</div>
                  </div>
                  <div class="indicator-name">{{ indicator.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间面板 -->
      <div class="center-panel">
        <!-- 成本构成图表 -->
        <div class="panel-container cost-chart-container">
          <div class="chart-header">
            <span class="chart-title">{{
              pageConfig.panels.costChartTitle
            }}</span>
            <span class="completion-rate">{{
              pageConfig.panels.costChartSubtitle
            }}</span>
          </div>
          <div class="chart-content">
            <div
              ref="costChart"
              class="cost-chart"
            ></div>
            <div class="cost-legend">
              <div
                v-for="item in costLegendItems"
                :key="item.label"
                class="legend-item"
              >
                <div
                  class="legend-color"
                  :style="{ background: item.color }"
                ></div>
                <span class="legend-text">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 成本数据表格 -->
        <div class="panel-container data-table-container">
          <div class="panel-title">{{ pageConfig.panels.dataTableTitle }}</div>
          <div class="table-wrapper">
            <div
              v-if="loading"
              class="loading-state"
              >数据加载中...</div
            >
            <div
              v-else-if="error"
              class="error-state"
            >
              数据加载失败: {{ error.message || error }}
            </div>
            <NDataTable
              v-else
              :columns="dataTableColumns"
              :data="factoryData"
              :bordered="false"
              :single-line="false"
              size="small"
              :scroll-x="800"
              max-height="290"
              virtual-scroll
              striped
            />
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <!-- 分厂成本单本分析 -->
        <div class="panel-container analysis-table-container">
          <div class="panel-title">{{
            pageConfig.panels.analysisTableTitle
          }}</div>
          <div class="table-wrapper">
            <NDataTable
              :columns="analysisTableColumns"
              :data="analysisData"
              :bordered="false"
              :single-line="false"
              size="small"
              max-height="190"
            />
          </div>
        </div>

        <!-- 30日趋势图 -->
        <div class="panel-container trend-container">
          <div class="panel-title">{{ pageConfig.panels.trendChartTitle }}</div>
          <div
            ref="trendChart"
            class="trend-chart"
          ></div>
          <div class="trend-value">{{ trendCurrentValue }}</div>
        </div>

        <!-- 产量数据 -->
        <div class="panel-container production-table-container">
          <div class="panel-title">{{
            pageConfig.panels.productionTableTitle
          }}</div>
          <div class="table-wrapper">
            <NDataTable
              :columns="productionTableColumns"
              :data="productionData"
              :bordered="false"
              :single-line="false"
              size="small"
              max-height="190"
            />
          </div>
          <div class="completion-notice">{{
            pageConfig.panels.productionNotice
          }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import * as echarts from 'echarts/core'
  import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
  } from 'echarts/components'
  import { PieChart, LineChart } from 'echarts/charts'
  import { LabelLayout, UniversalTransition } from 'echarts/features'
  import { CanvasRenderer } from 'echarts/renderers'

  // 注册 echarts 组件
  echarts.use([
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    PieChart,
    LineChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
  ])

  import {
    pageConfig,
    factoryHeaders,
    costLegendItems,
    getStatus,
    createKeyIndicators,
    createTrendData,
    fetchBoardData,
    fetchKpiData,
    fetchTrendData,
    getCostChartOption,
    getTrendChartOption,
    getDefaultCostData,
  } from './data'

  // 类型定义
  interface FactoryData {
    id: number
    costCenter: string
    costCenterDesc: string
    acctDate: string
    type: { key: number; value: string }
    wgt: number
    amtReal: number
    amtUnitReal: number
    amtStandard: number
    amtUnitDiff: number
    amtUnitDiffRate: number
    wgtDiff: number
    wgtDiffRate: number
    mom: number
    yoy: number
    progressPercentage?: number
    standardPercentage?: number
  }

  interface KpiData {
    wgtDiffRate: number
    amtUnitDiffRate: number
    amtUnitDiff: number
    amtReal?: number
    amtStandard?: number
    materialCostRate?: number
    laborCostRate?: number
    energyCostRate?: number
    efficiencyRate?: number
  }

  interface TrendData {
    acctDate: string
    amtUnitReal: number
    day: number
  }

  // 数据状态
  const apiData = ref<FactoryData[]>([])
  const selectedFactory = ref<FactoryData | null>(null)
  const kpiData = ref<KpiData | null>(null)
  const trendData = ref<TrendData[] | null>(null)

  // 加载状态
  const loading = ref<boolean>(false)
  const error = ref<any>(null)

  // UI状态
  const currentDate = ref<string>('2025.03.12')
  const currentTime = ref<string>('16:45')
  const trendCurrentValue = ref<number>(702)

  // 滚动控制
  const factoryListRef = ref<HTMLElement | null>(null)
  const isScrollPaused = ref<boolean>(false)
  const scrollTimer = ref<NodeJS.Timeout | null>(null)
  const scrollSpeed = ref<number>(0.3)

  // 图表引用
  const costChart = ref<HTMLElement | null>(null)
  const trendChart = ref<HTMLElement | null>(null)
  let costChartInstance: echarts.ECharts | null = null
  let trendChartInstance: echarts.ECharts | null = null

  // 工具函数
  const getProgressWidth = (
    factory: FactoryData,
    type: 'actual' | 'standard'
  ): number => {
    if (type === 'actual') {
      return (
        factory.progressPercentage ||
        Math.min((factory.amtUnitReal / 200) * 100, 100)
      )
    }
    return factory.standardPercentage || 85
  }

  const formatCurrency = (value: number): string => value.toLocaleString()
  const formatPercentage = (value: number): string =>
    `${(value * 100).toFixed(2)}%`

  // 创建表格渲染函数
  const createStatusCell = (row: any, key: string, isPercentage = false) => {
    const status = getStatus(row.amtUnitDiffRate)
    const value = isPercentage
      ? formatPercentage(row[key])
      : formatCurrency(row[key])

    return h('div', { class: 'status-cell' }, [
      h('span', { class: ['status-light', status] }),
      h('span', { style: 'margin-left: 4px; color: #fff;' }, value),
    ])
  }

  const createCostValueCell = (row: any, key: string) => {
    const status = getStatus(row.amtUnitDiffRate)
    return h('div', { class: 'status-cell' }, [
      h(
        'span',
        {
          class: 'cost-value',
          style: 'color: #40a9f3; font-weight: bold; font-size: 11px;',
        },
        formatCurrency(row[key] || 0)
      ),
      h('span', { class: ['status-light', status] }),
    ])
  }

  // 计算属性
  const doubleFactories = computed(() => [...apiData.value, ...apiData.value])
  const factoryData = computed(() => apiData.value)
  const analysisData = computed(() => apiData.value)
  const productionData = computed(() => apiData.value)
  const realKeyIndicators = computed(() => createKeyIndicators(kpiData.value))
  const realTrendData = computed(() => createTrendData(trendData.value))

  // 优化后的表格列配置
  const dataTableColumns: any[] = [
    {
      title: '厂别',
      key: 'costCenterDesc',
      width: 140, // 减小宽度，让内容可见
      ellipsis: { tooltip: true },
    },
    {
      title: '产量',
      key: 'wgt',
      width: 90, // 紧凑一些
      render: (row: any) => formatCurrency(row.wgt || 0),
    },
    {
      title: '综合成本',
      key: 'amtReal',
      width: 100, // 紧凑一些
      render: (row: any) => formatCurrency(row.amtReal || 0),
    },
    {
      title: '综合单本',
      key: 'amtUnitReal',
      width: 90, // 紧凑一些
      render: (row: any) => (row.amtUnitReal || 0).toFixed(2),
    },
    {
      title: '标准成本',
      key: 'amtStandard',
      width: 100,
      render: (row: any) => formatCurrency(row.amtStandard || 0),
    },
    {
      title: '偏差',
      key: 'amtUnitDiff',
      width: 70, // 紧凑一些
      render: (row: any) => (row.amtUnitDiff || 0).toFixed(2),
    },
    {
      title: '偏差率',
      key: 'amtUnitDiffRate',
      width: 80,
      render: (row: any) => createStatusCell(row, 'amtUnitDiffRate', true),
    },
  ]

  const analysisTableColumns: any[] = [
    {
      title: '分厂',
      key: 'costCenterDesc',
      width: 80, // 减小宽度
      ellipsis: { tooltip: true },
      render: (row: any) =>
        h(
          'span',
          { style: 'color: #fff; font-size: 11px;' },
          row.costCenterDesc
        ),
    },
    {
      title: '环比',
      key: 'mom',
      width: 55, // 紧凑
      render: (row: any) =>
        h(
          'span',
          { style: 'color: #fff; font-size: 11px;' },
          `${(row.mom || 0).toFixed(1)}%`
        ),
    },
    {
      title: '同比',
      key: 'yoy',
      width: 55, // 紧凑
      render: (row: any) =>
        h(
          'span',
          { style: 'color: #fff; font-size: 11px;' },
          `${(row.yoy || 0).toFixed(1)}%`
        ),
    },
    {
      title: '综合单本',
      key: 'amtUnitReal',
      minWidth: 75, // 稍微减小
      render: (row: any) => createCostValueCell(row, 'amtUnitReal'),
    },
  ]

  const productionTableColumns: any[] = [
    {
      title: '分厂',
      key: 'costCenterDesc',
      minWidth: 80, // 减小宽度
      ellipsis: { tooltip: true },
      render: (row: any) =>
        h(
          'span',
          { style: 'color: #fff; font-size: 11px;' },
          row.costCenterDesc
        ),
    },
    {
      title: '计划产量',
      key: 'wgt',
      minWidth: 70, // 紧凑
      render: (row: any) => createCostValueCell(row, 'wgt'),
    },
    {
      title: '计划偏差',
      key: 'wgtDiff',
      minWidth: 60, // 紧凑
      render: (row: any) =>
        h(
          'span',
          { style: 'color: #fff; font-size: 11px;' },
          formatCurrency(row.wgtDiff || 0)
        ),
    },
  ]

  // 事件处理函数
  const handleResize = (): void => {
    costChartInstance?.resize()
    trendChartInstance?.resize()
  }

  const updateTime = (): void => {
    const now = new Date()
    currentDate.value = now.toLocaleDateString('zh-CN').replace(/\//g, '.')
    currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  }

  const handleFactorySelect = (factory: FactoryData): void => {
    selectedFactory.value = factory
    console.log('选中分厂:', factory)
    updateCostChart(factory)
    Promise.all([loadKpiData(factory), loadTrendData(factory)])
  }

  // 数据获取方法 - 合并加载状态管理
  const loadData = async <T,>(
    loadFn: () => Promise<T>,
    loadingRef: Ref<boolean>,
    errorHandler?: (err: any) => T | null
  ): Promise<T | null> => {
    try {
      loadingRef.value = true
      return await loadFn()
    } catch (err: any) {
      console.error('数据加载失败:', err)
      return errorHandler ? errorHandler(err) : null
    } finally {
      loadingRef.value = false
    }
  }

  const loadBoardData = async (): Promise<void> => {
    const data = await loadData(fetchBoardData, loading, () => [])
    if (data) {
      apiData.value = data
      console.log('数据加载完成，共', data.length, '个分厂')
    }
  }

  const loadKpiData = async (factory: FactoryData): Promise<void> => {
    const kpiLoading = ref(false)
    const data = await loadData(
      () => fetchKpiData(factory),
      kpiLoading,
      () => ({ wgtDiffRate: 0, amtUnitDiffRate: 0, amtUnitDiff: 0 })
    )
    if (data) {
      kpiData.value = data
      console.log('KPI数据更新完成:', data)
    }
  }

  const loadTrendData = async (factory: FactoryData): Promise<void> => {
    const trendLoading = ref(false)
    const data = await loadData(() => fetchTrendData(factory), trendLoading)
    if (data) {
      trendData.value = data
      console.log('趋势数据更新完成:', data)
    }
  }

  // 滚动控制方法
  const scrollControls = {
    /**
     *
     */
    start() {
      if (
        !factoryListRef.value ||
        scrollTimer.value ||
        apiData.value.length === 0
      )
        return

      const container = factoryListRef.value
      const itemHeight = 42
      const totalHeight = apiData.value.length * itemHeight

      if (container.scrollHeight <= container.clientHeight) return

      const scroll = (): void => {
        if (isScrollPaused.value) return
        container.scrollTop += scrollSpeed.value
        if (container.scrollTop >= totalHeight) {
          container.scrollTop = 0
        }
      }

      scrollTimer.value = setInterval(scroll, 20)
    },

    /**
     *
     */
    pause() {
      isScrollPaused.value = true
    },

    /**
     *
     */
    resume() {
      isScrollPaused.value = false
    },

    /**
     *
     */
    stop() {
      if (scrollTimer.value) {
        clearInterval(scrollTimer.value)
        scrollTimer.value = null
      }
    },
  }

  const pauseScroll = scrollControls.pause
  const resumeScroll = scrollControls.resume

  // 图表方法
  const updateCostChart = (factory: FactoryData): void => {
    if (costChartInstance && factory) {
      const unitCost = factory.amtUnitReal || 0
      const newData = [
        {
          value: unitCost * 0.6,
          name: '原材料消耗成本',
          itemStyle: { color: '#ff6b6b' },
        },
        {
          value: unitCost * 0.15,
          name: '人工成本',
          itemStyle: { color: '#4ecdc4' },
        },
        {
          value: unitCost * 0.15,
          name: '能耗',
          itemStyle: { color: '#45b7d1' },
        },
        {
          value: unitCost * 0.1,
          name: '制造费用',
          itemStyle: { color: '#f9ca24' },
        },
      ].filter(item => item.value > 0)

      costChartInstance.setOption({ series: [{ data: newData }] })
    }
  }

  const updateTrendChart = (): void => {
    if (trendChartInstance) {
      const option = getTrendChartOption(realTrendData.value)
      trendChartInstance.setOption(option)

      if (realTrendData.value.length > 0) {
        trendCurrentValue.value = Math.round(
          realTrendData.value[realTrendData.value.length - 1].value
        )
      }
    }
  }

  const initCharts = (): void => {
    if (costChart.value) {
      costChartInstance = echarts.init(costChart.value)
      costChartInstance.setOption(getCostChartOption(getDefaultCostData()))
    }

    if (trendChart.value) {
      trendChartInstance = echarts.init(trendChart.value)
      trendChartInstance.setOption(getTrendChartOption(realTrendData.value))

      if (realTrendData.value.length > 0) {
        trendCurrentValue.value = Math.round(
          realTrendData.value[realTrendData.value.length - 1].value
        )
      }
    }
  }

  // 数据监听
  watch(
    trendData,
    (newData: TrendData[] | null) => {
      if (newData) updateTrendChart()
    },
    { deep: true }
  )

  // 生命周期
  onMounted(async () => {
    updateTime()
    setInterval(updateTime, 1000)

    await loadBoardData()

    nextTick(() => {
      initCharts()

      setTimeout(() => {
        if (factoryListRef.value && apiData.value.length > 0) {
          scrollControls.start()
        }
      }, 800)

      window.addEventListener('resize', handleResize)
    })
  })

  onUnmounted(() => {
    scrollControls.stop()

    if (costChartInstance) {
      costChartInstance.dispose()
      costChartInstance = null
    }
    if (trendChartInstance) {
      trendChartInstance.dispose()
      trendChartInstance = null
    }

    window.removeEventListener('resize', handleResize)
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
