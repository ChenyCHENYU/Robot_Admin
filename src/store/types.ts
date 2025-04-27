/*
 * @Description: 服务于 store 中的类型约定
 * @Author: Cheny ycyplus@gmail.com
 * @Date: 2022-12-12 11:55:39
 * @LastEditors: Cheny ycyplus@gmail.com
 * @LastEditTime: 2022-12-13 21:17:06
 * @FilePath: \vue3_vite3_elementPlus_admin\src\store\types.ts
 * Copyright (c) 2022 西安天智 AgileTeam by Cheny email: ycyplus@gmail.com, All Rights Reserved.
 */

export interface I_ThemeConfigProps {
  layout: string
  primary: string
  isDark: boolean
  isGrey: boolean
  isCollapse: boolean
  isWeak: boolean
  breadcrumb: boolean
  breadcrumbIcon: boolean
  tabs: boolean
  tabsIcon: boolean
  footer: boolean
  maximize: boolean
}

/* GlobalState */
export interface I_GlobalState {
  assemblySize: string
  language: string
  themeConfig: ThemeConfigProps
}
