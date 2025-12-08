/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-23 10:10:21
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-23 13:58:51
 * @FilePath: \Robot_Admin\src\hooks\useJsZip\index.ts
 * @Description: 基于JSZip的文件压缩导出Hook
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// ==================== 简化的类型定义 ====================
export interface ExportState {
  loading: boolean
  progress: number
  currentFile: string
  lastResult: ExportResult | null
}

export interface ExportResult {
  success: boolean
  fileName: string
  fileCount: number
  message: string
}

// 代码项目配置
export interface CodeProjectConfig {
  projectName: string
  framework?: 'vue' | 'react' | 'nodejs' | 'vanilla'
  includeConfig?: boolean
  includeReadme?: boolean
  files: Array<{ path: string; content: string }>
}

// 报表配置
export interface ReportConfig {
  title: string
  format: 'excel' | 'csv' | 'json'
  data: Record<string, any>[]
  includeSummary?: boolean
}

// 媒体配置
export interface MediaConfig {
  packageName: string
  files: Array<{ name: string; file: File | Blob; category?: string }>
  organizeByCategory?: boolean
  includeMetadata?: boolean
}

// 模板配置
export interface TemplateConfig {
  libraryName: string
  templates: Array<{
    id: string
    name: string
    files: Record<string, string>
  }>
  bundleMode?: 'separate' | 'combined'
  includeDocumentation?: boolean
}

// 媒体文件夹类型定义
type MediaFolderType = 'image' | 'video' | 'audio' | 'other'

// 媒体文件夹映射接口
interface MediaFolders {
  image: JSZip
  video: JSZip
  audio: JSZip
  other: JSZip
}

/**
 * * @description JSZip Hook - 简化版本，提供文件压缩导出功能
 * ? @return JSZip Hook 实例
 * ! @return 包含各种导出方法和状态管理的对象
 */
