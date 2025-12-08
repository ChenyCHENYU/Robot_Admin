/**
 * 数组处理工具函数
 */

/**
 * 数组去重
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/**
 * 根据对象属性去重
 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set()
  return arr.filter(item => {
    const val = item[key]
    if (seen.has(val)) return false
    seen.add(val)
    return true
  })
}

/**
 * 数组分块
 * @example chunk([1, 2, 3, 4, 5], 2) => [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 * 数组扁平化
 */
export function flatten<T>(arr: any[]): T[] {
  return arr.reduce(
    (acc, val) =>
      Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val),
    []
  )
}

/**
 * 数组分组
 * @example groupBy([{id: 1, type: 'a'}, {id: 2, type: 'b'}], 'type')
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const groupKey = String(item[key])
      if (!acc[groupKey]) acc[groupKey] = []
      acc[groupKey].push(item)
      return acc
    },
    {} as Record<string, T[]>
  )
}

/**
 * 数组求和
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0)
}

/**
 * 数组平均值
 */
export function average(arr: number[]): number {
  return arr.length === 0 ? 0 : sum(arr) / arr.length
}

/**
 * 数组最大值
 */
export function max(arr: number[]): number {
  return Math.max(...arr)
}

/**
 * 数组最小值
 */
export function min(arr: number[]): number {
  return Math.min(...arr)
}

/**
 * 随机打乱数组
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 随机获取数组中的一项
 */
export function sample<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 移动数组元素位置
 */
export function move<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr]
  const item = result.splice(from, 1)[0]
  result.splice(to, 0, item)
  return result
}

/**
 * 树形结构扁平化
 */
export function flattenTree<T extends Record<string, any>>(
  tree: T[],
  childrenKey = 'children'
): T[] {
  const result: T[] = []
  function traverse(nodes: T[]) {
    nodes.forEach(node => {
      result.push(node)
      if (node[childrenKey]?.length) {
        traverse(node[childrenKey])
      }
    })
  }
  traverse(tree)
  return result
}
