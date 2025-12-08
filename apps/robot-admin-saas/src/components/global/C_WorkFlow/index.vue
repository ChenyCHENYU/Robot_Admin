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
          <h3>✅ 验证通过</h3>
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
            <h3>❌ 发现 {{ validationErrors.length }} 个问题</h3>
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
  </div>
</template>

<script setup lang="ts">
  import { VueFlow, type NodeMouseEvent } from '@vue-flow/core'
  import type { Component } from 'vue'

  // 导入类型定义
  import type {
    WorkflowNode,
    WorkflowEdge,
    WorkflowData,
    WorkflowProps,
    WorkflowEmits,
    NodeType,
    MenuPosition,
    ValidationError,
  } from '@/types/work-flow'

  // 导入数据常量
  import {
    NODE_TYPE_OPTIONS,
    NODE_TITLES,
    FIELD_DISPLAY_NAMES,
    ERROR_TYPE_TEXTS,
    INITIAL_NODE,
    generateEdgeId,
  } from './data'

  // 导入节点组件
  import StartNode from './nodes/StartNode.vue'
  import ApprovalNode from './nodes/ApprovalNode.vue'
  import CopyNode from './nodes/CopyNode.vue'
  import ConditionNode from './nodes/ConditionNode.vue'

  // 导入节点配置弹窗组件
  import NodeConfigModal from './NodeConfigModal.vue'

  // 节点组件映射
  const NODE_TYPES: Record<string, Component> = {
    start: markRaw(StartNode),
    approval: markRaw(ApprovalNode),
    copy: markRaw(CopyNode),
    condition: markRaw(ConditionNode),
  }

  // Props & Emits
  const props = withDefaults(defineProps<WorkflowProps>(), {
    users: () => [],
    roles: () => [],
    departments: () => [],
    readonly: false,
    theme: 'light',
  })

  const emit = defineEmits<WorkflowEmits>()

  // 响应式数据
  const message = useMessage()
  const vueFlowRef = ref()

  const nodes = ref<WorkflowNode[]>([{ ...INITIAL_NODE }])
  const edges = ref<WorkflowEdge[]>([])
  const showAddMenu = ref(false)
  const menuPosition = ref<MenuPosition>({ x: 0, y: 0 })
  const showNodeConfig = ref(false)
  const currentNode = ref<WorkflowNode | null>(null)
  const validationErrors = ref<ValidationError[]>([])
  const showValidationErrors = ref(false)
  const currentAddNodeId = ref<string | null>(null)

  // 计算属性
  const nodeTypes = computed(() => NODE_TYPES)

  const workflowStats = computed(() => {
    const stats = {
      totalNodes: nodes.value.length,
      approvalNodes: 0,
      copyNodes: 0,
      conditionNodes: 0,
    }
    nodes.value.forEach(n => {
      if (n.type === 'approval') stats.approvalNodes++
      else if (n.type === 'copy') stats.copyNodes++
      else if (n.type === 'condition') stats.conditionNodes++
    })
    return stats
  })

  // 方法定义
  const handleShowAddMenu = (position: MenuPosition, nodeId?: string): void => {
    try {
      menuPosition.value = {
        x: typeof position.x === 'number' ? position.x : 0,
        y: typeof position.y === 'number' ? position.y : 0,
      }
      currentAddNodeId.value = nodeId || null
      showAddMenu.value = true
    } catch (error) {
      console.error('Error showing add menu:', error)
    }
  }

  const deleteNode = (nodeId: string): void => {
    if (nodeId === 'start-1') {
      message?.warning?.('不能删除开始节点')
      return
    }

    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
    if (nodeIndex === -1) return

    const incomingEdges = edges.value.filter(edge => edge.target === nodeId)
    const outgoingEdges = edges.value.filter(edge => edge.source === nodeId)

    nodes.value.splice(nodeIndex, 1)
    edges.value = edges.value.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    )

    incomingEdges.forEach(inEdge => {
      outgoingEdges.forEach(outEdge => {
        edges.value.push({
          id: generateEdgeId(inEdge.source, outEdge.target),
          source: inEdge.source,
          target: outEdge.target,
          animated: true,
          type: 'default',
        })
      })
    })

    nodes.value.forEach((node, index) => {
      if (index >= nodeIndex) {
        node.position.y -= 120
      }
    })

    emitChange()
    message?.success?.('节点已删除')

    nextTick(() => {
      setTimeout(() => {
        vueFlowRef.value?.fitView?.({ padding: 60, duration: 400 })
      }, 100)
    })
  }

  provide('showAddMenu', handleShowAddMenu)
  provide('deleteNode', deleteNode)

  // 节点添加逻辑
  const getTargetNodeInfo = () => {
    let targetNodeIndex = nodes.value.length - 1
    let targetNode = nodes.value[targetNodeIndex]

    if (currentAddNodeId.value) {
      const foundIndex = nodes.value.findIndex(
        n => n.id === currentAddNodeId.value
      )
      if (foundIndex !== -1) {
        targetNodeIndex = foundIndex
        targetNode = nodes.value[targetNodeIndex]
      }
    }
    return { targetNodeIndex, targetNode }
  }

  const createNewNode = (
    type: NodeType,
    targetNode: WorkflowNode | null
  ): WorkflowNode => ({
    id: `${type}-${Date.now()}`,
    type,
    position: {
      x: targetNode?.position.x || 150,
      y: (targetNode?.position.y || 130) + 120,
    },
    data: {
      title: NODE_TITLES[type],
      status: 'pending',
      ...(type === 'approval' && { approvers: [], approvalMode: 'any' }),
      ...(type === 'copy' && { copyUsers: [] }),
      ...(type === 'condition' && { conditions: [] }),
    },
  })

  const handleEdgeReconnection = (
    targetNode: WorkflowNode,
    newNode: WorkflowNode
  ) => {
    const targetOutgoingEdges = edges.value.filter(
      edge => edge.source === targetNode.id
    )
    edges.value = edges.value.filter(edge => edge.source !== targetNode.id)

    edges.value.push({
      id: generateEdgeId(targetNode.id, newNode.id),
      source: targetNode.id,
      target: newNode.id,
      animated: true,
      type: 'default',
    })

    targetOutgoingEdges.forEach(edge => {
      edges.value.push({
        id: generateEdgeId(newNode.id, edge.target),
        source: newNode.id,
        target: edge.target,
        animated: true,
        type: 'default',
      })
    })
  }

  const addNode = (type: NodeType): void => {
    try {
      const { targetNodeIndex, targetNode } = getTargetNodeInfo()
      const newNode = createNewNode(type, targetNode)

      nodes.value.splice(targetNodeIndex + 1, 0, newNode)

      for (let i = targetNodeIndex + 2; i < nodes.value.length; i++) {
        nodes.value[i].position.y += 120
      }

      if (targetNode) {
        handleEdgeReconnection(targetNode, newNode)
      }

      showAddMenu.value = false
      currentAddNodeId.value = null
      emitChange()

      nextTick(() => {
        setTimeout(() => {
          vueFlowRef.value?.fitView?.({ padding: 60, duration: 400 })
        }, 100)
      })
    } catch (error) {
      console.error('Error adding node:', error)
      message?.error?.('添加节点失败，请重试')
    }
  }

  const onNodeClick = (event: NodeMouseEvent): void => {
    try {
      const node = event.node as WorkflowNode
      currentNode.value = node
      showNodeConfig.value = true
      emit('node-click', node)
    } catch (error) {
      console.error('Error handling node click:', error)
    }
  }

  const closeAddMenu = (): void => {
    showAddMenu.value = false
  }

  // 处理配置保存
  const handleConfigSave = (configData: any): void => {
    if (currentNode.value) {
      const nodeIndex = nodes.value.findIndex(
        n => n.id === currentNode.value!.id
      )
      if (nodeIndex !== -1) {
        // 创建新的节点对象，确保响应式更新
        const updatedNode = {
          ...nodes.value[nodeIndex],
          data: {
            ...nodes.value[nodeIndex].data,
            ...configData,
          },
        }

        // 替换数组中的节点，触发响应式更新
        nodes.value.splice(nodeIndex, 1, updatedNode)

        // 更新当前节点引用
        currentNode.value = updatedNode
      }

      emitChange()
      showNodeConfig.value = false
      message?.success?.('节点配置已保存')
    }
  }

  const saveWorkflow = (): void => {
    const errors = validateWorkflow()
    if (errors.length > 0) {
      message?.error?.(`工作流验证失败: ${errors[0].message}`)
      showValidationErrors.value = true
      return
    }

    const data = getCurrentWorkflowData()
    emit('save', data)
    message?.success?.('工作流保存成功')
  }

  const previewWorkflow = (): void => {
    const data = getCurrentWorkflowData()
    console.log('预览工作流', data)
    message?.info?.('预览功能开发中...')
  }

  const validateCurrentWorkflow = (): void => {
    const errors = validateWorkflow()
    validationErrors.value = errors

    if (errors.length === 0) {
      message?.success?.('✅ 工作流验证通过！所有节点配置正确')
      showValidationErrors.value = false
    } else {
      message?.error?.(`❌ 发现 ${errors.length} 个问题，请查看详细错误`)
      showValidationErrors.value = true
      emit('validate-error', errors)
    }
  }

  const fitView = (): void => {
    try {
      if (vueFlowRef.value?.fitView) {
        nextTick(() => {
          vueFlowRef.value.fitView({
            padding: 50,
            includeHiddenNodes: false,
            minZoom: 0.5,
            maxZoom: 1.5,
            duration: 800,
          })
        })
        message?.success?.('已适应窗口大小')
      } else {
        message?.warning?.('画布未准备就绪，请稍后重试')
      }
    } catch (error) {
      console.error('FitView error:', error)
      message?.error?.('适应窗口失败')
    }
  }

  const clearWorkflow = (): void => {
    nodes.value = [{ ...INITIAL_NODE }]
    edges.value = []
    validationErrors.value = []
    showValidationErrors.value = false
    emitChange()

    nextTick(() => {
      setTimeout(() => {
        vueFlowRef.value?.fitView?.({ padding: 80, duration: 600 })
      }, 100)
    })

    message?.success?.('画布已清空')
  }

  const validateWorkflow = (): ValidationError[] => {
    const errors: ValidationError[] = []

    nodes.value.forEach(node => {
      if (node.type === 'approval') {
        const approvers = (node.data as any).approvers || []
        if (approvers.length === 0) {
          errors.push({
            nodeId: node.id,
            nodeName: node.data.title,
            field: 'approvers',
            message: '审批节点必须设置至少一个审批人，否则流程无法正常运行',
            type: 'required',
          })
        }
      }

      if (node.type === 'condition') {
        const conditions = (node.data as any).conditions || []
        if (conditions.length === 0) {
          errors.push({
            nodeId: node.id,
            nodeName: node.data.title,
            field: 'conditions',
            message:
              '条件分支节点必须配置至少一个分支条件，否则无法进行条件判断',
            type: 'required',
          })
        } else {
          const incompleteConditions = conditions.filter(
            (c: any) => !c.name || !c.field || !c.operator || !c.value
          )
          if (incompleteConditions.length > 0) {
            errors.push({
              nodeId: node.id,
              nodeName: node.data.title,
              field: 'conditions',
              message: `有 ${incompleteConditions.length} 个条件分支配置不完整，请完善所有必填字段`,
              type: 'incomplete',
            })
          }
        }
      }
    })

    const connectedNodes = new Set<string>()
    edges.value.forEach(edge => {
      connectedNodes.add(edge.source)
      connectedNodes.add(edge.target)
    })

    nodes.value.forEach(node => {
      if (node.type !== 'start' && !connectedNodes.has(node.id)) {
        errors.push({
          nodeId: node.id,
          nodeName: node.data.title,
          field: 'connection',
          message: '此节点未与其他节点连接，可能导致流程中断',
          type: 'warning',
        })
      }
    })

    return errors
  }

  const getFieldDisplayName = (field: string): string =>
    FIELD_DISPLAY_NAMES[field] || field
  const getErrorTypeText = (type: string): string =>
    ERROR_TYPE_TEXTS[type] || type

  const jumpToErrorNode = (nodeId: string): void => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node && vueFlowRef.value) {
      vueFlowRef.value.setCenter(node.position.x, node.position.y, {
        zoom: 1.2,
        duration: 800,
      })

      setTimeout(() => {
        currentNode.value = node
        showNodeConfig.value = true
        showValidationErrors.value = false
      }, 900)

      message?.info?.(`已定位到节点：${node.data.title}`)
    }
  }

  const getCurrentWorkflowData = (): WorkflowData => ({
    nodes: nodes.value,
    edges: edges.value,
    config: {
      version: '1.0',
      createdAt: new Date().toISOString(),
    },
  })

  const emitChange = (): void => {
    const data = getCurrentWorkflowData()
    emit('update:modelValue', data)
    emit('change', data)
  }

  watch(
    () => props.modelValue,
    newValue => {
      if (newValue && newValue !== getCurrentWorkflowData()) {
        nodes.value = newValue.nodes || []
        edges.value = newValue.edges || []
      }
    },
    { deep: true }
  )

  onMounted(() => {
    nextTick(() => {
      setTimeout(() => {
        vueFlowRef.value?.fitView?.({
          padding: 80,
          includeHiddenNodes: false,
          minZoom: 0.8,
          maxZoom: 1.2,
          duration: 600,
        })
      }, 300)
    })
  })

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
