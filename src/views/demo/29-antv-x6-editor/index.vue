<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 图编辑工作台，统一模型导航、画布和属性检查
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace diagram-workspace"
    ><header class="workspace-heading"
      ><div
        ><small>VISUAL MODEL STUDIO</small><h1>图编辑工作台</h1
        ><p>围绕订单交付，读懂流程、数据与对象之间的关系。</p></div
      ><NButton
        size="small"
        type="primary"
        @click="exportJson"
        >导出当前图数据</NButton
      ></header
    >
    <nav
      class="diagram-scenarios"
      aria-label="图模型场景"
      ><button
        v-for="item in DIAGRAM_TYPES"
        :key="item.value"
        type="button"
        :aria-pressed="type === item.value"
        @click="type = item.value"
        ><C_Icon
          :name="item.icon"
          :size="22"
        /><span
          ><strong>{{ item.label }}</strong
          ><small>{{ item.note }}</small></span
        ></button
      ></nav
    >
    <div class="diagram-layout">
      <main class="workspace-panel"
        ><header class="workspace-toolbar"
          ><div
            ><h2>{{
              DIAGRAM_TYPES.find(item => item.value === type)?.label
            }}</h2
            ><small
              >{{ items.length }} 个节点 · {{ connections }} 条关系</small
            ></div
          ><div class="workspace-actions"
            ><NRadioGroup
              v-model:value="mode"
              size="small"
              ><NRadioButton value="edit">编辑</NRadioButton
              ><NRadioButton value="preview"
                >只读预览</NRadioButton
              ></NRadioGroup
            ><NButton
              size="tiny"
              @click="fit"
              >适配视野</NButton
            ><NButton
              size="tiny"
              :disabled="mode !== 'edit'"
              @click="showReset = true"
              >恢复示例</NButton
            ></div
          ></header
        ><div class="diagram-canvas"
          ><C_AntV
            ref="diagramRef"
            :key="`${type}-${revision}`"
            :type="type"
            :data="initialData"
            width="100%"
            height="100%"
            :readonly="mode === 'preview'"
            :show-toolbar="mode === 'edit'"
            :theme="themeStore.isDark ? 'dark' : 'light'"
            @ready="onReady"
            @data-change="onChange" /></div
        ><footer class="workspace-footer"
          ><span>{{
            mode === 'edit'
              ? '拖动节点调整位置，双击节点编辑内容'
              : '只读预览 · 已禁用节点编辑'
          }}</span
          ><span>导出为当前模型的 JSON 数据</span></footer
        ></main
      >
      <aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2>节点检查器</h2>
          <NSelect
            :value="selectedId"
            :options="items.map(item => ({ label: item.name, value: item.id }))"
            size="small"
            aria-label="选择图节点"
            @update:value="select" />
          <template v-if="selectedNode"
            ><span class="workspace-badge">{{ type.toUpperCase() }}</span
            ><h3>{{ selectedNode.name }}</h3
            ><p>{{ selectedNode.detail }}</p
            ><dl
              ><dt>标识</dt><dd>{{ selectedNode.id }}</dd
              ><dt>坐标</dt
              ><dd
                >{{ Math.round(selectedNode.position.x) }},
                {{ Math.round(selectedNode.position.y) }}</dd
              ></dl
            ><NButton
              size="small"
              block
              :disabled="mode !== 'edit'"
              @click="editSelected"
              >编辑选中节点</NButton
            ></template
          ><NEmpty
            v-else
            description="选择一个节点" /></section
        ><section class="workspace-section"
          ><h2>当前模型</h2
          ><p
            >切换场景会保留本页草稿。刷新页面会恢复示例，需要留存请先导出。</p
          ></section
        ></aside
      ></div
    >
    <NModal
      v-model:show="showReset"
      preset="dialog"
      type="warning"
      title="恢复当前模型示例"
      content="当前模型的修改将被示例替换，其他场景草稿会保留。"
      positive-text="恢复示例"
      negative-text="保留修改"
      @positive-click="reset"
    />
  </div>
</template>
<script setup lang="ts">
  import { s_themeStore } from '@/stores/theme'
  import { DIAGRAM_TYPES } from './data'
  import { useDiagramWorkspace } from './useDiagramWorkspace'
  defineOptions({ name: 'Demo29AntvX6Editor' })
  const themeStore = s_themeStore()
  const showReset = ref(false)
  const {
    type,
    mode,
    revision,
    diagramRef,
    initialData,
    items,
    connections,
    selectedId,
    selectedNode,
    select,
    onReady,
    onChange,
    fit,
    editSelected,
    reset,
    exportJson,
  } = useDiagramWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
