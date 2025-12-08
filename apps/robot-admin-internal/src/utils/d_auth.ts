/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 14:27:41
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-29 16:43:28
 * @FilePath: \Robot_Admin\src\utils\d_auth.ts
 * @Description:  权限相关工具函数
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { TIME_STAMP, TOKEN_TIMEOUT_VALUE } from '@/constant'
import { getItem, setItem } from '@/hooks/useStorage'

/**
 * @description: 获取缓存的时间戳
 */
export const d_getTimeStamp = (): number => getItem(TIME_STAMP) ?? 0

/**
 * @description: 设置缓存时间戳
 */
export const d_setTimeStamp = (): void => setItem(TIME_STAMP, Date.now())

/**
 * @description: 刷新过期时间（活跃续期）
 */
export const d_refreshTokenExpire = (): void => {
  setItem(TIME_STAMP, Date.now())
}

/**
 * @description: 是否超时（仅用于主动检查，不在拦截器中使用）
 */
export const d_isCheckTimeout = (): boolean => {
  const currentTime = Date.now()
  const timeStamp = d_getTimeStamp()
  return currentTime - timeStamp > TOKEN_TIMEOUT_VALUE
}
