/*
 * @Description: 子系统标题配置
 * @Author: CHENY
 * @Date: 2025-12-25
 */

export interface SystemTitle {
  main: string // 主标题
  subtitle: string // 副标题
}

/**
 * 子系统标题映射表
 * key: 路由路径（支持精确匹配和前缀匹配）
 * value: 标题配置
 */
export const systemTitleMap: Record<string, SystemTitle> = {
  // 智慧物流系统
  '/micro-app/logistics': {
    main: '智慧物流',
    subtitle: '物流管理系统',
  },

  // 可以继续添加其他子系统
  // '/micro-app/warehouse': {
  //   main: '智能仓储',
  //   subtitle: '仓储管理系统',
  // },

  // '/micro-app/finance': {
  //   main: '财务管理',
  //   subtitle: '财务系统',
  // },

  // 微前端容器页（默认显示主平台）
  '/micro-app': {
    main: 'Robot Admin',
    subtitle: '工业互联网平台',
  },

  // 默认标题（主平台）
  default: {
    main: 'Robot Admin',
    subtitle: '工业互联网平台',
  },
}

/**
 * 根据路由路径获取系统标题
 * @param path 当前路由路径
 * @returns 系统标题配置
 */
export function getSystemTitle(path: string): SystemTitle {
  // 精确匹配
  if (systemTitleMap[path]) {
    return systemTitleMap[path]
  }

  // 前缀匹配（从长到短匹配，确保优先匹配更具体的路径）
  const sortedKeys = Object.keys(systemTitleMap)
    .filter(key => key !== 'default')
    .sort((a, b) => b.length - a.length)

  const matchedKey = sortedKeys.find(key => path.startsWith(key))

  return matchedKey ? systemTitleMap[matchedKey] : systemTitleMap.default
}
