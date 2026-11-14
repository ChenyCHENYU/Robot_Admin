/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\production-actual\data.ts
 * @Description: 炉次实绩记录、多区域校验与成分上下限核对
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { BUSINESS_DIALOG_BUTTONS } from '../shared/actionIcons'
import type {
  FormOption,
  FormConfig,
  FormInstance,
} from '@robot-admin/naive-ui-components/C_Form'
import type { SectionNavItem } from '@robot-admin/naive-ui-components/C_SectionNav'
import {
  actionsColumn,
  defineVueColumns,
  indexColumn,
  type RowStyleRule,
} from '@agile-team/mach-table-vue'
import { statusTag } from '../shared/presentation'
import { useActualReview } from './operations'

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

export interface ActualComparisonRow {
  readonly id: string
  readonly name: string
  readonly previous: number | null
  readonly current: number | null
}

export interface ActualComparisonGroup {
  readonly key: string
  readonly title: string
  readonly rows: ActualComparisonRow[]
}
export const HEATS = Array.from({ length: 7 }, (_, index) => ({
  id: `HEAT-${index + 1}`,
  no: `L261029${String(101 + index)}`,
  furnace: `${(index % 2) + 1}# 转炉`,
  grade: ['Q355B', 'Q235B', 'HRB400E'][index % 3],
  time: `${8 + index}:35`,
  state: index < 2 ? '待复核' : '已归档',
}))
export type ActualHeat = (typeof HEATS)[number]
type FieldSpec = readonly [keyof ActualModel, string, string]
/** 标签带单位，数值键盘与步进规则交给统一表单渲染器。 */
const numberFields = (
  fields: readonly FieldSpec[]
): FormOption<ActualModel>[] =>
  fields.map(([prop, label, unit]) => ({
    prop,
    label: `${label} (${unit})`,
    type: 'inputNumber',
    // 12 轨道、默认占 4 格：宽屏三列，收窄后按最小宽度自然扩展为两列或一列。
    layout: { grid: { span: 4 } },
    attrs: {
      min: 0,
      precision: ['temperature', 'ladle', 'lance'].includes(prop)
        ? 0
        : ['%', 't', 'MPa'].includes(unit)
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
  }))
export const ACTUAL_GROUPS = [
  {
    key: 'charge',
    title: '原料与产出',
    caption: '物料平衡 · 重量与温度',
    fields: numberFields([
      ['received', '受钢量', 't'],
      ['scrap', '废钢量', 't'],
      ['hotMetal', '铁水量', 't'],
      ['output', '出钢量', 't'],
      ['temperature', '出钢温度', '℃'],
      ['ladle', '钢包号', '号'],
    ]),
  },
  {
    key: 'energy',
    title: '能源介质',
    caption: '能耗与气体 · 实际消耗',
    fields: numberFields([
      ['oxygen', '氧气', 'Nm³'],
      ['argon', '氩气', 'Nm³'],
      ['nitrogen', '氮气', 'Nm³'],
      ['electricity', '总电耗', 'kWh'],
      ['water', '冷却水', 't'],
      ['gas', '煤气', 'Nm³'],
    ]),
  },
  {
    key: 'process',
    title: '炉况参数',
    caption: '过程实绩 · 吹炼与出钢',
    fields: numberFields([
      ['powerOn', '冶炼时长', 'min'],
      ['tapTime', '出钢时长', 'min'],
      ['bottomFlow', '底吹量', 'Nm³/h'],
      ['pressure', '底吹压力', 'MPa'],
      ['lance', '氧枪高度', 'mm'],
      ['slag', '渣量', 't'],
    ]),
  },
  {
    key: 'chemistry',
    title: '成分与判定',
    caption: '成分实测 · 对照内控标准',
    fields: numberFields([
      ['carbon', '碳 C', '%'],
      ['silicon', '硅 Si', '%'],
      ['manganese', '锰 Mn', '%'],
      ['phosphorus', '磷 P', '%'],
      ['sulfur', '硫 S', '%'],
    ]),
  },
] as const
export const ACTUAL_FORM_CONFIG: FormConfig<ActualModel> = {
  density: 'compact',
  layout: 'grid',
  labelPlacement: 'left',
  labelWidth: 128,
  grid: { cols: 12, minItemWidth: 270, xGap: 16 },
  showActions: false,
}

/** 对照表只派生展示值；沿用上一炉已保存的参考快照，不建立第二份可编辑状态。 */
export function createActualComparisonGroups(
  model: Readonly<ActualModel>,
  references: readonly ActualComparisonRow[]
): ActualComparisonGroup[] {
  const previousByField = new Map(references.map(row => [row.id, row.previous]))
  return ACTUAL_GROUPS.filter(group => group.key !== 'chemistry').map(
    group => ({
      key: group.key,
      title: group.title,
      rows: group.fields.map(field => ({
        id: String(field.prop),
        name: String(field.label),
        current: model[field.prop as keyof ActualModel],
        previous: previousByField.get(String(field.prop)) ?? null,
      })),
    })
  )
}

/** 三张小表共用业务列；表头、密度和布局由内置 detail 场景提供。 */
export const ACTUAL_COMPARISON_COLUMNS = defineVueColumns<ActualComparisonRow>([
  { field: 'name', headerName: '实绩项目', minWidth: 88 },
  {
    field: 'current',
    headerName: '当前值',
    width: 88,
    minWidth: 64,
    valueFormatter: ({ value }) => (value === null ? '—' : String(value)),
  },
  {
    field: 'previous',
    headerName: '上炉值',
    width: 88,
    minWidth: 64,
    valueFormatter: ({ value }) => (value === null ? '—' : String(value)),
  },
])
const CHEMICAL_LIMITS = [
  { key: 'carbon', name: '碳 C', min: 0.12, max: 0.22 },
  { key: 'silicon', name: '硅 Si', min: 0.15, max: 0.4 },
  { key: 'manganese', name: '锰 Mn', min: 0.7, max: 1.3 },
  { key: 'phosphorus', name: '磷 P', min: 0, max: 0.035 },
  { key: 'sulfur', name: '硫 S', min: 0, max: 0.03 },
] as const
/** 炉次初始化独立快照，零值和空值保留原有语义。 */
export function createActualRecord(index = 0): ActualModel {
  return { ...DEFAULT_ACTUAL, output: DEFAULT_ACTUAL.output + index * 0.25 }
}
/** 是否偏离标准与测量是否合法分开，偏离标准的真实测量仍可以保存。 */
export function inspectChemistry(model: ActualModel) {
  return CHEMICAL_LIMITS.map(limit => {
    const value = model[limit.key]
    return {
      id: limit.key,
      name: limit.name,
      unit: '%',
      min: limit.min,
      max: limit.max,
      value,
      failed: value !== null && (value < limit.min || value > limit.max),
    }
  })
}
/** 多分区表单共用业务模型，跨炉次切换保护未保存内容。 */
export function useProductionActual() {
  const dialog = useDialog()
  const container = ref<HTMLElement | null>(null)
  const savedRecords = new Map(
    HEATS.map((heat, index) => [heat.id, createActualRecord(index)])
  )
  const currentId = ref(HEATS[0].id)
  const model = ref<ActualModel>(createActualRecord())
  const saved = ref<ActualModel>({ ...model.value })
  const traceVisible = ref(false)
  const activeSection = ref('charge')
  const forms: Array<FormInstance<ActualModel> | null> = []
  const notice = ref('录入原始实绩并保存；成分偏差会保留并提示复核。')
  const saving = ref(false)
  const current = computed(
    () => HEATS.find(heat => heat.id === currentId.value) ?? HEATS[0]
  )
  const dirty = computed(
    () => JSON.stringify(model.value) !== JSON.stringify(saved.value)
  )
  const chemicalRows = computed(() => inspectChemistry(model.value))
  const onlyChemistryDeviations = ref(false)
  const chemistryDeviations = computed(() =>
    chemicalRows.value.filter(row => row.failed)
  )
  const chemistryPendingCount = computed(
    () => chemicalRows.value.filter(row => row.value === null).length
  )
  const visibleChemistryRows = computed(() =>
    onlyChemistryDeviations.value
      ? chemistryDeviations.value
      : chemicalRows.value
  )
  const chemistryLocale = {
    emptyRows: '当前炉次无超限实测项',
    emptyRowsHint: '可切回全部项目，继续核对实测值与待检测项',
  }
  const review = useActualReview({ current, dirty, notice, saving })
  const heatList = computed(() =>
    HEATS.map(heat => ({ ...heat, state: review.stateOf(heat.id, heat.state) }))
  )
  const actualConfig = computed(() => ({
    ...ACTUAL_FORM_CONFIG,
    disabled: review.locked.value,
  }))
  const referenceVisible = ref(false)
  const previous = computed(
    () => HEATS[HEATS.findIndex(heat => heat.id === currentId.value) - 1]
  )
  const referenceRows = computed<ActualComparisonRow[]>(() => {
    const prior = previous.value && savedRecords.get(previous.value.id)
    return prior
      ? ACTUAL_GROUPS.flatMap(group =>
          group.fields.map(field => ({
            id: String(field.prop),
            name: String(field.label),
            previous: prior[field.prop as keyof ActualModel],
            current: model.value[field.prop as keyof ActualModel],
          }))
        )
      : []
  })
  const comparisonGroups = computed(() =>
    createActualComparisonGroups(model.value, referenceRows.value)
  )
  const comparisonCaption = computed(() =>
    previous.value
      ? `当前录入 / ${previous.value.no} 已保存值 · 只读联动`
      : '当前录入只读联动 · 首炉暂无上一炉快照'
  )
  const referenceColumns = defineVueColumns<
    (typeof referenceRows.value)[number]
  >([
    indexColumn({ headerName: '序号', width: 46 }),
    { field: 'name', headerName: '实绩项目', minWidth: 160 },
    {
      field: 'previous',
      headerName: '上一炉已保存值',
      width: 160,
    },
    { field: 'current', headerName: '当前炉次值', width: 150 },
  ])
  const sections: SectionNavItem[] = ACTUAL_GROUPS.map(group => ({
    key: group.key,
    label: group.title,
  }))
  const setForm = (index: number, instance: unknown) => {
    forms[index] = instance as FormInstance<ActualModel> | null
  }
  const navigate = (key: string) => {
    if (!ACTUAL_GROUPS.some(group => group.key === key)) return
    const comingFromTrace = traceVisible.value
    traceVisible.value = false
    activeSection.value = key
    void nextTick(() => {
      const section = container.value?.querySelector<HTMLElement>(
        `[data-section="${key}"]`
      )
      if (comingFromTrace) section?.focus({ preventScroll: true })
      section?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }
  const chemistryIndex = ACTUAL_GROUPS.findIndex(
    group => group.key === 'chemistry'
  )
  const focusChemistryMeasurement = async (field: string) => {
    activeSection.value = 'chemistry'
    await forms[chemistryIndex]?.revealField(field)
  }
  const activate = (id: string) => {
    const index = HEATS.findIndex(heat => heat.id === id)
    if (index < 0) return
    currentId.value = id
    model.value = { ...(savedRecords.get(id) ?? createActualRecord(index)) }
    saved.value = { ...model.value }
    forms.forEach(form => form?.clearValidation())
  }
  const chooseHeat = (id: string) => {
    if (id === currentId.value || saving.value) return
    if (!dirty.value) {
      activate(id)
      return
    }
    dialog.warning({
      ...BUSINESS_DIALOG_BUTTONS,
      title: '当前炉次有未保存实绩',
      content: '切换后将放弃当前未保存修改。',
      positiveText: '放弃并切换',
      negativeText: '保留当前炉次',
      onPositiveClick: () => activate(id),
    })
  }
  const restore = () => {
    if (review.locked.value || saving.value) return
    model.value = { ...saved.value }
    forms.forEach(form => form?.clearValidation())
    notice.value = '已恢复当前炉次最近一次保存的记录。'
  }
  const validateRegion = async (index: number): Promise<boolean> => {
    const form = forms[index]
    if (!form) return false
    try {
      await form.validate()
      return true
    } catch {
      return false
    }
  }
  const save = async () => {
    if (saving.value || review.locked.value) return
    saving.value = true
    try {
      const results = await Promise.all(
        ACTUAL_GROUPS.map((_, index) => validateRegion(index))
      )
      const invalid = results.findIndex(result => !result)
      if (invalid >= 0) {
        navigate(ACTUAL_GROUPS[invalid].key)
        notice.value = '请补齐表单中标记的实绩数据。'
        return
      }
      saved.value = { ...model.value }
      savedRecords.set(currentId.value, { ...model.value })
      forms.forEach(form => form?.markAsClean())
      const count = chemicalRows.value.filter(row => row.failed).length
      notice.value = `${current.value.no} 实绩已保存${count ? `，${count} 项成分偏差待复核` : '，成分在内控范围内'}（本地演示）。`
    } finally {
      saving.value = false
    }
  }
  const chemicalColumns = defineVueColumns<(typeof chemicalRows.value)[number]>(
    [
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
      actionsColumn<(typeof chemicalRows.value)[number]>({
        width: 66,
        actions: [
          {
            icon: 'edit',
            label: '定位实测录入',
            disabled: () => review.locked.value,
            onClick: ({ data }) =>
              data && void focusChemistryMeasurement(data.id),
          },
        ],
      }),
    ]
  )
  const chemicalStyles: readonly RowStyleRule<
    (typeof chemicalRows.value)[number]
  >[] = [{ when: ({ data }) => data.failed, tone: 'danger' }]
  return {
    ...review,
    heatList,
    actualConfig,
    traceVisible,
    referenceVisible,
    referenceRows,
    comparisonGroups,
    comparisonCaption,
    referenceColumns,
    previous,
    container,
    model,
    current,
    currentId,
    dirty,
    activeSection,
    sections,
    chemicalRows,
    onlyChemistryDeviations,
    chemistryDeviations,
    chemistryPendingCount,
    visibleChemistryRows,
    chemistryLocale,
    chemicalColumns,
    chemicalStyles,
    saving,
    notice,
    setForm,
    navigate,
    chooseHeat,
    save,
    restore,
  }
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
  const blowDelay = heat.id === HEATS[0].id ? 3 : 0
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
