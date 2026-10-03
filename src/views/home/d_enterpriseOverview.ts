/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-03
 * @FilePath: \Robot_Admin\src\views\home\d_enterpriseOverview.ts
 * @Description: 各公司隔离的前端演示业务摘要，真实数据由后端按上下文返回
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

interface EnterpriseOverview {
  orders: string
  revenue: string
  pending: string
  update: string
}

const MOCK_OVERVIEWS: Record<string, EnterpriseOverview> = {
  'jinheng-nanjing': {
    orders: '1,286',
    revenue: '¥ 438.6 万',
    pending: '18',
    update: '南京总部 · 本周订单与营收',
  },
  'jinheng-xian': {
    orders: '742',
    revenue: '¥ 216.3 万',
    pending: '9',
    update: '西安团队 · 本周订单与营收',
  },
  'tianzhi-xian': {
    orders: '396',
    revenue: '¥ 85.2 万',
    pending: '4',
    update: '西安天智 · 本周订单与营收',
  },
}

export const getMockEnterpriseOverview = (
  contextId: string | undefined
): EnterpriseOverview | null =>
  contextId ? (MOCK_OVERVIEWS[contextId] ?? null) : null
