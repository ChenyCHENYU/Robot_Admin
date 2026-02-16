/**
 * 工作流验证 Composable
 * 封装流程校验逻辑、错误展示和节点定位
 */

import type { Ref } from 'vue'
import type {
  WorkflowNode,
  WorkflowEdge,
  ValidationError,
} from '@/types/work-flow'
import {
  FIELD_DISPLAY_NAMES,
  ERROR_TYPE_TEXTS,
} from '@/components/global/C_WorkFlow/data'

export interface WorkflowValidationOptions {
  /** 定位错误节点后打开配置弹窗的回调 */
  onShowNodeConfig?: (node: WorkflowNode) => void
  /** 验证失败时的外部回调（通常用于 emit） */
  onValidateError?: (errors: ValidationError[]) => void
}

/** 工作流验证 —— 封装流程校验逻辑、错误展示和节点定位 */
export function useWorkflowValidation(
  nodes: Ref<WorkflowNode[]>,
  edges: Ref<WorkflowEdge[]>,
  vueFlowRef: Ref,
  options?: WorkflowValidationOptions
) {
  const message = useMessage()

  // ─── 响应式状态 ──────────────────────────────────────────
  const validationErrors = ref<ValidationError[]>([])
  const showValidationErrors = ref(false)

  // ─── 核心验证 ────────────────────────────────────────────
  /** 执行工作流验证，返回错误列表（纯逻辑，不操作 UI） */
  const validateWorkflow = (): ValidationError[] => {
    const errors: ValidationError[] = []

    nodes.value.forEach(node => {
      // 审批节点：必须有审批人
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

      // 条件节点：必须有分支且配置完整
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
          const incomplete = conditions.filter(
            (c: any) => !c.name || !c.field || !c.operator || !c.value
          )
          if (incomplete.length > 0) {
            errors.push({
              nodeId: node.id,
              nodeName: node.data.title,
              field: 'conditions',
              message: `有 ${incomplete.length} 个条件分支配置不完整，请完善所有必填字段`,
              type: 'incomplete',
            })
          }
        }
      }
    })

    // 检查断连节点
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

  // ─── UI 交互 ─────────────────────────────────────────────
  /** 执行验证并更新 UI 状态（消息提示 + 抽屉） */
  const validateCurrentWorkflow = (): void => {
    const errors = validateWorkflow()
    validationErrors.value = errors

    if (errors.length === 0) {
      message.success('工作流验证通过！所有节点配置正确')
      showValidationErrors.value = false
    } else {
      message.error(`发现 ${errors.length} 个问题，请查看详细错误`)
      showValidationErrors.value = true
      options?.onValidateError?.(errors)
    }
  }

  /** 定位到错误节点并打开配置弹窗 */
  const jumpToErrorNode = (nodeId: string): void => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node || !vueFlowRef.value) return

    vueFlowRef.value.setCenter(node.position.x, node.position.y, {
      zoom: 1.2,
      duration: 800,
    })

    setTimeout(() => {
      options?.onShowNodeConfig?.(node)
      showValidationErrors.value = false
    }, 900)

    message.info(`已定位到节点：${node.data.title}`)
  }

  // ─── 辅助方法 ────────────────────────────────────────────
  const getFieldDisplayName = (field: string): string =>
    FIELD_DISPLAY_NAMES[field] || field

  const getErrorTypeText = (type: string): string =>
    ERROR_TYPE_TEXTS[type] || type

  /** 重置验证状态 */
  const resetValidation = (): void => {
    validationErrors.value = []
    showValidationErrors.value = false
  }

  return {
    validationErrors,
    showValidationErrors,
    validateWorkflow,
    validateCurrentWorkflow,
    jumpToErrorNode,
    getFieldDisplayName,
    getErrorTypeText,
    resetValidation,
  }
}
