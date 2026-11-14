/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\src\composables\useScopedMachTableConfig.ts
 * @Description: 在表格 setup 时捕获身份范围，让延迟保存始终归属创建它的账号
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { MachTableVueProps } from '@agile-team/mach-table-vue'
import { s_userStore } from '@/stores/user'
import { buildTablePreferenceScope } from '@/utils/d_tablePreferences'

/** 仅读取稳定身份 ID；布局跟踪此结果，凭据刷新和显示名变化不会重建页面。 */
export function getCurrentTablePreferenceScope(): string | undefined {
  const user = s_userStore()
  if (!user.token) return undefined
  return buildTablePreferenceScope({
    userId: user.userInfo.id,
    tenantId: user.activeContext?.tenantId,
    companyId: user.activeContext?.companyId,
  })
}

/** 必须在 setup 捕获一次；身份切换由布局 key 销毁旧实例，不动态改写其保存目标。 */
export function useScopedMachTableConfig<TData>(
  config: MachTableVueProps<TData>
): MachTableVueProps<TData> {
  const scope = getCurrentTablePreferenceScope()
  const { persistence } = config
  return {
    ...config,
    persistence:
      scope && persistence && persistence.key.trim()
        ? { ...persistence, key: JSON.stringify([scope, persistence.key]) }
        : false,
  }
}
