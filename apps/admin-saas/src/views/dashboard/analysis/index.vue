<template>
  <div class="dashboard">
    <!-- 头部区域 -->
    <NRow class="header">
      <NCol
        :span="24"
        class="title-box"
      >
        <h4 class="title">Dashboard</h4>
        <div class="actions">
          <NDatePicker
            v-model:value="pickDate"
            type="date"
            placeholder="选择日期"
          />
          <NButton
            circle
            type="primary"
            class="ml-3"
          >
            <template #icon><div class="i-mdi:refresh"></div></template>
          </NButton>
          <NButton
            circle
            type="primary"
            class="ml-2"
          >
            <template #icon><div class="i-mdi:search"></div></template>
          </NButton>
        </div>
      </NCol>
    </NRow>

    <!-- 信息卡片+产品图表 -->
    <NRow :gutter="16">
      <NCol
        :span="10"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="10"
      >
        <NRow :gutter="16">
          <NCol
            v-for="(card, index) in infoCards"
            :key="index"
            :span="12"
            :xs="24"
            :sm="12"
          >
            <NCard
              hoverable
              class="info-card"
            >
              <div class="card-header">
                <h5 class="text-muted">{{ card.title }}</h5>
                <div class="widget-icon"><div :class="card.icon"></div></div>
              </div>
              <div class="card-middle"
                ><h3>{{ card.value }}</h3></div
              >
              <div class="card-footer">
                <div
                  :class="
                    card.trend > 0 ? 'i-mdi:arrow-up' : 'i-mdi:arrow-down'
                  "
                ></div>
                <span :class="card.trend > 0 ? 'text-success' : 'text-danger'"
                  >{{ Math.abs(card.trend) }}%</span
                >
                <span class="text-nowrap">since last week</span>
              </div>
            </NCard>
          </NCol>
        </NRow>
      </NCol>
      <NCol
        :span="14"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="14"
      >
        <NCard
          hoverable
          class="chart-card product-chart"
        >
          <div class="card-header">
            <h4 class="text-muted">Products</h4>
            <div class="i-mdi:ellipsis-horizontal"></div>
          </div>
          <div
            class="chart-container no-padding"
            ref="refProduct"
          ></div>
        </NCard>
      </NCol>
    </NRow>

    <!-- 收入 & 地区分布 -->
    <NRow
      :gutter="16"
      class="mt-4"
    >
      <NCol
        :span="16"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="16"
      >
        <NCard
          hoverable
          class="chart-card revenue-chart"
        >
          <div class="card-header">
            <h4 class="text-muted">Revenue</h4>
            <div class="i-mdi:ellipsis-horizontal"></div>
          </div>
          <div class="chart-legend">
            <NRow>
              <NCol
                v-for="legend in revenueLegend"
                :key="legend.label"
                :span="12"
                :xs="24"
                :md="12"
              >
                <p class="legend-label">{{ legend.label }}</p>
                <h2 class="legend-value">
                  <span :class="['dot', legend.dotClass]"></span>
                  <span>{{ legend.value }}</span>
                </h2>
              </NCol>
            </NRow>
          </div>
          <div
            class="chart-container"
            ref="refLineChart"
          ></div>
        </NCard>
      </NCol>
      <NCol
        :span="8"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="8"
      >
        <NCard
          hoverable
          class="chart-card location-chart"
        >
          <div class="card-header">
            <h4 class="text-muted">Revenue by Location</h4>
            <div class="i-mdi:ellipsis-horizontal"></div>
          </div>
          <div
            class="chart-container"
            ref="refTreeMap"
          ></div>
          <div class="chart-footer">
            <h5 class="location">New York</h5>
            <NProgress
              :percentage="88"
              type="line"
              ><span>88k</span></NProgress
            >
          </div>
        </NCard>
      </NCol>
    </NRow>

    <!-- 第三行：表格、右统计区 -->
    <NRow
      :gutter="16"
      class="mt-4"
    >
      <NCol
        :span="12"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="12"
      >
        <NCard
          hoverable
          class="data-card bottom-card"
        >
          <div class="card-header with-action">
            <h4 class="text-muted">TOP SELLING PRODUCTS</h4>
            <div class="btn-link">
              <span>Export</span>
              <div class="i-mdi:download ml-1"></div>
            </div>
          </div>
          <NDataTable
            ref="tableRef"
            :data="tableData"
            :columns="columns"
            :pagination="false"
            :bordered="false"
          />
        </NCard>
      </NCol>
      <NCol
        :span="12"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="12"
      >
        <NRow :gutter="16">
          <NCol
            :span="12"
            :xs="24"
            :md="12"
          >
            <!-- 销售饼图 -->
            <NCard
              hoverable
              class="chart-card sales-chart bottom-card"
            >
              <div class="card-header">
                <h4 class="text-muted">TOTAL SALES</h4>
                <div class="i-mdi:ellipsis-horizontal"></div>
              </div>
              <div
                class="chart-container small"
                ref="refAverageSales"
              ></div>
              <div class="chart-legend-list">
                <div
                  v-for="(item, index) in salesData"
                  :key="index"
                  class="legend-item"
                >
                  <span>
                    <span :class="`color-box ${item.color}`"></span>
                    {{ item.name }}
                  </span>
                  <span>{{ item.value }}</span>
                </div>
              </div>
            </NCard>
          </NCol>
          <NCol
            :span="12"
            :xs="24"
            :md="12"
          >
            <!-- 平均销售额 -->
            <NCard
              hoverable
              class="primary-card sale-size-card"
            >
              <div class="card-header">
                <h4 class="text-light">AVERAGE SALE SIZE</h4>
                <div class="i-mdi:ellipsis-horizontal text-light"></div>
              </div>
              <div class="avg-content">
                <div class="badge-container">
                  <span class="badge badge-danger">-23.47%</span>
                </div>
                <h3 class="value">￥156.37</h3>
                <p class="subtitle">Per sale</p>
                <NButton
                  type="primary"
                  ghost
                >
                  more
                  <template #icon
                    ><div class="i-mdi:chevron-right ml-1"></div
                  ></template>
                </NButton>
              </div>
            </NCard>
            <!-- 活动 -->
            <NCard
              hoverable
              class="chart-card mt-4 activity-card"
            >
              <div class="card-header">
                <h4 class="text-muted">RECENT ACTIVITY</h4>
                <div class="i-mdi:ellipsis-horizontal"></div>
              </div>
              <div class="timeline-container">
                <NTimeline>
                  <NTimelineItem
                    v-for="(activity, index) in activities"
                    :key="index"
                    :type="activity.type"
                    :color="activity.color"
                    :time="activity.timestamp"
                  >
                    {{ activity.content }}
                  </NTimelineItem>
                </NTimeline>
              </div>
            </NCard>
          </NCol>
        </NRow>
      </NCol>
    </NRow>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useInitChart } from './useInitEcharts'
  import { useInitLineChart } from './useInitLineCharts'
  import { useInitPieChart } from './useInitPieCharts'
  import { useInitTreeMap } from './useInitTreeMap'

  const pickDate = ref(null)
  const refProduct = ref<HTMLElement | null>(null)
  const refLineChart = ref<HTMLElement | null>(null)
  const refAverageSales = ref<HTMLElement | null>(null)
  const refTreeMap = ref<HTMLElement | null>(null)
  const tableRef = ref()

  const infoCards = [
    { title: 'Customers', value: '37,258', trend: 6.28, icon: 'i-mdi:cart' },
    {
      title: 'Orders',
      value: '3,258',
      trend: -2.28,
      icon: 'i-mdi:jewelry-box',
    },
    {
      title: 'Revenue',
      value: '￥3,258',
      trend: -3.28,
      icon: 'i-mdi:billboard',
    },
    {
      title: 'Growth',
      value: '+ 20.48%',
      trend: 5.28,
      icon: 'i-mdi:chart-line',
    },
  ]

  const revenueLegend = [
    { label: 'Current week', value: '￥23,976', dotClass: 'primary' },
    { label: 'Previous week', value: '￥23,976', dotClass: 'green' },
  ]

  const salesData = [
    { name: 'Union Ads', value: '￥26,000', color: 'yellow' },
    { name: 'Direct', value: '￥26,000', color: 'green' },
    { name: 'Search Engine', value: '￥26,000', color: 'deep-blue' },
    { name: 'Video Ads', value: '￥26,000', color: 'red' },
  ]
  const tableData = [
    {
      date: '2016-05-02',
      name: 'cheny',
      province: '西安',
      city: '未央区',
      address: '西安市未央区太华南路888号',
      zip: 710000,
    },
    {
      date: '2016-05-02',
      name: 'cheny',
      province: '西安',
      city: '未央区',
      address: '西安市未央区太华南路888号',
      zip: 710000,
    },
    {
      date: '2016-05-02',
      name: 'cheny',
      province: '西安',
      city: '未央区',
      address: '西安市未央区太华南路888号',
      zip: 710000,
    },
    {
      date: '2016-05-02',
      name: 'cheny',
      province: '西安',
      city: '未央区',
      address: '西安市未央区太华南路888号',
      zip: 710000,
    },
    {
      date: '2016-05-02',
      name: 'cheny',
      province: '西安',
      city: '未央区',
      address: '西安市未央区太华南路888号',
      zip: 710000,
    },
  ]
  const activities = [
    {
      content: '支持使用图标',
      timestamp: '2018-04-12 20:46',
      type: 'info' as const,
      color: '#2080f0',
    },
    {
      content: '支持自定义颜色',
      timestamp: '2018-04-03 20:46',
      color: '#0bbd87',
    },
    {
      content: '支持自定义尺寸',
      timestamp: '2018-04-03 20:46',
      type: 'success' as const,
    },
    {
      content: '默认样式的节点',
      timestamp: '2018-04-03 20:46',
      type: 'default' as const,
    },
  ]
  const columns = computed(() => [
    { title: '日期', key: 'date', width: 150, fixed: 'left' as const },
    { title: '姓名', key: 'name', width: 120 },
    { title: '省份', key: 'province', width: 120 },
    { title: '市区', key: 'city', width: 120 },
    { title: '地址', key: 'address', width: 400 },
    { title: '邮编', key: 'zip', width: 120 },
  ])

  onMounted(() => {
    useInitChart(refProduct.value!)
    useInitLineChart(refLineChart.value!)
    useInitPieChart(refAverageSales.value!)
    useInitTreeMap(refTreeMap.value!)
  })
</script>

<style lang="scss">
  @use './index.scss';
</style>
