<template>
  <div class="download-demo">
    <NH1 class="demo-title"> 下载 All - [useDownload] 场景示例 </NH1>
    <p class="mb-20px"> 展示支持多种文件类型的通用下载钩子函数使用方法 </p>
    <div class="demo-content">
      <!-- 快捷下载区域 -->
      <NCard
        title="快捷下载"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi:flash-outline text-yellow-500"></span>
        </template>

        <div class="button-grid">
          <NButton
            v-for="(item, key) in quickDownloadButtons"
            :key="key"
            :type="item.type"
            :loading="loading[key]"
            @click="item.handler"
          >
            <template #icon>
              <span :class="item.icon"></span>
            </template>
            {{ item.label }}
          </NButton>
        </div>
      </NCard>

      <!-- 自定义下载区域 -->
      <NCard
        title="自定义下载"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi:wrench-settings text-purple-500"></span>
        </template>

        <NForm
          :model="customForm"
          label-placement="left"
          label-width="120"
        >
          <NFormItem label="文件名称">
            <NInput
              v-model:value="customForm.fileName"
              placeholder="请输入文件名称"
              clearable
            />
          </NFormItem>

          <NFormItem label="文件类型">
            <NSelect
              v-model:value="customForm.fileType"
              :options="fileTypeOptions"
              placeholder="请选择文件类型"
              clearable
            />
          </NFormItem>

          <NFormItem label="显示通知">
            <NSwitch v-model:value="customForm.showNotification" />
          </NFormItem>

          <NFormItem label="自定义参数">
            <NInput
              v-model:value="customForm.paramsJson"
              type="textarea"
              placeholder='例如: {"category": "report", "format": "detailed"}'
              :rows="3"
            />
          </NFormItem>

          <NFormItem>
            <NButton
              type="primary"
              :loading="loading.custom"
              :disabled="!customForm.fileName || !customForm.fileType"
              @click="handleCustomDownload"
            >
              <template #icon>
                <span class="i-mdi:cloud-download-outline"></span>
              </template>
              自定义下载
            </NButton>
          </NFormItem>
        </NForm>
      </NCard>

      <!-- 批量下载区域 -->
      <NCard
        title="批量下载"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi:folder text-green-500"></span>
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
      </NCard>

      <!-- 下载历史 -->
      <NCard
        title="下载历史"
        class="demo-card demo-section"
      >
        <template #header-extra>
          <span class="i-mdi:clock-time-four-outline text-indigo-500"></span>
        </template>

        <NDataTable
          :columns="historyColumns"
          :data="downloadHistory"
          :pagination="{ pageSize: 5 }"
          size="small"
        />
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    useDownload,
    useDownloadExcel,
    useDownloadCSV,
    useDownloadPDF,
    useDownloadJSON,
    FileType,
    getSupportedFileTypes,
    type DownloadConfig,
  } from '@/hooks/useDownload'
  import {
    createMockApi,
    batchFiles,
    historyColumns,
    type HistoryItem,
  } from './data'
  import './index.scss'
  import { createDiscreteApi } from 'naive-ui/es/discrete'

  // 创建 naive-ui 的离散 API
  const { message } = createDiscreteApi(['message'])

  // 加载状态
  const loading = reactive({
    excel: false,
    csv: false,
    pdf: false,
    json: false,
    custom: false,
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

  /**
   * * @description 快捷下载按钮配置
   * ! @return 按钮配置对象
   */
  const quickDownloadButtons = computed(() => ({
    excel: {
      type: 'primary' as const,
      icon: 'i-mdi:microsoft-excel',
      label: '下载 Excel',
      handler: handleDownloadExcel,
    },
    csv: {
      type: 'success' as const,
      icon: 'i-mdi:file-csv-outline',
      label: '下载 CSV',
      handler: handleDownloadCSV,
    },
    pdf: {
      type: 'error' as const,
      icon: 'i-mdi:file-pdf-box',
      label: '下载 PDF',
      handler: handleDownloadPDF,
    },
    json: {
      type: 'info' as const,
      icon: 'i-mdi:code-json',
      label: '下载 JSON',
      handler: handleDownloadJSON,
    },
  }))

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
    downloadFn: () => Promise<void>,
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
  async function handleCustomDownload() {
    loading.custom = true
    try {
      let params = {}
      if (customForm.paramsJson.trim()) {
        try {
          params = JSON.parse(customForm.paramsJson)
        } catch {
          throw new Error('参数格式错误，请输入有效的 JSON')
        }
      }

      const config: DownloadConfig = {
        fileName: customForm.fileName,
        fileType: customForm.fileType,
        params,
        showNotification: customForm.showNotification,
        notificationConfig: {
          loading: `正在生成 ${customForm.fileName} 文件...`,
          success: `${customForm.fileName} 下载完成！`,
          error: `${customForm.fileName} 下载失败`,
        },
      }

      await useDownload(createMockApi('custom'), config)
      addDownloadHistory(
        customForm.fileName + customForm.fileType,
        customForm.fileType.toUpperCase().substring(1),
        'success'
      )
    } catch {
      addDownloadHistory(
        customForm.fileName + customForm.fileType,
        customForm.fileType.toUpperCase().substring(1),
        'failed'
      )
    } finally {
      loading.custom = false
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
