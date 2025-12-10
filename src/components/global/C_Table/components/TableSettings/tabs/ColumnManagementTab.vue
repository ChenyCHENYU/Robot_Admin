<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-12-10 08:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-10 10:52:00
 * @FilePath: \Robot_Admin\src\components\global\C_Table\components\TableSettings\tabs\ColumnManagementTab.vue
 * @Description: 列管理Tab
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="column-management-tab">
    <!-- 搜索框 -->
    <NInput
      v-model:value="searchText"
      placeholder="搜索列名..."
      clearable
      class="search-input"
    >
      <template #prefix>
        <C_Icon name="mdi:magnify" />
      </template>
    </NInput>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <NSpace>
        <NButton
          size="small"
          @click="selectAll"
        >
          全选
        </NButton>
        <NButton
          size="small"
          @click="selectNone"
        >
          全不选
        </NButton>
        <NButton
          size="small"
          @click="resetColumns"
        >
          重置
        </NButton>
      </NSpace>
    </div>

    <!-- 统计信息 -->
    <div class="stats-info">
      <NText depth="3">
        已选 {{ visibleCount }} / 总共 {{ totalCount }} 列
      </NText>
    </div>

    <!-- 列列表 -->
    <div
      ref="listRef"
      class="column-list"
    >
      <div
        v-for="(column, index) in filteredColumns"
        :key="column.key"
        class="column-item"
        :class="{ 
          disabled: column.key === '_actions',
          'fixed-left': column.fixed === 'left',
          'fixed-right': column.fixed === 'right'
        }"
        :draggable="column.key !== '_actions'"
        @dragstart="handleDragStart(index, $event)"
        @dragover="handleDragOver(index, $event)"
        @dragend="handleDragEnd"
        @drop="handleDrop(index)"
      >
        <div class="column-info">
          <div class="column-controls">
            <C_Icon
              name="mdi:drag"
              size="18"
              class="drag-handle"
              :class="{ disabled: column.key === '_actions' }"
            />
            <NCheckbox
              :checked="column.visible !== false"
              :disabled="column.key === '_actions'"
              @update:checked="value => toggleColumnVisibility(index, value)"
            />
            <div class="drag-controls">
              <NButton
                quaternary
                size="small"
                :disabled="index === 0"
                @click="moveColumn(index, index - 1)"
              >
                <template #icon>
                  <C_Icon name="mdi:chevron-up" />
                </template>
              </NButton>
              <NButton
                quaternary
                size="small"
                :disabled="index === filteredColumns.length - 1"
                @click="moveColumn(index, index + 1)"
              >
                <template #icon>
                  <C_Icon name="mdi:chevron-down" />
                </template>
              </NButton>
            </div>
          </div>
          <div class="column-details">
            <NSpace
              align="center"
              :size="8"
            >
              <NText strong>{{ column.title || column.key }}</NText>
              <NTag
                v-if="column.fixed === 'left'"
                size="small"
                type="info"
              >
                左固定
              </NTag>
              <NTag
                v-if="column.fixed === 'right'"
                size="small"
                type="warning"
              >
                右固定
              </NTag>
            </NSpace>
            <NText
              depth="3"
              style="font-size: 12px"
            >
              {{ column.key }}
            </NText>
          </div>
        </div>
        <div class="column-actions">
          <NDropdown
            :options="getFixedOptions(column)"
            @select="value => handleFixedSelect(index, value)"
          >
            <NButton
              quaternary
              size="small"
              :type="column.fixed ? 'primary' : 'default'"
            >
              <template #icon>
                <C_Icon name="mdi:pin" />
              </template>
            </NButton>
          </NDropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import {
    NCheckbox,
    NButton,
    NText,
    NSpace,
    NDropdown,
    NInput,
    NTag,
  } from 'naive-ui/es'
  import C_Icon from '@/components/global/C_Icon/index.vue'
  import type { TableColumn } from '@/types/modules/table'

  interface Props {
    columns: TableColumn[]
  }

  interface Emits {
    (e: 'change', columns: TableColumn[]): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const localColumns = ref<TableColumn[]>([...props.columns])
  const searchText = ref('')
  const listRef = ref<HTMLElement>()

  // 拖拽相关状态
  const draggedIndex = ref<number | null>(null)
  const dragOverIndex = ref<number | null>(null)

  // 过滤后的列
  const filteredColumns = computed(() => {
    if (!searchText.value) return localColumns.value

    const search = searchText.value.toLowerCase()
    return localColumns.value.filter(
      column =>
        column.title?.toLowerCase().includes(search) ||
        column.key.toLowerCase().includes(search)
    )
  })

  // 统计信息
  const visibleCount = computed(() => {
    return localColumns.value.filter(col => col.visible !== false).length
  })

  const totalCount = computed(() => localColumns.value.length)

  // 全选
  const selectAll = () => {
    localColumns.value.forEach(col => {
      if (col.key !== '_actions') {
        col.visible = true
      }
    })
    applyChanges()
  }

  // 全不选
  const selectNone = () => {
    localColumns.value.forEach(col => {
      if (col.key !== '_actions') {
        col.visible = false
      }
    })
    applyChanges()
  }

  const toggleColumnVisibility = (index: number, visible: boolean) => {
    // 🔥 修复：需要找到原始列的索引
    const column = filteredColumns.value[index]
    const originalIndex = localColumns.value.findIndex(
      col => col.key === column.key
    )
    if (originalIndex !== -1) {
      localColumns.value[originalIndex].visible = visible
      // 立即应用变化
      emit('change', [...localColumns.value])
    }
  }

  const setColumnFixed = (
    index: number,
    fixed: 'left' | 'right' | undefined
  ) => {
    // 🔥 修复：需要找到原始列的索引
    const column = filteredColumns.value[index]
    const originalIndex = localColumns.value.findIndex(
      col => col.key === column.key
    )
    if (originalIndex !== -1) {
      localColumns.value[originalIndex].fixed = fixed
      // 立即应用变化
      emit('change', [...localColumns.value])
    }
  }

  const handleFixedSelect = (index: number, value: string) => {
    if (value === 'none') {
      setColumnFixed(index, undefined)
    } else {
      setColumnFixed(index, value as 'left' | 'right')
    }
  }

  const getFixedOptions = (column: TableColumn) => {
    return [
      {
        label: column.fixed ? '✓ 取消固定' : '不固定',
        key: 'none',
        disabled: !column.fixed,
      },
      {
        label: column.fixed === 'left' ? '✓ 固定左侧' : '固定左侧',
        key: 'left',
        disabled: false,
      },
      {
        label: column.fixed === 'right' ? '✓ 固定右侧' : '固定右侧',
        key: 'right',
        disabled: false,
      },
    ]
  }

  const resetColumns = () => {
    localColumns.value = [...props.columns]
    applyChanges()
  }

  const applyChanges = () => {
    emit('change', [...localColumns.value])
  }

  const moveColumn = (fromIndex: number, toIndex: number) => {
    // 🔥 修复：需要找到原始列的索引
    const fromColumn = filteredColumns.value[fromIndex]
    const toColumn = filteredColumns.value[toIndex]

    const originalFromIndex = localColumns.value.findIndex(
      col => col.key === fromColumn.key
    )
    const originalToIndex = localColumns.value.findIndex(
      col => col.key === toColumn.key
    )

    if (originalFromIndex !== -1 && originalToIndex !== -1) {
      const column = localColumns.value.splice(originalFromIndex, 1)[0]
      localColumns.value.splice(originalToIndex, 0, column)
      applyChanges()
    }
  }

  // 🆕 拖拽功能
  const handleDragStart = (index: number, event: DragEvent) => {
    const column = filteredColumns.value[index]
    if (column.key === '_actions') {
      event.preventDefault()
      return
    }
    draggedIndex.value = index
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  const handleDragOver = (index: number, event: DragEvent) => {
    event.preventDefault()
    if (draggedIndex.value === null) return

    const column = filteredColumns.value[index]
    if (column.key === '_actions') return

    dragOverIndex.value = index
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  const handleDrop = (toIndex: number) => {
    if (draggedIndex.value === null) return

    const toColumn = filteredColumns.value[toIndex]
    if (toColumn.key === '_actions') return

    moveColumn(draggedIndex.value, toIndex)
    draggedIndex.value = null
    dragOverIndex.value = null
  }

  const handleDragEnd = () => {
    draggedIndex.value = null
    dragOverIndex.value = null
  }
</script>

<style scoped lang="scss">
  .column-management-tab {
    .search-input {
      margin-bottom: 12px;
    }

    .quick-actions {
      margin-bottom: 12px;
    }

    .stats-info {
      margin-bottom: 16px;
      padding: 8px 12px;
      background: var(--n-color-target);
      border-radius: 6px;
    }

    .column-list {
      .column-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        margin-bottom: 8px;
        border: 1px solid var(--n-border-color);
        border-radius: 6px;
        background: var(--n-card-color);
        cursor: move;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--n-primary-color);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        &.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &.fixed-left {
          border-left: 3px solid var(--n-info-color);
        }

        &.fixed-right {
          border-right: 3px solid var(--n-warning-color);
        }

        .column-info {
          display: flex;
          align-items: center;
          flex: 1;
          gap: 12px;

          .column-controls {
            display: flex;
            align-items: center;
            gap: 8px;

            .drag-handle {
              color: var(--n-text-color-3);
              cursor: grab;

              &:active {
                cursor: grabbing;
              }

              &.disabled {
                cursor: not-allowed;
                opacity: 0.3;
              }
            }

            .drag-controls {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
          }

          .column-details {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
        }

        .column-actions {
          display: flex;
          align-items: center;
        }
      }
    }
  }
</style>
