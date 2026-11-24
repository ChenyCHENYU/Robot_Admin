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
          page.saved ? `本机保存 ${page.saved}` : '演示流程 · 尚未保存到本机'
        }}</span
        ><NButton
          size="small"
          secondary
          @click="showApprovalSample = true"
        >
          <template #icon><span class="i-mdi-history" /></template>
          查看审批实例 </NButton
        ><NButton
          size="small"
          @click="page.exportJson"
          >导出当前流程</NButton
        ><NButton
          size="small"
          type="primary"
          @click="page.save"
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
        :aria-pressed="page.currentScenario === item.id"
        @click="page.currentScenario = item.id"
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
            ><h2>{{ page.current.name }}</h2
            ><small
              >{{ page.data.nodes.length }} 个节点 ·
              {{ page.data.edges.length }} 条连接</small
            ></div
          ><div class="workspace-actions"
            ><NRadioGroup
              v-model:value="page.mode"
              size="small"
              ><NRadioButton value="edit">编辑</NRadioButton
              ><NRadioButton value="preview"
                >只读预览</NRadioButton
              ></NRadioGroup
            ><NButton
              size="tiny"
              @click="page.validate"
              >检查流程</NButton
            ><NButton
              size="tiny"
              :disabled="page.mode !== 'edit'"
              @click="page.restore"
              >恢复模板</NButton
            ></div
          ></header
        >
        <div
          class="flow-canvas"
          :class="{ 'is-preview': page.mode === 'preview' }"
          ><C_WorkFlow
            ref="workflowRef"
            :key="page.currentScenario"
            v-model="page.data"
            :users="userList"
            :departments="deptList"
            :condition-fields="CONDITION_FIELDS"
            :readonly="page.mode === 'preview'"
            :allow-cycles="false"
            :theme="themeStore.isDark ? 'dark' : 'light'"
            @node-click="page.selectNode"
            @edge-click="page.selectEdge"
            @save="page.save" /></div
        ><footer class="workspace-footer"
          ><span>{{
            page.mode === 'edit'
              ? '点击画布节点打开完整配置；节点下方 + 添加后续步骤'
              : '只读预览中，拖动和配置操作已禁用'
          }}</span
          ><span>各场景草稿独立保留</span></footer
        ></main
      >
      <aside class="workspace-panel flow-inspector">
        <section
          v-if="page.selectedEdge"
          class="workspace-section"
          aria-label="选中连线"
        >
          <h2>连线详情</h2>
          <p
            >{{ page.nodeTitle(page.selectedEdge.source) }} →
            {{ page.nodeTitle(page.selectedEdge.target) }}</p
          >
          <p class="workspace-hint">{{
            page.selectedEdge.label || '未设置连线标签'
          }}</p>
          <small>{{ page.selectedEdge.id }}</small>
        </section>
        <section class="workspace-section">
          <div class="flow-inspector-heading"
            ><span class="i-mdi-tune-variant" /><h2>节点属性</h2
            ><span class="flow-node-type">{{
              page.selected ? NODE_LABELS[page.selected.type] : '未选择'
            }}</span></div
          >
          <NSelect
            :value="page.selectedId"
            size="small"
            aria-label="选择流程节点"
            :options="
              page.data.nodes.map(node => ({
                label: node.data.title,
                value: node.id,
              }))
            "
            @update:value="page.selectedId = $event"
          />
          <template v-if="page.selected">
            <label class="workspace-label"
              ><span>节点名称</span
              ><NInput
                :value="page.selected.data.title"
                :disabled="page.mode !== 'edit'"
                :maxlength="80"
                :input-props="{ 'aria-label': '节点名称' }"
                @update:value="page.updateTitle"
            /></label>
            <template v-if="page.selected.type !== 'condition'">
              <label class="workspace-label"
                ><span>{{
                  page.selected.type === 'start'
                    ? '发起人员'
                    : page.selected.type === 'copy'
                      ? '抄送人员'
                      : '审批人员'
                }}</span
                ><NSelect
                  :value="page.selectedUsers.map(user => user.id)"
                  multiple
                  filterable
                  :disabled="page.mode !== 'edit'"
                  :options="USER_OPTIONS"
                  aria-label="配置节点人员"
                  @update:value="page.updateMembers"
              /></label>
              <div class="flow-people"
                ><div
                  v-for="user in page.selectedUsers"
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
                  v-if="!page.selectedUsers.length"
                  class="workspace-hint"
                  >选择人员后，头像会同步显示在画布。</p
                ></div
              >
            </template>
            <label
              v-if="page.selected.type === 'approval'"
              class="workspace-label"
              ><span>审批方式</span
              ><NSelect
                :value="page.selected.data.approvalMode ?? 'any'"
                :disabled="page.mode !== 'edit'"
                :options="[
                  { label: '或签 · 一人同意即可', value: 'any' },
                  { label: '会签 · 所有人同意', value: 'all' },
                  { label: '顺序 · 按人员顺序审批', value: 'sequence' },
                ]"
                aria-label="审批方式"
                @update:value="page.updateApprovalMode"
            /></label>
            <template v-if="page.selected.type === 'condition'">
              <div
                v-for="(condition, index) in page.selected.data.conditions ??
                []"
                :key="condition.id"
                class="flow-condition"
              >
                <NInput
                  :value="condition.name"
                  placeholder="分支名称"
                  :disabled="page.mode !== 'edit'"
                  :input-props="{ 'aria-label': `分支名称 ${index + 1}` }"
                  @update:value="
                    page.setConditions(
                      (page.selected.data.conditions ?? []).map((item, i) =>
                        i === index ? { ...item, name: $event } : item
                      )
                    )
                  "
                />
                <p>{{
                  condition.isDefault
                    ? '默认分支 · 其他条件均未命中时使用'
                    : `${condition.field} ${condition.operator} ${condition.value}`
                }}</p
                ><span class="workspace-hint"
                  >去向：{{
                    condition.targetNodeId
                      ? page.nodeTitle(condition.targetNodeId)
                      : '尚未绑定'
                  }}。点击条件节点可编辑规则与去向。</span
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
          ><p v-if="!page.validated"
            >点击“检查流程”验证审批人、分支配置和节点连接。</p
          ><NTag
            v-else
            :type="page.errors.length ? 'warning' : 'success'"
            size="small"
            >{{
              page.errors.length
                ? `${page.errors.length} 项待处理`
                : '当前规则检查通过'
            }}</NTag
          ><button
            v-for="(issue, index) in page.errors"
            :key="index"
            class="flow-issue"
            type="button"
            @click="page.selectedId = issue.nodeId"
            ><strong>{{ issue.nodeName }}</strong
            ><span>{{ issue.message }}</span></button
          ></section
        ></aside
      >
    </div>
  </div>
  <C_ApprovalViewer
    v-if="showApprovalSample"
    v-model:show="showApprovalSample"
    :business-key="demoApprovalKey"
    :source="demoApprovalSource"
    title="请假审批 · 演示实例"
  />
</template>
<script setup lang="ts">
  import '@vue-flow/core/dist/style.css'
  import '@vue-flow/core/dist/theme-default.css'
  import { s_themeStore } from '@/stores/theme'
  import {
    workflowScenarios,
    userList,
    deptList,
    CONDITION_FIELDS,
    NODE_LABELS,
    USER_OPTIONS,
    demoApprovalKey,
    demoApprovalSource,
  } from './data'
  import { useWorkflowWorkspace } from './useWorkflowWorkspace'
  defineOptions({ name: 'Demo28WorkFlowEditor' })
  const themeStore = s_themeStore()
  const showApprovalSample = ref(false)
  onDeactivated(() => {
    showApprovalSample.value = false
  })
  const controller = useWorkflowWorkspace()
  const page = proxyRefs(controller)
  const { workflowRef } = controller
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
