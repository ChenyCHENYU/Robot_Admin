<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 组织探索工作台，搜索、下钻和固定详情面板
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace org-workspace">
    <header class="workspace-heading"
      ><div
        ><small>PEOPLE & ORGANIZATION</small><h1>组织架构工作台</h1
        ><p>从组织全景找到成员，再沿汇报关系查看团队。</p></div
      ><div class="workspace-actions"
        ><NTag
          size="small"
          :bordered="false"
          >演示组织 · {{ entries.length }} 名成员</NTag
        ><NButton
          size="small"
          @click="reset"
          >返回组织全景</NButton
        ></div
      ></header
    >
    <div class="org-layout"
      ><aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2>查找成员与部门</h2
          ><NInput
            v-model:value="search"
            size="small"
            clearable
            placeholder="姓名、职位或部门"
            :input-props="{ 'aria-label': '搜索组织成员' }"
          /><div class="org-search-results"
            ><button
              v-for="item in matches"
              :key="item.node.id"
              type="button"
              class="workspace-choice"
              :aria-pressed="selectedId === item.node.id"
              @click="choose(item.node.id, true)"
              ><span class="org-initial">{{ item.node.label.slice(0, 1) }}</span
              ><span
                ><strong>{{ item.node.label }}</strong
                ><small
                  >{{ item.department }} · {{ item.node.subtitle }}</small
                ></span
              ></button
            ><p
              v-if="!matches.length"
              class="workspace-hint"
              >没有匹配的成员</p
            ></div
          ></section
        ></aside
      >
      <main class="workspace-panel"
        ><header class="workspace-toolbar"
          ><div class="org-breadcrumb"
            ><button
              v-for="(node, index) in focused.path"
              :key="node.id"
              type="button"
              @click="focusId = node.id"
              >{{ node.label
              }}<span v-if="index < focused.path.length - 1"> / </span></button
            ></div
          ><div class="workspace-actions"
            ><NSelect
              v-model:value="direction"
              size="small"
              :options="DIRECTION_OPTIONS"
              aria-label="组织布局"
            /><NButton
              size="tiny"
              @click="chartRef?.fitView()"
              >适配视野</NButton
            ></div
          ></header
        >
        <div class="org-canvas"
          ><C_OrgChart
            ref="chartRef"
            :key="focusId"
            :data="tree"
            :direction="direction"
            :line-style="lineStyle"
            :min-zoom="0.1"
            :node-spacing="20"
            :level-spacing="44"
            fit-on-init
            @node-click="node => choose(node.id)"
            ><template #node="{ node }"
              ><button
                type="button"
                class="org-person"
                :class="{ 'is-selected': selectedId === node.id }"
                :aria-label="`查看 ${node.label}`"
                @click.stop="choose(node.id)"
                ><span class="org-initial">{{ node.label.slice(0, 1) }}</span
                ><span
                  ><strong>{{ node.label }}</strong
                  ><small>{{ node.subtitle }}</small></span
                ><b v-if="node.children?.length">{{
                  node.children.length
                }}</b></button
              ></template
            ></C_OrgChart
          ></div
        ><footer class="workspace-footer"
          ><span>拖动空白区域平移 · 滚轮缩放 · +/- 展开或折叠</span
          ><span>点击成员查看右侧详情</span></footer
        ></main
      >
      <aside class="workspace-panel org-detail"
        ><section class="workspace-section"
          ><h2>成员详情</h2
          ><div class="org-person-heading"
            ><span class="org-initial">{{
              selected.node.label.slice(0, 1)
            }}</span
            ><div
              ><h3>{{ selected.node.label }}</h3
              ><p>{{ selected.node.subtitle }}</p></div
            ></div
          ><dl
            ><dt>所属部门</dt><dd>{{ selected.department }}</dd
            ><dt>汇报对象</dt
            ><dd>{{ selected.path.at(-2)?.label ?? '组织负责人' }}</dd
            ><dt>邮箱</dt><dd>{{ selected.node.data?.email ?? '未填写' }}</dd
            ><dt>直属成员</dt
            ><dd>{{ selected.node.children?.length ?? 0 }} 人</dd></dl
          ><NButton
            size="small"
            block
            :disabled="focusId === selectedId"
            @click="focusId = selectedId"
            >查看此成员的团队</NButton
          ></section
        ><section class="workspace-section"
          ><h2>汇报路径</h2
          ><ol class="org-path"
            ><li
              v-for="node in selected.path"
              :key="node.id"
              ><button
                type="button"
                @click="choose(node.id, true)"
                >{{ node.label }}<small>{{ node.subtitle }}</small></button
              ></li
            ></ol
          ></section
        ></aside
      >
    </div>
  </div>
</template>
<script setup lang="ts">
  import { DIRECTION_OPTIONS } from './data'
  import { useOrgWorkspace } from './useOrgWorkspace'
  defineOptions({ name: 'Demo56OrgChart' })
  const {
    entries,
    search,
    focusId,
    selectedId,
    direction,
    lineStyle,
    chartRef,
    focused,
    selected,
    matches,
    tree,
    choose,
    reset,
  } = useOrgWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
