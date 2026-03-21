<!--
 * @Description: 仓库管理
 * @Author: Robot Admin
 * @Date: 2025-12-24
-->
<template>
  <div class="warehouse-page">
    <div class="page-header">
      <h1 class="page-title">仓库管理</h1>
    </div>

    <div class="warehouse-grid">
      <NCard
        v-for="warehouse in warehouseList"
        :key="warehouse.id"
        :title="warehouse.name"
      >
        <NSpace
          vertical
          size="large"
        >
          <div class="info-item">
            <span class="label">地址：</span>
            <span class="value">{{ warehouse.address }}</span>
          </div>
          <div class="info-item">
            <span class="label">容量：</span>
            <span class="value">{{ warehouse.capacity }}</span>
          </div>
          <div class="info-item">
            <span class="label">使用率：</span>
            <NProgress
              type="line"
              :percentage="warehouse.usage"
              :color="warehouse.usage > 80 ? '#ff6b6b' : '#5b8ff9'"
            />
          </div>
          <div class="info-item">
            <span class="label">库存：</span>
            <span class="value">{{ warehouse.stock }}</span>
          </div>
        </NSpace>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'WarehousePage',
  })

  import { warehouseList } from './data'
</script>

<style lang="scss" scoped src="./index.scss"></style>
