// ==================== 权限抽屉相关类型定义 ====================
export type PermissionType = 'menu' | 'button' | 'api'

export interface PermissionData {
  id: string
  name: string
  code: string
  type: PermissionType
  parentId?: string | null
  path?: string
  icon?: string
  description?: string
  sort: number
  status: number
  children?: PermissionData[]
}

export interface RoleData {
  id: string
  name: string
  code: string
  description?: string
  permissionIds?: string[]
  permissionNames?: string[]
}

// ==================== 权限模板接口 ====================
export interface PermissionTemplate {
  id: string
  name: string
  description: string
  icon: string
  permissions: string[]
}

// ==================== 组件配置 ====================
export const PERMISSION_CONFIG = {
  permissionTypeOptions: [
    { label: '菜单权限', value: 'menu' },
    { label: '按钮权限', value: 'button' },
    { label: '接口权限', value: 'api' },
  ],
} as const

/** 统计面板类型选项 */
export const TYPE_STAT_OPTIONS = [
  ['menu', '菜单'],
  ['button', '按钮'],
  ['api', '接口'],
] as const

// ==================== 索引构建（O(1) 查找） ====================

/** 构建 id → PermissionData 的扁平索引（一次遍历，后续 O(1) 查找） */
export const buildPermissionMap = (
  permissions: PermissionData[]
): Map<string, PermissionData> => {
  const map = new Map<string, PermissionData>()
  const collect = (perms: PermissionData[]) => {
    for (const perm of perms) {
      map.set(perm.id, perm)
      if (perm.children) collect(perm.children)
    }
  }
  collect(permissions)
  return map
}

/** 构建 id → 顶级模块 的索引（每个节点都映射到所属顶级模块） */
export const buildTopLevelMap = (
  permissions: PermissionData[]
): Map<string, PermissionData> => {
  const map = new Map<string, PermissionData>()
  for (const topLevel of permissions) {
    map.set(topLevel.id, topLevel)
    const collectChildren = (perms: PermissionData[]) => {
      for (const perm of perms) {
        map.set(perm.id, topLevel)
        if (perm.children) collectChildren(perm.children)
      }
    }
    if (topLevel.children) collectChildren(topLevel.children)
  }
  return map
}

// ==================== 工具函数 ====================
export const usePermissionUtils = () => {
  // 检查是否有匹配的权限 - 简化匹配逻辑
  const hasMatchingPermissionInTree = (
    permissions: PermissionData[],
    keyword: string
  ): boolean => {
    return permissions.some(perm => {
      const fields = [perm.name, perm.code, perm.description || '']
      const matches = fields.some(field =>
        field.toLowerCase().includes(keyword)
      )
      return (
        matches ||
        (perm.children && hasMatchingPermissionInTree(perm.children, keyword))
      )
    })
  }

  // 检查权限树中是否有指定类型 - 简化类型检查
  const hasPermissionTypeInTree = (
    permissions: PermissionData[],
    type: string
  ): boolean => {
    return permissions.some(
      perm =>
        perm.type === type ||
        (perm.children && hasPermissionTypeInTree(perm.children, type))
    )
  }

  // 获取模块的所有权限（扁平化）
  const getModulePermissions = (module: PermissionData): PermissionData[] => {
    const result: PermissionData[] = []
    const collect = (perms: PermissionData[]) => {
      for (const perm of perms) {
        result.push(perm)
        if (perm.children) collect(perm.children)
      }
    }
    if (module.children) collect(module.children)
    return result
  }

  // 获取所有权限ID
  const getAllPermissionIds = (permissions: PermissionData[]): string[] => {
    const ids: string[] = []
    const collect = (perms: PermissionData[]) => {
      for (const perm of perms) {
        ids.push(perm.id)
        if (perm.children) collect(perm.children)
      }
    }
    collect(permissions)
    return ids
  }

  // 获取模块显示权限 - 简化显示逻辑
  const getModuleDisplayPermissions = (module: PermissionData) => {
    if (!module.children) return []
    const menuPermissions = module.children.filter(perm => perm.type === 'menu')
    return menuPermissions.length === 0 ? module.children : menuPermissions
  }

  // 类型映射 - 使用对象映射替代switch
  const iconMap: Record<PermissionType, string> = {
    menu: 'mdi:menu',
    button: 'mdi:gesture-tap-button',
    api: 'mdi:api',
  }

  const colorMap: Record<PermissionType, string> = {
    menu: 'info',
    button: 'success',
    api: 'warning',
  }

  const nameMap: Record<PermissionType, string> = {
    menu: '菜单',
    button: '按钮',
    api: '接口',
  }

  // 简化的获取方法
  const getPermissionIcon = (type: PermissionType): string =>
    iconMap[type] || 'mdi:circle'
  const getPermissionTypeColor = (type: PermissionType) =>
    colorMap[type] || 'default'
  const getPermissionTypeName = (type: PermissionType) => nameMap[type] || type

  return {
    getAllPermissionIds,
    hasMatchingPermissionInTree,
    hasPermissionTypeInTree,
    getModulePermissions,
    getModuleDisplayPermissions,
    getPermissionIcon,
    getPermissionTypeColor,
    getPermissionTypeName,
  }
}
