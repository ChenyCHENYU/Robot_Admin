/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\permission-manage\d_permissionImport.ts
 * @Description: 导入前完整验证权限模型，不接受字符串状态或重复权限编码
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  PermissionDraft,
  PermissionType,
} from '@/api/permission-manage.contract'

const types: readonly PermissionType[] = ['module', 'function', 'button', 'api']

/** 将任意输入收窄为一条权限记录。 */
function readRecord(value: unknown, index: number): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`第 ${index} 条权限格式不正确`)
  return value as Record<string, unknown>
}

/** 校验排序、状态和资源契约，并归一化输入资源。 */
function readResourceFields(row: Record<string, unknown>, index: number) {
  const { resources, sort, status } = row
  if (status !== 0 && status !== 1)
    throw new Error(`第 ${index} 条权限状态必须为数值 0 或 1`)
  if (typeof sort !== 'number' || !Number.isSafeInteger(sort) || sort < 0)
    throw new Error(`第 ${index} 条权限排序必须为非负整数`)
  if (
    !Array.isArray(resources) ||
    !resources.every((item): item is string => typeof item === 'string')
  )
    throw new Error(`第 ${index} 条权限资源必须为字符串数组`)
  return {
    resources: [...new Set(resources.map(item => item.trim()).filter(Boolean))],
    sort,
    status,
  }
}

/** 将一条权限解析为业务草稿，只保留公开导入字段。 */
function readDraft(
  value: unknown,
  index: number,
  codes: Set<string>
): PermissionDraft {
  const row = readRecord(value, index)
  const required = (field: string) => {
    const text = row[field]
    if (typeof text !== 'string' || !text.trim())
      throw new Error(`第 ${index} 条权限缺少 ${field}`)
    return text.trim()
  }
  const name = required('name')
  const code = required('code')
  const module = required('module')
  const inputType = required('type')
  const type = types.find(entry => entry === inputType)
  if (!type) throw new Error(`第 ${index} 条权限类型不正确`)
  if (codes.has(code)) throw new Error(`权限编码「${code}」重复，请修改后导入`)
  const fields = readResourceFields(row, index)
  const optionalText = (field: string) => {
    const text = row[field]
    if (text === undefined) return ''
    if (typeof text !== 'string')
      throw new Error(`第 ${index} 条权限的 ${field} 必须为文本`)
    return text
  }
  codes.add(code)
  return {
    name,
    code,
    module,
    type,
    ...fields,
    description: optionalText('description'),
    remark: optionalText('remark'),
  }
}

/** 验证完整批次后才返回纯数据，失败不会修改现有列表。 */
export function parsePermissionImport(
  value: unknown,
  existingCodes: readonly string[]
): PermissionDraft[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 200)
    throw new Error('请导入包含 1 至 200 条权限的 JSON 数组')
  const codes = new Set(existingCodes)
  return value.map((item, index) => readDraft(item, index + 1, codes))
}
