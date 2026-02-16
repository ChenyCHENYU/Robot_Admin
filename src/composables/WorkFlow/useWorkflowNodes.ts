/**
 * 工作流节点管理 Composable
 * 封装节点 CRUD、provide/inject、边重连、画布操作等逻辑
 */

import type { Component, Ref } from 'vue'
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowData,
  WorkflowProps,
  NodeType,
  MenuPosition,
} from '@/types/work-flow'
import {
  NODE_TITLES,
  INITIAL_NODE,
  NODE_Y_GAP,
  generateEdgeId,
} from '@/components/global/C_WorkFlow/data'

import StartNode from '@/components/global/C_WorkFlow/nodes/StartNode.vue'
import ApprovalNode from '@/components/global/C_WorkFlow/nodes/ApprovalNode.vue'
import CopyNode from '@/components/global/C_WorkFlow/nodes/CopyNode.vue'
import ConditionNode from '@/components/global/C_WorkFlow/nodes/ConditionNode.vue'

/** 节点组件映射（模块级常量，仅初始化一次） */
const NODE_COMPONENT_MAP: Record<string, Component> = {
  start: markRaw(StartNode),
  approval: markRaw(ApprovalNode),
  copy: markRaw(CopyNode),
  condition: markRaw(ConditionNode),
}

type EmitFn = (event: string, ...args: any[]) => void

