/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 20:44:22
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 20:45:48
 * @FilePath: \Robot_Admin\src\utils\d_breadcrumb.ts
 * @Description: 面包屑导航工具函数
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * @description 双重递归找出所有面包屑存储到 pinia/vuex 中
 * @param {Array} menuList 所有菜单列表
      menuItem.children.forEach(item => loop(item as Menu.MenuOptions & { path: string }))
 */
export function getAllBreadcrumbList(menuList: Menu.MenuOptions[]) {
  const handleBreadcrumbList: { [key: string]: unknown } = {}
  const loop = (menuItem: Menu.MenuOptions & { path: string }) => {
    if (menuItem?.children?.length)
      menuItem.children.forEach(item => {
        if ('path' in item) loop(item as Menu.MenuOptions & { path: string })
      })
    else
      handleBreadcrumbList[menuItem.path] = getCurrentBreadcrumb(
        menuItem.path,
        menuList
      )
  }
  menuList.forEach(item => {
    if ('path' in item) loop(item as Menu.MenuOptions & { path: string })
  })
  return handleBreadcrumbList
}

/**
 * @description 使用递归，过滤出当前路径匹配的面包屑地址
 * @param {String} path 当前访问地址
 * @param {Array} menuList 所有菜单列表
 * @returns array
 */
export function getCurrentBreadcrumb(
  path: string,
  menuList: Menu.MenuOptions[]
) {
  const tempPath: Menu.MenuOptions[] = []
  try {
    const getNodePath = (node: Menu.MenuOptions) => {
      tempPath.push(node)
      if (node.path === path) throw new Error('Find IT!')
      if (node.children?.length)
        node.children.forEach(item => getNodePath(item))
      tempPath.pop()
    }
    menuList.forEach(item => getNodePath(item))
  } catch {
    return tempPath
  }
}
