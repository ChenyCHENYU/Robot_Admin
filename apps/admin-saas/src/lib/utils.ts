/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-16 15:19:02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-07 15:02:43
 * @FilePath: \Robot_Admin\src\lib\utils.ts
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
//* 处理动画组件的工具函数

import { type ClassValue, clsx } from 'clsx'

/**
 * @description:  三方库 - 合并类名
 * @param {array} inputs
 * @return {*}
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export type ObjectValues<T> = T[keyof T]
