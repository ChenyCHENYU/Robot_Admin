/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\demo\19-download-all\useDownloadDemo.ts
 * @Description: 快捷、定制与批量下载共享格式、下载执行和历史
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  FileType,
  useDownload,
  sanitizeFileName,
  type DownloadConfig,
} from '@robot-admin/file-utils'
import { defineActions } from '@robot-admin/naive-ui-components/C_ActionBar'
import {
  PRESET_RULES,
  defineFormConfig,
  defineFormOptions,
} from '@robot-admin/naive-ui-components/C_Form'
import {
  BATCH_DOWNLOAD_TYPES,
  DOWNLOAD_FORMATS,
  FORM_DOWNLOAD_TYPES,
  createMockApi,
  type DemoFileType,
  type HistoryItem,
} from './data'

interface DownloadForm {
  fileName: string
  fileType: DemoFileType | null
  showNotification: boolean
  paramsJson: string
}

type DownloadPlan = DownloadConfig & { fileType: DemoFileType }

const parseParams = (text: string): Record<string, unknown> => {
  if (!text.trim()) return {}
  const value: unknown = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('只接受 JSON 对象')
  }
  return value as Record<string, unknown>
}

export const CUSTOM_DOWNLOAD_FIELDS = defineFormOptions<DownloadForm>([
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
    children: FORM_DOWNLOAD_TYPES,
    attrs: { clearable: true },
    rules: [PRESET_RULES.required('文件类型', 'change')],
  },
  { prop: 'showNotification', label: '显示通知', type: 'switch' },
  {
    prop: 'paramsJson',
    label: '自定义参数',
    type: 'textarea',
    placeholder: '例如：{"category": "report"}',
    attrs: { rows: 3 },
    rules: [
      {
        trigger: 'blur',
        validator: (_rule: unknown, value: string) => {
          try {
            parseParams(value)
            return true
          } catch {
            return new Error('参数格式错误，请输入有效的 JSON')
          }
        },
      },
    ],
  },
])

/** 下载格式由页面选择，实际文件名与结果由文件工具统一返回。 */
export function useDownloadDemo() {
  const message = useMessage()
  const form = ref<DownloadForm>({
    fileName: '',
    fileType: FileType.XLSX,
    showNotification: true,
    paramsJson: '',
  })
  const pending = reactive(new Set<DemoFileType>())
  const batchBusy = ref(false)
  const selected = ref<DemoFileType[]>([])
  const history = ref<HistoryItem[]>([])
  let nextId = 0

  const record = (
    fileName: string,
    fileType: DemoFileType,
    status: HistoryItem['status']
  ) => {
    history.value.unshift({
      id: ++nextId,
      fileName,
      fileType: DOWNLOAD_FORMATS[fileType].extension,
      status,
      downloadTime: new Date().toLocaleString('zh-CN'),
    })
    if (history.value.length > 10) history.value.pop()
  }
  const execute = async (plan: DownloadPlan) => {
    try {
      const result = await useDownload(createMockApi(plan.fileType), plan)
      record(result.fileName, plan.fileType, 'success')
    } catch (error) {
      const expectedName = plan.fileName.toLowerCase().endsWith(plan.fileType)
        ? plan.fileName
        : plan.fileName + plan.fileType
      record(sanitizeFileName(expectedName), plan.fileType, 'failed')
      throw error
    }
  }
  const downloadQuick = async (fileType: DemoFileType) => {
    if (pending.has(fileType)) return
    pending.add(fileType)
    try {
      await execute({ fileName: DOWNLOAD_FORMATS[fileType].name, fileType })
    } catch {
      // 文件工具已显示失败，下载历史记录失败状态。
    } finally {
      pending.delete(fileType)
    }
  }
  const downloadBatch = async () => {
    if (batchBusy.value || !selected.value.length) return
    batchBusy.value = true
    const types = [...selected.value]
    try {
      const results = await Promise.allSettled(
        types.map(fileType =>
          execute({
            fileType,
            fileName: DOWNLOAD_FORMATS[fileType].name,
            showNotification: false,
          })
        )
      )
      const failed = results.filter(
        result => result.status === 'rejected'
      ).length
      if (failed)
        message.warning(
          `已下载 ${types.length - failed} 个文件，失败 ${failed} 个`
        )
      else message.success(`批量下载完成，共 ${types.length} 个文件`)
    } finally {
      batchBusy.value = false
    }
  }
  const formConfig = defineFormConfig<DownloadForm>({
    labelPlacement: 'top',
    labelWidth: 120,
    onSubmit: ({ model }, context) => {
      if (!model.fileType) throw new Error('请选择文件类型')
      return execute({
        fileType: model.fileType,
        fileName: model.fileName,
        showNotification: model.showNotification,
        params: parseParams(model.paramsJson),
        signal: context?.signal,
      })
    },
  })
  const batchActions = computed(() =>
    defineActions([
      {
        key: 'download-batch',
        label: `批量下载 (${selected.value.length})`,
        type: 'primary',
        icon: 'mdi:download-multiple-outline',
        disabled: () => !selected.value.length,
        loading: batchBusy,
        onClick: downloadBatch,
      },
      {
        key: 'select-all',
        label: '全选',
        type: 'info',
        buttonProps: { quaternary: true },
        onClick: () => {
          selected.value = [...BATCH_DOWNLOAD_TYPES]
        },
      },
      {
        key: 'clear',
        label: '清空',
        type: 'warning',
        buttonProps: { quaternary: true },
        onClick: () => {
          selected.value = []
        },
      },
    ])
  )
  return proxyRefs({
    form,
    formConfig,
    selected,
    history,
    pending,
    batchActions,
    downloadQuick,
  })
}
