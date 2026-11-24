/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 独立团队绩效场景，所有指标由演示交付记录计算
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
interface PerformanceWeek {
  planned: number
  delivered: number
  checked: number
  accepted: number
  cycleDays: number
}

export interface PerformanceTeam {
  id: string
  name: string
  note: string
  weeks: PerformanceWeek[]
}
export const PERFORMANCE_TEAMS: PerformanceTeam[] = [
  {
    id: 'product',
    name: '产品与设计',
    note: '需求澄清 · 体验设计',
    weeks: [
      { planned: 12, delivered: 10, checked: 10, accepted: 9, cycleDays: 28 },
      { planned: 13, delivered: 12, checked: 12, accepted: 12, cycleDays: 31 },
      { planned: 12, delivered: 12, checked: 12, accepted: 11, cycleDays: 30 },
      { planned: 14, delivered: 13, checked: 13, accepted: 13, cycleDays: 34 },
      { planned: 14, delivered: 13, checked: 13, accepted: 12, cycleDays: 31 },
      { planned: 15, delivered: 14, checked: 14, accepted: 14, cycleDays: 32 },
    ],
  },
  {
    id: 'frontend',
    name: '前端研发',
    note: '界面实现 · 组件建设',
    weeks: [
      { planned: 18, delivered: 15, checked: 15, accepted: 13, cycleDays: 60 },
      { planned: 18, delivered: 17, checked: 17, accepted: 16, cycleDays: 63 },
      { planned: 20, delivered: 18, checked: 18, accepted: 17, cycleDays: 65 },
      { planned: 20, delivered: 19, checked: 19, accepted: 18, cycleDays: 65 },
      { planned: 21, delivered: 20, checked: 20, accepted: 19, cycleDays: 66 },
      { planned: 22, delivered: 21, checked: 21, accepted: 20, cycleDays: 66 },
    ],
  },
  {
    id: 'backend',
    name: '服务端研发',
    note: '服务能力 · 数据工程',
    weeks: [
      { planned: 16, delivered: 14, checked: 14, accepted: 13, cycleDays: 64 },
      { planned: 17, delivered: 15, checked: 15, accepted: 14, cycleDays: 66 },
      { planned: 17, delivered: 16, checked: 16, accepted: 16, cycleDays: 67 },
      { planned: 18, delivered: 16, checked: 16, accepted: 15, cycleDays: 64 },
      { planned: 18, delivered: 17, checked: 17, accepted: 16, cycleDays: 65 },
      { planned: 19, delivered: 18, checked: 18, accepted: 18, cycleDays: 66 },
    ],
  },
  {
    id: 'quality',
    name: '测试与质量',
    note: '验收保障 · 回归验证',
    weeks: [
      { planned: 15, delivered: 14, checked: 14, accepted: 14, cycleDays: 38 },
      { planned: 16, delivered: 15, checked: 15, accepted: 15, cycleDays: 39 },
      { planned: 17, delivered: 16, checked: 16, accepted: 16, cycleDays: 40 },
      { planned: 17, delivered: 17, checked: 17, accepted: 16, cycleDays: 42 },
      { planned: 18, delivered: 17, checked: 17, accepted: 17, cycleDays: 40 },
      { planned: 19, delivered: 18, checked: 18, accepted: 18, cycleDays: 41 },
    ],
  },
]
export const PERFORMANCE_WEEKS = Array.from({ length: 6 }, (_, index) => ({
  label: `第 ${index + 1} 周`,
  value: index,
}))

/** 团队明细和汇总共用相同的分母与无任务时的展示口径。 */
export const performanceMetrics = ({
  planned,
  delivered,
  checked,
  accepted,
  cycleDays,
}: PerformanceWeek) => ({
  delivery: planned ? (delivered / planned) * 100 : 0,
  quality: checked ? (accepted / checked) * 100 : 0,
  cycle: delivered ? cycleDays / delivered : 0,
})
/** 按实际完成量汇总周期，不对团队百分比做简单平均。 */
export const summarizePerformance = (
  teams: PerformanceTeam[],
  week: number
) => {
  const sums = teams.reduce(
    (sum, team) => {
      const row = team.weeks[week]
      return {
        planned: sum.planned + row.planned,
        delivered: sum.delivered + row.delivered,
        checked: sum.checked + row.checked,
        accepted: sum.accepted + row.accepted,
        cycleDays: sum.cycleDays + row.cycleDays,
      }
    },
    { planned: 0, delivered: 0, checked: 0, accepted: 0, cycleDays: 0 }
  )
  return {
    ...sums,
    ...performanceMetrics(sums),
  }
}
