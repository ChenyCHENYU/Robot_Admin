<script setup lang="ts">
  defineOptions({ name: 'WaybillManage' })
  /**
   * 运单管理页 — 演示从 robotAdmin 远程消费 Form + Table 组件
   */
  import { defineAsyncComponent, ref, h } from 'vue'
  import { NCard, NSpin, NResult } from 'naive-ui'

  const RemoteForm = defineAsyncComponent({
    loader: () => import('robotAdmin/Form'),
    loadingComponent: { render: () => h(NSpin, { size: 'large' }) },
    errorComponent: {
      render: () =>
        h(NResult, {
          status: 'error',
          title: '远程 Form 组件加载失败',
          description: '请确保 robotAdmin 主应用正在运行 (localhost:1988)',
        }),
    },
    delay: 200,
    timeout: 10000,
  })

  const RemoteTable = defineAsyncComponent({
    loader: () => import('robotAdmin/Table'),
    loadingComponent: { render: () => h(NSpin, { size: 'large' }) },
    errorComponent: {
      render: () =>
        h(NResult, { status: 'error', title: '远程 Table 组件加载失败' }),
    },
    delay: 200,
    timeout: 10000,
  })

  // 搜索表单配置
  const searchFormOptions = ref([
    {
      prop: 'waybillNo',
      label: '运单号',
      type: 'input',
      placeholder: '请输入运单号',
    },
    {
      prop: 'status',
      label: '状态',
      type: 'select',
      placeholder: '请选择状态',
      options: [
        { label: '全部', value: '' },
        { label: '待揽收', value: 'pending' },
        { label: '运输中', value: 'transit' },
        { label: '已签收', value: 'delivered' },
      ],
    },
  ])

  const searchModel = ref({ waybillNo: '', status: '' })

  const tableColumns = ref([
    { prop: 'waybillNo', label: '运单号', width: 180 },
    { prop: 'sender', label: '寄件人' },
    { prop: 'receiver', label: '收件人' },
    { prop: 'weight', label: '重量(kg)', width: 100 },
    { prop: 'status', label: '状态', width: 120 },
  ])

  const tableData = ref([
    {
      waybillNo: 'WB20260326010',
      sender: '张三',
      receiver: '李四',
      weight: 2.5,
      status: '运输中',
    },
    {
      waybillNo: 'WB20260326011',
      sender: '王五',
      receiver: '赵六',
      weight: 1.2,
      status: '已签收',
    },
    {
      waybillNo: 'WB20260326012',
      sender: '孙七',
      receiver: '周八',
      weight: 5.0,
      status: '待揽收',
    },
  ])

  /** 执行搜索 */
  function handleSearch() {
    console.log('搜索:', searchModel.value)
  }
</script>

<template>
  <div class="waybill">
    <h1 style="margin-bottom: 24px; font-size: 20px; font-weight: bold">
      📋 运单管理 — 远程 Form + Table 组件联动
    </h1>

    <!-- 搜索表单（远程 Form 组件） -->
    <NCard
      title="🔍 筛选条件"
      style="margin-bottom: 16px"
    >
      <RemoteForm
        :options="searchFormOptions"
        :model="searchModel"
        layout="inline"
        @submit="handleSearch"
      />
    </NCard>

    <!-- 运单列表（远程 Table 组件） -->
    <NCard title="📦 运单列表">
      <RemoteTable
        :columns="tableColumns"
        :data="tableData"
      />
    </NCard>
  </div>
</template>
