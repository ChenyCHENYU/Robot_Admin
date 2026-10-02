<script setup lang="ts">
  defineOptions({ name: 'WaybillManage' })
  /**
   * 运单管理页 — 演示从 robotAdmin 远程消费 Form + Table 组件
   */
  import { computed, defineAsyncComponent, h, ref } from 'vue'
  import type {
    FormOption,
    SubmitEventPayload,
  } from '@robot-admin/naive-ui-components/C_Form'
  import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
  import { NCard, NSpin, NResult } from 'naive-ui'

  const RemoteForm = defineAsyncComponent({
    loader: () => import('robotAdmin/Form'),
    loadingComponent: { render: () => h(NSpin, { size: 'large' }) },
    errorComponent: {
      render: () =>
        h(NResult, {
          status: 'error',
          title: '远程 Form 组件加载失败',
          description: '请检查联邦宿主地址及其 remoteEntry.js 是否可访问',
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

  interface SearchModel {
    waybillNo: string
    status: string
  }

  interface Waybill {
    waybillNo: string
    sender: string
    receiver: string
    weight: number
    status: string
  }

  const searchFormOptions: FormOption<SearchModel>[] = [
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
      children: [
        { label: '全部', value: '' },
        { label: '待揽收', value: 'pending' },
        { label: '运输中', value: 'transit' },
        { label: '已签收', value: 'delivered' },
      ],
    },
  ]

  const searchModel = ref<SearchModel>({ waybillNo: '', status: '' })
  const appliedSearch = ref<SearchModel>({ ...searchModel.value })
  const searchFormConfig = { layout: 'inline' as const }

  const tableColumns: TableColumn<Waybill>[] = [
    { key: 'waybillNo', title: '运单号', width: 180 },
    { key: 'sender', title: '寄件人' },
    { key: 'receiver', title: '收件人' },
    { key: 'weight', title: '重量(kg)', width: 100 },
    { key: 'status', title: '状态', width: 120 },
  ]

  const tableData: Waybill[] = [
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
  ]

  const visibleWaybills = computed(() =>
    tableData.filter(row => {
      const { waybillNo, status } = appliedSearch.value
      return (
        (!waybillNo || row.waybillNo.includes(waybillNo.trim())) &&
        (!status || row.status === status)
      )
    })
  )

  /** 提交筛选条件后同步表格数据。 */
  function handleSearch({ model }: SubmitEventPayload<SearchModel>) {
    appliedSearch.value = { ...model }
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
        v-model="searchModel"
        :config="searchFormConfig"
        @submit="handleSearch"
      />
    </NCard>

    <!-- 运单列表（远程 Table 组件） -->
    <NCard title="📦 运单列表">
      <RemoteTable
        :columns="tableColumns"
        :data="visibleWaybills"
        row-key="waybillNo"
      />
    </NCard>
  </div>
</template>
