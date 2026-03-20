/**
 * @Description: 文件预览演示页 - 静态数据
 */

// ================= 场景配置 =================
export interface ScenarioConfig {
  id: string
  title: string
  description: string
  icon: string
}

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'upload',
    title: '文件上传预览',
    description: '上传本地文件进行预览',
    icon: 'ic:outline-cloud-upload',
  },
  {
    id: 'url',
    title: 'URL文件预览',
    description: '通过URL加载远程文件',
    icon: 'ic:outline-link',
  },
  {
    id: 'batch',
    title: '批量文件预览',
    description: '同时预览多个文件',
    icon: 'ic:outline-folder-open',
  },
  {
    id: 'config',
    title: '配置选项',
    description: '自定义预览组件配置',
    icon: 'ic:outline-settings',
  },
]

// ================= 预设 URL =================
export interface PresetUrl {
  name: string
  url: string
  type: 'error' | 'success' | 'info'
  icon: string
}

export const PRESET_URLS: PresetUrl[] = [
  {
    name: '本地PDF示例',
    url: '/demo-files/sample.pdf',
    type: 'error',
    icon: 'ic:outline-picture-as-pdf',
  },
  {
    name: '本地Excel示例',
    url: '/demo-files/sample.xlsx',
    type: 'success',
    icon: 'ic:outline-grid-on',
  },
  {
    name: '本地Word示例',
    url: '/demo-files/sample.docx',
    type: 'info',
    icon: 'ic:outline-description',
  },
]

// ================= 配置选项文件 =================
export interface FileOption {
  url: string
  name: string
}

export const CONFIG_FILE_OPTIONS: Array<{
  label: string
  value: FileOption
}> = [
  {
    label: 'PDF文档',
    value: { url: '/demo-files/sample.pdf', name: 'sample.pdf' },
  },
  {
    label: 'Excel表格',
    value: { url: '/demo-files/sample.xlsx', name: 'sample.xlsx' },
  },
]
