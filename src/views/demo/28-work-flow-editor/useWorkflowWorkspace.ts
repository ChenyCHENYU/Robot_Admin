/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 审批流的场景草稿、节点检查与真实本机保存
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  WorkflowData,
  WorkflowNode,
  WorkflowEdge,
  ValidationError,
  WorkflowExpose,
  ApprovalMode,
  Condition,
} from '@robot-admin/naive-ui-components/C_WorkFlow'
import { workflowScenarios, userList, hydrateWorkflowPeople } from './data'
import { restoreWorkflowDrafts } from './workflowDrafts'
const STORAGE_KEY = 'robot-admin:workflow-workspace:v1'
const clone = (data: WorkflowData): WorkflowData =>
  JSON.parse(JSON.stringify(data))
/** 每个场景独立保留草稿；保存只明确写入当前浏览器，导出只包含当前流程。 */
export function useWorkflowWorkspace() {
  const message = useMessage()
  const dialog = useDialog()
  const currentScenario = ref('leave-approval')
  const mode = ref('edit')
  const drafts = ref<Record<string, WorkflowData>>(
    Object.fromEntries(
      workflowScenarios.map(item => [item.id, clone(item.template)])
    )
  )
  const saved = ref('')
  const selectedId = ref('start-1')
  const selectedEdgeId = ref('')
  const errors = ref<ValidationError[]>([])
  const validated = ref(false)
  const workflowRef = ref<WorkflowExpose | null>(null)
  const current = computed(() =>
    workflowScenarios.find(item => item.id === currentScenario.value)!
  )
  const data = computed({
    get: () => drafts.value[currentScenario.value],
    set: (value: WorkflowData) => {
      drafts.value = { ...drafts.value, [currentScenario.value]: value }
      validated.value = false
    },
  })
  const selected = computed(() =>
    data.value.nodes.find(item => item.id === selectedId.value)
  )
  const selectedEdge = computed(() =>
    data.value.edges.find(edge => edge.id === selectedEdgeId.value)
  )
  /** 详情始终读取当前模型名称，避免沿用点击时的旧节点快照。 */
  const nodeTitle = (id: string) =>
    data.value.nodes.find(node => node.id === id)?.data.title ?? id
  const selectedUsers = computed(() => {
    const node = selected.value
    if (!node) return []
    return node.type === 'approval'
      ? (node.data.approvers ?? [])
      : node.type === 'copy'
        ? (node.data.copyUsers ?? [])
        : (node.data.initiators ?? [])
  })
  const updateSelected = (update: (node: WorkflowNode) => WorkflowNode) => {
    if (mode.value !== 'edit' || !selected.value) return
    const node = selected.value
    const next = update(node)
    if (next === node) return
    data.value = {
      ...data.value,
      nodes: data.value.nodes.map(item => (item.id === node.id ? next : item)),
    }
  }

  /** 顺序审批沿用用户的选择顺序。 */
  const updateMembers = (ids: string[]) => {
    const members = ids.flatMap(
      id => userList.find(user => user.id === id) ?? []
    )
    updateSelected(node => {
      if (node.type === 'approval')
        return { ...node, data: { ...node.data, approvers: members } }
      if (node.type === 'copy')
        return { ...node, data: { ...node.data, copyUsers: members } }
      if (node.type === 'start')
        return { ...node, data: { ...node.data, initiators: members } }
      return node
    })
  }
  const updateApprovalMode = (approvalMode: ApprovalMode) =>
    updateSelected(node =>
      node.type === 'approval'
        ? { ...node, data: { ...node.data, approvalMode } }
        : node
    )
  const setConditions = (conditions: Condition[]) =>
    updateSelected(node =>
      node.type === 'condition'
        ? { ...node, data: { ...node.data, conditions } }
        : node
    )
  const save = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, drafts: drafts.value })
      )
      saved.value = new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })
      message.success('所有场景草稿已保存到当前浏览器')
    } catch {
      message.error('本机保存失败，请导出 JSON 留存')
    }
  }
  const selectNode = (node: WorkflowNode) => {
    selectedId.value = node.id
    selectedEdgeId.value = ''
  }
  /** 连线点击只接收组件公开快照，详情跟随当前流程数据更新。 */
  const selectEdge = (edge: WorkflowEdge) => {
    selectedEdgeId.value = edge.id
  }
  const updateTitle = (title: string) =>
    updateSelected(node => {
      const updated = { ...node }
      updated.data = { ...node.data, title }
      return updated
    })
  const validate = () => {
    const editor = workflowRef.value
    if (!editor) return
    errors.value = editor.validateWorkflow()
    validated.value = true
  }
  const restore = () => {
    const scenario = current.value
    dialog.warning({
      title: '恢复当前场景模板',
      content: '当前场景的修改将被示例模板替换，其他场景草稿会保留。',
      positiveText: '恢复模板',
      negativeText: '保留修改',
      onPositiveClick: () => {
        const template = clone(scenario.template)
        if (currentScenario.value === scenario.id) {
          data.value = template
          selectedId.value = template.nodes[0]?.id ?? ''
          selectedEdgeId.value = ''
        } else {
          drafts.value[scenario.id] = template
        }
      },
    })
  }
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data.value, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${currentScenario.value}-workflow.json`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const restored = restoreWorkflowDrafts(raw)
      drafts.value = {
        ...drafts.value,
        ...Object.fromEntries(
          Object.entries(restored).map(([id, value]) => [
            id,
            hydrateWorkflowPeople(value),
          ])
        ),
      }
      saved.value = '已恢复'
    }
  } catch {
    message.warning('本机草稿无法恢复，已使用内置模板')
  }
  watch(currentScenario, () => {
    selectedId.value = data.value.nodes[0]?.id ?? ''
    selectedEdgeId.value = ''
    errors.value = []
    validated.value = false
  })
  return {
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
    selectedEdge,
    nodeTitle,
    save,
    selectNode,
    selectEdge,
    updateTitle,
    validate,
    restore,
    exportJson,
  }
}
