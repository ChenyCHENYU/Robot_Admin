<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-04 19:20:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-08 02:39:26
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Dynamic\index.vue
 * @Description: 表单组件 - 动态表单组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-form-dynamic">
    <!-- 动态控制面板 -->
    <div
      v-if="showControls && isDynamicStateAvailable"
      class="dynamic-controls"
    >
      <NCard
        size="small"
        title="动态表单控制"
        :bordered="false"
      >
        <template #header-extra>
          <NBadge
            :value="dynamicFieldsCount"
            type="warning"
          >
            <div class="i-mdi:layers text-16px"></div>
          </NBadge>
        </template>

        <NSpace
          justify="space-between"
          align="center"
        >
          <NSpace>
            <NButton
              size="small"
              type="primary"
              :disabled="!canAddMoreFields"
              @click="dynamicState!.addField()"
            >
              <template #icon>
                <div class="i-mdi:plus text-14px"></div>
              </template>
              添加字段 ({{ dynamicFieldsCount }}/{{ maxFields }})
            </NButton>

            <NButton
              size="small"
              type="warning"
              :disabled="dynamicFieldsCount === 0"
              @click="dynamicState!.removeField()"
            >
              <template #icon>
                <div class="i-mdi:minus text-14px"></div>
              </template>
              移除字段
            </NButton>

            <NButton
              size="small"
              type="error"
              :disabled="dynamicFieldsCount === 0"
              @click="dynamicState!.clearDynamicFields()"
            >
              <template #icon>
                <div class="i-mdi:delete-sweep text-14px"></div>
              </template>
              清空动态
            </NButton>
          </NSpace>

          <!-- 最大字段数配置 -->
          <div class="max-fields-config">
            <span>最大字段数:</span>
            <NInputNumber
              :value="maxFields"
              @update:value="
                (v: any) => v && dynamicState!.updateConfig({ maxFields: v })
              "
              :min="5"
              :max="50"
              size="small"
              style="width: 100px"
            />
          </div>
        </NSpace>

        <!-- 状态信息 -->
        <div class="dynamic-stats">
          <NSpace>
            <NTag type="info">总字段: {{ totalFieldsCount }}</NTag>
            <NTag type="warning">动态: {{ dynamicFieldsCount }}</NTag>
          </NSpace>
        </div>
      </NCard>
    </div>

    <!-- 状态不可用时的提示 -->
    <div
      v-else-if="showControls && !isDynamicStateAvailable"
      class="dynamic-controls-fallback"
    >
      <NCard
        size="small"
        title="动态表单控制 (静态模式)"
        :bordered="false"
      >
        <NAlert
          type="info"
          show-icon
        >
          <template #icon>
            <div class="i-mdi:information-outline text-16px"></div>
          </template>
          当前为静态模式，如需动态功能请在父组件中提供动态表单状态。
        </NAlert>
      </NCard>
    </div>

    <!-- 表单项渲染区域 -->
    <div class="dynamic-form-items">
      <NGrid
        :cols="gridCols"
        :x-gap="gridGutter"
        :y-gap="gridGutter"
      >
        <NGridItem
          v-for="(item, index) in formItems"
          :key="getItemKey(item, index)"
          :span="getItemSpan(index)"
        >
          <div
            class="dynamic-item-wrapper"
            :class="{ 'is-dynamic-field': isDynamicField(item) }"
          >
            <component :is="item" />
          </div>
        </NGridItem>
      </NGrid>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'
  import type {
    DynamicFieldConfig,
    LayoutConfig,
    FormOption,
  } from '@/types/modules/form'
  import {
    DYNAMIC_FORM_STATE_KEY,
    type DynamicFormStateType,
  } from '@/composables/Form/useDynamicFormState'

  // ================= 接口定义 =================
  interface Props {
    formItems: VNode[]
    layoutConfig?: LayoutConfig
    options?: FormOption[]
    dynamicFormState?: DynamicFormStateType | null
  }

  // ================= 组件配置 =================
  const props = withDefaults(defineProps<Props>(), {
    layoutConfig: () => ({}),
    options: () => [],
    dynamicFormState: null,
  })

  defineEmits<{
    'field-add': [fieldConfig: DynamicFieldConfig]
    'field-remove': [fieldId: string]
    'fields-clear': []
  }>()

  // ================= 状态管理 =================
  const injectedDynamicState = inject<DynamicFormStateType | null>(
    DYNAMIC_FORM_STATE_KEY,
    null
  )

  const dynamicState = computed(
    () => props.dynamicFormState || injectedDynamicState
  )
  const isDynamicStateAvailable = computed(() => !!dynamicState.value)

  // ================= 计算属性 =================
  const gridCols = computed(() => props.layoutConfig?.dynamic?.grid?.cols ?? 24)
  const gridGutter = computed(
    () => props.layoutConfig?.dynamic?.grid?.gutter ?? 16
  )
  const showControls = computed(
    () => props.layoutConfig?.dynamic?.controls?.showControls !== false
  )

  const maxFields = computed(() => {
    return (
      dynamicState.value?.state.config.maxFields ??
      props.layoutConfig?.dynamic?.dynamic?.maxFields ??
      50
    )
  })

  const dynamicFieldsCount = computed(
    () => dynamicState.value?.dynamicFieldsCount.value ?? 0
  )
  const canAddMoreFields = computed(
    () => dynamicState.value?.canAddMoreFields.value ?? false
  )
  const totalFieldsCount = computed(() => props.formItems.length)

  // ================= 工具方法 =================
  const getItemKey = (item: VNode, index: number): string => {
    return (
      item.key?.toString() ||
      (item.props as any)?.path ||
      `dynamic-item-${index}`
    )
  }

  const getItemSpan = (index: number): number => {
    const span = props.options?.[index]?.layout?.span
    return typeof span === 'number' && span > 0 && span <= gridCols.value
      ? span
      : Math.min(12, gridCols.value)
  }

  const isDynamicField = (item: VNode): boolean => {
    if (!dynamicState.value) return false
    const fieldId = (item.props as any)?.path || item.key?.toString() || ''
    return dynamicState.value.state.dynamicFields.some(
      (field: any) => field.prop === fieldId
    )
  }

  // ================= 对外暴露 =================
  defineExpose({
    addField: () => dynamicState.value?.addField(),
    removeField: () => dynamicState.value?.removeField(),
    clearAllDynamic: () => dynamicState.value?.clearDynamicFields(),
    isDynamicStateAvailable,
    dynamicState,
  })

  // ================= 开发环境验证 =================
  if (import.meta.env.DEV) {
    watchEffect(() => {
      const { options, formItems } = props
      if (options && options.length !== formItems.length) {
        console.warn(
          `[Dynamic Layout] 配置项数量(${options.length})与表单项数量(${formItems.length})不匹配`
        )
      }

      console.log(
        '[Dynamic Layout]',
        isDynamicStateAvailable.value ? '动态模式已启用' : '运行在静态模式',
        {
          totalFields: totalFieldsCount.value,
          dynamicFields: dynamicFieldsCount.value,
          stateSource: props.dynamicFormState ? 'props透传' : 'inject注入',
        }
      )
    })
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
