import type { Graph } from '@antv/x6'
import html2canvas from 'html2canvas'
import { downloadBlob } from '@robot-admin/file-utils'

/**
 * 导出数据为 JSON 文件
 * @param data - 要导出的数据
 * @param filename - 文件名，默认 'diagram.json'
 */
export function exportJSON(data: any, filename = 'diagram.json'): void {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  downloadBlob(blob, filename)
}

/**
 * 导出图表为 PNG 图片（基于 html2canvas 截图方案）
 * @param graph - AntV X6 图表实例
 * @param filename - 文件名，默认 'diagram.png'
 * @param options - 导出选项
 */
export async function exportPNG(
  graph: Graph,
  filename = 'diagram.png',
  options: { backgroundColor?: string; scale?: number } = {}
): Promise<void> {
  const { backgroundColor = '#ffffff', scale = 2 } = options
  const { container } = graph

  const canvas = await html2canvas(container, {
    backgroundColor,
    scale,
    useCORS: true,
    logging: false,
  })

  const blob = await canvasToBlob(canvas, 'image/png')
  downloadBlob(blob, filename)
}

/**
 * 导出图表为 SVG 矢量图（从容器内 SVG 元素序列化）
 * @param graph - AntV X6 图表实例
 * @param filename - 文件名，默认 'diagram.svg'
 */
export function exportSVG(graph: Graph, filename = 'diagram.svg'): void {
  const svgElement = graph.container.querySelector('svg')
  if (!svgElement) {
    throw new Error('SVG导出失败: 未找到图表 SVG 元素')
  }

  // 克隆以避免修改原始 DOM
  const cloned = svgElement.cloneNode(true) as SVGSVGElement

  // 确保有 xmlns 属性
  if (!cloned.getAttribute('xmlns')) {
    cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  }
  if (!cloned.getAttribute('xmlns:xlink')) {
    cloned.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  }

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(cloned)
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  downloadBlob(blob, filename)
}

/**
 * 将 Canvas 转换为 Blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas 转 Blob 失败'))
        }
      },
      mimeType,
      quality
    )
  })
}

/**
 * 复制内容到剪贴板
 * @param content - 要复制的内容
 * @returns 是否复制成功
 */
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    if (!navigator.clipboard) {
      return fallbackCopyToClipboard(content)
    }

    await navigator.clipboard.writeText(content)
    return true
  } catch {
    return fallbackCopyToClipboard(content)
  }
}

/**
 * 备用的复制到剪贴板方法（适用于不支持 Clipboard API 的浏览器）
 */
function fallbackCopyToClipboard(content: string): boolean {
  try {
    const textArea = document.createElement('textarea')
    textArea.value = content
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const result = document.execCommand('copy')
    document.body.removeChild(textArea)
    return result
  } catch {
    return false
  }
}
