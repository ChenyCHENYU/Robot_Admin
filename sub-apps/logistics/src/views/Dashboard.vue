<script setup lang="ts">
  defineOptions({ name: 'LogisticsDashboard' })
  /**
   * 物流仪表盘 — 演示从 robotAdmin 远程消费 Table + Icon 组件
   */
  import { defineAsyncComponent, ref, h } from 'vue'
  import { NCard, NSpin, NResult, NGi, NGrid, NStatistic } from 'naive-ui'

  // 🔮 远程消费 robotAdmin 暴露的组件
  const RemoteTable = defineAsyncComponent({
    loader: () => import('robotAdmin/Table'),
    loadingComponent: { render: () => h(NSpin, { size: 'large' }) },
    errorComponent: {
      render: () =>
        h(NResult, {
          status: 'error',
          title: '远程组件加载失败',
          description: '请确保 robotAdmin 主应用正在运行 (localhost:1988)',
        }),
    },
    delay: 200,
    timeout: 10000,
  })

  const RemoteIcon = defineAsyncComponent({
    loader: () => import('robotAdmin/Icon'),
    loadingComponent: { render: () => h(NSpin, { size: 'small' }) },
    errorComponent: { render: () => h('span', '⚠️') },
    delay: 200,
    timeout: 10000,
  })

  // 仪表盘统计数据
  const stats = ref([
    { label: '今日运单', value: 1284, icon: 'ri:file-list-3-line' },
    { label: '在途运输', value: 386, icon: 'ri:truck-line' },
    { label: '已签收', value: 892, icon: 'ri:checkbox-circle-line' },
    { label: '异常件', value: 6, icon: 'ri:error-warning-line' },
  ])

  // 演示 Table 数据
  const tableColumns = ref([
    { prop: 'waybillNo', label: '运单号', width: 180 },
    { prop: 'origin', label: '始发地' },
    { prop: 'destination', label: '目的地' },
    { prop: 'status', label: '状态', width: 120 },
    { prop: 'createdAt', label: '创建时间', width: 180 },
  ])

  const tableData = ref([
    {
      waybillNo: 'WB20260326001',
      origin: '上海',
      destination: '北京',
      status: '运输中',
      createdAt: '2026-03-26 08:30',
    },
    {
      waybillNo: 'WB20260326002',
      origin: '广州',
      destination: '成都',
      status: '已签收',
      createdAt: '2026-03-26 09:15',
    },
    {
      waybillNo: 'WB20260326003',
      origin: '深圳',
      destination: '杭州',
      status: '待揽收',
      createdAt: '2026-03-26 10:00',
    },
    {
      waybillNo: 'WB20260326004',
      origin: '武汉',
      destination: '南京',
      status: '运输中',
      createdAt: '2026-03-26 10:45',
    },
    {
      waybillNo: 'WB20260326005',
      origin: '重庆',
      destination: '西安',
      status: '已签收',
      createdAt: '2026-03-26 11:20',
    },
  ])
</script>

<template>
  <div class="dashboard">
    <h1 style="margin-bottom: 24px; font-size: 20px; font-weight: bold">
      📊 物流仪表盘 — 远程联邦组件演示
    </h1>

    <!-- 统计卡片区域（消费远程 Icon 组件） -->
    <NGrid
      :cols="4"
      :x-gap="16"
      style="margin-bottom: 24px"
    >
      <NGi
        v-for="stat in stats"
        :key="stat.label"
      >
        <NCard>
          <div style="display: flex; align-items: center; gap: 12px">
            <RemoteIcon
              :icon="stat.icon"
              :size="32"
            />
            <NStatistic
              :label="stat.label"
              :value="stat.value"
            />
          </div>
        </NCard>
      </NGi>
    </NGrid>

    <!-- 远程 Table 组件演示 -->
    <NCard title="📦 运单列表（远程 Table 组件）">
      <RemoteTable
        :columns="tableColumns"
        :data="tableData"
      />
    </NCard>
  </div>
</template>
