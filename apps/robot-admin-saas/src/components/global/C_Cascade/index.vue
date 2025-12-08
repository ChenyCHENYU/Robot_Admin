<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-28 11:41:36
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-31 14:13:48
 * @FilePath: \Robot_Admin\src\components\global\C_Cascade\index.vue
 * @Description: 级联选择组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="n-cascade-selector">
    <NSelect
      v-for="(level, index) in levels"
      :key="index"
      v-model:value="selectedValues[index]"
      :options="levelOptions[index]"
      clearable
      :placeholder="placeholders[index]"
      :disabled="index > 0 && !selectedValues[index - 1]"
      @update:value="handleChange(index)"
      class="n-select-item"
    />
  </div>
</template>

<script lang="ts" setup>
  // 类型定义
  export interface CascadeItem {
    label: string
    value: string | number
    children?: CascadeItem[]
  }

  interface CascadeValue {
    primary?: Pick<CascadeItem, 'label' | 'value'> | null
    secondary?: Pick<CascadeItem, 'label' | 'value'> | null
    tertiary?: Pick<CascadeItem, 'label' | 'value'> | null
  }

  // Props 定义
  const props = withDefaults(
    defineProps<{
      /** 级联数据源 */
      data: CascadeItem[]
      /** 各级占位符文本 */
      placeholders?: string[]
      /** v-model 绑定值 */
      modelValue?: CascadeValue
    }>(),
    {
      placeholders: () => ['请选择', '请选择', '请选择'],
    }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: CascadeValue]
    change: [value: CascadeValue]
  }>()

  const levels = [0, 1, 2]
  const selectedValues = ref<(string | number | null)[]>([null, null, null])

  /**
   * 根据层级获取对应的数据源
   * @param level 层级索引
   * @returns 对应层级的数据源
   */
  const getLevelData = (level: number): CascadeItem[] => {
    if (level === 0) return props.data
    if (!selectedValues.value[level - 1]) return []

    const parentData = getLevelData(level - 1)
    return (
      parentData.find(x => x.value === selectedValues.value[level - 1])
        ?.children || []
    )
  }

  /**
   * 各层级的选项列表
   */
  const levelOptions = computed(() =>
    levels.map(level =>
      getLevelData(level).map(item => ({
        label: item.label,
        value: item.value,
      }))
    )
  )

  /**
   * 处理选择变更
   * @param index 变更的层级索引
   */
  const handleChange = (index: number) => {
    // 清空下级选择
    selectedValues.value.splice(
      index + 1,
      levels.length - index - 1,
      ...Array(levels.length - index - 1).fill(null)
    )
    emitValue()
  }

  /**
   * 获取选中项数据
   * @param index 层级索引
   */
  const getSelectedItem = (index: number) => {
    const value = selectedValues.value[index]
    if (!value) return null

    const data = getLevelData(index)
    const item = data.find(i => i.value === value)
    return item ? { label: item.label, value: item.value } : null
  }

  /**
   * 发出选中值
   */
  const emitValue = () => {
    const result: CascadeValue = {
      primary: getSelectedItem(0),
      secondary: getSelectedItem(1),
      tertiary: getSelectedItem(2),
    }
    emit('update:modelValue', result)
    emit('change', result)
  }

  // 监听外部值变化
  watch(
    () => props.modelValue,
    val => {
      selectedValues.value = [
        val?.primary?.value ?? null,
        val?.secondary?.value ?? null,
        val?.tertiary?.value ?? null,
      ]
    },
    { immediate: true, deep: true }
  )
</script>

<style scoped lang="scss">
  .n-cascade-selector {
    display: flex;
    gap: 12px;
    .n-select-item {
      min-width: 140px;
      flex: 1;
    }
  }
</style>
