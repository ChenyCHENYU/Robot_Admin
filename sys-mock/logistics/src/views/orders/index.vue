<!--
 * @Description: 订单管理
 * @Author: Robot Admin
 * @Date: 2025-12-24
-->
<template>
  <div class="orders-page">
    <div class="page-header">
      <h1 class="page-title">订单管理</h1>
    </div>

    <NCard title="订单列表">
      <NDataTable
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
      />
    </NCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'OrdersPage',
  })

  import { columns, tableData, pagination } from './data'
</script>

<style lang="scss" scoped src="./index.scss"></style>
