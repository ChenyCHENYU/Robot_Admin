/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-21
 * @Description: PDF 文档加载、翻页和渲染任务的生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { useElementSize } from '@vueuse/core'
import {
  getDocument,
  GlobalWorkerOptions,
  version,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type RenderTask,
} from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { PdfReaderProps } from './types'
/** 文档在本机渲染；切换文件和离开页面时取消旧任务并释放 Worker。 */
export function usePdfReader(props: Readonly<PdfReaderProps>) {
  GlobalWorkerOptions.workerSrc = workerUrl
  const canvas = ref<HTMLCanvasElement>()
  const viewport = ref<HTMLElement>()
  const loading = ref(false)
  const error = ref('')
  const page = ref(1)
  const total = ref(0)
  const zoom = ref(1)
  const { width } = useElementSize(viewport)
  let documentTask: PDFDocumentLoadingTask | undefined
  let pdf: PDFDocumentProxy | undefined
  let rendering: RenderTask | undefined
  let generation = 0
  let drawing = 0
  /** 只接受当前文档、当前翻页请求的结果。 */
  const isCurrentDraw = (request: number, currentPdf: PDFDocumentProxy) =>
    request === drawing && currentPdf === pdf
  /** 取消渲染属于正常翻页，不将它显示为文件错误。 */
  const isCancelled = (reason: unknown) =>
    reason instanceof Error && reason.name === 'RenderingCancelledException'
  /** 取消旧页渲染，再以当前容器宽度生成高分辨率画布。 */
  const renderPage = async () => {
    const currentPdf = pdf
    if (!currentPdf || !canvas.value || error.value) return
    const request = ++drawing
    rendering?.cancel()
    try {
      const current = await currentPdf.getPage(page.value)
      if (!isCurrentDraw(request, currentPdf) || !canvas.value) return
      const target = canvas.value
      const scale =
        Math.min(
          2,
          Math.max(220, width.value - 48) /
            current.getViewport({ scale: 1 }).width
        ) * zoom.value
      const view = current.getViewport({ scale })
      const ratio = Math.min(window.devicePixelRatio, 2)
      target.width = Math.ceil(view.width * ratio)
      target.height = Math.ceil(view.height * ratio)
      target.style.width = `${view.width}px`
      target.style.height = `${view.height}px`
      rendering = current.render({
        canvas: target,
        viewport: view,
        transform: [ratio, 0, 0, ratio, 0, 0],
      })
      await rendering.promise
    } catch (reason) {
      if (isCurrentDraw(request, currentPdf) && !isCancelled(reason))
        error.value = '页面渲染失败，请重新加载或下载原件。'
    }
  }
  /** 文档切换使用代际标记，旧任务不能覆盖后来选择的文件。 */
  const load = async () => {
    const request = ++generation
    drawing++
    rendering?.cancel()
    pdf = undefined
    await documentTask?.destroy()
    if (request !== generation) return
    error.value = ''
    loading.value = true
    total.value = 0
    page.value = 1
    try {
      const input = props.file
        ? { data: new Uint8Array(await props.file.arrayBuffer()) }
        : { url: props.url }
      if (request !== generation) return
      documentTask = getDocument({
        ...input,
        cMapUrl: `/pdfjs/${version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `/pdfjs/${version}/standard_fonts/`,
        wasmUrl: `/pdfjs/${version}/wasm/`,
        iccUrl: `/pdfjs/${version}/iccs/`,
      })
      const loaded = await documentTask.promise
      if (request !== generation) return
      pdf = loaded
      total.value = loaded.numPages
      await nextTick()
      await renderPage()
    } catch {
      if (request === generation)
        error.value = '请检查文件是否完整；远程链接需允许跨域读取。'
    } finally {
      if (request === generation) loading.value = false
    }
  }
  watch(() => [props.file, props.url], load, { immediate: true })
  watch([page, zoom], renderPage)
  watch(width, useDebounceFn(renderPage, 120))
  onBeforeUnmount(() => {
    generation++
    drawing++
    rendering?.cancel()
    void documentTask?.destroy()
  })
  return { canvas, viewport, loading, error, page, total, zoom, load }
}
