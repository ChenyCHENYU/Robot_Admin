/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\user-manage\data.ts
 * @Description: 用户页面表单、列、展示配置与部门树转换
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { FormItemRule } from 'naive-ui/es'
import type {
  UserType,
  UserFormData,
  ResetPasswordForm,
  DeptData,
  DeptTreeOption,
} from '@/api/user-manage.contract'

// ==================== UI 配置常量 ====================
export const UI_CONFIG = {
  userType: [
    { label: '内部员工', value: 'internal' },
    { label: '外部客户', value: 'external' },
    { label: '合作伙伴', value: 'partner' },
    { label: '访客', value: 'guest' },
  ],
  userStatus: [
    { label: '正常', value: 1 },
    { label: '禁用', value: 0 },
  ],
  pagination: {
    defaultPage: 1,
    defaultPageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },
}

// ==================== 组件配置 ====================
export const COMPONENT_CONFIG = {
  icons: {
    search: 'mdi:magnify',
    plus: 'mdi:plus',
    refresh: 'mdi:refresh',
    tree: 'mdi:file-tree',
    toggle: 'mdi:toggle-switch',
    delete: 'mdi:delete',
    edit: 'mdi:pencil',
    eye: 'mdi:eye',
    pause: 'mdi:pause',
    play: 'mdi:play',
    key: 'mdi:key',
    cancel: 'mdi:cancel',
    role: 'mdi:account-key',
    check: 'mdi:check-circle',
    info: 'mdi:information',
  },
  statusConfig: {
    1: { text: '正常', type: 'success' as const, icon: 'mdi:check-circle' },
    0: { text: '禁用', type: 'error' as const, icon: 'mdi:pause-circle' },
  },
  userTypeConfig: {
    internal: { text: '内部', type: 'info' as const, icon: 'mdi:account' },
    external: {
      text: '外部',
      type: 'warning' as const,
      icon: 'mdi:account-group',
    },
    partner: {
      text: '伙伴',
      type: 'success' as const,
      icon: 'mdi:handshake',
    },
    guest: {
      text: '访客',
      type: 'default' as const,
      icon: 'mdi:account-outline',
    },
  },
  defaultAvatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
  batchConfig: {
    delete: {
      title: '批量删除',
      content: '确认删除选中的用户吗？此操作不可恢复！',
      type: 'error' as const,
    },
    toggle: {
      title: '批量状态操作',
      content: '确认对选中的用户进行状态切换吗？',
      type: 'warning' as const,
    },
  },
} as const

// ==================== 表格列配置 ====================
export const TABLE_COLUMN_CONFIG = {
  userType: { title: '用户类型', width: 100 },
  username: { title: '用户名', width: 120, fixed: 'left' as const },
  nickname: { title: '昵称', width: 120 },
  email: { title: '邮箱', width: 180 },
  phone: { title: '手机号', width: 130 },
  deptName: { title: '部门/公司', width: 150 },
  roleNames: { title: '角色', width: 180 },
  status: { title: '状态', width: 90 },
  createTime: { title: '创建时间', width: 180 },
} as const

// ==================== 表单验证规则 ====================
export const USER_FORM_RULES: Record<string, FormItemRule[]> = {
  username: [
    { required: true, message: '请输入用户名', trigger: ['input', 'blur'] },
    {
      min: 3,
      max: 20,
      message: '用户名长度在 3 到 20 个字符',
      trigger: ['input', 'blur'],
    },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: ['input', 'blur'] },
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: ['change', 'blur'] },
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱格式',
      trigger: ['input', 'blur'],
    },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: ['input', 'blur'],
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['input', 'blur'] },
    {
      min: 8,
      max: 64,
      message: '密码长度在 8 到 64 个字符',
      trigger: ['input', 'blur'],
    },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      message: '密码必须同时包含大写字母、小写字母和数字',
      trigger: ['input', 'blur'],
    },
  ],
}

// ==================== 默认数据 ====================
export const DEFAULT_USER_FORM_DATA: UserFormData = {
  username: '',
  nickname: '',
  email: '',
  phone: '',
  userType: 'internal',
  deptId: null,
  roleIds: [],
  password: '',
  status: 1,
  remark: '',
  companyName: '',
  contactPerson: '',
  memberships: [],
}

export const DEFAULT_RESET_PASSWORD_FORM: ResetPasswordForm = {
  newPassword: '',
  confirmPassword: '',
}

/**
 * 根据部门ID查找部门对象
 */
export const findDeptById = (
  depts: DeptData[],
  id: string
): DeptData | null => {
  for (const dept of depts) {
    if (dept.id === id) return dept
    if (dept.children) {
      const found = findDeptById(dept.children, id)
      if (found) return found
    }
  }
  return null
}

/**
 * 将部门列表转换为树形选项
 */
export const convertDeptListToTreeOptions = (
  depts: DeptData[]
): DeptTreeOption[] =>
  depts.map(dept => ({
    id: dept.id,
    name: dept.name,
    children: dept.children
      ? convertDeptListToTreeOptions(dept.children)
      : undefined,
  }))

/**
 * 获取用户状态配置
 */
export const getUserStatusConfig = (status: number) =>
  COMPONENT_CONFIG.statusConfig[
    status as keyof typeof COMPONENT_CONFIG.statusConfig
  ] || COMPONENT_CONFIG.statusConfig[1]

/**
 * 获取用户类型配置
 */
export const getUserTypeConfig = (userType: UserType) =>
  COMPONENT_CONFIG.userTypeConfig[userType] ||
  COMPONENT_CONFIG.userTypeConfig.internal
