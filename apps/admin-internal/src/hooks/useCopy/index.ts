/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-12 08:27:36
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-23 15:05:21
 * @FilePath: \Robot_Admin\src\hooks\useCopy\index.ts
 * @Description: 基于 Clipboard API 封装的 useCopy Hooks
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// ==================== 类型定义 ====================

export type CopyDataType =
  | 'text'
  | 'url'
  | 'email'
  | 'phone'
  | 'json'
  | 'html'
  | 'markdown'
  | 'csv'
  | 'code'

export interface CopyOptions {
  successTip?: string
  errorTip?: string
  showMessage?: boolean
  dataType?: CopyDataType
  formatData?: boolean
  formatter?: (data: any) => string
  onSuccess?: (text: string) => void
  onError?: (error: Error) => void
}

export interface CopyState {
  loading: boolean
  lastCopied: string
  copyCount: number
  lastCopyTime: Date | null
  isSupported: boolean
}

export interface CopyResult {
  success: boolean
  text: string
  error?: string
  method: 'native-api' | 'legacy-fallback'
}

// ==================== 浏览器支持检测 ====================

/**
 * 检测当前环境对 Clipboard API 的支持情况
 */
const detectClipboardSupport = () => {
  // 检查基本的 Clipboard API 支持
  const hasClipboard = 'clipboard' in navigator
  const hasWriteText = hasClipboard && 'writeText' in navigator.clipboard
  const hasReadText = hasClipboard && 'readText' in navigator.clipboard

  // 检查是否在安全上下文中（HTTPS 或 localhost）
  const isSecureContext =
    window.isSecureContext ||
    location.protocol === 'https:' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1'

  return {
    hasClipboard,
    hasWriteText,
    hasReadText,
    isSecureContext,
    isSupported: hasWriteText && isSecureContext,
  }
}

// ==================== 数据格式化器 ====================

const dataFormatters: Record<CopyDataType, (data: any) => string> = {
  text: (data: any) => String(data),

  url: (data: any) => {
    const url = String(data).trim()
    if (!url) return ''
    // 智能添加协议
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`
    }
    return url
  },

  email: (data: any) => {
    const email = String(data).trim()
    // 简单的邮箱格式验证
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn('Invalid email format:', email)
    }
    return email
  },

  phone: (data: any) => {
    const phone = String(data).replace(/[^\d+\-\s()]/g, '')
    // 中国手机号格式化
    if (/^\d{11}$/.test(phone.replace(/\D/g, ''))) {
      const cleaned = phone.replace(/\D/g, '')
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
    }
    return phone
  },

  json: (data: any) => {
    try {
      if (typeof data === 'string') {
        // 验证是否为有效 JSON
        JSON.parse(data)
        return data
      }
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.warn('Invalid JSON data:', error)
      return String(data)
    }
  },

  html: (data: any) => {
    if (typeof data === 'object') {
      const jsonStr = JSON.stringify(data, null, 2)
      return `<pre><code>${jsonStr.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    }
    return String(data)
  },

  markdown: (data: any) => {
    if (typeof data === 'object') {
      const jsonStr = JSON.stringify(data, null, 2)
      return `\`\`\`json\n${jsonStr}\n\`\`\``
    }
    const text = String(data)
    // 如果包含特殊字符，用代码块包裹
    if (/[`*_[\]()#+-]/.test(text)) {
      return `\`${text}\``
    }
    return text
  },

  csv: (data: any) => {
    if (Array.isArray(data) && data.length > 0) {
      // 确保所有对象都有相同的键
      const allKeys = new Set<string>()
      data.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => allKeys.add(key))
        }
      })

      const headers = Array.from(allKeys)
      const csvHeaders = headers.map(h => `"${h}"`).join(',')
      const csvRows = data.map(row =>
        headers
          .map(header => {
            const value = row && typeof row === 'object' ? row[header] : ''
            return `"${String(value || '').replace(/"/g, '""')}"`
          })
          .join(',')
      )

      return [csvHeaders, ...csvRows].join('\n')
    }
    return String(data)
  },

  code: (data: any) => {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2)
    }
    return String(data).trim()
  },
}

// ==================== 主要 Hook ====================

/**
 * @description:  基于原生 Clipboard API 的现代化复制工具
 * @param {CopyOptions} defaultOptions 默认选项
 * @return {*} 复制方法
 */
