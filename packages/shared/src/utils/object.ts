/**
 * 对象处理工具函数
 */

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (obj instanceof Object) {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (source) {
    for (const key in source) {
      if (source[key] instanceof Object && !Array.isArray(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key] as any)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 获取对象指定路径的值
 * @example get({ a: { b: { c: 1 } } }, 'a.b.c') => 1
 */
export function get<T = any>(
  obj: Record<string, any>,
  path: string,
  defaultValue?: T
): T {
  const keys = path.split('.')
  let result: any = obj

  for (const key of keys) {
    if (result?.[key] === undefined) return defaultValue as T
    result = result[key]
  }

  return result ?? defaultValue
}

/**
 * 设置对象指定路径的值
 * @example set({}, 'a.b.c', 1) => { a: { b: { c: 1 } } }
 */
export function set<T extends Record<string, any>>(
  obj: T,
  path: string,
  value: any
): T {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let current: any = obj

  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[lastKey] = value
  return obj
}

/**
 * 省略对象的某些属性
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

/**
 * 选取对象的某些属性
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) result[key] = obj[key]
  })
  return result
}

/**
 * 判断对象是否为空
 */
export function isEmptyObject(obj: any): boolean {
  if (obj === null || obj === undefined) return true
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * 检查对象是否包含指定属性
 */
export function has(obj: Record<string, any>, path: string): boolean {
  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (!current || !(key in current)) return false
    current = current[key]
  }

  return true
}
