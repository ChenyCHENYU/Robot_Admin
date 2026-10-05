/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\34-production-cost\data.ts
 * @Description: 可复核的成本演示口径，所有指标从同一组数据计算
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export interface FactoryData {
  id: string
  name: string
  stage: string
  quantity: number
  standard: number
  actual: number
}
export const COST_DEMO_DATE = '2026-10-05'
const seeds: Array<[string, string, number, number, number]> = [
  ['球团矿', '原料', 4100, 960, -0.012],
  ['石灰车间', '原料', 1250, 240, 0.024],
  ['烧结矿', '原料', 9050, 820, -0.009],
  ['炼铁厂', '冶炼', 6300, 2180, 0.033],
  ['炼钢一厂', '冶炼', 7200, 2720, 0.018],
  ['炼钢二厂', '冶炼', 6100, 2745, -0.018],
  ['棒线厂 · 高棒', '轧制', 2300, 3160, -0.012],
  ['棒线厂 · 普棒', '轧制', 1850, 3080, 0.041],
  ['热轧厂 · 1580', '轧制', 5400, 3310, 0.015],
  ['热轧厂 · 900', '轧制', 3250, 3240, -0.023],
  ['冷轧厂 · 酸轧', '轧制', 2150, 3890, 0.009],
  ['冷轧厂 · 罩平', '轧制', 1200, 4020, 0.045],
  ['冷轧厂 · 镀锌 1', '轧制', 1650, 4380, 0.025],
  ['冷轧厂 · 镀锌 2', '轧制', 1400, 4350, -0.015],
  ['冷轧厂 · 镀锌 3', '轧制', 1520, 4410, 0.028],
  ['冷轧厂 · 彩涂', '轧制', 900, 4720, -0.005],
  ['冷轧厂 · 酸平', '轧制', 1100, 4100, 0.018],
]
export const COST_FACTORIES: FactoryData[] = seeds.map(
  ([name, stage, quantity, unit, difference], index) => ({
    id: `CC${String(index + 1).padStart(3, '0')}`,
    name,
    stage,
    quantity,
    standard: Math.round(quantity * unit),
    actual: Math.round(quantity * unit * (1 + difference)),
  })
)
export interface CostSummary {
  actual: number
  standard: number
  quantity: number
  unit: number
  standardUnit: number
  difference: number
  differenceRate: number
  execution: number
  overBudget: number
}
/** 汇总金额后计算加权吨成本，避免平均百分比与独立随机指标。 */
export function summarizeCosts(rows: FactoryData[]): CostSummary {
  const actual = rows.reduce((sum, row) => sum + row.actual, 0)
  const standard = rows.reduce((sum, row) => sum + row.standard, 0)
  const quantity = rows.reduce((sum, row) => sum + row.quantity, 0)
  return {
    actual,
    standard,
    quantity,
    unit: quantity ? actual / quantity : 0,
    standardUnit: quantity ? standard / quantity : 0,
    difference: actual - standard,
    differenceRate: standard ? (actual - standard) / standard : 0,
    execution: standard ? actual / standard : 0,
    overBudget: rows.filter(row => row.actual > row.standard).length,
  }
}
/** 演示趋势以固定统计日结束，最后一天与当前选中范围的吨成本一致。 */
export function createCostTrend(
  summary: CostSummary
): Array<{ date: string; value: number }> {
  const end = Date.parse(`${COST_DEMO_DATE}T00:00:00Z`)
  return Array.from({ length: 30 }, (_, index) => ({
    date: new Date(end - (29 - index) * 86400000).toISOString().slice(0, 10),
    value:
      Math.round(
        summary.unit *
          (1 +
            0.018 * Math.sin((index - 29) * 0.36) +
            0.009 * (Math.cos((index - 29) * 0.51) - 1)) *
          100
      ) / 100,
  }))
}
/** 紧凑金额以万元展示，同时保留表格中的完整财务单位。 */
export function formatCost(value: number): string {
  return (value / 10000).toLocaleString('zh-CN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}
/** 根据展示精度格式化实际数量或单价。 */
export function formatQuantity(value: number, decimals = 0): string {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
/** 偏差以预算为分母，保留节约与超支的正负方向。 */
export function differenceRate(row: FactoryData): number {
  return row.standard ? (row.actual - row.standard) / row.standard : 0
}
