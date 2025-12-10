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

    <!-- 顶部操作栏：统计信息和快捷操作按钮 -->
    <div class="top-actions-bar">
      <div class="stats-info">
        <NText
          depth="3"
          :style="{ fontSize: '13px' }"
        >
          已选 {{ visibleCount }} / 总共 {{ totalCount }} 列
        </NText>
      </div>
      <div class="quick-actions">
        <NSpace :size="6">
          <NButton
            size="tiny"
            @click="selectAll"
          >
            全选
          </NButton>
          <NButton
            size="tiny"
            @click="selectNone"
          >
            全不选
          </NButton>
          <NButton
            size="tiny"
            @click="resetColumns"
          >
            重置
          </NButton>
        </NSpace>
      </div>
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
          'fixed-right': column.fixed === 'right',
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
              size="16"
              class="drag-handle"
              :class="{ disabled: column.key === '_actions' }"
            />
            <NCheckbox
              :checked="column.visible !== false"
              :disabled="column.key === '_actions'"
              @update:checked="value => toggleColumnVisibility(index, value)"
            />
          </div>
          <div class="column-details">
            <NSpace
              align="center"
              :size="6"
            >
              <NText
                strong
                :style="{ fontSize: '13px' }"
              >
                {{ column.title || column.key }}
              </NText>
              <NTag
                v-if="column.fixed === 'left'"
                size="tiny"
                type="info"
              >
                左固定
              </NTag>
              <NTag
                v-if="column.fixed === 'right'"
                size="tiny"
                type="warning"
              >
                右固定
              </NTag>
            </NSpace>
            <NText
              depth="3"
              :style="{ fontSize: '11px' }"
            >
              {{ column.key }}
            </NText>
          </div>
        </div>
        <div class="column-actions">
          <div class="drag-controls">
            <C_Icon
              name="mdi:chevron-up"
              size="14"
              title="上移"
              :clickable="index !== 0"
              :class="{ disabled: index === 0 }"
              @click="index !== 0 && moveColumn(index, index - 1)"
            />
            <C_Icon
              name="mdi:chevron-down"
              size="14"
              title="下移"
              :clickable="index !== filteredColumns.length - 1"
              :class="{ disabled: index === filteredColumns.length - 1 }"
              @click="
                index !== filteredColumns.length - 1 &&
                moveColumn(index, index + 1)
              "
            />
          </div>
          <NDropdown
            :options="getFixedOptions(column)"
            @select="value => handleFixedSelect(index, value)"
          >
            <C_Icon
              name="mdi:pin"
              size="14"
              title="固定列"
              clickable
              :style="{
                color: column.fixed ? 'var(--n-primary-color)' : undefined,
              }"
            />
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

  // 通用的索引查找函数
  const findOriginalIndex = (filteredIndex: number): number => {
    const column = filteredColumns.value[filteredIndex]
    return localColumns.value.findIndex(col => col.key === column.key)
  }

  const toggleColumnVisibility = (index: number, visible: boolean) => {
    const originalIndex = findOriginalIndex(index)
    if (originalIndex !== -1) {
      localColumns.value[originalIndex].visible = visible
      emit('change', [...localColumns.value])
    }
  }

  const handleFixedSelect = (index: number, value: string) => {
    const originalIndex = findOriginalIndex(index)
    if (originalIndex !== -1) {
      localColumns.value[originalIndex].fixed =
        value === 'none' ? undefined : (value as 'left' | 'right')
      applyChanges()
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
    const originalFromIndex = findOriginalIndex(fromIndex)
    const originalToIndex = findOriginalIndex(toIndex)

    if (originalFromIndex !== -1 && originalToIndex !== -1) {
      const [movedColumn] = localColumns.value.splice(originalFromIndex, 1)
      localColumns.value.splice(originalToIndex, 0, movedColumn)
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

    .top-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 10px 12px;
      background: var(--n-color-target);
      border-radius: 6px;

      .stats-info {
        flex: 1;
      }

      .quick-actions {
        flex-shrink: 0;
      }
    }

    .column-list {
      .column-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 4px;
        margin-bottom: 4px;
        border-radius: 4px;
        background: transparent;
        cursor: move;
        transition: all 0.2s ease;

        &:hover {
          background: var(--n-color-target);
        }

        &.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &.fixed-left {
          background: rgba(24, 160, 88, 0.08);
        }

        &.fixed-right {
          background: rgba(240, 138, 0, 0.08);
        }

        .column-info {
          display: flex;
          align-items: center;
          flex: 1;
          gap: 10px;
          min-width: 0;

          .column-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;

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
          }

          .column-details {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
            min-width: 0;
            overflow: hidden;
          }
        }

        .column-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;

          .drag-controls {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .c-icon {
              opacity: 0.6;
              transition: all 0.2s ease;

              &:not(.disabled):hover {
                opacity: 1;
                transform: scale(1.15);
              }

              &.disabled {
                opacity: 0.3;
                cursor: not-allowed;
              }
            }
          }

          .c-icon {
            transition: all 0.2s ease;

            &:hover {
              transform: scale(1.15);
            }
          }
        }
      }
    }
  }
</style>
