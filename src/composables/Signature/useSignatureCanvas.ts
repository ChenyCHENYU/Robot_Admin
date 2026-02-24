/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\composables\Signature\useSignatureCanvas.ts
 * @Description: 电子签名 Canvas 绘制逻辑
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import type {
  PenConfig,
  PenMode,
  SignaturePoint,
  SignatureStroke,
} from '@/types/modules/signature'

interface UseSignatureCanvasOptions {
  canvasRef: Ref<HTMLCanvasElement | null>
  penConfig: Ref<PenConfig>
  mode: Ref<PenMode>
  disabled: Ref<boolean>
  onStrokeComplete: (stroke: SignatureStroke) => void
  onDrawStart: () => void
  onDrawing: (point: SignaturePoint) => void
}

/**
 * 签名 Canvas 绘制逻辑
 */
export function useSignatureCanvas(options: UseSignatureCanvasOptions) {
  const {
    canvasRef,
    penConfig,
    mode,
    disabled,
    onStrokeComplete,
    onDrawStart,
    onDrawing,
  } = options

  const isDrawing = ref(false)
  const currentStroke = ref<SignaturePoint[]>([])
  let ctx: CanvasRenderingContext2D | null = null

  /**
   * 初始化 Canvas 上下文
   */
  const initCanvas = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // 设置 Canvas 分辨率（支持高 DPI）
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    ctx.scale(dpr, dpr)

    // 设置平滑绘制
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  /**
   * 获取鼠标/触摸点位置
   */
  const getPointFromEvent = (e: MouseEvent | TouchEvent): SignaturePoint => {
    const canvas = canvasRef.value
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX: number
    let clientY: number

    if ('touches' in e && e.touches.length > 0) {
      const { clientX: touchX, clientY: touchY } = e.touches[0]
      clientX = touchX
      clientY = touchY
    } else if ('clientX' in e) {
      ;({ clientX, clientY } = e)
    } else {
      return { x: 0, y: 0 }
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      timestamp: Date.now(),
    }
  }

  /**
   * 绘制单个笔画点到点
   */
  const drawStroke = (
    from: SignaturePoint,
    to: SignaturePoint,
    config: PenConfig,
    eraserMode = false
  ) => {
    if (!ctx) return

    ctx.save()

    if (eraserMode) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = 20
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = config.color
      ctx.lineWidth = config.width
      ctx.globalAlpha = config.opacity
    }

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()

    ctx.restore()
  }

  /**
   * 开始绘制
   */
  const startDrawing = (e: MouseEvent | TouchEvent) => {
    if (disabled.value) return

    e.preventDefault()
    isDrawing.value = true
    currentStroke.value = []

    const point = getPointFromEvent(e)
    currentStroke.value.push(point)

    onDrawStart()
  }

  /**
   * 绘制中
   */
  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.value || disabled.value) return

    e.preventDefault()

    const point = getPointFromEvent(e)
    const lastPoint = currentStroke.value[currentStroke.value.length - 1]

    if (lastPoint) {
      drawStroke(lastPoint, point, penConfig.value, mode.value === 'eraser')
    }

    currentStroke.value.push(point)
    onDrawing(point)
  }

  /**
   * 结束绘制
   */
  const endDrawing = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.value || disabled.value) return

    e.preventDefault()
    isDrawing.value = false

    if (currentStroke.value.length > 0) {
      const stroke: SignatureStroke = {
        points: [...currentStroke.value],
        color: penConfig.value.color,
        width: penConfig.value.width,
        opacity: penConfig.value.opacity,
        mode: mode.value,
      }

      onStrokeComplete(stroke)
      currentStroke.value = []
    }
  }

  /**
   * 重绘所有笔画
   */
  const redrawStrokes = (strokes: SignatureStroke[]) => {
    if (!ctx || !canvasRef.value) return

    // 清空画布
    const canvas = canvasRef.value
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 重绘所有笔画
    strokes.forEach(stroke => {
      for (let i = 1; i < stroke.points.length; i++) {
        const from = stroke.points[i - 1]
        const to = stroke.points[i]
        drawStroke(
          from,
          to,
          {
            color: stroke.color,
            width: stroke.width,
            opacity: stroke.opacity,
          },
          stroke.mode === 'eraser'
        )
      }
    })
  }

  /**
   * 清空画布
   */
  const clearCanvas = () => {
    if (!ctx || !canvasRef.value) return
    const canvas = canvasRef.value
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  /**
   * 绑定事件
   */
  const bindEvents = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    // 鼠标事件
    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', endDrawing)
    canvas.addEventListener('mouseleave', endDrawing)

    // 触摸事件
    canvas.addEventListener('touchstart', startDrawing, { passive: false })
    canvas.addEventListener('touchmove', draw, { passive: false })
    canvas.addEventListener('touchend', endDrawing)
    canvas.addEventListener('touchcancel', endDrawing)
  }

  /**
   * 解绑事件
   */
  const unbindEvents = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    canvas.removeEventListener('mousedown', startDrawing)
    canvas.removeEventListener('mousemove', draw)
    canvas.removeEventListener('mouseup', endDrawing)
    canvas.removeEventListener('mouseleave', endDrawing)

    canvas.removeEventListener('touchstart', startDrawing)
    canvas.removeEventListener('touchmove', draw)
    canvas.removeEventListener('touchend', endDrawing)
    canvas.removeEventListener('touchcancel', endDrawing)
  }

  return {
    isDrawing: readonly(isDrawing),
    initCanvas,
    bindEvents,
    unbindEvents,
    redrawStrokes,
    clearCanvas,
  }
}
