/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-16 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\composables\QRCode\useQRCode.ts
 * @Description: 二维码核心渲染逻辑
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import QRCode from 'qrcode'
import type { Ref } from 'vue'
import type {
  ErrorCorrectionLevel,
  ExportType,
  LogoOptions,
  RenderMode,
} from '@/types/modules/qrcode'

interface UseQRCodeOptions {
  value: Ref<string>
  size: Ref<number>
  color: Ref<string>
  bgColor: Ref<string>
  errorCorrectionLevel: Ref<ErrorCorrectionLevel>
  margin: Ref<number>
  mode: Ref<RenderMode>
  logo: Ref<LogoOptions | undefined>
}

/**
 * 在 canvas 上绘制 Logo
 */
function drawLogo(
  canvas: HTMLCanvasElement,
  logo: LogoOptions,
  qrSize: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('Canvas context 不可用'))

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const ratio = logo.size ?? 0.2
      const logoSize = Math.floor(qrSize * ratio)
      const padding = logo.padding ?? 4
      const borderRadius = logo.borderRadius ?? 4

      const x = (canvas.width - logoSize) / 2
      const y = (canvas.height - logoSize) / 2

      // 绘制 Logo 背景
      ctx.save()
      const bgX = x - padding
      const bgY = y - padding
      const bgSize = logoSize + padding * 2
      const r = borderRadius + padding

      ctx.beginPath()
      ctx.moveTo(bgX + r, bgY)
      ctx.arcTo(bgX + bgSize, bgY, bgX + bgSize, bgY + bgSize, r)
      ctx.arcTo(bgX + bgSize, bgY + bgSize, bgX, bgY + bgSize, r)
      ctx.arcTo(bgX, bgY + bgSize, bgX, bgY, r)
      ctx.arcTo(bgX, bgY, bgX + bgSize, bgY, r)
      ctx.closePath()
      ctx.fillStyle = logo.bgColor ?? '#ffffff'
      ctx.fill()

      // 绘制 Logo 图片（带圆角）
      ctx.beginPath()
      ctx.moveTo(x + borderRadius, y)
      ctx.arcTo(x + logoSize, y, x + logoSize, y + logoSize, borderRadius)
      ctx.arcTo(x + logoSize, y + logoSize, x, y + logoSize, borderRadius)
      ctx.arcTo(x, y + logoSize, x, y, borderRadius)
      ctx.arcTo(x, y, x + logoSize, y, borderRadius)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(img, x, y, logoSize, logoSize)
      ctx.restore()

      resolve()
    }
    img.onerror = () => reject(new Error(`Logo 加载失败: ${logo.src}`))
    img.src = logo.src
  })
}

/**
 * 二维码渲染 composable
 * 支持 Canvas / SVG 双模式渲染 + Logo 叠加 + 多格式导出
 */
export function useQRCode(
  canvasRef: Ref<HTMLCanvasElement | null>,
  options: UseQRCodeOptions
) {
  const svgHtml = ref('')
  const error = ref<Error | null>(null)
  const loading = ref(false)

  // 有 Logo 时自动提升纠错等级
  const effectiveLevel = computed<ErrorCorrectionLevel>(() => {
    if (options.logo.value) {
      const level = options.errorCorrectionLevel.value
      if (level === 'L' || level === 'M') return 'Q'
      return level
    }
    return options.errorCorrectionLevel.value
  })

  const qrOptions = computed(() => ({
    width: options.size.value,
    margin: options.margin.value,
    errorCorrectionLevel: effectiveLevel.value,
    color: {
      dark: options.color.value,
      light: options.bgColor.value,
    },
  }))

  /**
   * 渲染 Canvas 模式
   */
  async function renderCanvas() {
    const canvas = canvasRef.value
    if (!canvas || !options.value.value) return

    await QRCode.toCanvas(canvas, options.value.value, qrOptions.value)

    if (options.logo.value) {
      await drawLogo(canvas, options.logo.value, options.size.value)
    }
  }

  /**
   * 渲染 SVG 模式
   */
  async function renderSvg() {
    if (!options.value.value) {
      svgHtml.value = ''
      return
    }

    const svgString = await QRCode.toString(options.value.value, {
      ...qrOptions.value,
      type: 'svg',
    })
    svgHtml.value = svgString
  }

  /**
   * 主渲染函数
   */
  async function render() {
    if (!options.value.value) return

    loading.value = true
    error.value = null

    try {
      if (options.mode.value === 'canvas') {
        await renderCanvas()
      } else {
        await renderSvg()
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      console.error('二维码渲染失败:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 导出为 DataURL
   */
  async function toDataURL(
    type: ExportType = 'png',
    quality = 0.92
  ): Promise<string> {
    if (type === 'svg') {
      // SVG 模式直接生成
      const svgStr = await QRCode.toString(options.value.value, {
        ...qrOptions.value,
        type: 'svg',
      })
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`
    }

    // 使用临时 Canvas 生成高保真图像
    const tempCanvas = document.createElement('canvas')
    await QRCode.toCanvas(tempCanvas, options.value.value, qrOptions.value)

    if (options.logo.value) {
      await drawLogo(tempCanvas, options.logo.value, options.size.value)
    }

    const mimeType = type === 'jpeg' ? 'image/jpeg' : 'image/png'
    return tempCanvas.toDataURL(mimeType, quality)
  }

  /**
   * 下载二维码
   */
  async function download(filename = 'qrcode', type: ExportType = 'png') {
    const dataUrl = await toDataURL(type)
    const link = document.createElement('a')
    link.download = `${filename}.${type}`
    link.href = dataUrl
    link.click()
  }

  // 监听所有依赖变化自动重渲染
  watch(
    [
      options.value,
      options.size,
      options.color,
      options.bgColor,
      options.errorCorrectionLevel,
      options.margin,
      options.mode,
      options.logo,
    ],
    () => render(),
    { deep: true }
  )

  return {
    svgHtml,
    error,
    loading,
    render,
    toDataURL,
    download,
  }
}
