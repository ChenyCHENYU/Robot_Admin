/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\utils\d_permissionComparison.ts
 * @Description: 基于唯一权限 ID 的差异计算，显示名称只负责展示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { RoleData } from '@/api/role-manage.contract'

/**
 *
 */
export function compareRolePermissions(roleA: RoleData, roleB: RoleData) {
  const idsA = new Set(roleA.permissionIds ?? [])
  const idsB = new Set(roleB.permissionIds ?? [])
  return {
    shared: [...idsA].filter(id => idsB.has(id)),
    onlyA: [...idsA].filter(id => !idsB.has(id)),
    onlyB: [...idsB].filter(id => !idsA.has(id)),
  }
}

/** 权限名称允许相同、缺失或变化，不能充当授权标识。 */
export function getRolePermissionName(role: RoleData, id: string): string {
  const index = role.permissionIds?.indexOf(id) ?? -1
  return role.permissionNames?.[index] || id
}
