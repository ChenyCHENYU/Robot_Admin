/**
 * 类名合并工具
 * 从 apps/admin/src/lib/utils.ts 提取
 */

import { type ClassValue, clsx } from 'clsx'

/**
 * @description 合并类名 - 基于 clsx 库
 * @param inputs 类名数组
 * @returns 合并后的类名字符串
 * @example
 * cn('foo', 'bar') // 'foo bar'
 * cn('foo', { bar: true }) // 'foo bar'
 * cn('foo', { bar: false }) // 'foo'
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
