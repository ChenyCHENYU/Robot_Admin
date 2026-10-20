<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-02
 * @FilePath: \Robot_Admin\src\views\demo\19-download-all\index.vue
 * @Description: 通用文件下载场景示例
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="plugin-workspace download-demo">
    <header class="workspace-heading"
      ><div
        ><small>DOWNLOAD CENTER</small><h1>文件下载工作台</h1
        ><p>选择合适的格式，让数据交付更简单。</p></div
      ><NTag
        size="small"
        :bordered="false"
        >{{ downloadHistory.length }} 条本次下载记录</NTag
      ></header
    >
    <div class="download-formats"
      ><article
        v-for="(action, index) in quickDownloadActions"
        :key="action.label"
        ><C_Icon
          class="download-format-icon"
          :name="action.icon"
          :size="30" /><small>{{ ['XLSX', 'CSV', 'PDF', 'JSON'][index] }}</small
        ><h2>{{
          ['用户数据报表', '订单统计', '商品清单', '结构化数据'][index]
        }}</h2
        ><p>{{
          [
            '可编辑工作簿，便于整理与协作',
            '通用表格格式，适合交换数据',
            '固定排版，适合阅读与分享',
            '保留数据结构，便于程序处理',
          ][index]
        }}</p
        ><NButton
          size="small"
          :loading="action.loading"
          @click="action.onClick"
          >{{ action.label
          }}<template #icon
            ><span class="i-mdi-download" /></template></NButton></article
    ></div>
    <nav
      class="file-tool-tabs"
      aria-label="下载方式"
      ><button
        type="button"
        :aria-pressed="downloadMode === 'custom'"
        @click="downloadMode = 'custom'"
        ><span class="i-mdi-wrench-settings" /><span
          ><strong>自定义下载</strong><small>名称、格式与附加参数</small></span
        ></button
      ><button
        type="button"
        :aria-pressed="downloadMode === 'batch'"
        @click="downloadMode = 'batch'"
        ><span class="i-mdi-download-multiple-outline" /><span
          ><strong>批量下载</strong><small>一次准备多份交付文件</small></span
        ></button
      ></nav
    >
    <div class="demo-content">
      <div class="file-tool-layout"
        ><div class="file-tool-main">
          <!-- 自定义下载区域 -->
          <NCard
            v-show="downloadMode === 'custom'"
            title="自定义下载"
            class="demo-card demo-section"
          >
            <template #header-extra>
              <span class="i-mdi-wrench-settings text-purple-500"></span>
            </template>

            <C_Form
              :model-value="customForm"
              @update:model-value="Object.assign(customForm, $event)"
              :options="customOptions"
              :config="customConfig"
            >
              <template #action="{ submit, submitting }">
                <NButton
                  type="primary"
                  :loading="submitting"
                  :disabled="!customForm.fileName || !customForm.fileType"
                  @click="submit"
                >
                  <template #icon
                    ><span class="i-mdi-cloud-download-outline"
                  /></template>
                  自定义下载
                </NButton>
              </template>
            </C_Form>
          </NCard>

          <!-- 批量下载区域 -->
          <NCard
            v-show="downloadMode === 'batch'"
            title="批量下载"
            class="demo-card demo-section"
          >
            <template #header-extra>
              <span class="i-mdi-folder text-green-500"></span>
            </template>

            <div class="batch-controls">
              <NCheckboxGroup v-model:value="selectedFiles">
                <div class="checkbox-grid">
                  <NCheckbox
                    v-for="file in batchFiles"
                    :key="file.key"
                    :value="file.key"
                    :label="file.label"
                  />
                </div>
              </NCheckboxGroup>

              <div class="batch-actions">
                <C_ActionBar :actions="batchActions" />
              </div>
            </div>
          </NCard> </div
        ><aside class="file-output"
          ><h2>下载说明</h2
          ><span class="file-output__icon i-mdi-cloud-download-outline" /><h3>{{
            downloadMode === 'custom'
              ? customForm.fileName || '为文件起个名字'
              : `已选择 ${selectedFiles.length} 份文件`
          }}</h3
          ><p>{{
            downloadMode === 'custom'
              ? '按选定格式生成文件，输入的参数用于本地演示。'
              : '各文件会分别触发浏览器下载；请选择需要的内容后执行。'
          }}</p
          ><ul
            ><li><span class="i-mdi-check-circle-outline" />真实文件下载</li
            ><li
              ><span
                class="i-mdi-shield-check-outline"
              />演示数据，不连接业务后台</li
            ></ul
          ><p
            >下载完成后，可在浏览器下载列表查看。历史仅保留当前页面最近 10
            次操作。</p
          ></aside
        ></div
      >
      <!-- 下载历史 -->
      <NCard
        title="下载历史"
        class="file-history"
      >
        <template #header-extra>
          <span class="i-mdi-clock-time-four-outline text-indigo-500"></span>
        </template>

        <C_Table
          :columns="historyColumns"
          :data="downloadHistory"
          :config="{
            toolbar: { show: false },
            pagination: {
              showSizePicker: false,
              showQuickJumper: false,
              pageSize: 5,
            },
            display: { striped: false, size: 'small' },
          }"
        />
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    PRESET_RULES,
    type FormConfig,
    type FormOption,
    type SubmitEventPayload,
  } from '@robot-admin/naive-ui-components/C_Form'
  defineOptions({ name: 'Demo19DownloadAll' })
  import { setupFileUtils } from '@/plugins/file-utils'
  import {
    useDownload,
    useDownloadExcel,
    useDownloadCSV,
    useDownloadPDF,
    useDownloadJSON,
    FileType,
    getSupportedFileTypes,
    type DownloadConfig,
  } from '@robot-admin/file-utils'

  import {
    createMockApi,
    batchFiles,
    historyColumns,
    type HistoryItem,
  } from './data'

  setupFileUtils()
  const message = useMessage()
  const downloadMode = ref('custom')

  // 加载状态
  const loading = reactive({
    excel: false,
    csv: false,
    pdf: false,
    json: false,
    batch: false,
  })

  // 自定义下载表单
  const customForm = reactive({
    fileName: '',
    fileType: FileType.XLSX,
    showNotification: true,
    paramsJson: '',
  })

  // 批量下载选中文件
  const selectedFiles = ref<string[]>([])

  // 下载历史
  const downloadHistory = ref<HistoryItem[]>([])

  /**
   * * @description 文件类型选项配置
   * ! @return 文件类型选项数组
   */
  const fileTypeOptions = computed(() =>
    getSupportedFileTypes().map(type => ({
      label: type.label,
      value: type.value,
    }))
  )

  const customOptions = computed<FormOption<typeof customForm>[]>(() => [
    {
      prop: 'fileName',
      label: '文件名称',
      type: 'input',
      placeholder: '请输入文件名称',
      attrs: { clearable: true },
      rules: [PRESET_RULES.required('文件名称')],
    },
    {
      prop: 'fileType',
      label: '文件类型',
      type: 'select',
      placeholder: '请选择文件类型',
      children: fileTypeOptions.value,
      attrs: { clearable: true },
      rules: [PRESET_RULES.required('文件类型', 'change')],
    },
    { prop: 'showNotification', label: '显示通知', type: 'switch' },
    {
      prop: 'paramsJson',
      label: '自定义参数',
      type: 'textarea',
      placeholder: '例如: {"category": "report", "format": "detailed"}',
      attrs: { rows: 3 },
      rules: [
        {
          trigger: 'blur',
          validator: (_rule: unknown, value: string) => {
            try {
              if (value.trim()) JSON.parse(value)
              return true
            } catch {
              return new Error('参数格式错误，请输入有效的 JSON')
            }
          },
        },
      ],
    },
  ])
  const customConfig: FormConfig<typeof customForm> = {
    labelPlacement: 'top',
    labelWidth: 120,
    onSubmit: handleCustomDownload,
  }

  /**
   * * @description 快捷下载按钮配置
   * ! @return 按钮操作配置数组
   */
  const quickDownloadActions = computed(() => [
    {
      label: '下载 Excel',
      type: 'primary' as const,
      icon: 'mdi:microsoft-excel',
      loading: loading.excel,
      onClick: handleDownloadExcel,
    },
    {
      label: '下载 CSV',
      type: 'success' as const,
      icon: 'mdi:file-csv-outline',
      loading: loading.csv,
      onClick: handleDownloadCSV,
    },
    {
      label: '下载 PDF',
      type: 'error' as const,
      icon: 'mdi:file-pdf-box',
      loading: loading.pdf,
      onClick: handleDownloadPDF,
    },
    {
      label: '下载 JSON',
      type: 'info' as const,
      icon: 'mdi:code-json',
      loading: loading.json,
      onClick: handleDownloadJSON,
    },
  ])

  /** 批量下载操作按钮 */
  const batchActions = computed(() => [
    {
      label: `批量下载 (${selectedFiles.value.length})`,
      type: 'primary' as const,
      icon: 'mdi:download-multiple-outline',
      loading: loading.batch,
      disabled: selectedFiles.value.length === 0,
      onClick: handleBatchDownload,
    },
    {
      label: '全选',
      type: 'info' as const,
      buttonProps: { quaternary: true },
      onClick: selectAllFiles,
    },
    {
      label: '清空',
      type: 'warning' as const,
      buttonProps: { quaternary: true },
      onClick: clearSelection,
    },
  ])

  /**
   * * @description 添加下载历史记录
   * ? @param fileName - 文件名
   * ? @param fileType - 文件类型
   * ? @param status - 下载状态
   */
  const addDownloadHistory = (
    fileName: string,
    fileType: string,
    status: 'success' | 'failed'
  ) => {
    downloadHistory.value.unshift({
      id: Date.now().toString(),
      fileName,
      fileType,
      status,
      downloadTime: new Date().toLocaleString('zh-CN'),
    })

    // 保持最新 10 条记录
    if (downloadHistory.value.length > 10) {
      downloadHistory.value = downloadHistory.value.slice(0, 10)
    }
  }

  /**
   * * @description 执行下载并处理状态
   * ? @param downloadFn - 下载函数
   * ? @param fileName - 文件名
   * ? @param fileType - 文件类型
   * ? @param loadingKey - 加载状态键
   */
  const executeDownload = async (
    downloadFn: () => Promise<unknown>,
    fileName: string,
    fileType: string,
    loadingKey: keyof typeof loading
  ) => {
    loading[loadingKey] = true
    try {
      await downloadFn()
      addDownloadHistory(fileName, fileType, 'success')
    } catch {
      addDownloadHistory(fileName, fileType, 'failed')
    } finally {
      loading[loadingKey] = false
    }
  }

  /**
   * * @description 下载Excel文件
   */
  async function handleDownloadExcel() {
    await executeDownload(
      () =>
        useDownloadExcel(createMockApi('excel'), '用户数据报表', {
          format: 'detailed',
          date: new Date().toISOString().split('T')[0],
        }),
      '用户数据报表.xlsx',
      'XLSX',
      'excel'
    )
  }

  /**
   * * @description 下载CSV文件
   */
  async function handleDownloadCSV() {
    await executeDownload(
      () => useDownloadCSV(createMockApi('csv'), '订单统计'),
      '订单统计.csv',
      'CSV',
      'csv'
    )
  }

  /**
   * * @description 下载PDF文件
   */
  async function handleDownloadPDF() {
    await executeDownload(
      () => useDownloadPDF(createMockApi('pdf'), '商品清单'),
      '商品清单.pdf',
      'PDF',
      'pdf'
    )
  }

  /**
   * * @description 下载JSON文件
   */
  async function handleDownloadJSON() {
    await executeDownload(
      () => useDownloadJSON(createMockApi('json'), '配置信息'),
      '配置信息.json',
      'JSON',
      'json'
    )
  }

  /**
   * * @description 自定义下载处理
   */
  async function handleCustomDownload({
    model,
  }: SubmitEventPayload<typeof customForm>) {
    try {
      let params = {}
      if (model.paramsJson.trim()) {
        try {
          params = JSON.parse(model.paramsJson)
        } catch {
          throw new Error('参数格式错误，请输入有效的 JSON')
        }
      }

      const config: DownloadConfig = {
        fileName: model.fileName,
        fileType: model.fileType,
        params,
        showNotification: model.showNotification,
        notificationConfig: {
          loading: `正在生成 ${model.fileName} 文件...`,
          success: `${model.fileName} 下载完成！`,
          error: `${model.fileName} 下载失败`,
        },
      }

      await useDownload(createMockApi('custom'), config)
      addDownloadHistory(
        model.fileName + model.fileType,
        model.fileType.toUpperCase().substring(1),
        'success'
      )
    } catch (error) {
      addDownloadHistory(
        model.fileName + model.fileType,
        model.fileType.toUpperCase().substring(1),
        'failed'
      )
      throw error
    }
  }

  /**
   * * @description 批量下载处理
   */
  async function handleBatchDownload() {
    loading.batch = true
    try {
      const downloadPromises = selectedFiles.value.map(async fileKey => {
        const file = batchFiles.find(f => f.key === fileKey)
        if (!file) return

        const fileType = file.label.split('.').pop()?.toLowerCase() || 'txt'
        const fileName = file.label.split('.')[0]

        await useDownload(createMockApi(fileKey), {
          fileName,
          fileType: `.${fileType}` as FileType,
          showNotification: false,
        })

        addDownloadHistory(file.label, fileType.toUpperCase(), 'success')
      })

      await Promise.all(downloadPromises)
      message.success(`批量下载完成，共 ${selectedFiles.value.length} 个文件`)
    } catch {
      message.error('批量下载失败')
    } finally {
      loading.batch = false
    }
  }

  /**
   * * @description 全选文件
   */
  const selectAllFiles = () => {
    selectedFiles.value = batchFiles.map(f => f.key)
  }

  /**
   * * @description 清空选择
   */
  const clearSelection = () => {
    selectedFiles.value = []
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
