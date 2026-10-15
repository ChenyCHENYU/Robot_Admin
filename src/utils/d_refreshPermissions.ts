/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-14
 * @FilePath: \Robot_Admin\src\utils\d_refreshPermissions.ts
 * @Description: 权限命令提交后重读当前会话授权，撤销旧路由及页面缓存身份
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import router from '@/router'
import { s_permissionStore } from '@/stores/permission'
import { clearExistingRoutes, initDynamicRouter } from '@/router/dynamicRouter'
import { getAuthorizedLandingPath } from '@/router/d_routeIdentity'

/** 授权写入成功后从服务端重新计算菜单，失去当前页时进入仍有权访问的页面。 */
export const refreshCurrentAuthorization = async (): Promise<void> => {
  const permission = s_permissionStore()
  const currentPath = router.currentRoute.value.fullPath
  permission.resetPermissions()
  clearExistingRoutes()
  if (!(await initDynamicRouter()))
    throw new Error('授权已提交，请刷新页面重新获取权限')
  const next = permission.hasRoutePermission(router.currentRoute.value.path)
    ? currentPath
    : getAuthorizedLandingPath(permission.authMenuList)
  await router.replace(next)
}
