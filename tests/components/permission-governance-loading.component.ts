/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\tests\components\permission-governance-loading.component.ts
 * @Description: 权限治理按区域刷新并保留各自的最新分页请求
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NDialogProvider, NMessageProvider } from 'naive-ui'
import { expect, test, vi } from 'vitest'
import { usePermissionManagement } from '@/views/sys-manage/permission-manage/usePermissionManagement'
import { deferred } from './d_deferred'

const api = vi.hoisted(() => ({
  getDataPermissionRulesApi: vi.fn(),
  getTempAuthorizationsPageApi: vi.fn(),
  getPermissionAuditLogsPageApi: vi.fn(),
  getPermissionConstraintsApi: vi.fn(),
  getGovernanceCapabilitiesApi: vi.fn(),
  createTempAuthorizationApi: vi.fn(),
  revokeTempAuthorizationApi: vi.fn(),
  updateDataPermissionRuleApi: vi.fn(),
}))
const getRoles = vi.hoisted(() => vi.fn())

vi.mock('@/api/permission-governance', () => api)
vi.mock('@/api/role-manage', () => ({ getRoleListApi: getRoles }))
vi.mock('@/api/permission-manage', () => ({
  getPermissionCatalogApi: vi.fn().mockResolvedValue({ data: { list: [] } }),
}))

test('约束接口失败不丢弃其他区域，审计翻页也不取消授权查询', async () => {
  api.getDataPermissionRulesApi.mockResolvedValue({ data: [] })
  api.getPermissionConstraintsApi.mockRejectedValue(new Error('暂不可用'))
  api.getGovernanceCapabilitiesApi.mockResolvedValue({
    data: {
      fieldPermission: { read: true },
      temporaryRoleGrant: { write: false },
    },
  })
  getRoles.mockResolvedValue({ data: { list: [] } })
  const grant = deferred<{ data: { list: []; total: number } }>()
  api.getTempAuthorizationsPageApi
    .mockResolvedValueOnce({ data: { list: [], total: 25 } })
    .mockReturnValueOnce(grant.promise)
  api.getPermissionAuditLogsPageApi
    .mockResolvedValueOnce({ data: { list: [], total: 31 } })
    .mockResolvedValueOnce({ data: { list: [], total: 30 } })

  let view!: ReturnType<typeof usePermissionManagement>
  const Page = defineComponent({
    /** 使用真实页面控制器发起、刷新和提交各标签的查询。 */
    setup() {
      view = usePermissionManagement()
      return () => null
    },
  })
  mount(
    defineComponent({
      /** 使用与页面一致的反馈上下文。 */
      setup: () => () =>
        h(NMessageProvider, null, () =>
          h(NDialogProvider, null, () => h(Page))
        ),
    })
  )
  await flushPromises()
  expect(view.temporaryGrants.total).toBe(25)
  expect(view.audit.total).toBe(31)

  view.temporaryGrants.page = 2
  const pending = view.temporaryGrants.load()
  try {
    view.audit.page = 2
    await view.audit.load()
    expect(api.getPermissionAuditLogsPageApi).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
      expect.any(AbortSignal)
    )
    expect(view.audit.total).toBe(30)
    expect(view.temporaryGrants.loading).toBe(true)
    expect(api.getTempAuthorizationsPageApi).toHaveBeenCalledTimes(2)
    expect(api.getPermissionConstraintsApi).toHaveBeenCalledTimes(1)
    expect(api.getGovernanceCapabilitiesApi).toHaveBeenCalledTimes(1)
    expect(getRoles).toHaveBeenCalledTimes(1)
  } finally {
    grant.resolve({ data: { list: [], total: 24 } })
    await pending
  }
  expect(view.temporaryGrants.total).toBe(24)
})
