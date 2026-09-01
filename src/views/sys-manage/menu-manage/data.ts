import type { FormRules } from 'naive-ui/es'
import menuOriginData from '@/assets/data/dynamicRouter.json'
import {
  deleteData,
  getData,
  postData,
  putData,
} from '@robot-admin/request-core'
import { isMockDataMode } from '@/config/dataMode'
import type { DynamicRoute } from '@/router/dynamicRouter'
import { delayWithSignal } from '@/utils/abort'

// ==================== 类型定义 ====================
export type MenuType = 'directory' | 'menu' | 'button'

export interface MenuData {
  id: string
  name: string
  type: MenuType
  parentId: string | null
  path?: string
  component?: string
  icon?: string
  permission?: string
  sort: number
  status: number
  hidden: number
  remark?: string
  children?: MenuData[]
}

export interface FormData {
  id?: string
  name: string
  type: MenuType
  parentId: string | null
  path: string
  component: string
  icon: string
  permission: string
  sort: number
  status: number
  hidden: number
  remark: string
}

export interface ButtonPermission {
  id: string
  menuId: string
  name: string
  permission: string
  remark?: string
}

export type MenuDropPosition = 'inside' | 'before' | 'after'

export interface ApiResponse<T = unknown> {
  code: string | number
  data: T
  msg: string
}

interface MenuRouteMeta {
  title: string
  icon?: string
  hidden: boolean
}

// ==================== 按钮权限配置 ====================
// 根据实际路由数据配置对应的按钮权限
export const BUTTON_PERMISSIONS_CONFIG = {
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

// ==================== 常量配置 ====================
export const FORM_RULES: FormRules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: ['input', 'blur'] },
  ],
  type: [
    { required: true, message: '请选择菜单类型', trigger: ['change', 'blur'] },
  ],
  sort: [
    {
      required: true,
      type: 'number',
      message: '请输入排序号',
      trigger: ['input', 'blur'],
    },
  ],
}

export const MENU_STATUS_CONFIGS = [
  {
    field: 'status',
    values: {
      0: { text: '禁用', type: 'error' as const },
      1: { text: '', type: 'success' as const },
    },
  },
  {
    field: 'hidden',
    values: {
      0: { text: '', type: 'success' as const },
      1: { text: '隐藏', type: 'warning' as const },
    },
  },
]

export const DEFAULT_FORM_DATA: FormData = {
  name: '',
  type: 'menu',
  parentId: null,
  path: '',
  component: '',
  icon: '',
  permission: '',
  sort: 0,
  status: 1,
  hidden: 0,
  remark: '',
}

