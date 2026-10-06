/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\utils\d_routeComponent.ts
 * @Description: 将缓存页面的组件身份对齐路由名，保留原组件与懒加载行为
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { defineComponent, h, type Component } from 'vue'

/** KeepAlive 的 include 匹配组件名；接口路由名不应依赖页面 SFC 的内部命名。 */
export const bindCachedRouteComponent = (
  name: string,
  load: () => Promise<unknown>
): (() => Promise<Component>) => {
  let pending: Promise<Component> | undefined
  return () => {
    pending ||= load()
      .then(module => {
        const page = (module as { default: Component }).default
        if (!page) throw new Error(`路由 ${name} 缺少页面组件`)
        return defineComponent({
          name,
          inheritAttrs: false,
          /** 透传路由参数与插槽，不添加 DOM 包裹，也不修改原始页面。 */
          setup(_props, { attrs, slots }) {
            return () => h(page, attrs, slots)
          },
        })
      })
      .catch(error => {
        pending = undefined
        throw error
      })
    return pending
  }
}
