/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\menu-manage.mock.ts
 * @Description: 从内置路由生成演示菜单，封装目录状态与按钮权限样例
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import menuOriginData from '@/assets/data/dynamicRouter.json'
import type { DynamicRoute } from '@/router/dynamicRouter'
import type {
  MenuData,
  MenuType,
  ButtonPermission,
} from './menu-manage.contract'

interface MenuRouteMeta {
  title: string
  icon?: string
  hidden: boolean
  keepAlive: boolean
}

// 根据实际路由数据配置对应的按钮权限
const BUTTON_PERMISSIONS_CONFIG = {
  // 仪表盘分析
  'dashboard-analysis': [
    {
      name: '导出数据',
      permission: 'dashboard:analysis:export',
      remark: '导出分析数据权限',
    },
    {
      name: '刷新数据',
      permission: 'dashboard:analysis:refresh',
      remark: '刷新分析数据权限',
    },
    {
      name: '打印报表',
      permission: 'dashboard:analysis:print',
      remark: '打印分析报表权限',
    },
  ],

  // 用户管理
  'user-manage': [
    { name: '添加用户', permission: 'user:manage:add', remark: '添加用户权限' },
    {
      name: '编辑用户',
      permission: 'user:manage:edit',
      remark: '编辑用户权限',
    },
    {
      name: '删除用户',
      permission: 'user:manage:delete',
      remark: '删除用户权限',
    },
    {
      name: '导出用户',
      permission: 'user:manage:export',
      remark: '导出用户数据权限',
    },
  ],

  // 角色列表
  'user-role-list': [
    { name: '添加角色', permission: 'role:add', remark: '添加角色权限' },
    { name: '编辑角色', permission: 'role:edit', remark: '编辑角色权限' },
    { name: '删除角色', permission: 'role:delete', remark: '删除角色权限' },
    { name: '分配权限', permission: 'role:assign', remark: '分配角色权限' },
  ],

  // 权限列表
  'user-permission-list': [
    { name: '添加权限', permission: 'permission:add', remark: '添加权限' },
    { name: '编辑权限', permission: 'permission:edit', remark: '编辑权限' },
    { name: '删除权限', permission: 'permission:delete', remark: '删除权限' },
  ],

  // 菜单管理
  'sys-menu-manage': [
    { name: '新增菜单', permission: 'sys:menu:add', remark: '新增菜单权限' },
    { name: '编辑菜单', permission: 'sys:menu:edit', remark: '编辑菜单权限' },
    { name: '删除菜单', permission: 'sys:menu:delete', remark: '删除菜单权限' },
    { name: '菜单排序', permission: 'sys:menu:sort', remark: '菜单排序权限' },
  ],

  // Excel导入
  'sys-excel-import': [
    {
      name: '上传文件',
      permission: 'sys:excel:upload',
      remark: '上传Excel文件权限',
    },
    {
      name: '导入数据',
      permission: 'sys:excel:import',
      remark: '导入Excel数据权限',
    },
    {
      name: '下载模板',
      permission: 'sys:excel:template',
      remark: '下载Excel模板权限',
    },
  ],

  // 演示表单
  'demo-form': [
    {
      name: '保存表单',
      permission: 'demo:form:save',
      remark: '保存表单数据权限',
    },
    { name: '重置表单', permission: 'demo:form:reset', remark: '重置表单权限' },
    {
      name: '导出表单',
      permission: 'demo:form:export',
      remark: '导出表单数据权限',
    },
  ],

  // 超级表格
  'demo-table': [
    {
      name: '添加数据',
      permission: 'demo:table:add',
      remark: '添加表格数据权限',
    },
    {
      name: '编辑数据',
      permission: 'demo:table:edit',
      remark: '编辑表格数据权限',
    },
    {
      name: '删除数据',
      permission: 'demo:table:delete',
      remark: '删除表格数据权限',
    },
    {
      name: '导出表格',
      permission: 'demo:table:export',
      remark: '导出表格数据权限',
    },
  ],
}

// 根据权限配置自动生成按钮权限数据
const generateButtonPermissionsData = (): ButtonPermission[] => {
  const allPermissions: ButtonPermission[] = []

  Object.entries(BUTTON_PERMISSIONS_CONFIG).forEach(([menuId, permissions]) => {
    permissions.forEach((perm, index) => {
      allPermissions.push({
        id: `btn-${menuId}-${index + 1}`,
        menuId,
        name: perm.name,
        permission: perm.permission,
        remark: perm.remark,
      })
    })
  })

  return allPermissions
}

// 模拟的按钮权限数据
export const MOCK_BUTTON_PERMISSIONS = generateButtonPermissionsData()

// ==================== 辅助函数 ====================
const generateMenuId = (route: DynamicRoute): string => {
  if (route.name) return route.name
  if (route.path) return route.path.replace(/\//g, '-').replace(/^-/, '')
  return `menu-${Date.now()}`
}

const processIcon = (icon?: string): string => {
  if (!icon) return 'mdi:menu'
  return icon.startsWith('i-') ? icon.replace('i-', '') : icon
}

const getRouteMeta = (route: DynamicRoute): MenuRouteMeta => {
  if (!route.meta) {
    return {
      title: route.name || route.path || '未命名菜单',
      icon: 'menu',
      hidden: false,
      keepAlive: false,
    }
  }
  return {
    title: route.meta.title || route.name || route.path || '未命名菜单',
    icon: route.meta.icon || 'menu',
    hidden: route.meta.hidden || false,
    keepAlive: route.meta.keepAlive === true,
  }
}

const determineMenuType = (route: DynamicRoute): MenuType => {
  return route.children?.length && route.component === 'layout'
    ? 'directory'
    : 'menu'
}

// 检查是否应该跳过当前路由
const shouldSkipRoute = (route: DynamicRoute, meta: MenuRouteMeta): boolean => {
  return !meta.title || Boolean(route.path === '/' && route.redirect)
}

// 检查是否是需要扁平化的单子菜单容器
const shouldFlattenContainer = (route: DynamicRoute): boolean => {
  const isSingleUnnamedLayout =
    route.component === 'layout' && route.children?.length === 1 && !route.name

  return isSingleUnnamedLayout && (!route.path || !route.meta?.title)
}

// 构建基础菜单数据
const buildMenuData = (
  route: DynamicRoute,
  meta: MenuRouteMeta,
  menuId: string,
  parentId: string | null,
  sort: number
): MenuData => {
  return {
    id: menuId,
    name: meta.title,
    type: determineMenuType(route),
    parentId,
    path: route.path,
    component: route.component === 'layout' ? undefined : route.component,
    icon: processIcon(meta.icon),
    sort,
    status: 1,
    hidden: meta.hidden ? 1 : 0,
    keepAlive: determineMenuType(route) === 'menu' && meta.keepAlive,
    remark: meta.title,
    children: undefined,
  }
}

export const createMenuFromRoute = (
  route: DynamicRoute,
  parentId: string | null = null,
  sort: number = 0
): MenuData | null => {
  const meta = getRouteMeta(route)

  if (shouldSkipRoute(route, meta)) {
    return null
  }

  if (shouldFlattenContainer(route)) {
    const [child] = route.children || []
    return child ? createMenuFromRoute(child, parentId, sort) : null
  }

  const menuId = generateMenuId(route)
  const menu = buildMenuData(route, meta, menuId, parentId, sort)

  if (route.children) {
    menu.children = route.children
      .map((child, index: number) =>
        createMenuFromRoute(child, menuId, index + 1)
      )
      .filter((child): child is MenuData => child !== null)
  }

  return menu
}

const createMockMenuData = (): MenuData[] => {
  const menuData: MenuData[] = []
  menuOriginData.data.forEach(route => {
    const routes =
      route.path === '/' && route.children ? route.children : [route]
    routes.forEach(child => {
      const childMenu = createMenuFromRoute(child, null, menuData.length + 1)
      if (childMenu) menuData.push(childMenu)
    })
  })
  return menuData
}

let mockMenuData: MenuData[] | undefined

export const getMockMenuData = (): MenuData[] => {
  mockMenuData ||= createMockMenuData()
  return mockMenuData
}

/** 深拷贝菜单与子节点，列表消费方不能改写目录。 */
export const cloneMenus = (menus: MenuData[]): MenuData[] =>
  menus.map(menu => ({
    ...menu,
    children: menu.children ? cloneMenus(menu.children) : undefined,
  }))

/** 在演示目录中查找可写节点。 */
export const findMockMenu = (
  id: string,
  menus = getMockMenuData()
): MenuData | null => {
  for (const menu of menus) {
    if (menu.id === id) return menu
    const child = menu.children ? findMockMenu(id, menu.children) : null
    if (child) return child
  }
  return null
}

/** 删除指定菜单节点及其整个子树。 */
export const removeMockMenu = (
  id: string,
  menus = getMockMenuData()
): boolean => {
  const index = menus.findIndex(menu => menu.id === id)
  if (index >= 0) {
    menus.splice(index, 1)
    return true
  }
  return menus.some(menu =>
    menu.children ? removeMockMenu(id, menu.children) : false
  )
}

/** 收集子树 ID，用于删除关联按钮和拒绝循环移动。 */
export const collectMenuIds = (menu: MenuData): string[] => [
  menu.id,
  ...(menu.children || []).flatMap(collectMenuIds),
]

/** 返回节点所在数组和下标，供移动操作保持树关系。 */
export const findMockMenuLocation = (
  id: string,
  menus = getMockMenuData()
): { list: MenuData[]; index: number } | null => {
  const index = menus.findIndex(menu => menu.id === id)
  if (index >= 0) return { list: menus, index }
  for (const menu of menus) {
    const location = menu.children
      ? findMockMenuLocation(id, menu.children)
      : null
    if (location) return location
  }
  return null
}

/** 移动后按当前顺序重新生成同级排序。 */
export const normalizeMockMenuSort = (menus: MenuData[]): void => {
  menus.forEach((menu, index) => {
    menu.sort = index + 1
  })
}
