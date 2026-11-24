/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\production-actual\useProductionActual.ts
 * @Description: 炉次实绩的录入、对照、成分核对和复核状态
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { FormInstance } from '@robot-admin/naive-ui-components/C_Form'
import { BUSINESS_DIALOG_BUTTONS } from '../shared/actionIcons'
import {
  ACTUAL_SECTIONS,
  HEATS,
  createActualComparison,
  createActualRecord,
  inspectChemistry,
  type ActualModel,
  type ActualSectionKey,
} from './data'
import { HEAT_TRACE_EDGES, heatTraceNodes } from './d_heatTrace'
import {
  comparisonOptions,
  createChemistryOptions,
  entryOptions,
  heatListOptions,
} from './options'
import { REVIEW_FIELDS, useActualReview } from './operations'

/** 多分区表单共用业务模型，跨炉次切换保护未保存内容。 */
export function useProductionActual() {
  const dialog = useDialog()
  const container = useTemplateRef<HTMLElement>('container')
  const savedRecords = shallowReactive(
    HEATS.map((_, index) => createActualRecord(index))
  )
  const activeHeatIndex = ref(0)
  const current = computed(() => HEATS[activeHeatIndex.value])
  const model = ref<ActualModel>({ ...savedRecords[0] })
  const saved = computed(() => savedRecords[activeHeatIndex.value])
  const traceVisible = ref(false)
  const traceRecord = ref('shipment')
  const traceNodes = computed(() => heatTraceNodes(current.value))
  const activeSection = ref<ActualSectionKey>('charge')
  const forms = new Map<ActualSectionKey, FormInstance<ActualModel>>()
  const notice = ref('录入原始实绩并保存；成分偏差会保留并提示复核。')
  const saving = ref(false)
  const dirty = computed(() =>
    ACTUAL_SECTIONS.some(({ fields }) =>
      fields.some(([key]) => model.value[key] !== saved.value[key])
    )
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
  const review = useActualReview({ current, dirty, notice, saving })
  const heatList = computed(() =>
    HEATS.map(heat => ({ ...heat, state: review.stateOf(heat.id, heat.state) }))
  )
  const actualConfig = computed(() => ({
    ...entryOptions.config,
    disabled: review.locked.value,
  }))
  const referenceVisible = ref(false)
  const previous = computed(() => HEATS[activeHeatIndex.value - 1])
  const comparison = computed(() =>
    createActualComparison(model.value, savedRecords[activeHeatIndex.value - 1])
  )
  const comparisonCaption = computed(() =>
    previous.value
      ? `当前录入 / ${previous.value.no} 已保存值 · 只读联动`
      : '当前录入只读联动 · 首炉暂无上一炉快照'
  )
  const setForm = (key: ActualSectionKey, instance: unknown) => {
    if (instance) forms.set(key, instance as FormInstance<ActualModel>)
    else forms.delete(key)
  }
  const navigate = (key: string) => {
    const target = ACTUAL_SECTIONS.find(section => section.key === key)
    if (!target) return
    const comingFromTrace = traceVisible.value
    traceVisible.value = false
    activeSection.value = target.key
    void nextTick(() => {
      const section = container.value?.querySelector<HTMLElement>(
        `[data-section="${target.key}"]`
      )
      if (comingFromTrace) section?.focus({ preventScroll: true })
      section?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }
  const focusChemistryMeasurement = async (field: string) => {
    activeSection.value = 'chemistry'
    await forms.get('chemistry')?.revealField(field)
  }
  const activate = (id: string) => {
    const index = HEATS.findIndex(heat => heat.id === id)
    if (index < 0) return
    activeHeatIndex.value = index
    model.value = { ...saved.value }
    traceRecord.value = 'shipment'
    forms.forEach(form => form.clearValidation())
  }
  const chooseHeat = (id: string) => {
    if (id === current.value.id || saving.value) return
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
    forms.forEach(form => form.clearValidation())
    notice.value = '已恢复当前炉次最近一次保存的记录。'
  }
  const validateRegion = async (key: ActualSectionKey): Promise<boolean> => {
    const form = forms.get(key)
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
        ACTUAL_SECTIONS.map(({ key }) => validateRegion(key))
      )
      const invalid = results.findIndex(result => !result)
      if (invalid >= 0) {
        navigate(ACTUAL_SECTIONS[invalid].key)
        notice.value = '请补齐表单中标记的实绩数据。'
        return
      }
      savedRecords[activeHeatIndex.value] = { ...model.value }
      forms.forEach(form => form.markAsClean())
      const count = chemistryDeviations.value.length
      notice.value = `${current.value.no} 实绩已保存${count ? `，${count} 项成分偏差待复核` : '，成分在内控范围内'}（本地演示）。`
    } finally {
      saving.value = false
    }
  }
  const chemistryOptions = createChemistryOptions(
    () => review.locked.value,
    field => void focusChemistryMeasurement(field)
  )
  return {
    heats: proxyRefs({
      current,
      items: heatList,
      select: chooseHeat,
      ...heatListOptions,
    }),
    entry: proxyRefs({
      model,
      dirty,
      saving,
      notice,
      save,
      restore,
      setForm,
      navigate,
      activeSection,
      ...entryOptions,
      config: actualConfig,
    }),
    chemistry: proxyRefs({
      rows: visibleChemistryRows,
      total: computed(() => chemicalRows.value.length),
      deviations: chemistryDeviations,
      pendingCount: chemistryPendingCount,
      onlyDeviations: onlyChemistryDeviations,
      ...chemistryOptions,
    }),
    comparison: proxyRefs({
      previous,
      caption: comparisonCaption,
      visible: referenceVisible,
      data: comparison,
      ...comparisonOptions,
    }),
    review: proxyRefs({ ...review, fields: REVIEW_FIELDS }),
    trace: proxyRefs({
      visible: traceVisible,
      record: traceRecord,
      nodes: traceNodes,
      edges: HEAT_TRACE_EDGES,
    }),
  }
}