/** 工作流节点管理 —— 封装节点 CRUD、provide/inject、边重连、画布操作等逻辑 */
export function useWorkflowNodes(
  props: WorkflowProps,
  emit: EmitFn,
  vueFlowRef: Ref
) {
  const message = useMessage()

  // ─── 响应式状态 ──────────────────────────────────────────
  const nodes = ref<WorkflowNode[]>([{ ...INITIAL_NODE }])
  const edges = ref<WorkflowEdge[]>([])
  const showAddMenu = ref(false)
  const menuPosition = ref<MenuPosition>({ x: 0, y: 0 })
  const showNodeConfig = ref(false)
  const currentNode = ref<WorkflowNode | null>(null)
  const currentAddNodeId = ref<string | null>(null)

  // ─── 计算属性 ────────────────────────────────────────────
  const nodeTypes = computed(() => NODE_COMPONENT_MAP)

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

  // ─── 数据操作 ────────────────────────────────────────────
  /** 获取当前工作流完整数据 */
  const getCurrentWorkflowData = (): WorkflowData => ({
    nodes: nodes.value,
    edges: edges.value,
    config: { version: '1.0', createdAt: new Date().toISOString() },
  })

  /** 触发数据变更事件 */
  const emitChange = (): void => {
    const data = getCurrentWorkflowData()
    emit('update:modelValue', data)
    emit('change', data)
  }

  /** 延迟适应画布视图 */
  const deferFitView = (padding = 60, duration = 400): void => {
    nextTick(() => {
      setTimeout(() => {
        vueFlowRef.value?.fitView?.({ padding, duration })
      }, 100)
    })
  }

  // ─── 添加菜单 ────────────────────────────────────────────
  const handleShowAddMenu = (position: MenuPosition, nodeId?: string): void => {
    menuPosition.value = {
      x: typeof position.x === 'number' ? position.x : 0,
      y: typeof position.y === 'number' ? position.y : 0,
    }
    currentAddNodeId.value = nodeId || null
    showAddMenu.value = true
  }

  const closeAddMenu = (): void => {
    showAddMenu.value = false
  }

  // ─── 节点删除 ────────────────────────────────────────────
  const deleteNode = (nodeId: string): void => {
    if (nodeId === 'start-1') {
      message.warning('不能删除开始节点')
      return
    }

    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
    if (nodeIndex === -1) return

    // 收集上下游边，用于重连
    const incomingEdges = edges.value.filter(e => e.target === nodeId)
    const outgoingEdges = edges.value.filter(e => e.source === nodeId)

    // 移除节点和关联边
    nodes.value.splice(nodeIndex, 1)
    edges.value = edges.value.filter(
      e => e.source !== nodeId && e.target !== nodeId
    )

    // 重连上下游
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

    // 下移后续节点位置
    nodes.value.forEach((node, i) => {
      if (i >= nodeIndex) node.position.y -= NODE_Y_GAP
    })

    emitChange()
    message.success('节点已删除')
    deferFitView()
  }

  // ─── provide 注入给子节点组件 ─────────────────────────────
  provide('showAddMenu', handleShowAddMenu)
  provide('deleteNode', deleteNode)

  // ─── 节点添加（内部辅助） ─────────────────────────────────
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
      y: (targetNode?.position.y || 130) + NODE_Y_GAP,
    },
    data: {
      title: NODE_TITLES[type],
      status: 'pending',
      ...(type === 'approval' && { approvers: [], approvalMode: 'any' }),
      ...(type === 'copy' && { copyUsers: [] }),
      ...(type === 'condition' && { conditions: [] }),
    },
  })

  /** 将新节点插入到 targetNode 之后，重连所有边 */
  const reconnectEdges = (
    targetNode: WorkflowNode,
    newNode: WorkflowNode
  ): void => {
    const outgoing = edges.value.filter(e => e.source === targetNode.id)
    edges.value = edges.value.filter(e => e.source !== targetNode.id)

    // 原节点 → 新节点
    edges.value.push({
      id: generateEdgeId(targetNode.id, newNode.id),
      source: targetNode.id,
      target: newNode.id,
      animated: true,
      type: 'default',
    })

    // 新节点 → 原下游
    outgoing.forEach(edge => {
      edges.value.push({
        id: generateEdgeId(newNode.id, edge.target),
        source: newNode.id,
        target: edge.target,
        animated: true,
        type: 'default',
      })
    })
  }

  // ─── 节点添加（公开） ─────────────────────────────────────
  const addNode = (type: NodeType): void => {
    try {
      const { targetNodeIndex, targetNode } = getTargetNodeInfo()
      const newNode = createNewNode(type, targetNode)

      nodes.value.splice(targetNodeIndex + 1, 0, newNode)

      // 下推后续节点
      for (let i = targetNodeIndex + 2; i < nodes.value.length; i++) {
        nodes.value[i].position.y += NODE_Y_GAP
      }

      if (targetNode) reconnectEdges(targetNode, newNode)

      showAddMenu.value = false
      currentAddNodeId.value = null
      emitChange()
      deferFitView()
    } catch (error) {
      console.error('Error adding node:', error)
      message.error('添加节点失败，请重试')
    }
  }

  // ─── 节点交互 ────────────────────────────────────────────
  const onNodeClick = (event: { node: WorkflowNode }): void => {
    const { node } = event
    currentNode.value = node
    showNodeConfig.value = true
    emit('node-click', node)
  }

  const handleConfigSave = (configData: Record<string, unknown>): void => {
    if (!currentNode.value) return

    const nodeIndex = nodes.value.findIndex(n => n.id === currentNode.value!.id)
    if (nodeIndex !== -1) {
      const updatedNode = {
        ...nodes.value[nodeIndex],
        data: { ...nodes.value[nodeIndex].data, ...configData },
      }
      nodes.value.splice(nodeIndex, 1, updatedNode)
      currentNode.value = updatedNode
    }

    emitChange()
    showNodeConfig.value = false
    message.success('节点配置已保存')
  }

  // ─── 画布操作 ────────────────────────────────────────────
  const fitView = (): void => {
    if (!vueFlowRef.value?.fitView) {
      message.warning('画布未准备就绪，请稍后重试')
      return
    }
    nextTick(() => {
      vueFlowRef.value.fitView({
        padding: 50,
        includeHiddenNodes: false,
        minZoom: 0.5,
        maxZoom: 1.5,
        duration: 800,
      })
    })
    message.success('已适应窗口大小')
  }

  /** 重置节点和边（不涉及验证状态） */
  const resetNodes = (): void => {
    nodes.value = [{ ...INITIAL_NODE }]
    edges.value = []
    emitChange()
    deferFitView(80, 600)
    message.success('画布已清空')
  }

  // ─── 生命周期 ────────────────────────────────────────────
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

  return {
    // 状态
    nodes,
    edges,
    showAddMenu,
    menuPosition,
    showNodeConfig,
    currentNode,
    // 计算属性
    nodeTypes,
    workflowStats,
    // 方法
    addNode,
    onNodeClick,
    closeAddMenu,
    handleConfigSave,
    resetNodes,
    getCurrentWorkflowData,
    fitView,
    deleteNode,
  }
}
