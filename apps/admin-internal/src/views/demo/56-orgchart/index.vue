<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-11
 * @FilePath: \Robot_Admin\src\views\demo\56-orgchart\index.vue
 * @Description: C_OrgChart 组织架构图组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="orgchart-demo">
    <c_vTitle
      title="组织架构图场景示例"
      icon="mdi:sitemap-outline"
      description="C_OrgChart 纯 CSS + Vue 实现的树形组织架构图，支持垂直 / 水平布局、缩放平移、节点折叠,适用于企业组织架构展示"
    />

    <div class="demo-grid">
      <!-- ==================== 架构图主区域 ==================== -->
      <NCard
        class="demo-card chart-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>组织架构</h3>
            <NTag
              type="success"
              size="small"
              round
            >
              {{ nodeCount }} 人
            </NTag>
          </div>
          <p class="card-desc"
            >鼠标拖拽平移画布，滚轮缩放，点击节点查看详情，点击 +/-
            折叠子树。</p
          >
        </template>

        <div class="config-bar">
          <span class="config-label">布局</span>
          <NSelect
            v-model:value="direction"
            :options="DIRECTION_OPTIONS"
            size="small"
            style="width: 120px"
          />
          <span class="config-label">连线</span>
          <NSelect
            v-model:value="lineStyle"
            :options="LINE_STYLE_OPTIONS"
            size="small"
            style="width: 120px"
          />
          <NCheckbox
            :checked="collapsible"
            @update:checked="collapsible = $event"
          >
            可折叠
          </NCheckbox>
          <NCheckbox
            :checked="zoomable"
            @update:checked="zoomable = $event"
          >
            可缩放
          </NCheckbox>
        </div>

        <div class="chart-container">
          <C_OrgChart
            ref="chartRef"
            :data="orgData"
            :direction="direction"
            :line-style="lineStyle"
            :collapsible="collapsible"
            :zoomable="zoomable"
            :node-spacing="28"
            :level-spacing="56"
            @node-click="handleNodeClick"
          />
        </div>
      </NCard>

      <!-- ==================== 右侧面板 ==================== -->
      <div class="side-panel">
        <!-- 选中节点详情 -->
        <NCard
          class="demo-card"
          :bordered="false"
        >
          <template #header>
            <div class="card-header">
              <h3>{{ selectedNode ? '节点详情' : '点击节点查看' }}</h3>
              <NTag
                :type="selectedNode ? 'success' : 'default'"
                size="small"
                round
              >
                {{ selectedNode ? '已选中' : '未选择' }}
              </NTag>
            </div>
          </template>

          <template v-if="selectedNode">
            <div class="node-detail">
              <div class="node-detail__header">
                <NAvatar
                  v-if="selectedNode.avatar"
                  :src="selectedNode.avatar"
                  :size="48"
                  round
                />
                <div class="node-detail__info">
                  <strong>{{ selectedNode.label }}</strong>
                  <span class="node-detail__subtitle">{{
                    selectedNode.subtitle
                  }}</span>
                </div>
              </div>
              <NDescriptions
                label-placement="left"
                :column="1"
                size="small"
                class="mt-3"
              >
                <NDescriptionsItem label="ID">{{
                  selectedNode.id
                }}</NDescriptionsItem>
                <NDescriptionsItem label="部门">{{
                  selectedNode.data?.dept ?? '-'
                }}</NDescriptionsItem>
                <NDescriptionsItem label="邮箱">{{
                  selectedNode.data?.email ?? '-'
                }}</NDescriptionsItem>
                <NDescriptionsItem label="直属下级">
                  <NTag
                    :type="
                      (selectedNode.children?.length ?? 0) > 0
                        ? 'info'
                        : 'default'
                    "
                    size="small"
                  >
                    {{ selectedNode.children?.length ?? 0 }} 人
                  </NTag>
                </NDescriptionsItem>
              </NDescriptions>
            </div>
          </template>
          <template v-else>
            <NEmpty description="点击架构图中的节点查看详细信息" />
          </template>
        </NCard>

        <!-- 功能特性 -->
        <NCard
          class="demo-card"
          :bordered="false"
        >
          <template #header>
            <div class="card-header">
              <h3>功能特性</h3>
              <NTag
                type="info"
                size="small"
                round
              >
                {{ FEATURES.length }} 项
              </NTag>
            </div>
          </template>

          <div class="feature-list">
            <div
              v-for="feat in FEATURES"
              :key="feat.title"
              class="feature-item"
            >
              <C_Icon
                :name="feat.icon"
                :size="18"
                class="feature-icon"
              />
              <div>
                <div class="feature-title">{{ feat.title }}</div>
                <div class="feature-desc">{{ feat.desc }}</div>
              </div>
            </div>
          </div>
        </NCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    orgData,
    DIRECTION_OPTIONS,
    LINE_STYLE_OPTIONS,
    FEATURES,
  } from './data'
  import type {
    OrgChartNode,
    OrgChartDirection,
    OrgChartLineStyle,
  } from '@robot-admin/naive-ui-components'

  defineOptions({ name: 'demo-orgchart' })

  const message = useMessage()

  // ─── State ───
  const direction = ref<OrgChartDirection>('vertical')
  const lineStyle = ref<OrgChartLineStyle>('rounded')
  const collapsible = ref(true)
  const zoomable = ref(true)
  const selectedNode = ref<OrgChartNode | null>(null)
  const chartRef = ref<any>(null)

  // ─── Computed ───
  /**
   * * @description: 递归统计节点总数
   */
  const nodeCount = computed(() => {
    const count = (node: OrgChartNode): number =>
      1 + (node.children?.reduce((sum, child) => sum + count(child), 0) ?? 0)
    return count(orgData)
  })

  // ─── Actions ───
  /**
   * * @description: 节点点击处理
   */
  const handleNodeClick = (node: OrgChartNode) => {
    selectedNode.value = node
    message.info(`选中：${node.label}（${node.subtitle ?? ''}）`)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
