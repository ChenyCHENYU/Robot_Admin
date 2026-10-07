/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: 调度工作区的扁平场景配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */
import type { CronConfig } from '@robot-admin/naive-ui-components/C_Cron'

export const INITIAL_PLAN = '0 30 8 * * ?'
export const cronConfig: CronConfig = {
  previewCount: 5,
  templates: [
    {
      label: '每日汇总',
      value: INITIAL_PLAN,
      description: '每天 08:30 生成汇总',
    },
    {
      label: '巡检同步',
      value: '0 0/5 * * * ?',
      description: '每隔 5 分钟执行一次',
    },
    {
      label: '工作日提醒',
      value: '0 0 9 ? * 2-6',
      description: '周一至周五 09:00',
    },
    { label: '月度归档', value: '0 0 0 1 * ?', description: '每月 1 日 00:00' },
  ],
}
