/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 图片工作台的素材加载、参数切换与可靠导出
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  CropOutputFormat,
  CropResult,
  ImageCropperExpose,
} from '@robot-admin/naive-ui-components/C_ImageCropper'
import { CROP_PRESETS, SAMPLE_IMAGES, formatFileSize } from './data'

const imageLoadErrorMessage = (error: unknown) =>
  error instanceof Error && error.message.includes('像素')
    ? error.message
    : '图片无法解码，请更换有效图片'

/** 一个裁剪器对应一份素材与结果；导出的结果明确标记是否已过期。 */
export function useCropWorkspace() {
  const message = useMessage()
  const cropperRef = ref<ImageCropperExpose | null>(null)
  const modalRef = ref<ImageCropperExpose | null>(null)
  const fileRef = ref<HTMLInputElement | null>(null)
  const src = ref<string>(SAMPLE_IMAGES[0].src)
  const fileName = ref('robot-logo.png')
  const sourceInfo = ref({ width: 0, height: 0, size: 0 })
  const preset = ref<string>('free')
  const ratio = computed(
    () => CROP_PRESETS.find(item => item.key === preset.value)?.ratio ?? 0
  )
  const format = ref<CropOutputFormat>('png')
  const quality = ref(90)
  const maxWidth = ref<number | null>(1600)
  const ready = ref(false)
  const exporting = ref(false)
  const result = shallowRef<CropResult | null>(null)
  const circular = ref(false)
  const stale = ref(false)
  const dropping = ref(false)
  let currentFileUrl: string | undefined
  let sourceSequence = 0
  let fileSequence = 0
  let active = true
  const markStale = () => {
    if (result.value) stale.value = true
  }
  const releaseFileUrl = () => {
    if (currentFileUrl) URL.revokeObjectURL(currentFileUrl)
    currentFileUrl = undefined
  }
  const probeImage = (url: string, bytes = 0) => {
    const request = ++sourceSequence
    const image = new Image()
    image.onload = () => {
      if (request === sourceSequence)
        sourceInfo.value = {
          width: image.naturalWidth,
          height: image.naturalHeight,
          size: bytes,
        }
    }
    image.src = url
  }
  const selectSample = (sample: (typeof SAMPLE_IMAGES)[number]) => {
    if (exporting.value) return
    if (src.value === sample.src) {
      transform('reset')
      return
    }
    fileSequence++
    releaseFileUrl()
    ready.value = false
    result.value = null
    stale.value = false
    src.value = sample.src
    fileName.value = sample.src.split('/').at(-1) ?? 'sample.png'
    void probeImage(sample.src)
  }
  const loadFile = async (file: File) => {
    if (exporting.value) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      message.error('请选择 PNG、JPEG 或 WebP 图片')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      message.error('图片不能超过 15 MB')
      return
    }
    const request = ++fileSequence
    const candidate = URL.createObjectURL(file)
    try {
      const image = new Image()
      image.src = candidate
      await image.decode()
      if (!active || request !== fileSequence) {
        URL.revokeObjectURL(candidate)
        return
      }
      if (image.naturalWidth * image.naturalHeight > 40_000_000)
        throw new Error('图片像素过大，请选择 4000 万像素以内的图片')
      releaseFileUrl()
      currentFileUrl = candidate
      ready.value = false
      result.value = null
      stale.value = false
      src.value = candidate
      fileName.value = file.name
      void probeImage(candidate, file.size)
    } catch (error) {
      URL.revokeObjectURL(candidate)
      if (!active || request !== fileSequence) return
      message.error(imageLoadErrorMessage(error))
    }
  }
  const onFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (file) await loadFile(file)
  }
  const onDrop = async (event: DragEvent) => {
    dropping.value = false
    const file = event.dataTransfer?.files[0]
    if (file) await loadFile(file)
  }
  const applyPreset = (key: string) => {
    const item = CROP_PRESETS.find(value => value.key === key)
    if (!item || exporting.value) return
    preset.value = key
    maxWidth.value = item.maxWidth
    circular.value = key === 'avatar'
    markStale()
  }
  const transform = (
    action:
      'left' | 'right' | 'zoom-in' | 'zoom-out' | 'flip-x' | 'flip-y' | 'reset'
  ) => {
    const cropper = cropperRef.value
    if (!cropper || !ready.value || exporting.value) return
    const actions = {
      left: () => cropper.rotate(-90),
      right: () => cropper.rotate(90),
      'zoom-in': () => cropper.zoom(0.15),
      'zoom-out': () => cropper.zoom(-0.15),
      'flip-x': () => cropper.flipX(),
      'flip-y': () => cropper.flipY(),
      reset: () => cropper.reset(),
    }
    actions[action]()
    markStale()
  }
  const exportCrop = async () => {
    if (!ready.value || !cropperRef.value || exporting.value) return
    exporting.value = true
    try {
      const next = await cropperRef.value.getCropResult()
      if (!active) return
      result.value = next
      stale.value = false
      message.success('裁剪结果已生成')
    } catch (error) {
      if (active)
        message.error(
          error instanceof Error ? error.message : '导出失败，请重试'
        )
    } finally {
      exporting.value = false
    }
  }
  const download = () => {
    if (!result.value || stale.value) return
    const url = URL.createObjectURL(result.value.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${fileName.value.replace(/\.[^.]+$/, '')}-crop.${result.value.format === 'jpeg' ? 'jpg' : result.value.format}`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const acceptModalResult = (value: CropResult) => {
    result.value = value
    stale.value = false
    message.success('已应用弹窗裁剪结果')
  }
  const onReady = () => {
    ready.value = true
  }
  const onError = (error: Error) => {
    ready.value = false
    message.error(error.message || '图片加载失败')
  }
  watch([format, quality, maxWidth, circular], markStale)
  onMounted(() => {
    void probeImage(src.value)
  })
  onBeforeUnmount(() => {
    active = false
    fileSequence++
    sourceSequence++
    releaseFileUrl()
  })
  return {
    cropperRef,
    modalRef,
    acceptModalResult,
    fileRef,
    src,
    fileName,
    sourceInfo,
    preset,
    ratio,
    format,
    quality,
    maxWidth,
    ready,
    exporting,
    result,
    circular,
    stale,
    dropping,
    markStale,
    selectSample,
    onFileChange,
    onDrop,
    applyPreset,
    transform,
    exportCrop,
    download,
    onReady,
    onError,
    formatFileSize,
  }
}
