<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-03 09:13:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-04 17:11:10
 * @FilePath: \Robot_Admin\src\components\global\C_WorkFlow\index.vue
 * @Description: 工作（审批流）流组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="approval-workflow-container">
    <!-- 浮动工具栏 -->
    <div class="floating-toolbar">
      <NButton
        size="small"
        type="primary"
        @click="saveWorkflow"
      >
        <template #icon
          ><div class="i-mdi:content-save w-4 h-4"></div
        ></template>
        保存
      </NButton>
      <NButton
        size="small"
        @click="previewWorkflow"
      >
        <template #icon><div class="i-mdi:eye w-4 h-4"></div></template>
        预览
      </NButton>
      <NButton
        size="small"
        @click="validateCurrentWorkflow"
        title="检查工作流配置是否正确"
      >
        <template #icon
          ><div class="i-mdi:check-circle w-4 h-4"></div
        ></template>
        验证流程
      </NButton>
      <div class="toolbar-divider"></div>
      <NButton
        size="small"
        @click="fitView"
        title="适应窗口"
      >
        <template #icon
          ><div class="i-mdi:fit-to-screen w-4 h-4"></div
        ></template>
      </NButton>
      <NButton
        size="small"
        type="error"
        @click="clearWorkflow"
        title="清空画布"
      >
        <template #icon
          ><div class="i-mdi:delete-sweep w-4 h-4"></div
        ></template>
      </NButton>
    </div>

    <!-- Vue Flow 画布 -->
    <VueFlow
      ref="vueFlowRef"
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      class="workflow-canvas"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :min-zoom="0.5"
      :max-zoom="2"
      :fit-view-on-init="true"
      :nodes-draggable="true"
      :elements-selectable="true"
      @node-click="onNodeClick"
      @pane-click="closeAddMenu"
    />

    <!-- 节点添加菜单 -->
    <Teleport to="body">
      <div
        v-show="showAddMenu"
        class="add-node-menu"
        :style="{ left: menuPosition.x + 'px', top: menuPosition.y + 'px' }"
      >
        <div class="add-menu-content">
          <div
            v-for="nodeType in NODE_TYPE_OPTIONS"
            :key="nodeType.type"
            class="add-menu-item"
            @click="addNode(nodeType.type)"
          >
            <div
              class="menu-icon"
              :class="nodeType.iconClass"
            >
              <div :class="nodeType.icon"></div>
            </div>
            <span class="menu-text">{{ nodeType.label }}</span>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 节点配置弹窗 - 拆分到独立组件 -->
    <NodeConfigModal
      v-model:show="showNodeConfig"
      :current-node="currentNode"
      :users="users"
      :departments="departments"
      @save="handleConfigSave"
      @cancel="showNodeConfig = false"
    />

    <!-- 验证错误日志抽屉 -->
    <NDrawer
      v-model:show="showValidationErrors"
      :width="450"
      placement="right"
    >
      <NDrawerContent
        title="流程验证结果"
        closable
      >
        <div
          v-if="validationErrors.length === 0"
          class="validation-success"
        >
          <div class="success-icon">
            <div class="i-mdi:check-circle text-32px text-green-500"></div>
          </div>
          <h3>验证通过</h3>
          <p>工作流配置正确，所有节点都已正确设置！</p>
        </div>

        <div
          v-else
          class="validation-errors"
        >
          <div class="error-summary">
            <div class="error-icon">
              <div class="i-mdi:alert-circle text-24px text-red-500"></div>
            </div>
            <h3>发现 {{ validationErrors.length }} 个问题</h3>
            <p>请修复以下问题后重新验证：</p>
          </div>

          <div class="error-list">
            <div
              v-for="(error, index) in validationErrors"
              :key="error.nodeId"
              class="error-item"
            >
              <div class="error-header">
                <span class="error-number">{{ index + 1 }}</span>
                <div class="error-info">
                  <strong class="error-node">{{ error.nodeName }}</strong>
                  <span class="error-field">{{
                    getFieldDisplayName(error.field)
                  }}</span>
                </div>
                <div
                  class="error-type"
                  :class="error.type"
                  >{{ getErrorTypeText(error.type) }}</div
                >
              </div>
              <div class="error-message">{{ error.message }}</div>
              <div class="error-actions">
                <NButton
                  size="small"
                  type="primary"
                  @click="jumpToErrorNode(error.nodeId)"
                >
                  <template #icon
                    ><div class="i-mdi:target w-4 h-4"></div
                  ></template>
                  定位节点
                </NButton>
              </div>
            </div>
          </div>

          <div class="validation-tips">
            <h4>💡 常见问题解决方案：</h4>
            <ul>
              <li
                ><strong>审批人未设置：</strong
                >点击审批节点，在弹窗中选择审批人员</li
              >
              <li
                ><strong>条件分支未配置：</strong
                >点击条件节点，添加至少一个条件分支</li
              >
              <li
                ><strong>节点连接断开：</strong> 检查节点之间的连线是否正确</li
              >
            </ul>
          </div>
        </div>

        <template #footer>
          <div class="validation-footer">
            <NButton @click="showValidationErrors = false">关闭</NButton>
            <NButton
              type="primary"
              @click="validateCurrentWorkflow"
            >
              <template #icon
                ><div class="i-mdi:refresh w-4 h-4"></div
              ></template>
              重新验证
            </NButton>
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>

    <!-- 流程预览抽屉 -->
    <NDrawer
      v-model:show="showPreview"
      :width="520"
      placement="right"
    >
      <NDrawerContent
        title="流程预览"
        closable
      >
        <!-- 统计概览 -->
        <div class="preview-stats">
          <div class="stat-item">
            <span class="stat-value">{{ previewStats.totalNodes }}</span>
            <span class="stat-label">总节点</span>
          </div>
          <div class="stat-item approval">
            <span class="stat-value">{{ previewStats.approvalNodes }}</span>
            <span class="stat-label">审批</span>
          </div>
          <div class="stat-item copy">
            <span class="stat-value">{{ previewStats.copyNodes }}</span>
            <span class="stat-label">抄送</span>
          </div>
          <div class="stat-item condition">
            <span class="stat-value">{{ previewStats.conditionNodes }}</span>
            <span class="stat-label">条件</span>
          </div>
          <div class="stat-item edge">
            <span class="stat-value">{{ previewStats.totalEdges }}</span>
            <span class="stat-label">连线</span>
          </div>
        </div>

        <!-- 流程步骤时间线 -->
        <div class="preview-timeline">
          <div
            v-for="(step, index) in previewSteps"
            :key="step.node.id"
            class="preview-step"
            :class="step.colorClass"
          >
            <!-- 时间线连接线 -->
            <div class="step-connector">
              <div class="step-dot">
                <div
                  :class="step.icon"
                  class="w-4 h-4"
                ></div>
              </div>
              <div
                v-if="index < previewSteps.length - 1"
                class="step-line"
              ></div>
            </div>

            <!-- 步骤内容 -->
            <div class="step-content">
              <div class="step-header">
                <span class="step-order">步骤 {{ step.order }}</span>
                <span class="step-type-badge">{{ step.nodeTypeLabel }}</span>
              </div>
              <div class="step-title">{{ step.node.data.title }}</div>
              <div
                v-if="step.details.length > 0"
                class="step-details"
              >
                <div
                  v-for="(detail, dIdx) in step.details"
                  :key="dIdx"
                  class="step-detail-item"
                  :class="{ 'is-warning': detail.type === 'warning' }"
                >
                  <span class="detail-label">{{ detail.label }}：</span>

                  <!-- 审批方式 badge -->
                  <span
                    v-if="detail.type === 'mode'"
                    class="mode-badge"
                    :class="detail.modeKey"
                  >
                    {{ detail.value }}
                  </span>

                  <!-- 人员 tags -->
                  <template v-else-if="detail.type === 'users'">
                    <NTag
                      v-for="user in detail.users"
                      :key="user.name"
                      size="small"
                      :bordered="false"
                      round
                      class="user-tag"
                    >
                      <template #icon>
                        <div class="i-mdi:account w-3 h-3"></div>
                      </template>
                      {{ user.name }}
                    </NTag>
                  </template>

                  <!-- 警告文案 -->
                  <span
                    v-else-if="detail.type === 'warning'"
                    class="warning-text"
                  >
                    ⚠️ {{ detail.value }}
                  </span>

                  <!-- 普通文本 -->
                  <span v-else>{{ detail.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="previewSteps.length === 0"
          class="preview-empty"
        >
          <div
            class="i-mdi:file-document-outline text-48px text-gray-300"
          ></div>
          <p>暂无流程节点</p>
        </div>

        <template #footer>
          <div class="preview-footer">
            <NButton @click="closePreview">关闭</NButton>
            <NButton
              type="primary"
              @click="
                closePreview()
                saveWorkflow()
              "
            >
              <template #icon
                ><div class="i-mdi:content-save w-4 h-4"></div
              ></template>
              确认并保存
            </NButton>
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<script setup lang="ts">
  import { VueFlow } from '@vue-flow/core'
  import type { WorkflowProps, WorkflowEmits } from '@/types/work-flow'
  import { NODE_TYPE_OPTIONS } from './data'
  import NodeConfigModal from './NodeConfigModal.vue'
  import { useWorkflowNodes } from '@/composables/WorkFlow/useWorkflowNodes'
  import { useWorkflowValidation } from '@/composables/WorkFlow/useWorkflowValidation'
  import { useWorkflowPreview } from '@/composables/WorkFlow/useWorkflowPreview'

  // Props & Emits
  const props = withDefaults(defineProps<WorkflowProps>(), {
    users: () => [],
    roles: () => [],
    departments: () => [],
    readonly: false,
    theme: 'light',
  })

  const emit = defineEmits<WorkflowEmits>()
  const message = useMessage()
  const vueFlowRef = ref()

  // ─── 节点管理 ────────────────────────────────────────────
  const {
    nodes,
    edges,
    showAddMenu,
    menuPosition,
    showNodeConfig,
    currentNode,
    nodeTypes,
    workflowStats,
    addNode,
    onNodeClick,
    closeAddMenu,
    handleConfigSave,
    resetNodes,
    getCurrentWorkflowData,
    fitView,
    deleteNode,
  } = useWorkflowNodes(props, emit, vueFlowRef)

  // ─── 流程验证 ────────────────────────────────────────────
  const {
    validationErrors,
    showValidationErrors,
    validateWorkflow,
    validateCurrentWorkflow,
    jumpToErrorNode,
    getFieldDisplayName,
    getErrorTypeText,
    resetValidation,
  } = useWorkflowValidation(nodes, edges, vueFlowRef, {
    onShowNodeConfig: node => {
      currentNode.value = node
      showNodeConfig.value = true
    },
    onValidateError: errors => emit('validate-error', errors),
  })

  // ─── 流程预览 ────────────────────────────────────────────
  const { showPreview, previewSteps, previewStats, openPreview, closePreview } =
    useWorkflowPreview(nodes, edges)

  // ─── 编排方法（跨 composable 协作） ──────────────────────
  const saveWorkflow = (): void => {
    const errors = validateWorkflow()
    if (errors.length > 0) {
      message.error(`工作流验证失败: ${errors[0].message}`)
      showValidationErrors.value = true
      return
    }
    const data = getCurrentWorkflowData()
    emit('save', data)
    message.success('工作流保存成功')
  }

  const previewWorkflow = (): void => {
    openPreview()
  }

  const clearWorkflow = (): void => {
    resetNodes()
    resetValidation()
  }

  // ─── 暴露方法 ────────────────────────────────────────────
  defineExpose({
    validateWorkflow,
    getCurrentWorkflowData,
    saveWorkflow,
    previewWorkflow,
    deleteNode,
    stats: workflowStats,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
