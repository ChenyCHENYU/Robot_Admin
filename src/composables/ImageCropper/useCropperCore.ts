/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 22:00:00
 * @FilePath: \Robot_Admin\src\composables\ImageCropper\useCropperCore.ts
 * @Description: vue-cropper 实例管理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  CropOutputFormat,
  CropResult,
} from '@/types/modules/image-cropper'
import type { Ref } from 'vue'

interface UseCropperCoreOptions {
  /** 输出格式 */
  format?: Ref<CropOutputFormat>
  /** 输出质量 */
  quality?: Ref<number>
  /** 输出最大宽度 */
  maxWidth?: Ref<number>
  /** 输出最大高度 */
  maxHeight?: Ref<number>
}

/**
 * vue-cropper 实例管理
 * 封装 VueCropper ref 的操作方法与裁剪输出
 */
export function useCropperCore(options: UseCropperCoreOptions = {}) {
  /** VueCropper 组件 ref */
  const cropperRef = ref<any>(null)

  // ─── 操作方法 ──────────────────────────────────

  /** 向左旋转 */
  function rotateLeft() {
    cropperRef.value?.rotateLeft()
  }

  /** 向右旋转 */
  function rotateRight() {
    cropperRef.value?.rotateRight()
  }

  /**
   * 旋转指定角度
   * 正数顺时针，负数逆时针（以 90° 为单位）
   */
  function rotate(angle: number) {
    const steps = Math.round(angle / 90)
    const fn = steps > 0 ? rotateRight : rotateLeft
    for (let i = 0; i < Math.abs(steps); i++) fn()
  }

  /** 缩放（正数放大，负数缩小） */
  function zoom(scale: number) {
    cropperRef.value?.changeScale(scale > 0 ? 1 : -1)
  }

  /** 水平翻转（通过 X 轴 scale 实现） */
  function flipX() {
    const el = cropperRef.value?.$refs?.img
    if (!el) return
    const current = el.style.transform || ''
    if (current.includes('scaleX(-1)')) {
      el.style.transform = current.replace('scaleX(-1)', 'scaleX(1)')
    } else {
      el.style.transform =
        current.replace(/scaleX\([^)]*\)/, '') + ' scaleX(-1)'
    }
  }

  /** 垂直翻转（通过 Y 轴 scale 实现） */
  function flipY() {
    const el = cropperRef.value?.$refs?.img
    if (!el) return
    const current = el.style.transform || ''
    if (current.includes('scaleY(-1)')) {
      el.style.transform = current.replace('scaleY(-1)', 'scaleY(1)')
    } else {
      el.style.transform =
        current.replace(/scaleY\([^)]*\)/, '') + ' scaleY(-1)'
    }
  }

  /** 重置 */
  function reset() {
    cropperRef.value?.refresh()
  }

  // ─── 裁剪输出 ──────────────────────────────────

  /** 约束输出尺寸 */
  function constrainSize(w: number, h: number) {
    let ow = w
    let oh = h
    const maxW = options.maxWidth?.value ?? 0
    const maxH = options.maxHeight?.value ?? 0

    if (maxW > 0 && ow > maxW) {
      const ratio = maxW / ow
      ow = maxW
      oh = Math.round(oh * ratio)
    }
    if (maxH > 0 && oh > maxH) {
      const ratio = maxH / oh
      oh = maxH
      ow = Math.round(ow * ratio)
    }
    return { width: ow, height: oh }
  }

  /** 获取裁剪结果 */
  function getCropResult(): Promise<CropResult> {
    return new Promise((resolve, reject) => {
      const cropper = cropperRef.value
      if (!cropper) return reject(new Error('Cropper not initialized'))

      const format = options.format?.value ?? 'png'
      const quality = options.quality?.value ?? 0.92
      const mime =
        format === 'jpeg'
          ? 'image/jpeg'
          : format === 'webp'
            ? 'image/webp'
            : 'image/png'

      // 同时获取 base64 和 blob
      cropper.getCropData((base64: string) => {
        cropper.getCropBlob((blob: Blob) => {
          // 从 base64 获取实际尺寸
          const img = new Image()
          img.onload = () => {
            const { width, height } = constrainSize(img.width, img.height)

            // 如果需要约束尺寸，重新绘制
            if (width !== img.width || height !== img.height) {
              const canvas = document.createElement('canvas')
              canvas.width = width
              canvas.height = height
              const ctx = canvas.getContext('2d')!
              ctx.drawImage(img, 0, 0, width, height)
              const constrainedBase64 = canvas.toDataURL(mime, quality)
              canvas.toBlob(
                constrainedBlob => {
                  resolve({
                    base64: constrainedBase64,
                    blob: constrainedBlob!,
                    width,
                    height,
                    format,
                  })
                },
                mime,
                format === 'png' ? undefined : quality
              )
            } else {
              resolve({
                base64,
                blob,
                width: img.width,
                height: img.height,
                format,
              })
            }
          }
          img.onerror = () => reject(new Error('Failed to load crop result'))
          img.src = base64
        })
      })
    })
  }

  return {
    cropperRef,
    rotate,
    rotateLeft,
    rotateRight,
    zoom,
    flipX,
    flipY,
    reset,
    getCropResult,
  }
}
