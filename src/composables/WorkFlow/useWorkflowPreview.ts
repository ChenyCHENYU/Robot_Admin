/**
 * 工作流预览 Composable
 * 封装流程预览逻辑、节点排序和步骤展示
 */

import type { Ref } from 'vue'
import type { WorkflowNode, WorkflowEdge } from '@/types/work-flow'

/** 详情项类型 */
export type DetailItemType = 'text' | 'mode' | 'users' | 'warning'

/** 结构化详情项 */
export interface DetailItem {
  type: DetailItemType
  label: string
  value?: string
  users?: { name: string; department?: string }[]
  modeKey?: string
}

/** 流程步骤（已排序） */
export interface FlowStep {
  order: number
  node: WorkflowNode
  nodeTypeLabel: string
  icon: string
  colorClass: string
  details: DetailItem[]
  children?: FlowStep[]
}

/** 预览统计信息 */
export interface PreviewStats {
  totalNodes: number
  approvalNodes: number
  copyNodes: number
  conditionNodes: number
  totalEdges: number
}

const NODE_TYPE_META: Record<
  string,
  { label: string; icon: string; colorClass: string }
> = {
  start: { label: '发起人', icon: 'i-mdi:play-circle', colorClass: 'start' },
  approval: {
    label: '审批节点',
    icon: 'i-mdi:account-check',
    colorClass: 'approval',
  },
  copy: { label: '抄送节点', icon: 'i-mdi:email-outline', colorClass: 'copy' },
  condition: {
    label: '条件分支',
    icon: 'i-mdi:source-branch',
    colorClass: 'condition',
  },
}

const APPROVAL_MODE_LABELS: Record<string, string> = {
  any: '或签（任一审批人通过即可）',
  all: '会签（所有审批人必须通过）',
  sequence: '顺序审批（按顺序依次审批）',
}

const OPERATOR_LABELS: Record<string, string> = {
  equals: '等于',
  not_equals: '不等于',
  greater_than: '大于',
  less_than: '小于',
  contains: '包含',
}

