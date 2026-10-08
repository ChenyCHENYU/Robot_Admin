/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\permission-policy.contract.ts
 * @Description: 角色与权限治理共享的数据范围和临时授权状态契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { DATA_SCOPE } from '@/constant'

export type DataScopeType = (typeof DATA_SCOPE)[keyof typeof DATA_SCOPE]
export type TemporaryAuthorizationStatus = 'active' | 'expired' | 'revoked'
