/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\user-manage\d_roleOptions.ts
 * @Description: 按角色响应的类型约束生成选项，不依赖演示角色 ID
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { RoleData, UserType } from '@/api/user-manage.contract'

/** 缺少类型约束时保留服务端返回的可用角色，不从角色 ID 推断权限。 */
export const createUserRoleOptions = (roles: RoleData[], userType?: UserType) =>
  roles
    .filter(
      role =>
        role.status === 1 &&
        (!userType || !role.userTypes || role.userTypes.includes(userType))
    )
    .map(role => ({ label: role.name, value: role.id }))
