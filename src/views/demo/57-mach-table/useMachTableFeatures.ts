/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\57-mach-table\\useMachTableFeatures.ts
 * @Description: 配置抽屉的预设、即时应用与配置复制
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import type { GridApi } from '@agile-team/mach-table-vue'
import { defineActions } from '@robot-admin/naive-ui-components/C_ActionBar'
import type { OrderRow } from './data'
import {
  DEFAULT_MACH_FEATURE_SETTINGS,
  MACH_FEATURE_PRESET_OPTIONS,
  MACH_FEATURE_PRESETS,
  toMachFeatureOptions,
  type MachFeaturePreset,
  type MachFeatureSettings,
} from './features'

/** 每次网格挂载和表单变动时应用同一份配置，手动顺序场景保留自己的选择及分页约束。 */
export function useMachTableFeatures(
  api: Readonly<Ref<GridApi<OrderRow> | null>>,
  ready: Readonly<Ref<boolean>>,
  manualOrder: Readonly<Ref<boolean>>
) {
  const message = useMessage()
  const open = ref(false)
  const settings = ref({ ...DEFAULT_MACH_FEATURE_SETTINGS })
  const settingKeys = Object.keys(
    DEFAULT_MACH_FEATURE_SETTINGS
  ) as (keyof MachFeatureSettings)[]
  const preset = computed(
    () =>
      MACH_FEATURE_PRESET_OPTIONS.find(option =>
        settingKeys.every(key => settings.value[key] === option.settings[key])
      )?.value
  )
  const presetLabel = computed(() =>
    preset.value
      ? `当前：${MACH_FEATURE_PRESETS[preset.value].label}`
      : '当前：自定义配置'
  )
  const options = computed(() => toMachFeatureOptions(settings.value))

  const applyPreset = (value: MachFeaturePreset) => {
    const selected = MACH_FEATURE_PRESETS[value]
    settings.value = { ...selected.settings }
    message.success(`已应用“${selected.label}”配置`)
  }

  const sync = () => {
    api.value?.batch(grid => {
      grid.updateOptions(
        manualOrder.value
          ? { ...options.value, pagination: false, rowSelection: 'multiple' }
          : options.value
      )
      if (!manualOrder.value && settings.value.rowSelection === 'none') {
        grid.selection.clear()
      }
    })
  }
  watch(options, sync, { flush: 'post' })
  watch(ready, isReady => {
    if (isReady) sync()
  })

  const openActions = defineActions([
    {
      key: 'settings',
      onClick: () => {
        open.value = true
      },
    },
  ])
  const panelActions = defineActions([
    {
      key: 'reset',
      label: '恢复推荐配置',
      onClick: () => {
        settings.value = { ...DEFAULT_MACH_FEATURE_SETTINGS }
        message.success('已恢复企业列表推荐配置')
      },
    },
    {
      key: 'copy-config',
      label: '复制当前配置',
      icon: 'mdi:content-copy',
      type: 'primary',
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(
            JSON.stringify(options.value, null, 2)
          )
          message.success('当前最小配置已复制')
        } catch {
          message.warning('浏览器未授权剪贴板，请手动复制')
        }
      },
    },
  ])

  return proxyRefs({
    open,
    settings,
    preset,
    presetLabel,
    applyPreset,
    openActions,
    panelActions,
  })
}
