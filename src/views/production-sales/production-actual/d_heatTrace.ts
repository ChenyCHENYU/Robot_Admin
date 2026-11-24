/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\production-actual\d_heatTrace.ts
 * @Description: 炉次上下游关系与工序时间轴
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { ActualHeat } from './data'

export const HEAT_TRACE_EDGES = [
  { key: 'sampling', from: 'heat', to: 'sample', label: '取样' },
  { key: 'release', from: 'sample', to: 'batch', label: '质检放行' },
  { key: 'dispatch', from: 'batch', to: 'shipment', label: '装车出库' },
]
/** 关联记录独立于实绩保存，由同一炉次编号生成可复核的本地样本。 */
export function heatTraceNodes(heat: ActualHeat) {
  const suffix = heat.no.slice(-3)
  return [
    {
      key: 'heat',
      label: heat.no,
      type: '炉次',
      subtitle: `${heat.furnace} · ${heat.grade}`,
    },
    {
      key: 'sample',
      label: `QC-${suffix}`,
      type: '质检试样',
      subtitle: '出钢成分检测',
    },
    {
      key: 'batch',
      label: `LOT-${suffix}`,
      type: '库存批次',
      subtitle: '已关联质检样本',
    },
    {
      key: 'shipment',
      label: `DN-261029-${suffix}`,
      type: '发运记录',
      subtitle: '装车出库记录',
    },
  ]
}

const TAP_START = 25
const TAP_DURATION = 7
const PROCESS_STEPS = [
  {
    key: 'charge',
    title: '加料与兑铁',
    start: 0,
    duration: 7,
    team: '加料班',
    section: 'charge',
    note: '原料与铁水已校核，确认后转入吹炼。',
  },
  {
    key: 'blow',
    title: '吹炼',
    start: 7,
    duration: 18,
    team: '炼钢班',
    section: 'process',
    note: '顶底复吹完成，底吹流量与压力已记录。',
  },
  {
    key: 'tap',
    title: '出钢',
    start: TAP_START,
    duration: TAP_DURATION,
    team: '出钢班',
    section: 'charge',
    note: '出钢完成，记录钢包号、重量和温度。',
  },
  {
    key: 'chemistry',
    title: '成分核对',
    start: 37,
    duration: 5,
    team: '质检班',
    section: 'chemistry',
    note: '送检样本已登记，结果录入成分与判定分区。',
  },
] as const

const TRACE_WINDOW = 48

/** 轨迹跨过零点时继续使用车间的 24 小时读法。 */
function formatProcessTime(minutes: number): string {
  const minutesPerDay = 24 * 60
  const timeInDay = (minutes + minutesPerDay) % minutesPerDay
  const hour = String(Math.floor(timeInDay / 60)).padStart(2, '0')
  const minute = String(timeInDay % 60).padStart(2, '0')
  return `${hour}:${minute}`
}

/** 本地示例按炉次排时。过程异常独立于当前实绩草稿和化验偏差。 */
export function createActualProcessTrace(heat: ActualHeat) {
  const [hour, minute] = heat.time.split(':').map(Number)
  const { blowDelayMinutes: blowDelay } = heat
  // 侧栏炉次时间是出钢时间。按工序记录倒推起点，异常顺延后续工序。
  const origin = hour * 60 + minute - TAP_START - TAP_DURATION - blowDelay
  const ticks = [0, 12, 24, 36, TRACE_WINDOW].map(offset =>
    formatProcessTime(origin + offset)
  )
  const steps = PROCESS_STEPS.map(step => {
    const delay = step.key === 'blow' ? blowDelay : 0
    const start = step.start + (step.start >= TAP_START ? blowDelay : 0)
    const duration = step.duration + delay
    return {
      ...step,
      duration,
      startTime: formatProcessTime(origin + start),
      endTime: formatProcessTime(origin + start + duration),
      left: `${(start / TRACE_WINDOW) * 100}%`,
      width: `${(duration / TRACE_WINDOW) * 100}%`,
      equipment: step.key === 'chemistry' ? '炉前化验站' : heat.furnace,
      exception: delay
        ? `底吹压力短时波动，吹炼延长 ${delay} 分钟。参数恢复后转入下一工序。`
        : null,
    }
  })
  return { ticks, steps }
}
