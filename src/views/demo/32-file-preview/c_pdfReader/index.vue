<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @Description: 按需加载的 PDF 画布阅读器，无浏览器插件或外部阅读服务依赖
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <section
    class="pdf-reader"
    :aria-busy="loading"
    aria-label="PDF 阅读器"
  >
    <div class="pdf-reader__toolbar">
      <div
        ><NButton
          size="small"
          :disabled="loading || page <= 1"
          aria-label="PDF 上一页"
          @click="page--"
          >上一页</NButton
        ><span>{{ page }} / {{ total || '—' }}</span
        ><NButton
          size="small"
          :disabled="loading || page >= total"
          aria-label="PDF 下一页"
          @click="page++"
          >下一页</NButton
        ></div
      >
      <div
        ><NButton
          size="small"
          :disabled="loading || zoom <= 0.5"
          aria-label="缩小 PDF"
          @click="zoom = Math.max(0.5, zoom - 0.25)"
          >−</NButton
        ><span>{{ Math.round(zoom * 100) }}%</span
        ><NButton
          size="small"
          :disabled="loading || zoom >= 2"
          aria-label="放大 PDF"
          @click="zoom = Math.min(2, zoom + 0.25)"
          >＋</NButton
        ><NButton
          size="small"
          :disabled="loading"
          @click="zoom = 1"
          >适合宽度</NButton
        ></div
      >
    </div>
    <div
      v-if="error"
      class="pdf-reader__error"
      role="alert"
      ><span class="i-mdi-file-alert-outline" /><h3>这份 PDF 暂时无法读取</h3
      ><p>{{ error }}</p
      ><NButton
        size="small"
        @click="load"
        >重新加载 PDF</NButton
      ></div
    >
    <div
      v-else
      ref="viewport"
      class="pdf-reader__viewport"
      ><NSpin :show="loading"
        ><canvas
          ref="canvas"
          :aria-label="`${name}，第 ${page} 页`"
          role="img" /></NSpin
    ></div>
    <p
      class="pdf-reader__note"
      role="status"
      >{{
        loading
          ? '正在读取文档…'
          : error
            ? '可下载原件使用本地阅读器打开'
            : '文档在本机渲染 · 支持翻页与缩放'
      }}</p
    >
  </section>
</template>
<script setup lang="ts">
  import type { PdfReaderProps } from './types'
  import { usePdfReader } from './usePdfReader'
  defineOptions({ name: 'DocumentPdfReader' })
  const props = defineProps<PdfReaderProps>()
  const { canvas, viewport, loading, error, page, total, zoom, load } =
    usePdfReader(props)
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
