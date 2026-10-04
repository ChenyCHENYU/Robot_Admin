/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\router\d_routeMatch.ts
 * @Description: 检测导航解析后动态路由被替换，防止沿用旧的 404 或公司路由记录
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { RouteLocationNormalized } from 'vue-router'

/** 比较记录身份而非路径：同一路径重新注册后，旧 matched 也必须重新解析。 */
export const hasRouteMatchChanged = (
  navigation: Pick<RouteLocationNormalized, 'matched'>,
  currentMatch: Pick<RouteLocationNormalized, 'matched'>
): boolean =>
  navigation.matched.length !== currentMatch.matched.length ||
  navigation.matched.some(
    (record, index) => record !== currentMatch.matched[index]
  )
