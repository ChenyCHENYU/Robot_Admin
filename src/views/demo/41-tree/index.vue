<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\views\demo\41-tree\index.vue
 * @Description: 树组件受控状态、密度、虚拟列表与异步加载场景
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="tree-demo-page">
    <c_vTitle
      title="树形控件场景示例"
      icon="mdi:file-tree-outline"
      description="部门导航、权限勾选与大数据树使用同一组件，原生能力收拢到 treeProps。"
    />
    <NCard
      :bordered="false"
      class="tree-demo-controls"
    >
      <div class="density-control">
        <span>显示密度</span>
        <NSelect
          v-model:value="density"
          :options="DENSITY_OPTIONS"
          aria-label="树显示密度"
          class="density-select"
        />
        <NText depth="3">节点、搜索框和工具栏同步调整尺寸</NText>
      </div>
    </NCard>
    <div class="tree-demo-grid">
      <NCard
        :bordered="false"
        title="部门导航与权限勾选"
        class="controlled-tree-card"
      >
        <template #header-extra
          ><NTag
            size="small"
            type="info"
            >受控状态</NTag
          ></template
        >
        <p class="section-description"
          >选择、勾选和搜索互相独立；已停用部门不可选择或勾选，长标题保持单行。</p
        >
        <C_Tree
          ref="treeRef"
          v-model:selected-keys="selectedKeys"
          v-model:expanded-keys="expandedKeys"
          v-model:checked-keys="checkedKeys"
          v-model:search-pattern="keyword"
          :data="departments"
          :density="density"
          :tree-props="CONTROLLED_TREE_PROPS"
          :addable="false"
          :refreshable="false"
          mode="org"
          :actions="[]"
          class="controlled-tree"
          @update:checked-keys="handleChecked"
          @update:selected-keys="handleSelected"
        >
          <template #empty
            ><NEmpty description="没有匹配的部门，清空关键词后重试"
          /></template>
        </C_Tree>
        <div class="demo-commands">
          <NButton
            size="small"
            @click="pickFrontend"
            >外部选择前端组</NButton
          >
          <NButton
            size="small"
            @click="checkLoadedLeaves"
            >勾选已加载叶节点</NButton
          >
          <NButton
            size="small"
            @click="clearState"
            >清空状态与搜索</NButton
          >
        </div>
        <dl
          class="tree-state"
          aria-live="polite"
        >
          <div
            ><dt>当前选择</dt
            ><dd data-testid="tree-selected-state">{{
              selectedSummary
            }}</dd></div
          >
          <div
            ><dt>勾选节点</dt
            ><dd data-testid="tree-checked-state">{{ checkedSummary }}</dd></div
          >
          <div
            ><dt>最近操作</dt><dd>{{ lastAction }}</dd></div
          >
        </dl>
      </NCard>
      <div class="tree-demo-side">
        <NCard
          :bordered="false"
          title="2,100 个节点 · 虚拟滚动"
        >
          <p class="section-description"
            >固定容器高度，滚动时按可视范围渲染；可搜索项目编号，如“1999”。</p
          >
          <C_Tree
            v-model:selected-keys="virtualSelectedKeys"
            v-model:expanded-keys="largeExpandedKeys"
            :data="largeTree"
            :tree-props="virtualTreeProps"
            :density="density"
            :addable="false"
            :refreshable="false"
            class="virtual-tree"
          />
        </NCard>
        <NCard
          :bordered="false"
          title="按需加载 · 失败可重试"
        >
          <p class="section-description"
            >本地模拟延迟，首次展开会失败一次；重试后加载资料，无需后端。</p
          >
          <NAlert
            v-if="lazyFailure"
            type="warning"
            :show-icon="false"
            class="lazy-error"
            data-testid="tree-lazy-error"
          >
            <div class="lazy-error-content">
              <span>{{ lazyFailure }}</span>
              <NButton
                size="small"
                @click="retryLoad"
                >重新加载</NButton
              >
            </div>
          </NAlert>
          <C_Tree
            v-model:expanded-keys="lazyExpandedKeys"
            :data="lazyData"
            :tree-props="lazyTreeProps"
            :density="density"
            :show-toolbar="false"
            class="lazy-tree"
            @load-error="handleLoadError"
          />
          <div class="lazy-footer"
            ><NText depth="3">已发起 {{ loadCount }} 次加载</NText
            ><NButton
              size="small"
              @click="resetLazy"
              >重置演示</NButton
            ></div
          >
        </NCard>
      </div>
    </div>
    <NAlert
      type="info"
      :show-icon="false"
      >业务层管理请求与数据，树组件保留原生选择、级联和键盘规则。真实后端全树检索与未加载权限计算由业务接口提供；本页的加载演示会在离开时取消。</NAlert
    >
  </div>
</template>
<script setup lang="ts">
  import { DENSITY_OPTIONS, CONTROLLED_TREE_PROPS, useTreeDemo } from './data'
  defineOptions({ name: 'TreeDemo' })
  const {
    density,
    treeRef,
    selectedKeys,
    expandedKeys,
    checkedKeys,
    keyword,
    lastAction,
    departments,
    largeTree,
    largeExpandedKeys,
    virtualSelectedKeys,
    virtualTreeProps,
    lazyData,
    lazyExpandedKeys,
    lazyFailure,
    loadCount,
    lazyTreeProps,
    checkedSummary,
    selectedSummary,
    handleChecked,
    handleSelected,
    clearState,
    pickFrontend,
    checkLoadedLeaves,
    handleLoadError,
    retryLoad,
    resetLazy,
  } = useTreeDemo()
</script>
<style scoped lang="scss">
  @use './index.scss';
</style>
