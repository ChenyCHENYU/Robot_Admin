<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 轻量结构图，使用真实分类清单与可键盘选择的明细节点
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="structure-map">
    <div
      class="structure-map__canvas"
      :aria-label="`${label}结构图`"
    >
      <svg
        class="structure-map__links"
        viewBox="0 0 600 360"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          v-for="(node, index) in nodes"
          :key="node.key"
          :d="`M 170 180 H 216 Q 242 180 242 ${36 + index * (288 / Math.max(nodes.length - 1, 1))} H 292`"
          :class="{ 'is-selected': selectedNode?.key === node.key }"
        />
      </svg>
      <div class="structure-map__root">
        <span
          class="structure-map__root-mark"
          aria-hidden="true"
          >R<span
        /></span>
        <small>{{ label }}</small
        ><strong>{{ total }}</strong
        ><span>{{ unit }}</span>
      </div>
      <div class="structure-map__nodes">
        <button
          v-for="(node, index) in nodes"
          :key="node.key"
          type="button"
          class="structure-map__node"
          :class="[
            `tone-${index % 5}`,
            { 'is-selected': selectedNode?.key === node.key },
          ]"
          :aria-pressed="selectedNode?.key === node.key"
          @click="selected = node.key"
        >
          <span class="structure-map__node-dot" /><span
            class="structure-map__node-name"
            >{{ node.label }}<small>{{ node.note }}</small></span
          >
          <strong>{{ node.count }}</strong
          ><span
            class="structure-map__arrow"
            aria-hidden="true"
            >↗</span
          >
        </button>
      </div>
    </div>
    <section
      v-if="selectedNode"
      class="structure-map__detail"
      :aria-label="`${selectedNode.label}明细`"
    >
      <header
        ><strong>{{ selectedNode.label }}</strong
        ><span
          >{{ selectedNode.children.length }} 个条目 · 点击节点切换</span
        ></header
      >
      <div class="structure-map__list">
        <div
          v-for="child in selectedNode.children"
          :key="child.label"
          ><span :title="child.label">{{ child.label }}</span
          ><small>{{ child.detail }}</small></div
        >
      </div>
    </section>
    <NEmpty
      v-else
      description="等待工程清单"
    />
  </div>
</template>
<script setup lang="ts">
  import type { StructureNode } from './types'
  defineOptions({ name: 'AnalysisStructureMap' })
  const props = defineProps<{
    nodes: StructureNode[]
    label: string
    unit: string
  }>()
  const selected = ref('')
  const selectedNode = computed(
    () =>
      props.nodes.find(node => node.key === selected.value) ?? props.nodes[0]
  )
  const total = computed(() =>
    props.nodes.reduce((sum, node) => sum + node.count, 0)
  )
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
