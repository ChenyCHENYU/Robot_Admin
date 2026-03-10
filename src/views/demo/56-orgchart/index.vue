<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @Description: C_OrgChart 组织架构图组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="orgchart-demo">
    <NH1 prefix="bar">组织架构图场景示例</NH1>
    <NP
      >C_OrgChart
      支持垂直/水平布局、缩放平移、节点折叠等特性，适用于企业组织架构展示。</NP
    >

    <!-- 控制面板 -->
    <NCard
      title="配置面板"
      :bordered="false"
      class="mb-4"
    >
      <NSpace
        align="center"
        :wrap="true"
      >
        <NSelect
          v-model:value="direction"
          :options="DIRECTION_OPTIONS"
          style="width: 140px"
        />
        <NSelect
          v-model:value="lineStyle"
          :options="LINE_STYLE_OPTIONS"
          style="width: 120px"
        />
        <NSwitch v-model:value="collapsible">
          <template #checked>可折叠</template>
          <template #unchecked>不可折叠</template>
        </NSwitch>
        <NSwitch v-model:value="zoomable">
          <template #checked>可缩放</template>
          <template #unchecked>不可缩放</template>
        </NSwitch>
      </NSpace>
    </NCard>

    <!-- 架构图 -->
    <NCard :bordered="false">
      <div class="orgchart-container">
        <C_OrgChart
          ref="chartRef"
          :data="orgData"
          :direction="direction"
          :line-style="lineStyle"
          :collapsible="collapsible"
          :zoomable="zoomable"
          @node-click="handleNodeClick"
        />
      </div>
    </NCard>

    <!-- 点击信息 -->
    <NCard
      v-if="selectedNode"
      title="选中节点信息"
      :bordered="false"
      class="mt-4"
    >
      <NDescriptions
        label-placement="left"
        :columns="2"
      >
        <NDescriptionsItem label="ID">{{ selectedNode.id }}</NDescriptionsItem>
        <NDescriptionsItem label="姓名">{{
          selectedNode.label
        }}</NDescriptionsItem>
        <NDescriptionsItem label="职位">{{
          selectedNode.subtitle
        }}</NDescriptionsItem>
        <NDescriptionsItem label="下属数">{{
          selectedNode.children?.length ?? 0
        }}</NDescriptionsItem>
      </NDescriptions>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import { orgData, DIRECTION_OPTIONS, LINE_STYLE_OPTIONS } from './data'
  import type {
    OrgChartNode,
    OrgChartDirection,
    OrgChartLineStyle,
  } from '@robot-admin/naive-ui-components'

  defineOptions({ name: 'demo-orgchart' })

  const direction = ref<OrgChartDirection>('vertical')
  const lineStyle = ref<OrgChartLineStyle>('rounded')
  const collapsible = ref(true)
  const zoomable = ref(true)
  const selectedNode = ref<OrgChartNode | null>(null)
  const chartRef = ref<any>(null)

  /**
   * * @description: 节点点击处理
   */
  const handleNodeClick = (node: OrgChartNode) => {
    selectedNode.value = node
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
