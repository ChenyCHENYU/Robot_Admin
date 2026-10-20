/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 审批流的场景草稿、节点检查与真实本机保存
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  WorkflowData,
  WorkflowNode,
  ValidationError,
  WorkflowExpose,
  ApprovalMode,
  Condition,
} from '@robot-admin/naive-ui-components/C_WorkFlow'
import {
  workflowScenarios,
  userList,
  restoreWorkflowDrafts,
  hydrateWorkflowPeople,
} from './data'
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
  const approvers = computed(() =>
    selected.value?.type === 'approval'
      ? (selected.value.data.approvers?.map(item => item.id) ?? [])
      : []
  )
  const selectedUsers = computed(() => {
    const node = selected.value
    if (!node) return []
    return node.type === 'approval'
      ? (node.data.approvers ?? [])
      : node.type === 'copy'
        ? (node.data.copyUsers ?? [])
        : (node.data.initiators ?? [])
  })
  /** 修改选中节点的人员，发起、审批与抄送分别写入自己的契约字段。 */
  const updateMembers = (ids: string[]) => {
    if (mode.value !== 'edit') return
    const members = userList.filter(user => ids.includes(user.id))
    data.value = {
      ...data.value,
      nodes: data.value.nodes.map(node => {
        if (node.id !== selectedId.value) return node
        if (node.type === 'approval')
          return { ...node, data: { ...node.data, approvers: members } }
        if (node.type === 'copy')
          return { ...node, data: { ...node.data, copyUsers: members } }
        if (node.type === 'start')
          return { ...node, data: { ...node.data, initiators: members } }
        return node
      }),
    }
  }
  /** 会签、或签及顺序审批直接写回画布，预览不允许修改。 */
  const updateApprovalMode = (approvalMode: ApprovalMode) => {
    if (mode.value !== 'edit') return
    data.value = {
      ...data.value,
      nodes: data.value.nodes.map(node =>
        node.id === selectedId.value && node.type === 'approval'
          ? { ...node, data: { ...node.data, approvalMode } }
          : node
      ),
    }
  }
  /** 条件编辑与组件原生配置共用数据，校验结果随修改失效。 */
  const setConditions = (conditions: Condition[]) => {
    if (mode.value !== 'edit') return
    data.value = {
      ...data.value,
      nodes: data.value.nodes.map(node =>
        node.id === selectedId.value && node.type === 'condition'
          ? { ...node, data: { ...node.data, conditions } }
          : node
      ),
    }
  }
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
  }
  const updateTitle = (title: string) => {
    if (mode.value !== 'edit') return
    data.value = {
      ...data.value,
      nodes: data.value.nodes.map(node => {
        if (node.id !== selectedId.value) return node
        const updated = { ...node }
        updated.data = { ...node.data, title }
        return updated
      }),
    }
  }
  const updateApprovers = (ids: string[]) => {
    if (mode.value !== 'edit') return
    data.value = {
      ...data.value,
      nodes: data.value.nodes.map(node =>
        node.id === selectedId.value && node.type === 'approval'
          ? {
              ...node,
              data: {
                ...node.data,
                approvers: userList.filter(user => ids.includes(user.id)),
              },
            }
          : node
      ),
    }
  }
  const validate = () => {
    errors.value = workflowRef.value?.validateWorkflow() ?? []
    validated.value = true
  }
  const restore = () =>
    dialog.warning({
      title: '恢复当前场景模板',
      content: '当前场景的修改将被示例模板替换，其他场景草稿会保留。',
      positiveText: '恢复模板',
      negativeText: '保留修改',
      onPositiveClick: () => {
        data.value = clone(current.value.template)
        selectedId.value = data.value.nodes[0]?.id ?? ''
      },
    })
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
    approvers,
    save,
    selectNode,
    updateTitle,
    updateApprovers,
    validate,
    restore,
    exportJson,
  }
}
