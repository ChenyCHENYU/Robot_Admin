<!--
  ExcelViewer — Excel 表格预览子组件
  负责: 工作表切换 + 表格渲染(合并单元格) + 分页 + 格式切换
-->
<template>
  <div class="file-container excel-container">
    <!-- 工具栏 -->
    <div class="file-toolbar">
      <div class="flex justify-between items-center">
        <div class="flex gap-2 items-center">
          <NTabs
            v-if="sheets.length > 1"
            v-model:value="activeSheet"
            type="card"
            size="small"
          >
            <NTabPane
              v-for="sheet in sheets"
              :key="sheet.name"
              :name="sheet.name"
              :tab="sheet.name"
            />
          </NTabs>
          <span
            v-else
            class="text-sm text-gray-600"
          >
            工作表: {{ activeSheet }}
          </span>
        </div>

        <div class="flex gap-2 items-center">
          <NButton
            size="small"
            @click="showExcelFormat = !showExcelFormat"
          >
            <template #icon>
              <C_Icon name="ic:outline-format-paint" />
            </template>
            {{ showExcelFormat ? '紧凑视图' : '完整格式' }}
          </NButton>
        </div>
      </div>
    </div>

    <div class="excel-viewer">
      <!-- 信息面板 -->
      <div
        v-if="currentData.length > 0"
        class="excel-info"
      >
        <NText
          depth="3"
          class="text-sm"
        >
          当前工作表: {{ activeSheet }} | 总行数: {{ currentData.length }} |
          总列数: {{ currentColumns.length }} | 当前页:
          {{ currentExcelPage }}/{{ totalExcelPages }}
        </NText>
      </div>

      <!-- 表格 -->
      <div class="excel-table-container">
        <div
          class="excel-table-wrapper"
          :class="{ 'simple-mode': !showExcelFormat }"
        >
          <table
            v-if="currentData.length > 0"
            class="excel-table"
          >
            <thead>
              <tr>
                <th class="row-number">行号</th>
                <th
                  v-for="(col, index) in currentColumns"
                  :key="col.key"
                  class="excel-header"
                  :style="{ minWidth: col.width + 'px' }"
                >
                  <div class="header-content">
                    <span class="column-letter">{{
                      getColumnLetter(index)
                    }}</span>
                    <span class="column-title">{{ col.title }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in paginatedData"
                :key="rowIndex"
                class="excel-row"
              >
                <td class="row-number">
                  {{ (currentExcelPage - 1) * pageSize + rowIndex + 1 }}
                </td>
                <td
                  v-for="col in currentColumns"
                  :key="col.key"
                  v-show="!row[col.key]?.hidden"
                  class="excel-cell"
                  :class="[
                    getCellClass(row[col.key]?.value),
                    row[col.key]?.merged ? 'merged-cell' : '',
                    !showExcelFormat ? 'compact-cell' : '',
                  ]"
                  :rowspan="row[col.key]?.rowspan || 1"
                  :colspan="row[col.key]?.colspan || 1"
                  :title="row[col.key]?.value"
                >
                  {{ formatCellValue(row[col.key]?.value) }}
                </td>
              </tr>
            </tbody>
          </table>

          <div
            v-else
            class="excel-empty"
          >
            <NEmpty description="该工作表没有数据或解析失败">
              <template #extra>
                <NButton
                  size="small"
                  @click="$emit('reload')"
                >
                  重新解析
                </NButton>
              </template>
            </NEmpty>
          </div>
        </div>

        <!-- 分页 -->
        <div
          v-if="totalExcelPages > 1"
          class="excel-pagination"
        >
          <NPagination
            v-model:page="currentExcelPage"
            :page-count="totalExcelPages"
            :page-size="pageSize"
            show-size-picker
            :page-sizes="PAGE_SIZE_OPTIONS"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    getColumnLetter,
    formatCellValue,
    getCellClass,
    PAGE_SIZE_OPTIONS,
  } from '@/components/global/C_FilePreview/data'

  const props = defineProps<{
    sheets: ExcelSheet[]
  }>()

  defineEmits<{
    reload: []
  }>()

  // ==================== 内部状态 ====================
  const activeSheet = ref('')
  const showExcelFormat = ref(false)
  const currentExcelPage = ref(1)
  const pageSize = ref(50)

  // ==================== 当前工作表数据 ====================
  const currentData = ref<ExcelRow[]>([])
  const currentColumns = ref<ExcelColumn[]>([])

  // ==================== 计算属性 ====================
  const totalExcelPages = computed(() =>
    Math.ceil(currentData.value.length / pageSize.value)
  )

  const paginatedData = computed(() => {
    const start = (currentExcelPage.value - 1) * pageSize.value
    return currentData.value.slice(start, start + pageSize.value)
  })

  // ==================== 方法 ====================
  const handlePageSizeChange = (newPageSize: number) => {
    pageSize.value = newPageSize
    currentExcelPage.value = 1
  }

  const syncSheetData = (sheetName: string) => {
    const sheet = props.sheets.find(s => s.name === sheetName)
    if (sheet) {
      currentData.value = sheet.data
      currentColumns.value = sheet.columns
      currentExcelPage.value = 1
    }
  }

  // ==================== 监听器 ====================
  watch(activeSheet, newSheet => {
    syncSheetData(newSheet)
  })

  // sheets 变化时初始化
  watch(
    () => props.sheets,
    newSheets => {
      if (newSheets.length > 0) {
        const [firstSheet] = newSheets
        activeSheet.value = firstSheet.name
        currentData.value = firstSheet.data
        currentColumns.value = firstSheet.columns
        currentExcelPage.value = 1
      }
    },
    { immediate: true }
  )
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
