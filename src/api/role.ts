/*
 * @Author: ChenYu
 * @Date: 2022-04-27 08:49:27
 * @LastEditors: ChenYu
 * @LastEditTime: 2022-04-27 17:10:35
 * @FilePath: \v3-el-components\src\api\role.ts
 * @Description: 权限接口
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

import request from '@/axios/request'

/**
 * @description: 获取所有角色
 */
export const roleList = () => {
  return request({
    url: '/role/list',
  })
}

/**
 * @description: 获取当前角色对应权限
 */
export const rolePermission = roleId => {
  return request({
    url: `/role/permission/${roleId}`,
  })
}

/**
 * @description: 为角色修改权限
 */
export const distributePermission = data => {
  return request({
    url: '/role/distribute-permission',
    method: 'POST',
    data,
  })
}
