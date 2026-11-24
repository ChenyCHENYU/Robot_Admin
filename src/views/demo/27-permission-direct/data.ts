import type {
  PermissionFallback,
  PermissionMode,
} from '@robot-admin/directives/permission'
import type { ButtonProps } from 'naive-ui'

/**
 * * @description 模拟权限数据
 */
export const MOCK_PERMISSIONS: Record<number, Record<string, boolean>> = {
  1: {
    'user:view': true,
    'user:edit': true,
    'user:delete': false,
    'system:admin': false,
  },
  2: {
    'user:view': true,
    'user:edit': true,
    'user:delete': true,
    'system:admin': false,
  },
  3: {
    'user:*': true,
    'system:*': true,
  },
  4: {
    'user:view': true,
    'user:edit': false,
    'user:delete': false,
    'system:admin': false,
  },
  5: {},
}

export const USER_PROFILES = [
  { id: 1, name: '普通编辑员', desc: '可查看和编辑用户' },
  { id: 2, name: '管理员', desc: '用户管理权限' },
  { id: 3, name: '超级管理员', desc: '所有权限（通配符）' },
  { id: 4, name: '只读用户', desc: '只能查看' },
  { id: 5, name: '无权限用户', desc: '无任何权限' },
]

export interface PermissionExample {
  permissions: string | readonly string[]
  mode?: PermissionMode
  fallback: PermissionFallback
  type: ButtonProps['type']
  label: string
  hint: string
  operation: string
}

export const BASIC_PERMISSIONS: PermissionExample[] = [
  {
    permissions: 'user:view',
    fallback: 'hide',
    type: 'primary',
    label: '👁️ 查看用户',
    hint: '需要: user:view',
    operation: '查看用户',
  },
  {
    permissions: 'user:edit',
    fallback: 'show',
    type: 'success',
    label: '✏️ 编辑用户',
    hint: '需要: user:edit (点击体验提示)',
    operation: '编辑用户',
  },
  {
    permissions: 'user:delete',
    fallback: 'show',
    type: 'error',
    label: '🗑️ 删除用户',
    hint: '需要: user:delete (点击体验提示)',
    operation: '删除用户',
  },
  {
    permissions: 'system:admin',
    fallback: 'hide',
    type: 'warning',
    label: '⚙️ 系统管理',
    hint: '需要: system:admin (隐藏模式)',
    operation: '系统管理',
  },
]

const editPermissions = ['user:edit', 'user:delete'] as const

export const ADVANCED_PERMISSIONS: PermissionExample[] = [
  {
    permissions: editPermissions,
    mode: 'OR',
    fallback: 'show',
    type: 'primary',
    label: '📝 编辑或删除 (OR模式)',
    hint: '需要: user:edit 或 user:delete',
    operation: '编辑或删除',
  },
  {
    permissions: editPermissions,
    mode: 'AND',
    fallback: 'show',
    type: 'warning',
    label: '🔒 编辑且删除 (AND模式)',
    hint: '需要: user:edit 且 user:delete',
    operation: '编辑且删除',
  },
  {
    permissions: 'user:*',
    fallback: 'show',
    type: 'success',
    label: '🌟 通配符权限 (user:*)',
    hint: '需要: user:* 通配符权限',
    operation: '用户管理',
  },
]

/**
 * * @description 代码示例
 */
export const PERMISSION_CODE_EXAMPLES = {
  basic:
    `<!-- 基础用法 -->
<NButton v-permission="{
  permissions: 'user:edit',
  authData: userPermissions
}" @click="handleEdit">
  编辑用户
</NButton>

<!-- 多权限检查 -->
<NButton v-permission="{
  permissions: ['user:edit', 'user:create'],
  authData: userPermissions,
  fallback: 'show'
}" @click="handleEditOrCreate">
  编辑或创建用户
</NButton>

<script setup>
const handleEdit = () => {
  // 在点击时再次检查权限并提示
  if (!hasPermission('user:edit')) {
    message.warning('权限不足，无法编辑用户')
    return
  }
  // 执行实际操作
  performOperation()
}
<` + `/script>`,

  advanced:
    `<!-- 高级配置 -->
<NButton v-permission="{
  permissions: 'user:delete',
  authData: userPermissions,
  fallback: 'disable'
}" @click="handleDelete">
  删除用户（禁用模式）
</NButton>

<!-- AND模式权限检查 -->
<NButton v-permission="{
  permissions: ['user:edit', 'user:delete'],
  authData: userPermissions,
  mode: 'AND',
  fallback: 'show'
}" @click="handleAdvancedOperation">
  高级操作（需要多权限）
</NButton>

<script setup>
const handleDelete = () => {
  if (!hasPermission('user:delete')) {
    message.warning('权限不足，无法删除用户')
    return
  }
  // 危险操作确认
  dialog.warning({
    title: '确认删除',
    content: '此操作不可恢复，确定要删除吗？',
    positiveText: '确定',
    onPositiveClick: () => {
      performDelete()
    }
  })
}
<` + `/script>`,

  scenarios: `<!-- 权限控制策略 -->

<!-- 1. 基础权限：没权限时隐藏 -->
<NButton v-permission="{
  permissions: 'user:view',
  authData: userPermissions,
  fallback: 'hide'
}" @click="performView">
  查看用户
</NButton>

<!-- 2. 危险操作：没权限时显示但禁用，点击提示 -->
<NButton v-permission="{
  permissions: 'user:delete',
  authData: userPermissions,
  fallback: 'show'
}" @click="performDelete">
  删除用户
</NButton>

<!-- 3. 管理功能：没权限时完全隐藏 -->
<div v-permission="{
  permissions: 'system:admin',
  authData: userPermissions,
  fallback: 'hide'
}">
  <NAlert type="warning">管理员面板</NAlert>
</div>

<!-- 4. 通配符权限 -->
<NButton v-permission="{
  permissions: 'user:*',
  authData: userPermissions
}" @click="performUserManagement">
  用户管理
</NButton>`,
} as const
