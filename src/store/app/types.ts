/*
 * @Author: ChenYu
 * @Date: 2022-04-15 00:42:54
 * @LastEditors: ChenYu
 * @LastEditTime: 2022-04-15 00:43:58
 * @FilePath: \v3-el-components\src\store\app\types.ts
 * @Description: 当前仓库类型约束
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

export interface I_Payload {
  type: 'index' | 'other' | 'right'
  index: number
}
