/*
 * @Author: ChenYu
 * @Date: 2022-04-27 09:48:09
 * @LastEditors: ChenYu
 * @LastEditTime: 2022-04-27 10:11:14
 * @FilePath: \v3-el-components\src\api\permission.ts
 * @Description: 权限列表
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

import request from '@/axios/request'

/**
 * @description:获取所有权限
 */

export const permissionList = () => {
  return request({
    url: '/permission/list',
  })
}
