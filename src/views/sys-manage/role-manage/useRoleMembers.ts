/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\sys-manage\role-manage\useRoleMembers.ts
 * @Description: 角色成员弹窗独立管理目标角色与分页
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { RoleData, RoleUserData } from '@/api/role-manage.contract'
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
import { getRoleUsersPageApi } from '@/api/role-manage'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { s_userStore } from '@/stores/user'

const pageSize = 20
type RoleTarget = Pick<RoleData, 'id' | 'name'>

/** 成员分页绑定打开列表时的角色，角色详情或权限抽屉不会改变请求目标。 */
export function useRoleMembers() {
  const message = useMessage()
  const request = useLatestRequest()
  const users = s_userStore()
  const visible = ref(false)
  const role = shallowRef<RoleTarget | null>(null)
  const rows = shallowRef<RoleUserData[]>([])
  const page = ref(1)
  const total = ref(0)
  let contextId: string | undefined
  const close = () => {
    request.cancel()
    role.value = null
  }
  watch(
    visible,
    shown => {
      if (!shown) close()
    },
    { flush: 'sync' }
  )
  onDeactivated(() => {
    visible.value = false
  })
  watch(
    () => users.activeContext?.id,
    () => {
      visible.value = false
    }
  )
  const loadPage = async (nextPage: number) => {
    const selected = role.value
    const isCurrent = () =>
      role.value === selected && users.activeContext?.id === contextId
    if (!selected || !visible.value || !isCurrent()) return
    page.value = nextPage
    try {
      const response = await request.run(signal =>
        getRoleUsersPageApi(selected.id, { page: nextPage, pageSize }, signal)
      )
      if (!response || !isCurrent()) return
      rows.value = response.data.list
      total.value = response.data.total
    } catch {
      if (isCurrent()) message.error('获取角色成员失败，请刷新后重试')
    }
  }
  const open = ({ id, name }: RoleTarget) => {
    role.value = { id, name }
    contextId = users.activeContext?.id
    rows.value = []
    total.value = 0
    visible.value = true
    return loadPage(1)
  }

  const columns: TableColumn<RoleUserData>[] = [
    { title: '用户名', key: 'username', width: 120 },
    { title: '昵称', key: 'nickname', width: 120 },
    { title: '邮箱', key: 'email', width: 200 },
    { title: '手机号', key: 'phone', width: 120 },
    { title: '部门', key: 'deptName', width: 120 },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (row: RoleUserData) =>
        h(
          NTag,
          { type: row.status === 1 ? 'success' : 'error', size: 'small' },
          { default: () => (row.status === 1 ? '正常' : '禁用') }
        ),
    },
  ]

  return proxyRefs({
    visible,
    role,
    rows,
    page,
    total,
    pageSize,
    columns,
    loading: request.loading,
    open,
    loadPage,
  })
}
