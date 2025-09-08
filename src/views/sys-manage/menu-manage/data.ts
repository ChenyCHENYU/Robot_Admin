import type { FormRules } from 'naive-ui/es'
import menuOriginData from '@/assets/data/dynamicRouter.json'

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

export interface ApiResponse<T = unknown> {
  code: string
  data: T
  msg: string
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
export const generateMenuId = (route: any): string => {
  return (
    route.name ||
    route.path.replace(/\//g, '-').replace(/^-/, '') ||
    `menu-${Date.now()}`
  )
}

export const processIcon = (icon?: string): string => {
  if (!icon) return 'mdi:menu'
  return icon.startsWith('i-') ? icon.replace('i-', '') : icon
}

export const getRouteMeta = (route: any) => {
  if (!route.meta) {
    return {
      title: route.name || route.path || '未命名菜单',
      icon: 'mdi:menu',
      hidden: false,
    }
  }
  return {
    title: route.meta.title || route.name || route.path || '未命名菜单',
    icon: route.meta.icon || 'mdi:menu',
    hidden: route.meta.hidden || false,
  }
}

export const determineMenuType = (route: any): MenuType => {
  return route.children?.length && route.component === 'layout'
    ? 'directory'
    : 'menu'
}

export const createMenuFromRoute = (
  route: any,
  parentId: string | null = null,
  sort: number = 0
): MenuData | null => {
  const meta = getRouteMeta(route)

  if (!meta.title || (route.path === '/' && route.redirect)) {
    return null
  }

  const menuId = generateMenuId(route)

  const menu: MenuData = {
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

  if (route.children) {
    menu.children = route.children
      .map((child: any, index: number) =>
        createMenuFromRoute(child, menuId, index + 1)
      )
      .filter(Boolean)
  }

  return menu
}

// ==================== API 方法 ====================
export const getMenuListApi = async (): Promise<ApiResponse<MenuData[]>> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const menuData: MenuData[] = []

      menuOriginData.data.forEach(route => {
        if (route.path === '/' && route.children) {
          route.children.forEach((child: any) => {
            const childMenu = createMenuFromRoute(
              child,
              null,
              menuData.length + 1
            )
            if (childMenu) {
              menuData.push(childMenu)
            }
          })
        } else {
          const menu = createMenuFromRoute(route, null, menuData.length + 1)
          if (menu) {
            menuData.push(menu)
          }
        }
      })

      resolve({ code: '0', data: menuData, msg: '成功' })
    }, 500)
  })
}

export const getButtonPermissionsApi = async (
  menuId?: string
): Promise<ApiResponse<ButtonPermission[]>> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const filteredPermissions = menuId
        ? MOCK_BUTTON_PERMISSIONS.filter(btn => btn.menuId === menuId)
        : MOCK_BUTTON_PERMISSIONS

      resolve({ code: '0', data: filteredPermissions, msg: '成功' })
    }, 300)
  })
}

export const addMenuApi = async (data: FormData): Promise<void> => {
  console.log('添加菜单:', data)
  return new Promise(resolve => setTimeout(resolve, 500))
}

export const updateMenuApi = async (data: FormData): Promise<void> => {
  console.log('更新菜单:', data)
  return new Promise(resolve => setTimeout(resolve, 500))
}

export const deleteMenuApi = async (id: string): Promise<void> => {
  console.log('删除菜单:', id)
  return new Promise(resolve => setTimeout(resolve, 500))
}

export const addButtonPermissionApi = async (
  data: Omit<ButtonPermission, 'id'>
): Promise<void> => {
  console.log('添加按钮权限:', data)
  return new Promise(resolve => setTimeout(resolve, 500))
}

export const updateButtonPermissionApi = async (
  data: ButtonPermission
): Promise<void> => {
  console.log('更新按钮权限:', data)
  return new Promise(resolve => setTimeout(resolve, 500))
}

export const deleteButtonPermissionApi = async (id: string): Promise<void> => {
  console.log('删除按钮权限:', id)
  return new Promise(resolve => setTimeout(resolve, 500))
}
