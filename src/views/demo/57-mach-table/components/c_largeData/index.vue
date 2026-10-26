<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-27
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\components\c_largeData\index.vue
 * @Description: 千万逻辑行与双向虚拟滚动的独立体验场景
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <section
    class="mach-large-data"
    aria-label="千万行视口体验"
  >
    <div class="mach-large-data__overview">
      <span
        >当前版本 <strong>v{{ machTableVersion }}</strong></span
      >
      <span
        >逻辑规模
        <strong>{{ LARGE_ROW_COUNT.toLocaleString() }} 行</strong></span
      >
      <span
        >运行状态 <strong>{{ ready ? 'Grid Ready' : '初始化中' }}</strong></span
      >
    </div>
    <div
      class="mach-large-data__toolbar"
      role="group"
      aria-label="逻辑行定位"
    >
      <NButton
        size="small"
        :disabled="!ready"
        aria-label="定位首行"
        @click="locateRow(1)"
        >首行</NButton
      >
      <NButton
        size="small"
        :disabled="!ready"
        aria-label="定位中间行"
        @click="locateRow(LARGE_MIDDLE_ROW)"
        >中间行</NButton
      >
      <NButton
        size="small"
        :disabled="!ready"
        aria-label="定位末行"
        @click="locateRow(LARGE_ROW_COUNT)"
        >末行</NButton
      >
      <label class="mach-large-data__locator">
        <span>行号</span>
        <NInputNumber
          v-model:value="targetRow"
          :min="1"
          :max="LARGE_ROW_COUNT"
          :precision="0"
          :show-button="false"
          size="small"
          :input-props="{
            role: 'spinbutton',
            'aria-label': '定位逻辑行号',
            'aria-valuemin': 1,
            'aria-valuemax': LARGE_ROW_COUNT,
            'aria-valuenow': targetRow ?? undefined,
            inputmode: 'numeric',
          }"
          @keyup.enter="locateRow()"
        />
      </label>
      <NButton
        size="small"
        type="primary"
        :disabled="!ready"
        :loading="locating"
        aria-label="跳转到指定行"
        @click="locateRow()"
        >定位</NButton
      >
      <NButton
        size="small"
        :disabled="!ready"
        aria-label="刷新缓存快照"
        @click="refreshSnapshot()"
        >刷新快照</NButton
      >
    </div>
    <p class="mach-large-data__tip">
      本地按需生成 10,000,000 行逻辑数据，每个请求模拟延迟 8ms，不连接业务接口。
      {{
        narrow
          ? '窄屏仅固定订单编号，其余列可横向查看'
          : '左右固定列，中间 46 列可横向滚动'
      }}；本场景只读，不提供筛选或排序。
    </p>
    <div class="mach-large-data__grid">
      <MachTable
        :ref="table.ref"
        v-bind="config"
        :column-defs="columnDefs"
        :theme="props.theme"
      />
    </div>
    <div
      class="mach-large-data__status"
      role="status"
      aria-live="polite"
      :aria-busy="locating"
      >{{ notice }}</div
    >
    <div
      class="mach-large-data__snapshot"
      aria-label="最近缓存快照"
    >
      <span>最近快照 {{ sampledAt }}</span>
      <span
        >缓存
        <strong
          >{{ snapshot?.cachedBlockCount ?? 0 }} 块 /
          {{ snapshot?.cachedRowCount ?? 0 }} 行</strong
        ></span
      >
      <span
        >命中 {{ snapshot?.hitCount ?? 0 }} / 未命中
        {{ snapshot?.missCount ?? 0 }}</span
      >
      <span
        >请求 {{ snapshot?.activeRequestCount ?? 0 }} / 排队
        {{ snapshot?.queuedRequestCount ?? 0 }}</span
      >
      <span
        >物理滚动高度
        <strong>{{ physicalHeight.toLocaleString() }}px</strong></span
      >
      <span
        >逻辑内容高度
        {{ (LARGE_ROW_COUNT * LARGE_ROW_HEIGHT).toLocaleString() }}px</span
      >
    </div>
  </section>
</template>

<script setup lang="ts">
  import '@agile-team/mach-table-vue/styles.css'
  import {
    MachTable,
    version as machTableVersion,
  } from '@agile-team/mach-table-vue'
  import { LARGE_MIDDLE_ROW, LARGE_ROW_COUNT, LARGE_ROW_HEIGHT } from './data'
  import { useLargeData } from './useLargeData'

  defineOptions({ name: 'MachTableLargeData' })
  interface Props {
    theme: 'light' | 'dark'
  }
  const props = defineProps<Props>()
  const {
    table,
    config,
    narrow,
    columnDefs,
    targetRow,
    locating,
    notice,
    snapshot,
    physicalHeight,
    sampledAt,
    locateRow,
    refreshSnapshot,
  } = useLargeData()
  const { ready } = table
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
