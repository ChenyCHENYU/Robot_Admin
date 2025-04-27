/*
 * @Description: 处理一些全局 State
 * @Author: Cheny ycyplus@gmail.com
 * @Date: 2022-12-12 11:46:51
 * @LastEditors: ChenYu
 * @LastEditTime: 2022-12-14 23:38:09
 * @FilePath: \vue3_vite3_element-plus_admin\src\store\index.ts
 * Copyright (c) 2022 西安天智 AgileTeam by Cheny email: ycyplus@gmail.com, All Rights Reserved.
 */

import piniaPersistConfig from '@/config/piniaPersist'
import { DEFAULT_PRIMARY } from '@/constant'
// 下面的这个持久化存储没生效，明天检查原因
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import type { I_GlobalState, I_ThemeConfigProps } from './types'

// defineStore 调用后返回一个函数，调用该函数获得 Store 实体
export const s_globalStore = defineStore({
  // id: 必须的，在所有 Store 中唯一
  id: 'globalState',
  // state: 返回对象的函数
  state: (): I_GlobalState => ({
    // element组件大小
    assemblySize: 'default',
    // language
    language: '',
    // themeConfig
    themeConfig: {
      // 布局切换 ==>  纵向：vertical | 经典：classic | 横向：transverse | 分栏：columns
      layout: 'vertical',
      // 默认 primary 主题颜色
      primary: DEFAULT_PRIMARY,
      // 深色模式
      isDark: false,
      // 灰色模式
      isGrey: false,
      // 色弱模式
      isWeak: false,
      // 折叠菜单
      isCollapse: false,
      // 面包屑导航
      breadcrumb: true,
      // 面包屑导航图标
      breadcrumbIcon: true,
      // 标签页
      tabs: true,
      // 页脚
      footer: true,
      // 当前页面是否全屏
      maximize: false,
    },
  }),
  getters: {},
  actions: {
    // setThemeConfig
    setThemeConfig(themeConfig: I_ThemeConfigProps) {
      this.themeConfig = themeConfig
    },
  },
  persist: piniaPersistConfig('globalState'),
})

// piniaPersist(持久化)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia
