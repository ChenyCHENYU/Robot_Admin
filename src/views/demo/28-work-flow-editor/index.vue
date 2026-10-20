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
    <nav
      class="flow-scenarios"
      aria-label="流程场景"
    >
      <button
        v-for="item in workflowScenarios"
        :key="item.id"
        type="button"
        :aria-pressed="currentScenario === item.id"
        @click="currentScenario = item.id"
      >
        <C_Icon
          :name="item.icon"
          :size="20"
        /><span
          ><strong>{{ item.name }}</strong
          ><small>{{ item.description }}</small></span
        >
      </button>
    </nav>
    <div class="flow-layout">
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
      <aside class="workspace-panel flow-inspector">
        <section class="workspace-section">
          <div class="flow-inspector-heading"
            ><span class="i-mdi-tune-variant" /><h2>节点属性</h2
            ><span class="flow-node-type">{{
              selected ? NODE_LABELS[selected.type] : '未选择'
            }}</span></div
          >
          <NSelect
            :value="selectedId"
            size="small"
            aria-label="选择流程节点"
            :options="
              data.nodes.map(node => ({
                label: node.data.title,
                value: node.id,
              }))
            "
            @update:value="selectedId = $event"
          />
          <template v-if="selected">
            <label class="workspace-label"
              ><span>节点名称</span
              ><NInput
                :value="selected.data.title"
                :disabled="mode !== 'edit'"
                :maxlength="80"
                :input-props="{ 'aria-label': '节点名称' }"
                @update:value="updateTitle"
            /></label>
            <template v-if="selected.type !== 'condition'">
              <label class="workspace-label"
                ><span>{{
                  selected.type === 'start'
                    ? '发起人员'
                    : selected.type === 'copy'
                      ? '抄送人员'
                      : '审批人员'
                }}</span
                ><NSelect
                  :value="selectedUsers.map(user => user.id)"
                  multiple
                  filterable
                  :disabled="mode !== 'edit'"
                  :options="USER_OPTIONS"
                  aria-label="配置节点人员"
                  @update:value="updateMembers"
              /></label>
              <div class="flow-people"
                ><div
                  v-for="user in selectedUsers"
                  :key="user.id"
                  class="flow-person"
                  ><img
                    :src="user.avatar"
                    :alt="user.name"
                  /><span
                    ><strong>{{ user.name }}</strong
                    ><small
                      >{{ user.department }} · {{ user.role }}</small
                    ></span
                  ></div
                ><p
                  v-if="!selectedUsers.length"
                  class="workspace-hint"
                  >选择人员后，头像会同步显示在画布。</p
                ></div
              >
            </template>
            <label
              v-if="selected.type === 'approval'"
              class="workspace-label"
              ><span>审批方式</span
              ><NSelect
                :value="selected.data.approvalMode ?? 'any'"
                :disabled="mode !== 'edit'"
                :options="[
                  { label: '或签 · 一人同意即可', value: 'any' },
                  { label: '会签 · 所有人同意', value: 'all' },
                  { label: '顺序 · 按人员顺序审批', value: 'sequence' },
                ]"
                aria-label="审批方式"
                @update:value="updateApprovalMode"
            /></label>
            <template v-if="selected.type === 'condition'">
              <div
                v-for="(condition, index) in selected.data.conditions ?? []"
                :key="condition.id"
                class="flow-condition"
              >
                <NInput
                  :value="condition.name"
                  placeholder="分支名称"
                  :disabled="mode !== 'edit'"
                  :input-props="{ 'aria-label': `分支名称 ${index + 1}` }"
                  @update:value="
                    setConditions(
                      (selected.data.conditions ?? []).map((item, i) =>
                        i === index ? { ...item, name: $event } : item
                      )
                    )
                  "
                />
                <p
                  >{{ condition.field }} {{ condition.operator }}
                  {{ condition.value }}</p
                ><span class="workspace-hint"
                  >点击画布中的条件节点，可编辑判断字段与条件值。</span
                >
              </div>
            </template>
            <p class="flow-inspector-note"
              ><span
                class="i-mdi-information-outline"
              />属性即时同步到画布；点击节点可打开完整配置。</p
            >
          </template>
          <NEmpty
            v-else
            description="点击画布节点开始配置"
          />
        </section>
        <section class="workspace-section"
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
    selectedUsers,
    updateMembers,
    updateApprovalMode,
    setConditions,
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
    save,
    selectNode,
    updateTitle,
    validate,
    restore,
    exportJson,
  } = useWorkflowWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
