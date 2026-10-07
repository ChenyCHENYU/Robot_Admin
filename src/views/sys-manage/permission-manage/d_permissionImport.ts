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

/** 验证完整批次后才返回纯数据，失败不会修改现有列表。 */
export function parsePermissionImport(
  value: unknown,
  existingCodes: readonly string[]
): PermissionDraft[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 200)
    throw new Error('请导入包含 1 至 200 条权限的 JSON 数组')
  const codes = new Set(existingCodes)
  return value.map((item: unknown, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item))
      throw new Error(`第 ${index + 1} 条权限格式不正确`)
    const row = item as Record<string, unknown>
    const required = (field: string) => {
      const text = row[field]
      if (typeof text !== 'string' || !text.trim())
        throw new Error(`第 ${index + 1} 条权限缺少 ${field}`)
      return text.trim()
    }
    const name = required('name')
    const code = required('code')
    const module = required('module')
    const type = required('type') as PermissionType
    if (!types.includes(type))
      throw new Error(`第 ${index + 1} 条权限类型不正确`)
    if (codes.has(code))
      throw new Error(`权限编码「${code}」重复，请修改后导入`)
    if (row.status !== 0 && row.status !== 1)
      throw new Error(`第 ${index + 1} 条权限状态必须为数值 0 或 1`)
    if (
      typeof row.sort !== 'number' ||
      !Number.isSafeInteger(row.sort) ||
      row.sort < 0
    )
      throw new Error(`第 ${index + 1} 条权限排序必须为非负整数`)
    if (
      !Array.isArray(row.resources) ||
      row.resources.some(item => typeof item !== 'string')
    )
      throw new Error(`第 ${index + 1} 条权限资源必须为字符串数组`)
    const optionalText = (field: string) => {
      if (row[field] === undefined) return ''
      if (typeof row[field] !== 'string')
        throw new Error(`第 ${index + 1} 条权限的 ${field} 必须为文本`)
      return row[field]
    }
    codes.add(code)
    return {
      name,
      code,
      module,
      type,
      status: row.status,
      sort: row.sort,
      resources: [
        ...new Set(row.resources.map(item => item.trim()).filter(Boolean)),
      ],
      description: optionalText('description'),
      remark: optionalText('remark'),
    }
  })
}