export function useJSZip() {
  const message = useMessage()

  // ==================== 状态管理 ====================
  const state = ref<ExportState>({
    loading: false,
    progress: 0,
    currentFile: '',
    lastResult: null,
  })

  // ==================== 基础工具函数 ====================

  /**
   * * @description 创建新的 JSZip 实例
   * ! @return 新的 JSZip 实例
   */
  const createZip = () => new JSZip()

  /**
   * * @description 向压缩包添加文件
   * ? @param zip - JSZip 实例
   * ? @param fileName - 文件名
   * ? @param content - 文件内容
   * ! @return void
   */
  const addFile = (zip: JSZip, fileName: string, content: string | Blob) => {
    zip.file(fileName, content)
  }

  /**
   * * @description 在压缩包中创建文件夹
   * ? @param zip - JSZip 实例
   * ? @param folderName - 文件夹名称
   * ! @return 创建的文件夹对象
   */
  const createFolder = (zip: JSZip, folderName: string) =>
    zip.folder(folderName)!

  /**
   * * @description 更新导出进度
   * ? @param progress - 进度百分比 (0-100)
   * ? @param fileName - 当前处理的文件名
   * ! @return void
   */
  const updateProgress = (progress: number, fileName = '') => {
    state.value.progress = progress
    state.value.currentFile = fileName
  }

  /**
   * * @description 下载压缩包文件
   * ? @param zip - JSZip 实例
   * ? @param fileName - 下载的文件名
   * ! @return Promise<void>
   */
  const downloadZip = async (zip: JSZip, fileName: string) => {
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, fileName)
  }

  /**
   * * @description 显示导出结果消息
   * ? @param result - 导出结果对象
   * ! @return void
   */
  const showResult = (result: ExportResult) => {
    state.value.lastResult = result
    state.value.loading = false

    if (result.success) {
      message.success(result.message)
    } else {
      message.error(result.message)
    }
  }

  // ==================== 通用执行器 ====================
  /**
   * * @description 通用的导出执行器 - 减少重复代码
   * ? @param config - 配置对象
   * ? @param executor - 执行器函数
   * ? @param successMessage - 成功消息
   * ! @return Promise<ExportResult> 导出结果
   */
  const executeExport = async <T>(
    config: T,
    executor: (
      zip: JSZip,
      config: T
    ) => Promise<{ fileName: string; fileCount: number }>,
    successMessage: string
  ): Promise<ExportResult> => {
    state.value.loading = true
    updateProgress(0, '准备中...')

    try {
      const zip = createZip()
      const { fileName, fileCount } = await executor(zip, config)

      updateProgress(90, '生成压缩文件...')
      await downloadZip(zip, fileName)
      updateProgress(100)

      const result: ExportResult = {
        success: true,
        fileName,
        fileCount,
        message: successMessage,
      }

      showResult(result)
      return result
    } catch (error) {
      const result: ExportResult = {
        success: false,
        fileName: '',
        fileCount: 0,
        message: `导出失败: ${(error as Error).message}`,
      }

      showResult(result)
      return result
    }
  }

  // ==================== 场景实现 ====================

  /**
   * * @description 代码项目导出
   * ? @param config - 代码项目配置
   * ! @return Promise<ExportResult> 导出结果
   */
  const exportCodeProject = async (config: CodeProjectConfig) => {
    return executeExport(
      config,
      async (zip, cfg) => {
        // 创建项目结构
        const srcFolder = cfg.framework ? createFolder(zip, 'src') : zip

        // 添加代码文件
        cfg.files.forEach((file, index) => {
          addFile(srcFolder, file.path, file.content)
          updateProgress(10 + (index / cfg.files.length) * 60, file.path)
        })

        // 添加配置文件
        if (cfg.includeConfig) {
          const packageJson = createPackageJson(cfg)
          addFile(zip, 'package.json', JSON.stringify(packageJson, null, 2))
          updateProgress(75, 'package.json')
        }

        // 添加 README
        if (cfg.includeReadme) {
          const readme = createReadme(cfg)
          addFile(zip, 'README.md', readme)
          updateProgress(85, 'README.md')
        }

        return {
          fileName: `${cfg.projectName}.zip`,
          fileCount: cfg.files.length,
        }
      },
      `项目 ${config.projectName} 导出成功！`
    )
  }

  /**
   * * @description 报表导出
   * ? @param config - 报表配置
   * ! @return Promise<ExportResult> 导出结果
   */
  const exportReport = async (config: ReportConfig) => {
    return executeExport(
      config,
      async (zip, cfg) => {
        updateProgress(20, '处理数据...')

        // 生成主数据文件
        const content =
          cfg.format === 'csv'
            ? generateCSV(cfg.data)
            : JSON.stringify(cfg.data, null, 2)
        const ext = cfg.format === 'excel' ? 'csv' : cfg.format
        addFile(zip, `${cfg.title}.${ext}`, content)
        updateProgress(60, `${cfg.title}.${ext}`)

        // 生成摘要
        if (cfg.includeSummary) {
          const summary = {
            title: cfg.title,
            totalRecords: cfg.data.length,
            exportTime: new Date().toISOString(),
          }
          addFile(zip, 'summary.json', JSON.stringify(summary, null, 2))
          updateProgress(80, 'summary.json')
        }

        return {
          fileName: `${cfg.title}_report.zip`,
          fileCount: cfg.data.length,
        }
      },
      `报表 ${config.title} 导出成功！包含 ${config.data.length} 条数据`
    )
  }

  /**
   * * @description 媒体文件导出
   * ? @param config - 媒体配置
   * ! @return Promise<ExportResult> 导出结果
   */
  const exportMedia = async (config: MediaConfig) => {
    return executeExport(
      config,
      async (zip, cfg) => {
        // 创建分类文件夹
        const folders: MediaFolders | null = cfg.organizeByCategory
          ? {
              image: createFolder(zip, 'images'),
              video: createFolder(zip, 'videos'),
              audio: createFolder(zip, 'audios'),
              other: createFolder(zip, 'others'),
            }
          : null

        const mediaInfo: any[] = []

        // 处理文件
        for (let i = 0; i < cfg.files.length; i++) {
          const file = cfg.files[i]
          const category = (file.category || 'other') as MediaFolderType
          const targetFolder = folders
            ? folders[category] || folders.other
            : zip

          addFile(targetFolder, file.name, file.file)

          if (cfg.includeMetadata) {
            mediaInfo.push({
              name: file.name,
              size: file.file.size,
              type: file.file.type,
              category: file.category,
            })
          }

          updateProgress(20 + (i / cfg.files.length) * 60, file.name)
        }

        // 添加元数据
        if (cfg.includeMetadata && mediaInfo.length) {
          addFile(zip, 'media-info.json', JSON.stringify(mediaInfo, null, 2))
        }

        return {
          fileName: `${cfg.packageName}.zip`,
          fileCount: cfg.files.length,
        }
      },
      `媒体包 ${config.packageName} 导出成功！`
    )
  }

  /**
   * * @description 模板库导出
   * ? @param config - 模板配置
   * ! @return Promise<ExportResult> 导出结果
   */
  const exportTemplates = async (config: TemplateConfig) => {
    return executeExport(
      config,
      async (zip, cfg) => {
        if (cfg.bundleMode === 'separate') {
          // 分离模式
          cfg.templates.forEach((template, index) => {
            const folder = createFolder(zip, template.name)
            Object.entries(template.files).forEach(([path, content]) => {
              addFile(folder, path, content)
            })
            updateProgress(
              20 + (index / cfg.templates.length) * 60,
              template.name
            )
          })
        } else {
          // 合并模式
          cfg.templates.forEach(template => {
            Object.entries(template.files).forEach(([path, content]) => {
              addFile(zip, `${template.name}/${path}`, content)
            })
          })
        }

        // 生成文档
        if (cfg.includeDocumentation) {
          const docs = createTemplateDoc(cfg)
          addFile(zip, 'README.md', docs)
          updateProgress(85, 'README.md')
        }

        return {
          fileName: `${cfg.libraryName}_templates.zip`,
          fileCount: cfg.templates.length,
        }
      },
      `模板库 ${config.libraryName} 导出成功！`
    )
  }

  // ==================== 辅助函数 ====================

  /**
   * * @description 创建 package.json 文件内容
   * ? @param config - 代码项目配置
   * ! @return package.json 对象
   */
  function createPackageJson(config: CodeProjectConfig) {
    const deps = {
      vue: { vue: '^3.4.0' },
      react: { react: '^18.0.0' },
      nodejs: { express: '^4.18.0' },
      vanilla: {},
    }

    return {
      name: config.projectName,
      version: '1.0.0',
      dependencies: deps[config.framework || 'vanilla'],
    }
  }

  /**
   * * @description 创建 README.md 文件内容
   * ? @param config - 代码项目配置
   * ! @return README.md 内容字符串
   */
  function createReadme(config: CodeProjectConfig) {
    return `# ${config.projectName}

## 技术栈
${config.framework ? `- ${config.framework}` : '- Vanilla JavaScript'}

## 安装
\`\`\`bash
npm install
\`\`\`

## 使用
\`\`\`bash
npm run dev
\`\`\`

生成时间: ${new Date().toLocaleString()}`
  }

  /**
   * * @description 将数据转换为 CSV 格式
   * ? @param data - 数据数组
   * ! @return CSV 格式字符串
   */
  function generateCSV(data: any[]) {
    if (!data.length) return ''

    const headers = Object.keys(data[0])
    const rows = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h]).join(',')),
    ]
    return rows.join('\n')
  }

  /**
   * * @description 创建模板文档内容
   * ? @param config - 模板配置
   * ! @return 模板文档内容字符串
   */
  function createTemplateDoc(config: TemplateConfig) {
    return `# ${config.libraryName}

## 包含模板
${config.templates.map(t => `- ${t.name}`).join('\n')}

## 使用方法
1. 解压到目标目录
2. 选择需要的模板
3. 根据文档配置

生成时间: ${new Date().toLocaleString()}`
  }

  // ==================== 返回接口 ====================
  return {
    // 基础能力
    createZip,
    addFile,
    createFolder,
    downloadZip,

    // 状态
    state: computed(() => state.value),

    // 场景能力
    exportCodeProject,
    exportReport,
    exportMedia,
    exportTemplates,
  }
}

export default useJSZip
