<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 审批流工作台，场景、设计画布和属性检查形成单一路径
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace workflow-workspace">
    <header class="workspace-heading"
      ><div
        ><small>APPROVAL FLOW STUDIO</small><h1>工作流设计工作台</h1
        ><p>选择场景、配置节点、检查流程，再保存到本机或导出。</p></div
      ><div class="workspace-actions"
        ><span class="workspace-hint">{{
          saved ? `本机保存 ${saved}` : '演示流程 · 尚未保存到本机'
        }}</span
        ><NButton
          size="small"
          @click="exportJson"
          >导出当前流程</NButton
        ><NButton
          size="small"
          type="primary"
          @click="save"
          >保存到本机</NButton
        ></div
      ></header
    >
    <div class="flow-layout"
      ><aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2>流程场景</h2
          ><button
            v-for="item in workflowScenarios"
            :key="item.id"
            type="button"
            class="workspace-choice"
            :aria-pressed="currentScenario === item.id"
            @click="currentScenario = item.id"
            ><span
              ><strong>{{ item.name }}</strong
              ><small>{{ item.description }}</small></span
            ></button
          ></section
        ><section class="workspace-section"
          ><h2>节点目录 · {{ data.nodes.length }}</h2
          ><button
            v-for="node in data.nodes"
            :key="node.id"
            type="button"
            class="workspace-choice"
            :aria-pressed="selectedId === node.id"
            @click="selectNode(node)"
            ><span
              class="flow-node-dot"
              :class="node.type"
            /><span
              ><strong>{{ node.data.title }}</strong
              ><small>{{ NODE_LABELS[node.type] }}</small></span
            ></button
          ></section
        ></aside
      >
      <main class="workspace-panel"
        ><header class="workspace-toolbar"
          ><div
            ><h2>{{ current.name }}</h2
            ><small
              >{{ data.nodes.length }} 个节点 ·
              {{ data.edges.length }} 条连接</small
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
              @click="validate"
              >检查流程</NButton
            ><NButton
              size="tiny"
              :disabled="mode !== 'edit'"
              @click="restore"
              >恢复模板</NButton
            ></div
          ></header
        >
        <div
          class="flow-canvas"
          :class="{ 'is-preview': mode === 'preview' }"
          ><C_WorkFlow
            ref="workflowRef"
            :key="currentScenario"
            v-model="data"
            :users="userList"
            :roles="roleList"
            :departments="deptList"
            :readonly="mode === 'preview'"
            :allow-cycles="false"
            :theme="themeStore.isDark ? 'dark' : 'light'"
            @node-click="selectNode"
            @save="save" /></div
        ><footer class="workspace-footer"
          ><span>{{
            mode === 'edit'
              ? '点击画布节点打开完整配置；节点下方 + 添加后续步骤'
              : '只读预览中，拖动和配置操作已禁用'
          }}</span
          ><span>各场景草稿独立保留</span></footer
        ></main
      >
      <aside class="workspace-panel flow-inspector"
        ><section class="workspace-section"
          ><h2>节点属性</h2
          ><template v-if="selected"
            ><span class="flow-node-type">{{ NODE_LABELS[selected.type] }}</span
            ><label class="workspace-label"
              ><span>节点名称</span
              ><NInput
                :value="selected.data.title"
                :disabled="mode !== 'edit'"
                :maxlength="80"
                :input-props="{ 'aria-label': '节点名称' }"
                @update:value="updateTitle" /></label
            ><label
              v-if="selected.type === 'approval'"
              class="workspace-label"
              ><span>审批人</span
              ><NSelect
                :value="approvers"
                multiple
                :disabled="mode !== 'edit'"
                :options="USER_OPTIONS"
                @update:value="updateApprovers" /></label
            ><p class="workspace-hint">{{ selected.id }}</p
            ><p
              >高级审批、条件和抄送设置，可在编辑模式点击画布中的对应节点配置。</p
            ></template
          ><NEmpty
            v-else
            description="从节点目录选择一项" /></section
        ><section class="workspace-section"
          ><h2>检查结果</h2
          ><p v-if="!validated"
            >点击“检查流程”验证审批人、分支配置和节点连接。</p
          ><NTag
            v-else
            :type="errors.length ? 'warning' : 'success'"
            size="small"
            >{{
              errors.length ? `${errors.length} 项待处理` : '当前规则检查通过'
            }}</NTag
          ><button
            v-for="(issue, index) in errors"
            :key="index"
            class="flow-issue"
            type="button"
            @click="selectedId = issue.nodeId"
            ><strong>{{ issue.nodeName }}</strong
            ><span>{{ issue.message }}</span></button
          ></section
        ></aside
      >
    </div>
  </div>
</template>
<script setup lang="ts">
  import '@vue-flow/core/dist/style.css'
  import '@vue-flow/core/dist/theme-default.css'
  import { s_themeStore } from '@/stores/theme'
  import { workflowScenarios, userList, roleList, deptList } from './data'
  import { useWorkflowWorkspace } from './useWorkflowWorkspace'
  defineOptions({ name: 'Demo28WorkFlowEditor' })
  const themeStore = s_themeStore()
  const NODE_LABELS = {
    start: '发起',
    approval: '审批',
    copy: '抄送',
    condition: '条件分支',
  }
  const USER_OPTIONS = userList.map(user => ({
    label: user.name,
    value: user.id,
  }))
  const {
    currentScenario,
    mode,
    saved,
    selectedId,
    errors,
    validated,
    workflowRef,
    current,
    data,
    selected,
    approvers,
    save,
    selectNode,
    updateTitle,
    updateApprovers,
    validate,
    restore,
    exportJson,
  } = useWorkflowWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
