<!--
 * @Description: 车辆调度
 * @Author: Robot Admin
 * @Date: 2025-12-24
-->
<template>
  <div class="vehicles-page">
    <div class="page-header">
      <h1 class="page-title">车辆调度</h1>
    </div>

    <NCard title="车辆列表">
      <div class="vehicles-grid">
        <div
          v-for="vehicle in vehicleList"
          :key="vehicle.id"
          class="vehicle-card"
        >
          <div class="vehicle-header">
            <div class="vehicle-number">{{ vehicle.plateNumber }}</div>
            <NTag
              :type="vehicle.status === 'online' ? 'success' : 'default'"
              size="small"
            >
              {{ vehicle.statusText }}
            </NTag>
          </div>
          <div class="vehicle-info">
            <div class="info-row">
              <span class="label">司机：</span>
              <span>{{ vehicle.driver }}</span>
            </div>
            <div class="info-row">
              <span class="label">类型：</span>
              <span>{{ vehicle.type }}</span>
            </div>
            <div class="info-row">
              <span class="label">当前位置：</span>
              <span>{{ vehicle.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'VehiclesPage',
  })

  import { vehicleList } from './data'
</script>

<style lang="scss" scoped src="./index.scss"></style>
