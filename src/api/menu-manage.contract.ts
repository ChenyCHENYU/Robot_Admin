/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\menu-manage.contract.ts
 * @Description: 菜单树、编辑草稿、按钮权限和移动请求的领域契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export type MenuType = 'directory' | 'menu' | 'button'

export interface MenuData {
  id: string
  name: string
  type: MenuType
  parentId: string | null
  path?: string
  component?: string
  icon?: string
  permission?: string
  sort: number
  status: number
  hidden: number
  keepAlive: boolean
  remark?: string
  children?: MenuData[]
}

export interface MenuFormData {
  id?: string
  name: string
  type: MenuType
  parentId: string | null
  path: string
  component: string
  icon: string
  permission: string
  sort: number
  status: number
  hidden: number
  keepAlive: boolean
  remark: string
}

export interface ButtonPermission {
  id: string
  menuId: string
  name: string
  permission: string
  remark?: string
}

export type MenuDropPosition = 'inside' | 'before' | 'after'