// ==================== 模拟API数据 ====================
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
export const generateMenuId = (route: DynamicRoute): string => {
  if (route.name) return route.name
  if (route.path) return route.path.replace(/\//g, '-').replace(/^-/, '')
  return `menu-${Date.now()}`
}

export const processIcon = (icon?: string): string => {
  if (!icon) return 'mdi:menu'
  return icon.startsWith('i-') ? icon.replace('i-', '') : icon
}

export const getRouteMeta = (route: DynamicRoute): MenuRouteMeta => {
  if (!route.meta) {
    return {
      title: route.name || route.path || '未命名菜单',
      icon: 'menu',
      hidden: false,
    }
  }
  return {
    title: route.meta.title || route.name || route.path || '未命名菜单',
    icon: route.meta.icon || 'menu',
    hidden: route.meta.hidden || false,
  }
}

export const determineMenuType = (route: DynamicRoute): MenuType => {
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

const getMockMenuData = (): MenuData[] => {
  mockMenuData ||= createMockMenuData()
  return mockMenuData
}

const cloneMenus = (menus: MenuData[]): MenuData[] =>
  menus.map(menu => ({
    ...menu,
    children: menu.children ? cloneMenus(menu.children) : undefined,
  }))

const findMockMenu = (
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

const removeMockMenu = (id: string, menus = getMockMenuData()): boolean => {
  const index = menus.findIndex(menu => menu.id === id)
  if (index >= 0) {
    menus.splice(index, 1)
    return true
  }
  return menus.some(menu =>
    menu.children ? removeMockMenu(id, menu.children) : false
  )
}

const collectMenuIds = (menu: MenuData): string[] => [
  menu.id,
  ...(menu.children || []).flatMap(collectMenuIds),
]

const findMockMenuLocation = (
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

const normalizeMockMenuSort = (menus: MenuData[]): void => {
  menus.forEach((menu, index) => {
    menu.sort = index + 1
  })
}

// ==================== API 方法 ====================
export const getMenuListApi = async (): Promise<ApiResponse<MenuData[]>> => {
  if (!isMockDataMode()) {
    return getData<ApiResponse<MenuData[]>>('/sys/menus')
  }
  await delayWithSignal(300)
  return { code: '0', data: cloneMenus(getMockMenuData()), msg: '成功' }
}

export const getButtonPermissionsApi = async (
  menuId?: string
): Promise<ApiResponse<ButtonPermission[]>> => {
  if (!isMockDataMode()) {
    return getData<ApiResponse<ButtonPermission[]>>(
      menuId ? `/sys/menus/${menuId}/buttons` : '/sys/menu-buttons'
    )
  }
  await delayWithSignal(200)
  const filteredPermissions = menuId
    ? MOCK_BUTTON_PERMISSIONS.filter(btn => btn.menuId === menuId)
    : MOCK_BUTTON_PERMISSIONS
  return {
    code: '0',
    data: filteredPermissions.map(permission => ({ ...permission })),
    msg: '成功',
  }
}

export const addMenuApi = async (data: FormData): Promise<void> => {
  if (!isMockDataMode()) {
    await postData('/sys/menus', data)
    return
  }
  await delayWithSignal(300)
  const record: MenuData = {
    ...data,
    id: `menu_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    children: data.type === 'directory' ? [] : undefined,
  }
  if (data.parentId) {
    const parent = findMockMenu(data.parentId)
    if (!parent) throw new Error('上级菜单不存在')
    parent.children = [...(parent.children || []), record]
  } else {
    getMockMenuData().push(record)
  }
}

export const updateMenuApi = async (data: FormData): Promise<void> => {
  if (!isMockDataMode()) {
    if (!data.id) throw new Error('更新菜单缺少 id')
    await putData(`/sys/menus/${data.id}`, data)
    return
  }
  await delayWithSignal(300)
  if (!data.id) throw new Error('更新菜单缺少 id')
  const current = findMockMenu(data.id)
  if (!current) throw new Error('菜单不存在')
  const { children } = current
  Object.assign(current, data, { children })
}

export const deleteMenuApi = async (id: string): Promise<void> => {
  if (!isMockDataMode()) {
    await deleteData(`/sys/menus/${id}`)
    return
  }
  await delayWithSignal(250)
  const current = findMockMenu(id)
  if (!current) throw new Error('菜单不存在')
  const removedIds = new Set(collectMenuIds(current))
  if (!removeMockMenu(id)) throw new Error('菜单不存在')
  for (let index = MOCK_BUTTON_PERMISSIONS.length - 1; index >= 0; index--) {
    const menuId = MOCK_BUTTON_PERMISSIONS[index]?.menuId
    if (menuId && removedIds.has(menuId)) {
      MOCK_BUTTON_PERMISSIONS.splice(index, 1)
    }
  }
}

const moveMockMenu = (
  dragId: string,
  targetId: string,
  position: MenuDropPosition
): void => {
  const dragMenu = findMockMenu(dragId)
  const targetMenu = findMockMenu(targetId)
  if (!dragMenu || !targetMenu) throw new Error('拖拽菜单不存在')
  if (dragId === targetId || collectMenuIds(dragMenu).includes(targetId)) {
    throw new Error('不能将菜单移动到自身或其子菜单')
  }

  const dragLocation = findMockMenuLocation(dragId)
  if (!dragLocation) throw new Error('拖拽菜单位置无效')
  dragLocation.list.splice(dragLocation.index, 1)
  normalizeMockMenuSort(dragLocation.list)

  if (position === 'inside') {
    targetMenu.children = [...(targetMenu.children || []), dragMenu]
    dragMenu.parentId = targetMenu.id
    normalizeMockMenuSort(targetMenu.children)
    return
  }

  const targetLocation = findMockMenuLocation(targetId)
  if (!targetLocation) throw new Error('目标菜单位置无效')
  const insertIndex = targetLocation.index + (position === 'after' ? 1 : 0)
  dragMenu.parentId = targetMenu.parentId
  targetLocation.list.splice(insertIndex, 0, dragMenu)
  normalizeMockMenuSort(targetLocation.list)
}

export const moveMenuApi = async (
  dragId: string,
  targetId: string,
  position: MenuDropPosition
): Promise<void> => {
  if (!isMockDataMode()) {
    await putData(`/sys/menus/${dragId}/move`, { targetId, position })
    return
  }

  await delayWithSignal(200)
  moveMockMenu(dragId, targetId, position)
}

export const addButtonPermissionApi = async (
  data: Omit<ButtonPermission, 'id'>
): Promise<void> => {
  if (!isMockDataMode()) {
    await postData(`/sys/menus/${data.menuId}/buttons`, data)
    return
  }
  await delayWithSignal(250)
  MOCK_BUTTON_PERMISSIONS.push({
    ...data,
    id: `btn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  })
}

export const updateButtonPermissionApi = async (
  data: ButtonPermission
): Promise<void> => {
  if (!isMockDataMode()) {
    await putData(`/sys/menu-buttons/${data.id}`, data)
    return
  }
  await delayWithSignal(250)
  const index = MOCK_BUTTON_PERMISSIONS.findIndex(item => item.id === data.id)
  if (index < 0) throw new Error('按钮权限不存在')
  MOCK_BUTTON_PERMISSIONS[index] = { ...data }
}

export const deleteButtonPermissionApi = async (id: string): Promise<void> => {
  if (!isMockDataMode()) {
    await deleteData(`/sys/menu-buttons/${id}`)
    return
  }
  await delayWithSignal(200)
  const index = MOCK_BUTTON_PERMISSIONS.findIndex(item => item.id === id)
  if (index < 0) throw new Error('按钮权限不存在')
  MOCK_BUTTON_PERMISSIONS.splice(index, 1)
}
