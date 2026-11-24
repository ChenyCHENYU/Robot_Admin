/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\sys-manage\menu-manage\useMenuNavigationSync.ts
 * @Description: 菜单提交后，同一会话的导航及页面缓存更新
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { clearExistingRoutes, initDynamicRouter } from '@/router/dynamicRouter'
import { getAuthMenuListApi, type AuthMenuResponse } from '@/api/auth'
import { isMockDataMode } from '@/config/dataMode'
import { s_userStore } from '@/stores/user'
import { s_permissionStore } from '@/stores/permission'
import { getRequestErrorMessage } from '@/utils/d_request'

/** 同步失败时保留当前已加载的导航。 */
function checkNavigationResponse(response: AuthMenuResponse): void {
  if (!['0', '200'].includes(String(response.code)) || !response.data?.length)
    throw new Error(response.msg || response.message || '导航配置加载失败')
}

/** 独立持有导航待同步状态；确认接口可用后才清理旧路由。 */
export function useMenuNavigationSync(blocked: () => boolean) {
  const router = useRouter()
  const route = useRoute()
  const message = useMessage()
  const users = s_userStore()
  const permissions = s_permissionStore()
  const pending = ref(false)
  const syncing = ref(false)

  const markChanged = (changedCache = false) => {
    pending.value ||= !isMockDataMode() || changedCache
  }
  const sync = async () => {
    if (blocked()) return
    syncing.value = true
    const { fullPath, path } = route
    const context = users.activeContext
    let generation = permissions.requestGeneration
    const contextId = context?.id
    const isCurrent = () =>
      permissions.requestGeneration === generation &&
      users.activeContext?.id === contextId

    try {
      const response = await getAuthMenuListApi(context)
      checkNavigationResponse(response)
      if (!isCurrent()) return
      clearExistingRoutes()
      permissions.resetPermissions()
      generation++
      if (!(await initDynamicRouter())) throw new Error('同步失败，请重试')
      // 重建布局可能卸载原页面，同一会话仍需完成用户发起的同步。
      if (!isCurrent()) return
      await router.replace(
        permissions.hasRoutePermission(path) ? fullPath : '/home'
      )
      pending.value = false
      message.success(
        isMockDataMode() ? '页面缓存配置已应用' : '导航与页面缓存配置已应用'
      )
    } catch (error) {
      if (isCurrent()) message.error(getRequestErrorMessage(error))
    } finally {
      syncing.value = false
    }
  }
  return proxyRefs({ pending, syncing, markChanged, sync })
}
