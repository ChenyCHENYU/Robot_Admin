/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-05
 * @FilePath: \Robot_Admin\src\views\production-sales\shipping\c_report\data.ts
 * @Description: 发运报表的分组维度与重量汇总
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { Shipment } from '../data'

export const REPORT_DIMENSIONS = [
  { key: 'destination', label: '目的地' },
  { key: 'status', label: '任务状态' },
  { key: 'grade', label: '钢种' },
  { key: 'customer', label: '客户' },
] as const

export type ReportDimension = (typeof REPORT_DIMENSIONS)[number]['key']

interface ReportTotals {
  count: number
  departedCount: number
  plannedKg: number
  departedKg: number
}

export interface ShipmentGroup extends ReportTotals {
  key: string
  dimensions: readonly string[]
  tasks: Shipment[]
}

const emptyTotals = (): ReportTotals => ({
  count: 0,
  departedCount: 0,
  plannedKg: 0,
  departedKg: 0,
})

const addShipment = (totals: ReportTotals, shipment: Shipment) => {
  totals.count++
  totals.plannedKg += shipment.weightKg
  if (shipment.status === 'departed') {
    totals.departedCount++
    totals.departedKg += shipment.weightKg
  }
}

/** 在同一轮扫描中生成分组与总计。重量以整数千克累计，吨位仅在展示时换算。 */
export const summarizeShipments = (
  shipments: readonly Shipment[],
  dimensions: readonly ReportDimension[]
) => {
  const totals = emptyTotals()
  const groups = new Map<string, ShipmentGroup>()
  for (const shipment of shipments) {
    const values = dimensions.map(dimension => shipment[dimension])
    const key = JSON.stringify(values)
    let group = groups.get(key)
    if (!group) {
      group = { key, dimensions: values, tasks: [], ...emptyTotals() }
      groups.set(key, group)
    }
    group.tasks.push(shipment)
    addShipment(group, shipment)
    addShipment(totals, shipment)
  }
  return { totals, groups: [...groups.values()] }
}
