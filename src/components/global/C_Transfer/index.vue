<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\components\global\C_Transfer\index.vue
 * @Description: 穿梭框组件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div
    class="c-transfer"
    :class="[`is-${mergedProps.size}`]"
  >
    <!-- ================ Source Panel ================ -->
    <div class="c-transfer__panel">
      <div class="c-transfer__header">
        <NCheckbox
          v-if="mergedProps.showSelectAll"
          :checked="isSourceAllChecked"
          :indeterminate="isSourceIndeterminate"
          @update:checked="toggleSourceAll"
        >
          {{ mergedProps.titles?.[0] }}
        </NCheckbox>
        <span
          v-else
          class="c-transfer__title"
        >
          {{ mergedProps.titles?.[0] }}
        </span>
        <span class="c-transfer__count"
          >{{ sourceChecked.size }} / {{ sourceList.length }}</span
        >
      </div>

      <div
        v-if="mergedProps.filterable"
        class="c-transfer__filter"
      >
        <NInput
          v-model:value="sourceQuery"
          clearable
          size="small"
          :placeholder="mergedProps.filterPlaceholder"
        >
          <template #prefix>
            <C_Icon name="mdi:magnify" />
          </template>
        </NInput>
      </div>

      <div
        v-if="filteredSourceList.length"
        class="c-transfer__list"
      >
        <template
          v-for="item in filteredSourceList"
          :key="item.key"
        >
          <div
            class="c-transfer__item"
            :class="{
              'is-disabled': item.disabled,
              'is-checked': sourceChecked.has(item.key),
            }"
            @click="!item.disabled && toggleSourceCheck(item.key)"
          >
            <NCheckbox
              :checked="sourceChecked.has(item.key)"
              :disabled="item.disabled"
              size="small"
              @update:checked="toggleSourceCheck(item.key)"
              @click.stop
            />
            <C_Icon
              v-if="item.icon"
              :name="item.icon"
              class="c-transfer__item-icon"
            />
            <span class="c-transfer__item-label">{{ item.label }}</span>
          </div>
        </template>
      </div>
      <div
        v-else
        class="c-transfer__empty"
      >
        {{ mergedProps.sourceEmptyText }}
      </div>
    </div>

    <!-- ================ Actions ================ -->
    <div class="c-transfer__actions">
      <button
        class="c-transfer__btn"
        :class="{ 'is-disabled': sourceChecked.size === 0 }"
        :disabled="sourceChecked.size === 0"
        @click="moveToTarget"
      >
        <C_Icon name="mdi:chevron-right" />
      </button>
      <button
        class="c-transfer__btn"
        :class="{ 'is-disabled': targetChecked.size === 0 }"
        :disabled="targetChecked.size === 0"
        @click="moveToSource"
      >
        <C_Icon name="mdi:chevron-left" />
      </button>
    </div>

    <!-- ================ Target Panel ================ -->
    <div class="c-transfer__panel">
      <div class="c-transfer__header">
        <NCheckbox
          v-if="mergedProps.showSelectAll"
          :checked="isTargetAllChecked"
          :indeterminate="isTargetIndeterminate"
          @update:checked="toggleTargetAll"
        >
          {{ mergedProps.titles?.[1] }}
        </NCheckbox>
        <span
          v-else
          class="c-transfer__title"
        >
          {{ mergedProps.titles?.[1] }}
        </span>
        <span class="c-transfer__count"
          >{{ targetChecked.size }} / {{ targetList.length }}</span
        >
      </div>

      <div
        v-if="mergedProps.filterable"
        class="c-transfer__filter"
      >
        <NInput
          v-model:value="targetQuery"
          clearable
          size="small"
          :placeholder="mergedProps.filterPlaceholder"
        >
          <template #prefix>
            <C_Icon name="mdi:magnify" />
          </template>
        </NInput>
      </div>

      <div
        v-if="filteredTargetList.length"
        class="c-transfer__list"
      >
        <template
          v-for="item in filteredTargetList"
          :key="item.key"
        >
          <div
            class="c-transfer__item"
            :class="{
              'is-disabled': item.disabled,
              'is-checked': targetChecked.has(item.key),
            }"
            @click="!item.disabled && toggleTargetCheck(item.key)"
          >
            <NCheckbox
              :checked="targetChecked.has(item.key)"
              :disabled="item.disabled"
              size="small"
              @update:checked="toggleTargetCheck(item.key)"
              @click.stop
            />
            <C_Icon
              v-if="item.icon"
              :name="item.icon"
              class="c-transfer__item-icon"
            />
            <span class="c-transfer__item-label">{{ item.label }}</span>
          </div>
        </template>
      </div>
      <div
        v-else
        class="c-transfer__empty"
      >
        {{ mergedProps.targetEmptyText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import {
    DEFAULT_TRANSFER_PROPS,
    type TransferItem,
    type TransferProps,
  } from './types'
  import './index.scss'

  const props = withDefaults(
    defineProps<{
      data: TransferProps['data']
      modelValue: TransferProps['modelValue']
      titles?: TransferProps['titles']
      filterable?: boolean
      filterPlaceholder?: string
      filterMethod?: TransferProps['filterMethod']
      showSelectAll?: boolean
      sortable?: boolean
      sourceEmptyText?: string
      targetEmptyText?: string
      size?: TransferProps['size']
    }>(),
    {
      titles: () => DEFAULT_TRANSFER_PROPS.titles as [string, string],
      filterable: DEFAULT_TRANSFER_PROPS.filterable,
      filterPlaceholder: DEFAULT_TRANSFER_PROPS.filterPlaceholder,
      showSelectAll: DEFAULT_TRANSFER_PROPS.showSelectAll,
      sortable: DEFAULT_TRANSFER_PROPS.sortable,
      sourceEmptyText: DEFAULT_TRANSFER_PROPS.sourceEmptyText,
      targetEmptyText: DEFAULT_TRANSFER_PROPS.targetEmptyText,
      size: DEFAULT_TRANSFER_PROPS.size,
    }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: Array<string | number>]
    change: [
      targetKeys: Array<string | number>,
      direction: 'left' | 'right',
      moveKeys: Array<string | number>,
    ]
  }>()

  const mergedProps = computed(() => ({ ...DEFAULT_TRANSFER_PROPS, ...props }))

  // ==================== 数据列表 ====================

  const dataMap = computed(() => {
    const m = new Map<string | number, TransferItem>()
    for (const item of props.data) m.set(item.key, item)
    return m
  })

  const targetKeySet = computed(() => new Set(props.modelValue))

  const sourceList = computed(() =>
    props.data.filter(d => !targetKeySet.value.has(d.key))
  )

  const targetList = computed(() => {
    const result: TransferItem[] = []
    for (const key of props.modelValue) {
      const item = dataMap.value.get(key)
      if (item) result.push(item)
    }
    return result
  })

  // ==================== 搜索 ====================

  const sourceQuery = ref('')
  const targetQuery = ref('')

  /** 默认过滤方法 */
  function defaultFilter(query: string, item: TransferItem): boolean {
    return item.label.toLowerCase().includes(query.toLowerCase())
  }

  const filterFn = computed(() => props.filterMethod ?? defaultFilter)

  const filteredSourceList = computed(() => {
    const q = sourceQuery.value.trim()
    return q
      ? sourceList.value.filter(item => filterFn.value(q, item))
      : sourceList.value
  })

  const filteredTargetList = computed(() => {
    const q = targetQuery.value.trim()
    return q
      ? targetList.value.filter(item => filterFn.value(q, item))
      : targetList.value
  })

  // ==================== 选中态 ====================

  const sourceChecked = reactive(new Set<string | number>())
  const targetChecked = reactive(new Set<string | number>())

  /** 切换源列表项选中状态 */
  function toggleSourceCheck(key: string | number) {
    if (sourceChecked.has(key)) sourceChecked.delete(key)
    else sourceChecked.add(key)
  }

  /** 切换目标列表项选中状态 */
  function toggleTargetCheck(key: string | number) {
    if (targetChecked.has(key)) targetChecked.delete(key)
    else targetChecked.add(key)
  }

  const isSourceAllChecked = computed(
    () =>
      filteredSourceList.value.length > 0 &&
      filteredSourceList.value.every(
        i => i.disabled || sourceChecked.has(i.key)
      )
  )
  const isSourceIndeterminate = computed(
    () =>
      !isSourceAllChecked.value &&
      filteredSourceList.value.some(i => sourceChecked.has(i.key))
  )
  const isTargetAllChecked = computed(
    () =>
      filteredTargetList.value.length > 0 &&
      filteredTargetList.value.every(
        i => i.disabled || targetChecked.has(i.key)
      )
  )
  const isTargetIndeterminate = computed(
    () =>
      !isTargetAllChecked.value &&
      filteredTargetList.value.some(i => targetChecked.has(i.key))
  )

  /** 切换源列表全选状态 */
  function toggleSourceAll(checked: boolean) {
    for (const item of filteredSourceList.value) {
      if (item.disabled) continue
      if (checked) sourceChecked.add(item.key)
      else sourceChecked.delete(item.key)
    }
  }

  /** 切换目标列表全选状态 */
  function toggleTargetAll(checked: boolean) {
    for (const item of filteredTargetList.value) {
      if (item.disabled) continue
      if (checked) targetChecked.add(item.key)
      else targetChecked.delete(item.key)
    }
  }

  // ==================== 穿梭操作 ====================

  /** 将选中项移至目标列表 */
  function moveToTarget() {
    const keys = [...sourceChecked]
    const newVal = [...props.modelValue, ...keys]
    emit('update:modelValue', newVal)
    emit('change', newVal, 'right', keys)
    sourceChecked.clear()
  }

  /** 将选中项移回源列表 */
  function moveToSource() {
    const keys = [...targetChecked]
    const removeSet = new Set(keys)
    const newVal = props.modelValue.filter(k => !removeSet.has(k))
    emit('update:modelValue', newVal)
    emit('change', newVal, 'left', keys)
    targetChecked.clear()
  }
</script>
