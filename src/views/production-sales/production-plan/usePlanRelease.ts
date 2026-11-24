/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\production-plan\usePlanRelease.ts
 * @Description: 待下达计划筛选与确认时状态校验
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { actionIcons, BUSINESS_DIALOG_BUTTONS } from '../shared/actionIcons'
import { releaseProductionPlans, type ProductionPlan } from './data'

interface PlanReleaseOptions {
  rows: Ref<ProductionPlan[]>
  selectedIds: Ref<string[]>
  notice: Ref<string>
}

/** 批量下达只触及确认时仍然可下达的原目标。 */
export function usePlanRelease({
  rows,
  selectedIds,
  notice,
}: PlanReleaseOptions) {
  const dialog = useDialog()
  const targets = computed(() =>
    rows.value
      .filter(
        row => row.status === 'draft' && selectedIds.value.includes(row.id)
      )
      .map(row => row.id)
  )
  const readyCount = computed(() => targets.value.length)
  let pending: ReturnType<typeof dialog.info> | undefined
  const close = () => {
    const previous = pending
    pending = undefined
    previous?.destroy()
  }
  onDeactivated(close)
  onScopeDispose(close)

  const confirm = () => {
    const ids = new Set(targets.value)
    if (!ids.size) {
      notice.value = '请先勾选待下达计划，已下达及执行中的计划不会重复处理。'
      return
    }
    close()
    const dismiss = () => {
      if (pending === current) pending = undefined
    }
    const current = dialog.info({
      ...BUSINESS_DIALOG_BUTTONS,
      positiveButtonProps: { renderIcon: actionIcons.sendOutline },
      title: '下达生产计划',
      content: `确认下达 ${ids.size} 项待下达计划？下达后锁定编制与顺序，执行前可撤销。`,
      positiveText: '确认下达',
      negativeText: '取消',
      onPositiveClick: () => {
        if (pending !== current) return
        dismiss()
        const next = releaseProductionPlans(rows.value, ids)
        const count = next.reduce(
          (total, row, index) => total + Number(row !== rows.value[index]),
          0
        )
        if (count) rows.value = next
        notice.value = count
          ? `已下达 ${count} 项计划，炉次与产线安排保持不变（本地演示）。`
          : '所选计划已不再待下达，未修改台账。'
      },
      onClose: dismiss,
      onNegativeClick: dismiss,
      onMaskClick: dismiss,
      onEsc: dismiss,
      onAfterLeave: dismiss,
    })
    pending = current
  }
  return proxyRefs({ readyCount, confirm })
}
