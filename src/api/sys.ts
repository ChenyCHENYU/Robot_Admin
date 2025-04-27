/*
 * @Author: ChenYu
 * @Date: 2022-04-04 13:10:47
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 21:34:29
 * @FilePath: \Robot_Admin\src\api\sys.ts
 * @Description: 登录相关的接口
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

import request from '@/axios/request'
import DynamicRouter from '@/assets/json/dynamicRouter.json'

// 登录接口
export const login = (data: unknown) => {
  return request({
    url: '/sys/login',
    method: 'POST',
    data,
  })
}

// 获取用户信息接口
export const getUserInfo = () => {
  return request({
    url: '/sys/profile',
  })
}

// 获取菜单列表
export const getAuthMenuListApi = () => {
  // return request({
  //   url: '/sys/menu/list',
  // })
  // 暂时使用本地数据
  return DynamicRouter
}
