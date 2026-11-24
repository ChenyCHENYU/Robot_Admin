/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @Description: 工作流浏览器草稿解析
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  WorkflowData,
  WorkflowNode,
} from '@robot-admin/naive-ui-components/C_WorkFlow'
import { workflowScenarios } from './data'

const validStoredPosition = (position: WorkflowNode['position'] | undefined) =>
  Number.isFinite(position?.x) && Number.isFinite(position?.y)

const validStoredNode = (value: unknown): value is WorkflowNode => {
  if (!value || typeof value !== 'object') return false
  const node = value as Partial<WorkflowNode>
  return (
    typeof node.id === 'string' &&
    typeof node.type === 'string' &&
    ['start', 'approval', 'copy', 'condition'].includes(node.type) &&
    typeof node.data?.title === 'string' &&
    validStoredPosition(node.position)
  )
}
const validStoredFlow = (value: unknown): value is WorkflowData => {
  if (!value || typeof value !== 'object') return false
  const flow = value as Partial<WorkflowData>
  return (
    Array.isArray(flow.nodes) &&
    flow.nodes.length <= 300 &&
    flow.nodes.every(validStoredNode) &&
    Array.isArray(flow.edges) &&
    flow.edges.length <= 500 &&
    flow.edges.every(
      edge =>
        typeof edge?.id === 'string' &&
        typeof edge.source === 'string' &&
        typeof edge.target === 'string'
    )
  )
}
/** 只恢复已知场景和可渲染草稿，不让损坏的本机记录阻断工作台。 */
export const restoreWorkflowDrafts = (
  raw: string
): Record<string, WorkflowData> => {
  const stored = JSON.parse(raw)
  if (
    stored?.version !== 1 ||
    !stored.drafts ||
    typeof stored.drafts !== 'object'
  )
    throw new Error('草稿结构无效')
  const result: Record<string, WorkflowData> = {}
  workflowScenarios.forEach(scenario => {
    const item = stored.drafts[scenario.id]
    if (validStoredFlow(item)) result[scenario.id] = item
  })
  return result
}
