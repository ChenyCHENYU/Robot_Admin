<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-09-02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-02 10:03:25
 * @FilePath: \Robot_Admin\src\components\global\C_Table\components\TableViewModal.vue
 * @Description: 表格查看详情模态框组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 -->

<template>
  <NModal
    v-model:show="visible"
    :title="title"
    :width="width"
    preset="card"
    class="w60%"
  >
    <NDescriptions
      v-if="visible && data && columns.length"
      :column="2"
      label-placement="left"
    >
      <NDescriptionsItem
        v-for="column in columns"
        :key="column.key"
        :label="column.title"
        :span="getDescriptionSpan(column)"
      >
        {{ getDisplayValue(column, data) }}
      </NDescriptionsItem>
    </NDescriptions>

    <!-- 自定义内容插槽 -->
    <slot
      :data="data"
      :columns="columns"
    />

    <template #action>
      <NSpace justify="end">
        <NButton @click="handleClose">关闭</NButton>
        <!-- 自定义操作按钮插槽 -->
        <slot
          name="actions"
          :data="data"
          :close="handleClose"
        />
      </NSpace>
    </template>
  </NModal>
</template>

<script setup lang="ts">
  import type { TableColumn, DataRecord } from '@/types/modules/table'
  import { getDisplayValue, getDescriptionSpan } from '../data'

  // ================= 类型定义 =================
  interface ViewModalProps {
    /** 模态框显示状态 */
    visible: boolean
    /** 模态框标题 */
    title?: string
    /** 模态框宽度 */
    width?: number
    /** 显示数据 */
    data: DataRecord | null
    /** 列配置 */
    columns: TableColumn[]
  }

  interface ViewModalEmits {
    'update:visible': [visible: boolean]
    close: []
  }

  // ================= Props & Emit =================
  const props = withDefaults(defineProps<ViewModalProps>(), {
    title: '查看详情',
    width: 600,
    data: null,
  })

  const emit = defineEmits<ViewModalEmits>()

  // ================= 计算属性 =================
  const visible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value),
  })

  // ================= 事件处理 =================

  /**
   * 关闭模态框
   */
  const handleClose = () => {
    emit('close')
    emit('update:visible', false)
  }

  // ================= 组件暴露 =================
  defineExpose({
    /** 关闭模态框 */
    close: handleClose,
  })
</script>

<style scoped lang="scss">
  // 可以添加查看模态框特定的样式
</style>
