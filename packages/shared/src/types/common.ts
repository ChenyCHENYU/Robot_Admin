/**
 * 通用类型定义
 */

/**
 * 获取对象的值类型
 * @example
 * const obj = { a: 1, b: 'hello' }
 * type Values = ObjectValues<typeof obj> // 1 | 'hello'
 */
export type ObjectValues<T> = T[keyof T]

/**
 * 可选的部分属性
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 必需的部分属性
 */
export type Required<T, K extends keyof T> = Omit<T, K> & globalThis.Required<Pick<T, K>>

/**
 * 通用 ID 类型
 */
export type ID = string | number
