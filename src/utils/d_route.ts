/**
 * @description 扁平化数组对象(主要用来处理路由菜单)
 * @param {Array} menuList 所有菜单列表
 * @return array
 */
export function getFlatArr(
  menuList: Menu.MenuOptions[] = []
): Menu.MenuOptions[] {
  if (!Array.isArray(menuList)) return []
  return menuList.reduce(
    (pre: Menu.MenuOptions[], current: Menu.MenuOptions) => {
      let flatArr = [...pre, current]
      if (Array.isArray(current.children) && current.children.length > 0)
        flatArr = [...flatArr, ...getFlatArr(current.children)]
      return flatArr
    },
    []
  )
}

/**
 * @description 使用递归，过滤出需要渲染在左侧菜单的列表（剔除 hidden == true 的菜单）
 * @param {Array} menuList 所有菜单列表
 * @return array
 * */
export function getShowMenuList(
  menuList: Menu.MenuOptions[] = []
): Menu.MenuOptions[] {
  if (!Array.isArray(menuList)) return []
  const newMenuList: Menu.MenuOptions[] = JSON.parse(JSON.stringify(menuList))

  return newMenuList.filter(item => {
    if (Array.isArray(item.children) && item.children.length > 0) {
      item.children = getShowMenuList(item.children)
    }
    return !(item.meta && item.meta.hidden)
  })
}

/**
 * @description 使用递归，过滤需要缓存的路由
 * @param {Array} menuList 所有菜单列表
 * @return array
 * */
export function getKeepAliveRouterName(
  menuList: Menu.MenuOptions[] = [],
  keepAliveArr: string[] = []
): string[] {
  if (!Array.isArray(menuList)) return keepAliveArr
  menuList.forEach(item => {
    if (item.meta && item.meta.isKeepAlive && item.name) {
      keepAliveArr.push(item.name)
    }
    if (Array.isArray(item.children) && item.children.length > 0) {
      getKeepAliveRouterName(item.children, keepAliveArr)
    }
  })
  return keepAliveArr
}
