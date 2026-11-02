/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-02
 * @FilePath: \Robot_Admin\src\config\enums.ts
 * @Description: 稳定业务枚举的共享选项；远程字典不在此注册
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { defineEnum } from '@robot-admin/dictionary'

export const ORDER_STATUS_OPTIONS = defineEnum([
  { value: 0, label: '待下达' },
  { value: 1, label: '执行中' },
  { value: 2, label: '已完成' },
])
