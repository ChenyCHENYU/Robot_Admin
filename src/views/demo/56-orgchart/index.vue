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
        ><C_UserPicker
          v-model="picker.collaboratorIds"
          :source="picker.memberSource"
          :organization="picker.memberOrganization"
          :fields="picker.memberFields"
          multiple
          :max-selection="5"
          title="选择协作成员"
          @select="picker.confirmCollaborators"
          @cancel="picker.cancelCollaborators"
          ><template #trigger="{ open }"
            ><NButton
              size="small"
              type="primary"
              @click="open"
              ><template #icon
                ><span
                  class="i-mdi-account-multiple-plus-outline"
                  aria-hidden="true" /></template
              >选择协作成员</NButton
            ></template
          ></C_UserPicker
        ><NTag
          size="small"
          :bordered="false"
          >演示组织 · {{ chart.memberCount }} 名成员</NTag
        ><NButton
          size="small"
          @click="chart.reset"
          >返回组织全景</NButton
        ></div
      ></header
    >
    <section
      class="org-collaborators"
      aria-label="协作成员"
      aria-live="polite"
    >
      <div>
        <strong>{{ picker.selectionFeedback }}</strong>
        <p
          >按组织筛选，可跨部门选取最多 5
          人；确认空选可清空，取消保留原结果。</p
        >
      </div>
      <div class="org-collaborators__members">
        <NTag
          v-for="member in picker.collaborators"
          :key="member.id"
          size="small"
          :bordered="false"
        >
          {{ member.name }} · {{ member.department }}
        </NTag>
      </div>
    </section>
    <div class="org-layout"
      ><aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2>查找成员与部门</h2
          ><NInput
            v-model:value="chart.search"
            size="small"
            clearable
            placeholder="姓名、职位或部门"
            :input-props="{ 'aria-label': '搜索组织成员' }"
          /><div class="org-search-results"
            ><button
              v-for="item in chart.matches"
              :key="item.node.id"
              type="button"
              class="workspace-choice"
              :aria-pressed="chart.selectedId === item.node.id"
              @click="chart.inspect(item.node.id)"
              ><span class="org-initial">{{ item.node.label.slice(0, 1) }}</span
              ><span
                ><strong>{{ item.node.label }}</strong
                ><small
                  >{{ item.department }} · {{ item.node.subtitle }}</small
                ></span
              ></button
            ><p
              v-if="!chart.matches.length"
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
              v-for="(node, index) in chart.focused.path"
              :key="node.id"
              type="button"
              @click="chart.focusOn(node.id)"
              >{{ node.label
              }}<span v-if="index < chart.focused.path.length - 1">
                /
              </span></button
            ></div
          ><div class="workspace-actions"
            ><NSelect
              v-model:value="chart.direction"
              size="small"
              :options="DIRECTION_OPTIONS"
              aria-label="组织布局"
            /><NButton
              size="tiny"
              @click="chart.fitView"
              >适配视野</NButton
            ></div
          ></header
        >
        <div class="org-canvas"
          ><C_OrgChart
            ref="chartRef"
            :key="chart.focusId"
            :data="chart.tree"
            :direction="chart.direction"
            :line-style="chart.lineStyle"
            :min-zoom="0.1"
            :node-spacing="20"
            :level-spacing="44"
            fit-on-init
            @node-click="node => chart.select(node.id)"
            ><template #node="{ node }"
              ><button
                type="button"
                class="org-person"
                :class="{ 'is-selected': chart.selectedId === node.id }"
                :aria-label="`查看 ${node.label}`"
                @click.stop="chart.select(node.id)"
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
              chart.selected.node.label.slice(0, 1)
            }}</span
            ><div
              ><h3>{{ chart.selected.node.label }}</h3
              ><p>{{ chart.selected.node.subtitle }}</p></div
            ></div
          ><dl
            ><dt>所属部门</dt><dd>{{ chart.selected.department }}</dd
            ><dt>汇报对象</dt
            ><dd>{{ chart.selected.path.at(-2)?.label ?? '组织负责人' }}</dd
            ><dt>邮箱</dt
            ><dd>{{ chart.selected.node.data?.email ?? '未填写' }}</dd
            ><dt>直属成员</dt
            ><dd>{{ chart.selected.node.children?.length ?? 0 }} 人</dd></dl
          ><NButton
            size="small"
            block
            :disabled="chart.focusId === chart.selectedId"
            @click="chart.focusOn(chart.selectedId)"
            >查看此成员的团队</NButton
          ></section
        ><section class="workspace-section"
          ><h2>汇报路径</h2
          ><ol class="org-path"
            ><li
              v-for="node in chart.selected.path"
              :key="node.id"
              ><button
                type="button"
                @click="chart.inspect(node.id)"
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
  const { chartRef, chart, picker } = useOrgWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
