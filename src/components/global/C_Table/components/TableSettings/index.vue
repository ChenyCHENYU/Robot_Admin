<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-12-10 08:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-10 09:24:35
 * @FilePath: \Robot_Admin\src\components\global\C_Table\components\TableSettings\index.vue
 * @Description: 表格设置面板
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NDrawer
    v-model:show="visible"
    :width="420"
    placement="right"
    :show-mask="true"
    :mask-closable="true"
    @update:show="handleVisibleChange"
  >
    <NDrawerContent
      title="列设置"
      closable
    >
      <ColumnManagement
        :columns="columns"
        @change="handleColumnChange"
      />
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { NDrawer, NDrawerContent } from 'naive-ui/es'
  import type { TableColumn } from '@/types/modules/table'
  import ColumnManagement from './ColumnManagement.vue'

  interface Props {
    visible: boolean
    columns: TableColumn[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'column-change', columns: TableColumn[]): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value),
  })

  const handleVisibleChange = (value: boolean) => {
    emit('update:visible', value)
  }

  const handleColumnChange = (columns: TableColumn[]) => {
    emit('column-change', columns)
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
