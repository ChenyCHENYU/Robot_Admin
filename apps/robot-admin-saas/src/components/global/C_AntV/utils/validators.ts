import type { ERTable, BPMNNode } from '@/types/antv'

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 验证 ER 表数据
 * @param {ERTable} table - ER 表数据
 * @returns {ValidationResult} 验证结果
 */
export function validateERTable(table: ERTable): ValidationResult {
  const errors: string[] = []

  if (!table.name || table.name.trim() === '') {
    errors.push('表名不能为空')
  }

  if (!table.fields || table.fields.length === 0) {
    errors.push('表至少需要一个字段')
  } else {
    const primaryKeys = table.fields.filter(field => field.isPrimaryKey)
    if (primaryKeys.length === 0) {
      errors.push('表需要至少一个主键字段')
    }

    // 检查字段名重复
    const fieldNames = table.fields.map(field => field.name)
    const duplicates = fieldNames.filter(
      (name, index) => fieldNames.indexOf(name) !== index
    )
    if (duplicates.length > 0) {
      errors.push(`字段名重复: ${duplicates.join(', ')}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 验证 BPMN 节点数据
 * @param {BPMNNode} node - BPMN 节点数据
 * @returns {ValidationResult} 验证结果
 */
export function validateBPMNNode(node: BPMNNode): ValidationResult {
  const errors: string[] = []

  if (!node.name || node.name.trim() === '') {
    errors.push('节点名称不能为空')
  }

  if (!node.type) {
    errors.push('节点类型不能为空')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
