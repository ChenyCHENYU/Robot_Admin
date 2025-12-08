/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 16:15:44
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-05 01:13:07
 * @FilePath: \Robot_Admin\src\hooks\useStorage\index.ts
 * @Description: 封装本地存储
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// 增加类型守卫
const isSerializable = (value: unknown): value is object =>
  typeof value === 'object' && value !== null && !(value instanceof Date)

// 存储数据（增强类型检查）
export const setItem = <T extends string | number | boolean | object | null>(
  key: string,
  value: T
): void => {
  const storageValue = isSerializable(value)
    ? JSON.stringify(value)
    : value instanceof Date
      ? value.toISOString()
      : String(value)

  window.localStorage.setItem(key, storageValue)
}

// 获取数据（安全的反序列化）
export const getItem = <T = unknown>(key: string): T | null => {
  const data = window.localStorage.getItem(key)
  if (data === null) return null

  try {
    return JSON.parse(data) as T
  } catch {
    return data as T
  }
}

// 删除指定数据
export const removeItem = (key: string) => window.localStorage.removeItem(key)

// 删除所有数据
export const removeAllItem = () => window.localStorage.clear()
