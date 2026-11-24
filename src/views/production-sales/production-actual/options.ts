/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\production-actual\options.ts
 * @Description: 实绩页的录入表单、炉次列表和表格显示配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  actionsColumn,
  defineVueColumns,
  indexColumn,
  type RowStyleRule,
} from '@agile-team/mach-table-vue'
import type {
  FormOption,
  FormConfig,
} from '@robot-admin/naive-ui-components/C_Form'
import type { RecordListStatusType } from '@robot-admin/naive-ui-components/C_RecordList'
import type { SectionNavItem } from '@robot-admin/naive-ui-components/C_SectionNav'
import { statusTag } from '../shared/presentation'
import {
  ACTUAL_SECTIONS,
  measurementLabel,
  type ActualComparisonRow,
  type ActualHeat,
  type ActualModel,
  type ChemistryRow,
  type Measurement,
} from './data'

const wholeNumberFields = new Set(['temperature', 'ladle', 'lance'])
const threeDecimalUnits = new Set(['%', 't', 'MPa'])

/** 同一份测量定义直接适配 C_Form。 */
function measurementInput(field: Measurement): FormOption<ActualModel> {
  const [prop, label, unit] = field
  return {
    prop,
    label: measurementLabel(label, unit),
    type: 'inputNumber',
    layout: { grid: { span: 4 } },
    attrs: {
      min: 0,
      precision: wholeNumberFields.has(prop)
        ? 0
        : threeDecimalUnits.has(unit)
          ? 3
          : 2,
      showButton: false,
    },
    rules: [
      {
        type: 'number',
        required: true,
        min: 0,
        message: `请填写非负的${label}`,
      },
    ],
  }
}

const entryGroups = ACTUAL_SECTIONS.map(({ fields, ...section }) => ({
  ...section,
  fields: fields.map(measurementInput),
}))

const sectionNavItems: SectionNavItem[] = ACTUAL_SECTIONS.map(
  ({ key, title }) => ({ key, label: title })
)

const entryFormConfig: FormConfig<ActualModel> = {
  density: 'compact',
  layout: 'grid',
  labelPlacement: 'left',
  labelWidth: 128,
  grid: { cols: 12, minItemWidth: 270, xGap: 16 },
  showActions: false,
}

export const entryOptions = {
  groups: entryGroups,
  sections: sectionNavItems,
  config: entryFormConfig,
}

const HEAT_STATUS_TONES = new Map<string, RecordListStatusType>([
  ['待复核', 'warning'],
  ['退回补录', 'error'],
  ['已复核', 'success'],
  ['已归档', 'success'],
])
const describeHeat = (heat: ActualHeat) => ({
  title: heat.no,
  description: `${heat.time} · ${heat.furnace} · ${heat.grade}`,
  status: {
    label: heat.state,
    type: HEAT_STATUS_TONES.get(heat.state) ?? 'default',
  },
})

export const heatListOptions = {
  key: (heat: ActualHeat) => heat.id,
  describe: describeHeat,
}

const comparisonNumber = ({ value }: { value: unknown }) =>
  value === null ? '—' : String(value)

/** 三张小表共用业务列；表头、密度和布局由内置 detail 场景提供。 */
const summaryColumns = defineVueColumns<ActualComparisonRow>([
  { field: 'name', headerName: '实绩项目', minWidth: 88 },
  {
    field: 'current',
    headerName: '当前值',
    width: 88,
    minWidth: 64,
    valueFormatter: comparisonNumber,
  },
  {
    field: 'previous',
    headerName: '上炉值',
    width: 88,
    minWidth: 64,
    valueFormatter: comparisonNumber,
  },
])

const referenceColumns = defineVueColumns<ActualComparisonRow>([
  indexColumn({ headerName: '序号', width: 46 }),
  { field: 'name', headerName: '实绩项目', minWidth: 160 },
  { field: 'previous', headerName: '上一炉已保存值', width: 160 },
  { field: 'current', headerName: '当前炉次值', width: 150 },
])

export const comparisonOptions = {
  summaryColumns,
  columns: referenceColumns,
}

const chemistryRowStyles: readonly RowStyleRule<ChemistryRow>[] = [
  { when: ({ data }) => data.failed, tone: 'danger' },
]
const chemistryLocale = {
  emptyRows: '当前炉次无超限实测项',
  emptyRowsHint: '可切回全部项目，继续核对实测值与待检测项',
}

/** 注入锁定状态和定位操作，列配置不读取页面状态。 */
export function createChemistryOptions(
  isLocked: () => boolean,
  locate: (field: ChemistryRow['id']) => void
) {
  const columns = defineVueColumns<ChemistryRow>([
    indexColumn({ headerName: '序号', width: 46 }),
    { field: 'name', headerName: '检测项目' },
    { field: 'unit', headerName: '单位', width: 80 },
    { field: 'min', headerName: '内控下限', width: 130 },
    { field: 'max', headerName: '内控上限', width: 130 },
    {
      field: 'value',
      headerName: '实测值',
      width: 130,
      valueFormatter: ({ value }) =>
        value === null ? '—' : Number(value).toFixed(3),
    },
    {
      colId: 'result',
      headerName: '核对结果',
      width: 130,
      render: row =>
        row.value === null
          ? statusTag('待检测', 'default')
          : statusTag(
              row.failed ? '偏差待复核' : '范围内',
              row.failed ? 'error' : 'success'
            ),
    },
    actionsColumn<ChemistryRow>({
      width: 66,
      actions: [
        {
          icon: 'edit',
          label: '定位实测录入',
          disabled: isLocked,
          onClick: ({ data }) => data && locate(data.id),
        },
      ],
    }),
  ])
  return { columns, rowStyles: chemistryRowStyles, locale: chemistryLocale }
}
