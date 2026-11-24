/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\production-actual\data.ts
 * @Description: 炉次样例、实绩测量定义及纯计算
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

const DEFAULT_ACTUAL = {
  received: 122.8,
  scrap: 18.5,
  hotMetal: 104.3,
  output: 119.42,
  temperature: 1625,
  ladle: 73,
  oxygen: 5600,
  argon: 86.5,
  nitrogen: 24.8,
  electricity: 1860,
  water: 42.6,
  gas: 156,
  powerOn: 38,
  tapTime: 6.5,
  bottomFlow: 42,
  pressure: 0.82,
  lance: 1250,
  slag: 4.25,
  carbon: 0.18,
  silicon: 0.25,
  manganese: 0.92,
  phosphorus: 0.018,
  sulfur: 0.015,
}
export type ActualModel = { [K in keyof typeof DEFAULT_ACTUAL]: number | null }

type ActualFieldKey = keyof ActualModel
export type Measurement = readonly [
  key: ActualFieldKey,
  label: string,
  unit: string,
  limits?: readonly [min: number, max: number],
]
interface ActualSection {
  key: string
  title: string
  caption: string
  fields: readonly Measurement[]
}

const CHEMISTRY_FIELDS = [
  ['carbon', '碳 C', '%', [0.12, 0.22]],
  ['silicon', '硅 Si', '%', [0.15, 0.4]],
  ['manganese', '锰 Mn', '%', [0.7, 1.3]],
  ['phosphorus', '磷 P', '%', [0, 0.035]],
  ['sulfur', '硫 S', '%', [0, 0.03]],
] as const satisfies readonly Measurement[]

export const ACTUAL_SECTIONS = [
  {
    key: 'charge',
    title: '原料与产出',
    caption: '物料平衡 · 重量与温度',
    fields: [
      ['received', '受钢量', 't'],
      ['scrap', '废钢量', 't'],
      ['hotMetal', '铁水量', 't'],
      ['output', '出钢量', 't'],
      ['temperature', '出钢温度', '℃'],
      ['ladle', '钢包号', '号'],
    ],
  },
  {
    key: 'energy',
    title: '能源介质',
    caption: '能耗与气体 · 实际消耗',
    fields: [
      ['oxygen', '氧气', 'Nm³'],
      ['argon', '氩气', 'Nm³'],
      ['nitrogen', '氮气', 'Nm³'],
      ['electricity', '总电耗', 'kWh'],
      ['water', '冷却水', 't'],
      ['gas', '煤气', 'Nm³'],
    ],
  },
  {
    key: 'process',
    title: '炉况参数',
    caption: '过程实绩 · 吹炼与出钢',
    fields: [
      ['powerOn', '冶炼时长', 'min'],
      ['tapTime', '出钢时长', 'min'],
      ['bottomFlow', '底吹量', 'Nm³/h'],
      ['pressure', '底吹压力', 'MPa'],
      ['lance', '氧枪高度', 'mm'],
      ['slag', '渣量', 't'],
    ],
  },
  {
    key: 'chemistry',
    title: '成分与判定',
    caption: '成分实测 · 对照内控标准',
    fields: CHEMISTRY_FIELDS,
  },
] as const satisfies readonly ActualSection[]
export type ActualSectionKey = (typeof ACTUAL_SECTIONS)[number]['key']

export const HEATS = Array.from({ length: 7 }, (_, index) => ({
  id: `HEAT-${index + 1}`,
  no: `L261029${101 + index}`,
  furnace: `${(index % 2) + 1}# 转炉`,
  grade: ['Q355B', 'Q235B', 'HRB400E'][index % 3],
  time: `${8 + index}:35`,
  state: index < 2 ? '待复核' : '已归档',
  blowDelayMinutes: index === 0 ? 3 : 0,
}))
export type ActualHeat = (typeof HEATS)[number]

/** 炉次初始化独立快照，零值和空值保留原有语义。 */
export function createActualRecord(index = 0): ActualModel {
  return { ...DEFAULT_ACTUAL, output: DEFAULT_ACTUAL.output + index * 0.25 }
}
/** 是否偏离标准与测量是否合法分开，偏离标准的真实测量仍可以保存。 */
export function inspectChemistry(model: ActualModel) {
  return CHEMISTRY_FIELDS.map(([id, name, unit, [min, max]]) => {
    const value = model[id]
    return {
      id,
      name,
      unit,
      min,
      max,
      value,
      failed: value !== null && (value < min || value > max),
    }
  })
}

export type ChemistryRow = ReturnType<typeof inspectChemistry>[number]

export interface ActualComparisonRow {
  readonly id: keyof ActualModel
  readonly name: string
  readonly previous: number | null
  readonly current: number | null
}

/** 录入和对照采用相同的测量标签。 */
export const measurementLabel = (label: string, unit: string) =>
  `${label} (${unit})`

/** 当前实绩和上一炉快照直接生成同一份对照数据，分组表与参考弹窗共用行。 */
export function createActualComparison(
  current: Readonly<ActualModel>,
  previous?: Readonly<ActualModel>
) {
  const groups = ACTUAL_SECTIONS.map(group => ({
    key: group.key,
    title: group.title,
    rows: group.fields.map<ActualComparisonRow>(([key, label, unit]) => ({
      id: key,
      name: measurementLabel(label, unit),
      current: current[key],
      previous: previous?.[key] ?? null,
    })),
  }))
  return {
    groups: groups.filter(group => group.key !== 'chemistry'),
    rows: previous ? groups.flatMap(group => group.rows) : [],
  }
}
