<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @FilePath: \Robot_Admin\src\views\demo\30-excel-all\index.vue
 * @Description: 30-excel-all 页面数据与统一表格配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace excel-demo">
    <header class="workspace-heading"
      ><div
        ><small>WORKBOOK STUDIO</small><h1>Excel 数据工作台</h1
        ><p>从一份工作簿开始，完成预览、整理与导出。</p></div
      ><div class="workspace-actions"
        ><NButton
          size="small"
          :loading="workbook.loading"
          @click="loadSample"
          >载入示例工作簿</NButton
        ><NButton
          size="small"
          @click="output.exportSample"
          >下载示例数据</NButton
        ></div
      ></header
    >
    <div class="file-summary"
      ><div
        ><span>当前文件</span
        ><strong>{{
          workbook.fileList[0]?.name ?? '等待导入工作簿'
        }}</strong></div
      ><div
        ><span>工作表</span
        ><strong>{{ workbook.sheets.length }} 张</strong></div
      ><div
        ><span>当前表记录</span
        ><strong>{{ workbook.rows.length }} 行</strong></div
      ><div
        ><span>处理结果</span
        ><strong>{{ workbook.processed.length }} 行</strong></div
      ></div
    >
    <nav
      class="file-tool-tabs"
      aria-label="工作簿操作"
      ><button
        v-for="item in EXCEL_STEPS"
        :key="item.id"
        type="button"
        :aria-pressed="excelMode === item.id"
        @click="excelMode = item.id"
        ><span :class="item.icon" /><span
          ><strong>{{ item.name }}</strong
          ><small>{{ item.note }}</small></span
        ></button
      ></nav
    >
    <div class="demo-content">
      <NCard
        v-if="excelMode === 'workflow'"
        title="导入向导与后台任务"
        class="demo-card demo-section"
      >
        <NSpace
          vertical
          :size="20"
        >
          <NAlert
            type="info"
            :show-icon="false"
          >
            本地演示。下载样本再导入，可查看缺少编码、重复编码和有效行的不同结果。
          </NAlert>
          <NButton
            secondary
            @click="workflow.downloadSample"
          >
            <template #icon><span class="i-mdi-download" /></template>
            下载向导样本
          </NButton>
          <C_ImportWizard
            title="导入物料"
            :fields="importFields"
            :adapter="workflow.adapter"
            accept=".xlsx,.xls"
          />
          <NSpace align="center">
            <NButton
              secondary
              type="primary"
              @click="workflow.queueExport(workbook.rows)"
            >
              <template #icon><span class="i-mdi-download" /></template>
              创建演示导出任务
            </NButton>
            <NCheckbox v-model:checked="workflow.failOnce"
              >模拟下一次导出失败</NCheckbox
            >
          </NSpace>
          <C_TaskPanel
            title="导出任务"
            :tasks="workflow.tasks"
            :pending-keys="workflow.pendingKeys"
            @retry="workflow.retry"
            @download="workflow.download"
          />
        </NSpace>
      </NCard>
      <!-- 文件导入区域 -->
      <NCard
        v-show="excelMode === 'import'"
        title="导入与预览"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi-file-upload text-blue-500"></span>
        </template>

        <NSpin
          :show="workbook.loading && !workbook.rows.length"
          :size="48"
          :rotate="false"
          description="正在读取 Excel 文件"
        >
          <template #icon><C_Loading /></template>
          <NSpace vertical>
            <div class="upload-area">
              <NUpload
                :file-list="workbook.fileList"
                :on-change="workbook.upload"
                :show-file-list="false"
                accept=".xlsx,.xls"
                :disabled="workbook.loading"
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
                v-if="workbook.fileList.length > 0"
                class="mt-4"
              >
                <NTag type="success">
                  <template #icon>
                    <span class="i-mdi-file-check"></span>
                  </template>
                  {{ workbook.fileList[0].name }}
                </NTag>
                <NButton
                  quaternary
                  type="error"
                  size="small"
                  :disabled="workbook.loading"
                  @click="workbook.clear"
                >
                  <template #icon>
                    <span class="i-mdi-close"></span>
                  </template>
                  清除
                </NButton>
              </NSpace>
            </div>

            <!-- 工作表选择和数据预览 -->
            <div v-if="workbook.sheets.length > 0">
              <div class="sheet-selector mb-3">
                <NText class="font-semibold mr-2">选择工作表：</NText>
                <NSelect
                  v-model:value="workbook.selectedSheet"
                  :options="workbook.sheetOptions"
                  :disabled="workbook.loading"
                  class="w-48"
                  placeholder="请选择工作表"
                />
                <NText
                  depth="3"
                  class="ml-4"
                >
                  共 {{ workbook.sheets.length }} 个工作表
                </NText>
              </div>

              <NCard
                v-if="workbook.rows.length > 0"
                title="数据预览"
                size="small"
                class="mb-4"
              >
                <template #header-extra>
                  <NSpace>
                    <NText depth="3">总计 {{ workbook.rows.length }} 行</NText>
                    <NButton
                      text
                      type="primary"
                      @click="workbook.showAll = !workbook.showAll"
                    >
                      {{ workbook.showAll ? '收起' : '查看全部' }}
                    </NButton>
                  </NSpace>
                </template>

                <C_Table
                  :columns="workbook.preview.columns"
                  :data="workbook.preview.rows"
                  :loading="workbook.loading"
                  class="preview-table"
                  row-key="__previewRowKey"
                  :config="{
                    toolbar: { show: false },
                    pagination: false,
                    display: {
                      size: 'small',
                      striped: true,
                      scrollX: Math.max(
                        600,
                        workbook.preview.columns.length * 120
                      ),
                    },
                  }"
                >
                  <template #loading>
                    <C_Loading label="正在加载数据" />
                  </template>
                </C_Table>
              </NCard>
            </div>
          </NSpace>
        </NSpin>
      </NCard>

      <!-- 导出功能区域 -->
      <NCard
        v-show="excelMode === 'export'"
        title="导出工作簿"
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
                    v-model:value="output.config.fileName"
                    placeholder="文件名"
                    clearable
                  />
                  <NInput
                    v-model:value="output.config.sheetName"
                    placeholder="工作表名"
                    clearable
                  />
                </NSpace>
              </div>
              <NButton
                type="primary"
                :loading="workbook.loading"
                :disabled="
                  !workbook.selectedSheet || workbook.rows.length === 0
                "
                @click="output.exportSheet"
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
                <div v-if="workbook.sheets.length > 1">
                  <NText class="text-sm mb-2">选择要导出的工作表：</NText>
                  <NCheckboxGroup v-model:value="output.selectedSheets">
                    <div class="checkbox-grid">
                      <NCheckbox
                        v-for="sheet in workbook.sheets"
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
                :loading="workbook.loading"
                :disabled="output.selectedSheets.length === 0"
                @click="output.exportSheets"
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
                @click="output.exportSample"
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
        v-show="excelMode === 'templates'"
        title="模板库"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi-file-document-multiple text-orange-500"></span>
        </template>

        <div class="template-grid">
          <NCard
            v-for="template in output.templates"
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
                @click="output.downloadTemplate(template)"
                :loading="workbook.loading"
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
        v-show="excelMode === 'process'"
        title="整理与检查"
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
            先导入工作簿，再筛选空行、检查统计结果。原始数据保持可回看，处理结果单独导出。
          </NAlert>

          <div class="data-process-controls">
            <C_ActionBar :actions="dataProcessActions" />
          </div>

          <!-- 处理结果显示 -->
          <div
            v-if="workbook.processed.length > 0"
            class="processed-data"
          >
            <NText class="font-semibold mb-2">处理结果预览：</NText>
            <C_Table
              :columns="workbook.processedPreview.columns"
              :data="workbook.processedPreview.rows"
              row-key="__previewRowKey"
              :config="{
                toolbar: { show: false },
                pagination: false,
                display: { size: 'small', striped: true },
              }"
            />
            <NText
              depth="3"
              class="mt-2"
            >
              处理后数据共 {{ workbook.processed.length }} 条
            </NText>
          </div>

          <!-- 数据统计 -->
          <div
            v-if="workbook.summary"
            class="data-summary"
          >
            <NText class="font-semibold mb-2">数据统计：</NText>
            <NSpace>
              <NTag type="info">总行数: {{ workbook.summary.totalRows }}</NTag>
              <NTag type="success"
                >非空行: {{ workbook.summary.validRows }}</NTag
              >
              <NTag type="warning">空行: {{ workbook.summary.emptyRows }}</NTag>
              <NTag type="primary"
                >字段数: {{ workbook.summary.totalFields }}</NTag
              >
            </NSpace>
          </div>
        </NSpace>
      </NCard>

      <!-- 操作历史 -->
      <NCard
        v-if="operationHistory.length"
        title="操作历史"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi-clock-time-four-outline text-gray-500"></span>
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

        <C_Table
          :columns="historyColumns"
          :data="operationHistory"
          :config="{
            toolbar: { show: false },
            pagination: {
              showSizePicker: false,
              showQuickJumper: false,
              pageSize: 8,
            },
            display: { striped: false, size: 'small' },
          }"
        />
      </NCard>
    </div>

    <!-- 状态提示 -->
    <NAlert
      v-if="workbook.error"
      type="error"
      :title="workbook.error"
      closable
      @close="workbook.dismissError"
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
  import { useExcel } from '@robot-admin/file-utils'
  import { setupFileUtils } from '@/plugins/file-utils'
  import {
    EXCEL_STEPS,
    historyColumns,
    type OperationHistoryItem,
    type RecordOperation,
  } from './data'
  import { useExcelExports } from './useExcelExports'
  import { useExcelWorkbook } from './useExcelWorkbook'
  import { importFields, useExcelWorkflowDemo } from './useExcelWorkflowDemo'

  defineOptions({ name: 'Demo30ExcelAll' })

  setupFileUtils()
  const message = useMessage()
  const excelMode = ref('import')
  const operationHistory = ref<OperationHistoryItem[]>([])
  let nextRecordId = 0
  const record: RecordOperation = (
    operation,
    description,
    status = 'success'
  ) => {
    operationHistory.value.unshift({
      id: ++nextRecordId,
      time: new Date().toLocaleString('zh-CN'),
      operation,
      description,
      status,
    })
    if (operationHistory.value.length > 50) operationHistory.value.pop()
  }
  const clearHistory = () => {
    operationHistory.value = []
    message.success('操作历史已清空')
  }

  const excel = useExcel()
  const workbook = useExcelWorkbook(excel, record)
  const output = useExcelExports(excel, workbook, record)
  const workflow = proxyRefs(useExcelWorkflowDemo())
  const loadSample = async () => {
    if (await workbook.loadSample()) excelMode.value = 'import'
  }

  const dataProcessActions = computed(() => [
    {
      label: '筛选非空行',
      icon: 'mdi:filter',
      disabled: !workbook.rows.length,
      onClick: workbook.filterEmpty,
    },
    {
      label: '数据统计',
      icon: 'mdi:chart-bar',
      disabled: !workbook.rows.length,
      onClick: workbook.summarize,
    },
    {
      label: '导出处理结果',
      type: 'success' as const,
      show: () => workbook.processed.length > 0,
      onClick: output.exportProcessed,
    },
  ])
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
