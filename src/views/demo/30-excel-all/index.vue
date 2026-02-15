<template>
  <div class="excel-demo">
    <NH1 class="demo-title"> Excel All - [useExcel] 场景示例 </NH1>
    <p class="mb-20px text-gray-600">
      专注于Excel文件的读取、导出和模板管理功能
    </p>

    <div class="demo-content">
      <!-- 文件导入区域 -->
      <NCard
        title="Excel 文件导入"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi-file-upload text-blue-500"></span>
        </template>

        <NSpace vertical>
          <div class="upload-area">
            <NUpload
              :file-list="fileList"
              :on-change="handleFileUpload"
              :show-file-list="false"
              accept=".xlsx,.xls"
              :disabled="loading"
              drag
              class="upload-dragger"
            >
              <div class="upload-content">
                <span
                  class="i-mdi-cloud-upload text-4xl text-gray-400 mb-2"
                ></span>
                <NText class="upload-text">点击或拖拽Excel文件到此区域</NText>
                <NText
                  depth="3"
                  class="upload-hint"
                  >支持 .xlsx, .xls 格式</NText
                >
              </div>
            </NUpload>

            <NSpace
              v-if="fileList.length > 0"
              class="mt-4"
            >
              <NTag type="success">
                <template #icon>
                  <span class="i-mdi-file-check"></span>
                </template>
                {{ fileList[0].name }}
              </NTag>
              <NButton
                quaternary
                type="error"
                size="small"
                @click="clearFileData"
              >
                <template #icon>
                  <span class="i-mdi-close"></span>
                </template>
                清除
              </NButton>
            </NSpace>
          </div>

          <!-- 工作表选择和数据预览 -->
          <div v-if="sheets.length > 0">
            <div class="sheet-selector mb-3">
              <NText class="font-semibold mr-2">选择工作表：</NText>
              <NSelect
                v-model:value="selectedSheet"
                :options="sheetOptions"
                class="w-48"
                placeholder="请选择工作表"
              />
              <NText
                depth="3"
                class="ml-4"
              >
                共 {{ sheets.length }} 个工作表
              </NText>
            </div>

            <NCard
              v-if="currentSheetData.length > 0"
              title="数据预览"
              size="small"
              class="mb-4"
            >
              <template #header-extra>
                <NSpace>
                  <NText depth="3">总计 {{ currentSheetData.length }} 行</NText>
                  <NButton
                    text
                    type="primary"
                    @click="showAllData = !showAllData"
                  >
                    {{ showAllData ? '收起' : '查看全部' }}
                  </NButton>
                </NSpace>
              </template>

              <NDataTable
                :columns="tableColumns"
                :data="previewData"
                :loading="loading"
                size="small"
                striped
                :scroll-x="1200"
                class="preview-table"
              />
            </NCard>
          </div>
        </NSpace>
      </NCard>

      <!-- 导出功能区域 -->
      <NCard
        title="导出功能"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi-download text-purple-500"></span>
        </template>

        <div class="export-grid">
          <NCard
            title="单表导出"
            size="small"
            class="export-card"
          >
            <div class="export-card-content">
              <div class="export-form">
                <NSpace vertical>
                  <NInput
                    v-model:value="exportConfig.fileName"
                    placeholder="文件名"
                    clearable
                  />
                  <NInput
                    v-model:value="exportConfig.sheetName"
                    placeholder="工作表名"
                    clearable
                  />
                </NSpace>
              </div>
              <NButton
                type="primary"
                :loading="loading"
                :disabled="!selectedSheet || currentSheetData.length === 0"
                @click="handleExportSingle"
                block
                class="export-button"
              >
                <template #icon>
                  <span class="i-mdi-file-export"></span>
                </template>
                导出当前工作表
              </NButton>
            </div>
          </NCard>

          <NCard
            title="多表导出"
            size="small"
            class="export-card"
          >
            <div class="export-card-content">
              <div class="export-form">
                <div v-if="sheets.length > 1">
                  <NText class="text-sm mb-2">选择要导出的工作表：</NText>
                  <NCheckboxGroup v-model:value="selectedSheetsForExport">
                    <div class="checkbox-grid">
                      <NCheckbox
                        v-for="sheet in sheets"
                        :key="sheet"
                        :value="sheet"
                        :label="sheet"
                      />
                    </div>
                  </NCheckboxGroup>
                </div>
                <div v-else>
                  <NText
                    depth="3"
                    class="text-center"
                  >
                    需要多个工作表才能使用此功能
                  </NText>
                </div>
              </div>
              <NButton
                type="info"
                :loading="loading"
                :disabled="selectedSheetsForExport.length === 0"
                @click="handleExportMultiple"
                block
                class="export-button"
              >
                <template #icon>
                  <span class="i-mdi-file-multiple-outline"></span>
                </template>
                导出多个工作表
              </NButton>
            </div>
          </NCard>

          <NCard
            title="示例数据"
            size="small"
            class="export-card"
          >
            <div class="export-card-content">
              <div class="export-form">
                <NText depth="3">导出预置的示例数据</NText>
                <NText
                  depth="3"
                  class="text-xs mt-2"
                >
                  包含员工信息示例数据，用于测试导出功能
                </NText>
              </div>
              <NButton
                type="success"
                @click="handleExportSample"
                block
                class="export-button"
              >
                <template #icon>
                  <span class="i-mdi-database-export"></span>
                </template>
                导出示例数据
              </NButton>
            </div>
          </NCard>
        </div>
      </NCard>

      <!-- 模板管理区域 -->
      <NCard
        title="模板管理"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi-file-document-multiple text-orange-500"></span>
        </template>

        <div class="template-grid">
          <NCard
            v-for="template in getPresetTemplates()"
            :key="template.name"
            :title="template.name"
            size="small"
            class="template-card"
            hoverable
          >
            <NSpace
              vertical
              size="small"
            >
              <NText depth="3">{{ template.description || '暂无描述' }}</NText>
              <NText depth="3">字段数量：{{ template.headers.length }}</NText>
              <NCollapse>
                <NCollapseItem
                  title="查看字段"
                  name="fields"
                >
                  <NSpace size="small">
                    <NTag
                      v-for="header in template.headers"
                      :key="header"
                      size="small"
                    >
                      {{ header }}
                    </NTag>
                  </NSpace>
                </NCollapseItem>
              </NCollapse>
              <NButton
                type="primary"
                size="small"
                @click="downloadTemplate(template)"
                :loading="loading"
                block
              >
                <template #icon>
                  <span class="i-mdi-download"></span>
                </template>
                下载模板
              </NButton>
            </NSpace>
          </NCard>
        </div>
      </NCard>

      <!-- 数据处理演示 -->
      <NCard
        title="数据处理演示"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi-cog text-indigo-500"></span>
        </template>

        <NSpace vertical>
          <NAlert
            type="info"
            class="mb-4"
          >
            <template #icon>
              <span class="i-mdi-information"></span>
            </template>
            这里演示如何在业务层处理导入的数据，比如筛选、验证等操作
          </NAlert>

          <div class="data-process-controls">
            <NSpace>
              <NButton
                :disabled="!selectedSheet || currentSheetData.length === 0"
                @click="handleFilterEmptyRows"
              >
                <template #icon>
                  <span class="i-mdi-filter"></span>
                </template>
                筛选非空行
              </NButton>
              <NButton
                :disabled="!selectedSheet || currentSheetData.length === 0"
                @click="handleShowDataSummary"
              >
                <template #icon>
                  <span class="i-mdi-chart-bar"></span>
                </template>
                数据统计
              </NButton>
              <NButton
                v-if="processedData.length > 0"
                type="success"
                @click="handleExportProcessedData"
              >
                导出处理结果
              </NButton>
            </NSpace>
          </div>

          <!-- 处理结果显示 -->
          <div
            v-if="processedData.length > 0"
            class="processed-data"
          >
            <NText class="font-semibold mb-2">处理结果预览：</NText>
            <NDataTable
              :columns="processedDataColumns"
              :data="processedData.slice(0, 5)"
              size="small"
              striped
            />
            <NText
              depth="3"
              class="mt-2"
            >
              处理后数据共 {{ processedData.length }} 条
            </NText>
          </div>

          <!-- 数据统计 -->
          <div
            v-if="dataSummary"
            class="data-summary"
          >
            <NText class="font-semibold mb-2">数据统计：</NText>
            <NSpace>
              <NTag type="info">总行数: {{ dataSummary.totalRows }}</NTag>
              <NTag type="success">非空行: {{ dataSummary.validRows }}</NTag>
              <NTag type="warning">空行: {{ dataSummary.emptyRows }}</NTag>
              <NTag type="primary">字段数: {{ dataSummary.totalFields }}</NTag>
            </NSpace>
          </div>
        </NSpace>
      </NCard>

      <!-- 操作历史 -->
      <NCard
        title="操作历史"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi:clock-time-four-outline text-gray-500"></span>
        </template>

        <div class="history-controls mb-3">
          <NSpace>
            <NButton
              quaternary
              type="warning"
              size="small"
              @click="clearHistory"
              :disabled="operationHistory.length === 0"
            >
              <template #icon>
                <span class="i-mdi-delete-sweep"></span>
              </template>
              清空历史
            </NButton>
            <NText depth="3">共 {{ operationHistory.length }} 条操作记录</NText>
          </NSpace>
        </div>

        <NDataTable
          :columns="historyColumns"
          :data="operationHistory"
          :pagination="{ pageSize: 8 }"
          size="small"
        />
      </NCard>
    </div>

    <!-- 状态提示 -->
    <NAlert
      v-if="error"
      type="error"
      :title="error"
      closable
      @close="clearError"
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
  import {
    type UploadFileInfo,
    type DataTableColumns,
    type SelectOption,
  } from 'naive-ui/es'
  import { useExcel, type ExcelTemplate } from '@robot-admin/file-utils'
  import { PREVIEW_ROWS, sampleData, historyColumns } from './data'
  import './index.scss'

  // Hooks
  const {
    loading,
    error,
    sheets,
    data,
    readFile,
    exportToExcel,
    exportMultipleSheets,
    getPresetTemplates,
    generateTemplate,
    clearData,
    clearError,
  } = useExcel()

  const message = useMessage()

  // 响应式状态
  const fileList = ref<UploadFileInfo[]>([])
  const selectedSheet = ref('')
  const showAllData = ref(false)
  const selectedSheetsForExport = ref<string[]>([])
  const processedData = ref<any[]>([])
  const dataSummary = ref<any>(null)
  const operationHistory = ref<any[]>([])

  // 导出配置
  const exportConfig = reactive({
    fileName: '',
    sheetName: '',
  })

  /**
   * * @description 工作表选项
   */
  const sheetOptions = computed((): SelectOption[] => {
    return sheets.value.map(sheet => ({
      label: sheet,
      value: sheet,
    }))
  })

  /**
   * * @description 当前选中工作表的数据
   */
  const currentSheetData = computed(() => {
    if (!selectedSheet.value || !data.value[selectedSheet.value]) {
      return []
    }
    return data.value[selectedSheet.value]
  })

  /**
   * * @description 预览数据
   */
  const previewData = computed(() => {
    if (showAllData.value) {
      return currentSheetData.value
    }
    return currentSheetData.value.slice(0, PREVIEW_ROWS)
  })

  /**
   * * @description 表格列配置
   */
  const tableColumns = computed((): DataTableColumns => {
    if (currentSheetData.value.length === 0) return []

    const firstRow = currentSheetData.value[0]
    return Object.keys(firstRow)
      .filter(key => key !== '__rowIndex')
      .map(key => ({
        title: key,
        key,
        width: 120,
        ellipsis: true,
      }))
  })

  /**
   * * @description 处理后数据的列配置
   */
  const processedDataColumns = computed((): DataTableColumns => {
    if (processedData.value.length === 0) return []

    const firstRow = processedData.value[0]
    return Object.keys(firstRow)
      .filter(key => key !== '__rowIndex')
      .map(key => ({
        title: key,
        key,
        width: 120,
        ellipsis: true,
      }))
  })

  /**
   * * @description 添加操作历史
   * ? @param operation - 操作类型
   * ? @param description - 操作描述
   * ? @param status - 操作状态
   */
  const addOperationHistory = (
    operation: string,
    description: string,
    status: 'success' | 'error' = 'success'
  ) => {
    operationHistory.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleString('zh-CN'),
      operation,
      description,
      status,
    })

    // 保持最新 50 条记录
    if (operationHistory.value.length > 50) {
      operationHistory.value = operationHistory.value.slice(0, 50)
    }
  }

  /**
   * * @description 文件上传处理
   */
  const handleFileUpload = async ({ file }: { file: UploadFileInfo }) => {
    if (!file.file) return

    try {
      await readFile(file.file)
      fileList.value = [file]

      // 自动选择第一个工作表
      if (sheets.value.length > 0) {
        selectedSheet.value = sheets.value[0]
        selectedSheetsForExport.value = [sheets.value[0]]
      }

      // 设置默认导出配置
      exportConfig.fileName = file.name?.replace(/\.[^/.]+$/, '') || '导出数据'
      exportConfig.sheetName = selectedSheet.value

      // 清空之前的处理结果
      processedData.value = []
      dataSummary.value = null

      addOperationHistory('文件导入', `成功导入文件：${file.name}`)
    } catch (err) {
      addOperationHistory(
        '文件导入',
        `导入失败：${err instanceof Error ? err.message : '未知错误'}`,
        'error'
      )
    }
  }

  /**
   * * @description 清除文件数据
   */
  const clearFileData = () => {
    fileList.value = []
    selectedSheet.value = ''
    selectedSheetsForExport.value = []
    processedData.value = []
    dataSummary.value = null
    clearData()
    addOperationHistory('清除数据', '清除所有文件数据')
  }

  /**
   * * @description 单表导出
   */
  const handleExportSingle = async () => {
    if (!selectedSheet.value || currentSheetData.value.length === 0) {
      message.warning('请先选择包含数据的工作表')
      return
    }

    try {
      await exportToExcel(currentSheetData.value, {
        fileName: exportConfig.fileName || '导出数据.xlsx',
        sheetName: exportConfig.sheetName || selectedSheet.value,
      })
      addOperationHistory('单表导出', `导出工作表：${selectedSheet.value}`)
    } catch (err) {
      addOperationHistory(
        '单表导出',
        `导出失败：${err instanceof Error ? err.message : '未知错误'}`,
        'error'
      )
    }
  }

  /**
   * * @description 多表导出
   */
  const handleExportMultiple = async () => {
    if (selectedSheetsForExport.value.length === 0) {
      message.warning('请选择要导出的工作表')
      return
    }

    try {
      const exportData: Record<string, any[]> = {}
      selectedSheetsForExport.value.forEach(sheetName => {
        if (data.value[sheetName]) {
          exportData[sheetName] = data.value[sheetName]
        }
      })

      await exportMultipleSheets(exportData)
      addOperationHistory(
        '多表导出',
        `导出${selectedSheetsForExport.value.length}个工作表`
      )
    } catch (err) {
      addOperationHistory(
        '多表导出',
        `导出失败：${err instanceof Error ? err.message : '未知错误'}`,
        'error'
      )
    }
  }

  /**
   * * @description 导出示例数据
   */
  const handleExportSample = async () => {
    try {
      await exportToExcel(sampleData, {
        fileName: '员工信息示例.xlsx',
        sheetName: '员工列表',
      })
      addOperationHistory('示例导出', '导出员工信息示例数据')
    } catch (err) {
      addOperationHistory(
        '示例导出',
        `导出失败：${err instanceof Error ? err.message : '未知错误'}`,
        'error'
      )
    }
  }

  /**
   * * @description 下载模板
   */
  const downloadTemplate = async (template: ExcelTemplate) => {
    try {
      await generateTemplate(template)
      addOperationHistory('模板下载', `下载模板：${template.name}`)
    } catch (err) {
      addOperationHistory(
        '模板下载',
        `下载失败：${err instanceof Error ? err.message : '未知错误'}`,
        'error'
      )
    }
  }

  /**
   * * @description 筛选非空行（业务层处理示例）
   */
  const handleFilterEmptyRows = () => {
    if (currentSheetData.value.length === 0) return

    const filtered = currentSheetData.value.filter(row => {
      return Object.values(row).some(
        value =>
          value !== '' &&
          value !== null &&
          value !== undefined &&
          value !== '__rowIndex'
      )
    })

    processedData.value = filtered
    message.success(`筛选完成，共 ${filtered.length} 条有效数据`)
    addOperationHistory('数据筛选', `筛选出${filtered.length}条非空数据`)
  }

  /**
   * * @description 显示数据统计（业务层处理示例）
   */
  const handleShowDataSummary = () => {
    if (currentSheetData.value.length === 0) return

    const totalRows = currentSheetData.value.length
    const validRows = currentSheetData.value.filter(row => {
      return Object.values(row).some(
        value =>
          value !== '' &&
          value !== null &&
          value !== undefined &&
          value !== '__rowIndex'
      )
    }).length
    const emptyRows = totalRows - validRows
    const totalFields =
      currentSheetData.value.length > 0
        ? Object.keys(currentSheetData.value[0]).filter(
            key => key !== '__rowIndex'
          ).length
        : 0

    dataSummary.value = {
      totalRows,
      validRows,
      emptyRows,
      totalFields,
    }

    message.info(`统计完成：总计 ${totalRows} 行，有效 ${validRows} 行`)
    addOperationHistory(
      '数据统计',
      `统计${totalRows}行数据，有效${validRows}行`
    )
  }

  /**
   * * @description 导出处理结果
   */
  const handleExportProcessedData = async () => {
    if (processedData.value.length === 0) return

    try {
      await exportToExcel(processedData.value, {
        fileName: `处理结果_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: '处理结果',
      })
      addOperationHistory(
        '导出处理结果',
        `导出${processedData.value.length}条处理后数据`
      )
    } catch (err) {
      addOperationHistory(
        '导出处理结果',
        `导出失败：${err instanceof Error ? err.message : '未知错误'}`,
        'error'
      )
    }
  }

  /**
   * * @description 清空操作历史
   */
  const clearHistory = () => {
    operationHistory.value = []
    message.success('操作历史已清空')
  }

  // 监听选中工作表变化
  watch(selectedSheet, newSheet => {
    if (newSheet) {
      exportConfig.sheetName = newSheet
      processedData.value = []
      dataSummary.value = null
    }
  })
</script>
