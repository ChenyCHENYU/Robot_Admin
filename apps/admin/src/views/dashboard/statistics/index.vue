<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-06 14:09:47
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-26 10:04:05
 * @FilePath: \Robot_Admin\src\views\home\index.vue
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="home-container page-container">
    <!-- 页面标题和日期选择器 -->
    <NGrid
      :x-gap="12"
      style="margin: 15px"
    >
      <NGi
        :span="24"
        class="page-title-box"
      >
        <h4 class="page-title">Data Analysis</h4>
        <div class="page-title-right">
          <NDatePicker
            v-model:value="pickDate"
            type="date"
            placeholder="选择日期"
          />
        </div>
      </NGi>
    </NGrid>

    <!-- 数据卡片行 -->
    <div class="card-container">
      <NGrid :x-gap="12">
        <!-- 访问量卡片 -->
        <NGi :span="6">
          <NCard
            hoverable
            class="card"
          >
            <NGrid :x-gap="12">
              <NGi
                :span="12"
                style="text-align: left"
              >
                <h5 class="text-muted">Visit</h5>
                <h3 class="margin-top-1 margin-bottom-1">6,168</h3>
                <p class="text-muted">
                  <span class="i-mdi:arrow-up-thin"></span>
                  <span class="text-success margin-right-1"> 3.66% </span>
                </p>
              </NGi>
              <NGi
                :span="12"
                class="flex flex-column flex-end"
              >
                <div
                  class="e-chart"
                  style="height: 70px; width: 100%"
                >
                  <div
                    ref="Refcampagin"
                    style="width: inherit; height: inherit; min-height: 70px"
                  ></div>
                </div>
              </NGi>
            </NGrid>
          </NCard>
        </NGi>

        <!-- 新线索卡片 -->
        <NGi :span="6">
          <NCard
            hoverable
            class="card"
          >
            <NGrid :x-gap="12">
              <NGi
                :span="12"
                style="text-align: left"
              >
                <h5 class="text-muted">new Leads</h5>
                <h3 class="margin-top-1 margin-bottom-1">6,168</h3>
                <p class="text-muted">
                  <span class="i-mdi:arrow-up-thin"></span>
                  <span class="text-success margin-right-1"> 4.66% </span>
                </p>
              </NGi>
              <NGi
                :span="12"
                class="flex flex-column flex-end"
              >
                <div
                  class="e-chart"
                  style="height: 70px; width: 100%"
                >
                  <div
                    ref="RefLeads"
                    style="width: inherit; height: inherit; min-height: 70px"
                  ></div>
                </div>
              </NGi>
            </NGrid>
          </NCard>
        </NGi>

        <!-- 交易卡片 -->
        <NGi :span="6">
          <NCard
            hoverable
            class="card"
          >
            <NGrid :x-gap="12">
              <NGi
                :span="12"
                style="text-align: left"
              >
                <h5 class="text-muted">Deals</h5>
                <h3 class="margin-top-1 margin-bottom-1">6,168</h3>
                <p class="text-muted">
                  <span class="i-mdi:arrow-up-thin"></span>
                  <span class="text-danger margin-right-1"> 2.66% </span>
                </p>
              </NGi>
              <NGi
                :span="12"
                class="flex flex-column flex-end"
              >
                <div
                  class="e-chart"
                  style="height: 70px; width: 100%"
                >
                  <div
                    ref="RefDeals"
                    style="width: inherit; height: inherit; min-height: 70px"
                  ></div>
                </div>
              </NGi>
            </NGrid>
          </NCard>
        </NGi>

        <!-- 收入卡片 -->
        <NGi :span="6">
          <NCard
            hoverable
            class="card"
          >
            <NGrid :x-gap="12">
              <NGi
                :span="12"
                style="text-align: left"
              >
                <h5 class="text-muted">Booked Revenue</h5>
                <h3 class="margin-top-1 margin-bottom-1">6,168</h3>
                <p class="text-muted">
                  <span class="i-mdi:arrow-up-thin"></span>
                  <span class="text-success margin-right-1"> 5.66% </span>
                </p>
              </NGi>
              <NGi
                :span="12"
                class="flex flex-column flex-end"
              >
                <div
                  class="e-chart"
                  style="height: 70px; width: 100%"
                >
                  <div
                    ref="RefRevenue"
                    style="width: inherit; height: inherit; min-height: 70px"
                  ></div>
                </div>
              </NGi>
            </NGrid>
          </NCard>
        </NGi>
      </NGrid>
    </div>
    <!-- 图表行 -->
    <NGrid :x-gap="12">
      <!-- 左侧饼图 -->
      <NGi :span="10">
        <NCard
          hoverable
          class="card"
        >
          <div class="header-title">
            <h4 class="text-muted">CAMPAIGNS</h4>
            <div class="dropdown">
              <span class="i-mdi:ellipsis-horizontal"></span>
            </div>
          </div>
          <div
            class="e-chart"
            style="height: 320px; width: 100%"
          >
            <div
              ref="RefPolorChart"
              style="width: inherit; height: inherit"
            ></div>
          </div>
          <NGrid :x-gap="12">
            <NGi
              v-for="(stat, index) in campaignStats"
              :key="index"
              :span="8"
            >
              <div class="icon-container">
                <i class="widget-icon bg-light-lighten rounded-circle">
                  <span :class="stat.icon"></span>
                </i>
              </div>
              <div style="margin-left: 40%">
                <h3 class="font-nomal margin-top-2 margin-bottom-1">{{
                  stat.value
                }}</h3>
                <p class="text-muted"
                  ><i :class="['icon', stat.iconClass]"></i> {{ stat.label }}</p
                >
              </div>
            </NGi>
          </NGrid>
        </NCard>
      </NGi>

      <!-- 右侧折线图 -->
      <NGi :span="14">
        <NCard
          hoverable
          class="card"
        >
          <div class="header-title">
            <h4 class="text-muted">Revenue</h4>
            <div class="dropdown">
              <span class="i-mdi:ellipsis-horizontal"></span>
            </div>
          </div>
          <div class="chart-bg padding-top-1 padding-bottom-1">
            <NGrid :x-gap="12">
              <NGi
                v-for="(week, index) in weekData"
                :key="index"
                :span="12"
              >
                <p class="text-muted text-muted-flag">{{ week.label }}</p>
                <h2 class="font-nomal text-center">
                  <small
                    :class="['text-primary', 'dot', week.dotClass]"
                  ></small>
                  <span>￥{{ week.value }}</span>
                </h2>
              </NGi>
            </NGrid>
          </div>
          <div
            class="e-chart"
            style="height: 361px"
          >
            <div
              ref="RefLineChart"
              style="width: inherit; height: inherit"
            ></div>
          </div>
        </NCard>
      </NGi>
    </NGrid>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { useInitBarChart } from './useInitBarChart'
  import { useInitGridChart } from './useInitLineChart'
  import { useInitPolorChart } from './useInitPolorChart'

  // 引用
  const RefDeals = ref()
  const RefRevenue = ref()
  const Refcampagin = ref()
  const RefLeads = ref()
  const RefPolorChart = ref()
  const RefLineChart = ref()
  const pickDate = ref()

  // 活动统计数据
  const campaignStats = [
    {
      icon: 'i-mdi:location',
      value: '1620',
      label: 'Total',
      iconClass: 'total',
    },
    {
      icon: 'i-mdi:flag-variant',
      value: '3216',
      label: 'Reached',
      iconClass: 'reached',
    },
    {
      icon: 'i-mdi:folder-eye',
      value: '6329',
      label: 'Open',
      iconClass: 'open',
    },
  ]

  // 周数据
  const weekData = [
    {
      label: 'current week',
      value: '23.976',
      dotClass: 'bg-primary',
    },
    {
      label: 'previous week',
      value: '23.976',
      dotClass: 'bg-green',
    },
  ]

  // 初始化图表
  onMounted(() => {
    useInitBarChart(Refcampagin.value)
    useInitBarChart(RefLeads.value)
    useInitBarChart(RefRevenue.value)
    useInitBarChart(RefDeals.value)
    useInitPolorChart(RefPolorChart.value)
    useInitGridChart(RefLineChart.value)
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
