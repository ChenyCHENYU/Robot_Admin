/*
 * @Author: ChenYu
 * @Date: 2022-04-18 11:40:01
 * @LastEditors: ChenYu
 * @LastEditTime: 2022-04-18 11:40:01
 * @FilePath: \v3-el-components\src\api\user.ts
 * @Description: 用户相关接口
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 *
 *
 */

import request from '@/axios/request'

export const feature = () => {
  return request({
    url: '/user/feature',
  })
}

export const chapter = () => {
  return request({
    url: '/user/chapter',
  })
}
