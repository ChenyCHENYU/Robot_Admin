import {
  hasPermission,
  type PermissionMode,
} from '@robot-admin/directives/permission'

/**
 * * @description 模拟权限数据
 */
const MOCK_PERMISSIONS = {
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

/**
 * * @description 用户信息接口
 */
interface UserProfile {
  id: number
  name: string
  desc: string
}

/**
 * * @description 创建权限演示状态
 * ! @return 演示状态对象
 */
export function createPermissionDemoState() {
  const currentUserId = ref(1)

  const userProfiles = reactive<UserProfile[]>([
    { id: 1, name: '普通编辑员', desc: '可查看和编辑用户' },
    { id: 2, name: '管理员', desc: '用户管理权限' },
    { id: 3, name: '超级管理员', desc: '所有权限（通配符）' },
    { id: 4, name: '只读用户', desc: '只能查看' },
    { id: 5, name: '无权限用户', desc: '无任何权限' },
  ])

  const currentUser = computed(() => {
    return (
      userProfiles.find(u => u.id === currentUserId.value) || userProfiles[0]
    )
  })

  const currentPermissions = computed<Record<string, boolean>>(() => {
    return (
      MOCK_PERMISSIONS[currentUserId.value as keyof typeof MOCK_PERMISSIONS] ||
      {}
    )
  })

  return {
    activeTab: ref('basic'),
    currentUserId,
    currentUser,
    currentPermissions,
    userProfiles,
    operationCount: ref(0),
  }
}

/**
 * * @description 创建权限演示处理函数
 * ? @param state - 演示状态对象
 * ! @return 处理函数对象
 */
export function createPermissionDemoHandlers(
  state: ReturnType<typeof createPermissionDemoState>
) {
  const message = useMessage()

  const allows = (
    permissions: string | readonly string[],
    mode?: PermissionMode
  ) => hasPermission(permissions, state.currentPermissions.value, mode)

  const perform = (
    permissions: string | string[],
    operation: string,
    mode: PermissionMode = 'OR'
  ) => {
    if (allows(permissions, mode)) {
      state.operationCount.value++
      message.success(`执行操作: ${operation}`)
      return
    }
    const requirement =
      typeof permissions === 'string'
        ? permissions
        : permissions.join(mode === 'AND' ? ' 且 ' : ' 或 ')
    message.warning(`权限不足，执行「${operation}」需要 ${requirement}`)
  }

  return {
    /**
     * * @description 切换用户
     * ? @param userId - 用户ID
     * ! @return void
     */
    switchUser: async (userId: number) => {
      state.currentUserId.value = userId
      await nextTick()
      const user = state.userProfiles.find(u => u.id === userId)
      message.info(`用户已切换: ${user?.name}`)
    },

    allows,
    performSecureOperation: perform,
    performMultiSecureOperation: perform,

    /**
     * * @description 重置演示
     * ! @return void
     */
    resetDemo: () => {
      state.operationCount.value = 0
      message.info('演示状态已重置')
    },
  }
}

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