export function useCopy(defaultOptions: CopyOptions = {}) {
  const message = useMessage()

  // 检测浏览器支持
  const clipboardSupport = detectClipboardSupport()

  // ==================== 状态管理 ====================
  const state = ref<CopyState>({
    loading: false,
    lastCopied: '',
    copyCount: 0,
    lastCopyTime: null,
    isSupported: clipboardSupport.isSupported,
  })

  // ==================== 计算属性 ====================
  const canCopy = computed(
    () =>
      state.value.isSupported ||
      (typeof document !== 'undefined' && document.execCommand)
  )

  const recentlyCopied = computed(() => {
    if (!state.value.lastCopyTime) return false
    const timeDiff = Date.now() - state.value.lastCopyTime.getTime()
    return timeDiff < 2000
  })

  // ==================== 工具函数 ====================

  const formatCopyData = (data: any, options: CopyOptions): string => {
    if (options.formatter) {
      return options.formatter(data)
    }

    if (options.dataType && options.formatData !== false) {
      const formatter = dataFormatters[options.dataType]
      return formatter ? formatter(data) : String(data)
    }

    return String(data)
  }

  const showToast = (
    type: 'success' | 'error',
    content: string,
    options: CopyOptions
  ): void => {
    if (options.showMessage === false) return

    const messageMap = {
      success:
        options.successTip ||
        `复制成功: ${content.slice(0, 30)}${content.length > 30 ? '...' : ''}`,
      error: options.errorTip || '复制失败，请重试',
    }

    message[type](messageMap[type])
  }

  const updateState = (text: string): void => {
    state.value.lastCopied = text
    state.value.copyCount++
    state.value.lastCopyTime = new Date()
  }

  // ==================== 复制方法 ====================

  /**
   * 使用原生 Clipboard API 复制
   */
  const copyWithNativeAPI = async (text: string): Promise<CopyResult> => {
    try {
      await navigator.clipboard.writeText(text)
      return {
        success: true,
        text,
        method: 'native-api',
      }
    } catch (error) {
      // 处理权限被拒绝的情况
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          throw new Error('复制功能被浏览器阻止，请检查权限设置')
        }
        if (error.name === 'NotSupportedError') {
          throw new Error('当前浏览器不支持复制功能')
        }
      }
      throw new Error(`复制失败: ${(error as Error).message}`)
    }
  }

  /**
   * 降级方案：使用 execCommand
   */
  const copyWithLegacyMethod = async (text: string): Promise<CopyResult> => {
    return new Promise((resolve, reject) => {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text

        // 设置样式使其不可见但可操作
        Object.assign(textArea.style, {
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          opacity: '0',
          pointerEvents: 'none',
        })

        document.body.appendChild(textArea)

        // 选择文本
        textArea.focus()
        textArea.select()
        textArea.setSelectionRange(0, text.length)

        // 执行复制
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)

        if (successful) {
          resolve({
            success: true,
            text,
            method: 'legacy-fallback',
          })
        } else {
          reject(new Error('execCommand 复制失败'))
        }
      } catch (error) {
        reject(new Error(`降级复制失败: ${(error as Error).message}`))
      }
    })
  }

  // ==================== 主要方法 ====================

  const copy = async (
    data: any,
    options: CopyOptions = {}
  ): Promise<CopyResult> => {
    if (!canCopy.value) {
      const error = new Error('当前环境不支持复制功能')
      options.onError?.(error)
      throw error
    }

    state.value.loading = true

    try {
      const mergedOptions = { ...defaultOptions, ...options }
      const text = formatCopyData(data, mergedOptions)

      let result: CopyResult

      // 优先使用原生 API
      if (clipboardSupport.isSupported) {
        try {
          result = await copyWithNativeAPI(text)
        } catch (error) {
          console.warn('原生 Clipboard API 失败，尝试降级方案:', error)
          result = await copyWithLegacyMethod(text)
        }
      } else {
        // 直接使用降级方案
        result = await copyWithLegacyMethod(text)
      }

      updateState(text)
      showToast('success', text, mergedOptions)
      mergedOptions.onSuccess?.(text)

      return result
    } catch (error) {
      const copyError = error as Error
      showToast('error', copyError.message, options)
      options.onError?.(copyError)

      return {
        success: false,
        text: '',
        error: copyError.message,
        method: state.value.isSupported ? 'native-api' : 'legacy-fallback',
      }
    } finally {
      state.value.loading = false
    }
  }

  // ==================== 便捷方法 ====================

  const copyText = async (text: string, tip?: string): Promise<CopyResult> => {
    return copy(text, {
      dataType: 'text',
      successTip: tip,
    })
  }

  const copyJSON = async (data: any, formatted = true): Promise<CopyResult> => {
    return copy(data, {
      dataType: 'json',
      formatData: formatted,
      successTip: 'JSON 数据复制成功',
    })
  }

  const copyURL = async (url: string): Promise<CopyResult> => {
    return copy(url, {
      dataType: 'url',
      successTip: '链接复制成功',
    })
  }

  const copyCode = async (
    code: string,
    language?: string
  ): Promise<CopyResult> => {
    return copy(code, {
      dataType: 'code',
      successTip: `${language || ''}代码复制成功`,
    })
  }

  // ==================== 高级功能 ====================

  /**
   * 读取剪贴板内容（需要用户权限）
   */
  const readClipboard = async (): Promise<string> => {
    if (!clipboardSupport.hasReadText) {
      throw new Error('当前浏览器不支持读取剪贴板')
    }

    try {
      const text = await navigator.clipboard.readText()
      return text
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        throw new Error('读取剪贴板权限被拒绝')
      }
      throw new Error(`读取剪贴板失败: ${(error as Error).message}`)
    }
  }

  /**
   * 复制富文本（HTML）
   */
  const copyRichText = async (
    html: string,
    plainText?: string
  ): Promise<CopyResult> => {
    if (!clipboardSupport.isSupported) {
      // 降级到纯文本复制
      return copyText(plainText || html.replace(/<[^>]*>/g, ''))
    }

    try {
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText || html.replace(/<[^>]*>/g, '')], {
          type: 'text/plain',
        }),
      })

      await navigator.clipboard.write([clipboardItem])

      updateState(html)
      return {
        success: true,
        text: html,
        method: 'native-api',
      }
    } catch (error) {
      throw new Error(`富文本复制失败: ${(error as Error).message}`)
    }
  }

  const clearHistory = (): void => {
    state.value.lastCopied = ''
    state.value.copyCount = 0
    state.value.lastCopyTime = null
  }

  const checkSupport = (): typeof clipboardSupport => {
    return clipboardSupport
  }

  // ==================== 返回接口 ====================
  return {
    // 状态
    state: computed(() => state.value),
    canCopy,
    recentlyCopied,

    // 核心方法
    copy,

    // 便捷方法
    copyText,
    copyJSON,
    copyURL,
    copyCode,

    // 高级功能
    readClipboard,
    copyRichText,

    // 工具方法
    clearHistory,
    checkSupport,

    // 格式化器
    formatters: dataFormatters,
  }
}

export default useCopy