/** 工作流预览 —— 封装流程预览逻辑、节点排序和步骤展示 */
export function useWorkflowPreview(
  nodes: Ref<WorkflowNode[]>,
  edges: Ref<WorkflowEdge[]>
) {
  // ─── 响应式状态 ──────────────────────────────────────────
  const showPreview = ref(false)
  const previewSteps = ref<FlowStep[]>([])
  const previewStats = ref<PreviewStats>({
    totalNodes: 0,
    approvalNodes: 0,
    copyNodes: 0,
    conditionNodes: 0,
    totalEdges: 0,
  })

  // ─── 节点详情提取 ────────────────────────────────────────
  /** 提取开始节点详情 */
  const extractStartDetails = (data: any): DetailItem[] => {
    const initiators = data.initiators || []
    return initiators.length > 0
      ? [{ type: 'users', label: '发起人', users: initiators }]
      : [{ type: 'text', label: '发起人', value: '所有人' }]
  }

  /** 提取审批节点详情 */
  const extractApprovalDetails = (data: any): DetailItem[] => {
    const mode = data.approvalMode || 'any'
    const approvers = data.approvers || []
    const items: DetailItem[] = [
      {
        type: 'mode',
        label: '审批方式',
        value: APPROVAL_MODE_LABELS[mode] || mode,
        modeKey: mode,
      },
    ]
    if (approvers.length > 0) {
      items.push({ type: 'users', label: '审批人', users: approvers })
    } else {
      items.push({ type: 'warning', label: '审批人', value: '未设置' })
    }
    return items
  }

  /** 提取抄送节点详情 */
  const extractCopyDetails = (data: any): DetailItem[] => {
    const copyUsers = data.copyUsers || []
    return copyUsers.length > 0
      ? [{ type: 'users', label: '抄送人', users: copyUsers }]
      : [{ type: 'text', label: '抄送人', value: '未设置' }]
  }

  /** 提取条件节点详情 */
  const extractConditionDetails = (data: any): DetailItem[] => {
    const conditions = data.conditions || []
    if (conditions.length === 0) {
      return [{ type: 'warning', label: '条件分支', value: '未配置' }]
    }
    return conditions.map((cond: any, i: number) => {
      const op = OPERATOR_LABELS[cond.operator] || cond.operator
      return {
        type: 'text' as const,
        label: `分支 ${i + 1}`,
        value: `${cond.name || '未命名'} — ${cond.field || '?'} ${op} ${cond.value || '?'}`,
      }
    })
  }

  /** 节点详情提取策略 */
  const detailExtractors: Record<string, (data: any) => DetailItem[]> = {
    start: extractStartDetails,
    approval: extractApprovalDetails,
    copy: extractCopyDetails,
    condition: extractConditionDetails,
  }

  /** 从节点数据中提取可读的配置详情 */
  const extractNodeDetails = (node: WorkflowNode): DetailItem[] => {
    const extractor = detailExtractors[node.type || 'start']
    return extractor ? extractor(node.data) : []
  }

  // ─── 拓扑排序 ────────────────────────────────────────────
  /** 基于 BFS 对流程节点进行拓扑排序 */
  const sortNodesByFlow = (): WorkflowNode[] => {
    const nodeMap = new Map<string, WorkflowNode>()
    nodes.value.forEach(n => nodeMap.set(n.id, n))

    const adjacency = new Map<string, string[]>()
    const inDegree = new Map<string, number>()
    nodes.value.forEach(n => {
      adjacency.set(n.id, [])
      inDegree.set(n.id, 0)
    })

    edges.value.forEach(e => {
      adjacency.get(e.source)?.push(e.target)
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1)
    })

    // 从入度为 0 的节点（start）开始 BFS
    const queue: string[] = []
    inDegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id)
    })

    const sorted: WorkflowNode[] = []
    const visited = new Set<string>()

    while (queue.length > 0) {
      const id = queue.shift()!
      if (visited.has(id)) continue
      visited.add(id)

      const node = nodeMap.get(id)
      if (node) sorted.push(node)

      const neighbors = adjacency.get(id) || []
      for (const next of neighbors) {
        const newDeg = (inDegree.get(next) || 1) - 1
        inDegree.set(next, newDeg)
        if (newDeg <= 0 && !visited.has(next)) {
          queue.push(next)
        }
      }
    }

    // 追加未连接的孤立节点
    nodes.value.forEach(n => {
      if (!visited.has(n.id)) sorted.push(n)
    })

    return sorted
  }

  // ─── 生成流程步骤 ────────────────────────────────────────
  /** 构建预览步骤列表 */
  const buildFlowSteps = (): FlowStep[] => {
    const sorted = sortNodesByFlow()
    return sorted.map((node, index) => {
      const meta = NODE_TYPE_META[node.type || 'start'] || NODE_TYPE_META.start
      return {
        order: index + 1,
        node,
        nodeTypeLabel: meta.label,
        icon: meta.icon,
        colorClass: meta.colorClass,
        details: extractNodeDetails(node),
      }
    })
  }

  // ─── 统计信息 ────────────────────────────────────────────
  const computeStats = (): PreviewStats => {
    const stats: PreviewStats = {
      totalNodes: nodes.value.length,
      approvalNodes: 0,
      copyNodes: 0,
      conditionNodes: 0,
      totalEdges: edges.value.length,
    }
    nodes.value.forEach(n => {
      if (n.type === 'approval') stats.approvalNodes++
      else if (n.type === 'copy') stats.copyNodes++
      else if (n.type === 'condition') stats.conditionNodes++
    })
    return stats
  }

  // ─── 公开方法 ────────────────────────────────────────────
  /** 打开预览面板 */
  const openPreview = (): void => {
    previewSteps.value = buildFlowSteps()
    previewStats.value = computeStats()
    showPreview.value = true
  }

  /** 关闭预览面板 */
  const closePreview = (): void => {
    showPreview.value = false
  }

  return {
    showPreview,
    previewSteps,
    previewStats,
    openPreview,
    closePreview,
  }
}
