<!--
 * @Description: 列设置面板 — 搜索、拖拽排序、可见性、固定列、列宽调整
 -->

<template>
  <div class="column-management-tab">
    <!-- 搜索框和列宽调整开关 -->
    <div class="search-row">
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

      <div class="resizable-control">
        <C_Icon
          name="mdi:arrow-split-vertical"
          size="14"
          :title="
            enableResizable ? '开启后可拖拽列边界调整宽度' : '允许调整列宽'
          "
        />
        <NText :style="{ fontSize: '12px', marginLeft: '4px' }">
          列宽调整
        </NText>
        <NSwitch
          v-model:value="enableResizable"
          size="small"
          style="margin-left: 6px"
          @update:value="handleResizableChange"
        />
      </div>
    </div>

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
              @update:checked="
                (value: boolean) => toggleColumnVisibility(index, value)
              "
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
            @select="(value: string) => handleFixedSelect(index, value)"
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
  import C_Icon from '@/components/global/C_Icon/index.vue'
  import type { TableColumn } from '@/types/modules/table'
  import { getFixedOptions, isSpecialColumn } from './data'

  // ================= Props & Emits =================

  const props = defineProps<{ columns: TableColumn[] }>()
  const emit = defineEmits<{ (e: 'change', columns: TableColumn[]): void }>()

  // ================= 响应式状态 =================

  const localColumns = ref<TableColumn[]>([...props.columns])
  const searchText = ref('')
  const listRef = ref<HTMLElement>()
  const draggedIndex = ref<number | null>(null)
  const dragOverIndex = ref<number | null>(null)
  const enableResizable = ref(false)

  onMounted(() => {
    enableResizable.value = localColumns.value.some(
      col => col.resizable === true
    )
  })

  // ================= 计算属性 =================

  const filteredColumns = computed(() => {
    if (!searchText.value) return localColumns.value
    const search = searchText.value.toLowerCase()
    return localColumns.value.filter(
      col =>
        col.title?.toLowerCase().includes(search) ||
        col.key.toLowerCase().includes(search)
    )
  })

  const visibleCount = computed(
    () => localColumns.value.filter(col => col.visible !== false).length
  )
  const totalCount = computed(() => localColumns.value.length)

  // ================= 批量操作 =================

  const setAllColumnsVisible = (visible: boolean) => {
    localColumns.value.forEach(col => {
      if (col.key !== '_actions') col.visible = visible
    })
    applyChanges()
  }

  const selectAll = () => setAllColumnsVisible(true)
  const selectNone = () => setAllColumnsVisible(false)

  // ================= 列属性更新 =================

  const findOriginalIndex = (filteredIndex: number): number => {
    const column = filteredColumns.value[filteredIndex]
    return localColumns.value.findIndex(col => col.key === column.key)
  }

  const updateColumnProperty = (
    index: number,
    updater: (col: TableColumn) => void
  ) => {
    const originalIndex = findOriginalIndex(index)
    if (originalIndex !== -1) {
      updater(localColumns.value[originalIndex])
      applyChanges()
    }
  }

  const toggleColumnVisibility = (index: number, visible: boolean) => {
    updateColumnProperty(index, col => {
      col.visible = visible
    })
  }

  const handleFixedSelect = (index: number, value: string) => {
    updateColumnProperty(index, col => {
      col.fixed = value === 'none' ? undefined : (value as 'left' | 'right')
    })
  }

  const applyChanges = () => emit('change', [...localColumns.value])

  const resetColumns = () => {
    localColumns.value = [...props.columns]
    applyChanges()
  }

  // ================= 列宽调整 =================

  const handleResizableChange = (value: boolean) => {
    localColumns.value.forEach(col => {
      if (!isSpecialColumn(col)) {
        col.resizable = value
        if (value) {
          col.minWidth = col.minWidth || 80
          col.maxWidth = col.maxWidth || 500
        }
      }
    })
    applyChanges()
  }

  // ================= 拖拽排序 =================

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const originalFromIndex = findOriginalIndex(fromIndex)
    const originalToIndex = findOriginalIndex(toIndex)
    if (originalFromIndex !== -1 && originalToIndex !== -1) {
      const [movedColumn] = localColumns.value.splice(originalFromIndex, 1)
      localColumns.value.splice(originalToIndex, 0, movedColumn)
      applyChanges()
    }
  }

  const handleDragStart = (index: number, event: DragEvent) => {
    const column = filteredColumns.value[index]
    if (column.key === '_actions') {
      event.preventDefault()
      return
    }
    draggedIndex.value = index
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (index: number, event: DragEvent) => {
    event.preventDefault()
    if (
      draggedIndex.value === null ||
      filteredColumns.value[index].key === '_actions'
    )
      return
    dragOverIndex.value = index
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (toIndex: number) => {
    if (
      draggedIndex.value === null ||
      filteredColumns.value[toIndex].key === '_actions'
    )
      return
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
  @use './index.scss';
</style>
