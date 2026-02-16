<!--
  PdfViewer — PDF 文件预览子组件
  负责: 工具栏(翻页+缩放) + iframe 渲染
-->
<template>
  <div class="file-container pdf-container">
    <div class="file-toolbar">
      <div class="flex justify-between items-center">
        <!-- 翻页控制 -->
        <div class="flex gap-2 items-center">
          <NButton
            size="small"
            :disabled="currentPage <= 1"
            @click="changePage('prev')"
          >
            <template #icon>
              <C_Icon name="ic:outline-chevron-left" />
            </template>
          </NButton>
          <NInputNumber
            v-model:value="currentPage"
            size="small"
            :min="1"
            :max="totalPages"
            style="width: 80px"
            @update:value="changePage"
          />
          <span class="text-sm text-gray-600">/ {{ totalPages }}</span>
          <NButton
            size="small"
            :disabled="currentPage >= totalPages"
            @click="changePage('next')"
          >
            <template #icon>
              <C_Icon name="ic:outline-chevron-right" />
            </template>
          </NButton>
        </div>

        <!-- 缩放控制 -->
        <div class="flex gap-2 items-center">
          <NButton
            size="small"
            :disabled="scale <= 0.5"
            @click="adjustZoom('out')"
          >
            <template #icon>
              <C_Icon name="ic:outline-zoom-out" />
            </template>
          </NButton>
          <span class="text-sm text-gray-600 min-w-12 text-center">
            {{ Math.round(scale * 100) }}%
          </span>
          <NButton
            size="small"
            :disabled="scale >= 3"
            @click="adjustZoom('in')"
          >
            <template #icon>
              <C_Icon name="ic:outline-zoom-in" />
            </template>
          </NButton>
          <NButton
            size="small"
            @click="adjustZoom('reset')"
          >
            <template #icon>
              <C_Icon name="ic:outline-fit-screen" />
            </template>
            适应
          </NButton>
        </div>
      </div>
    </div>

    <div class="file-viewer">
      <iframe
        v-if="pdfUrl"
        :src="pdfUrl"
        class="w-full h-full border-0"
        title="PDF预览"
        frameborder="0"
        allowfullscreen
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    createZoomHandler,
    ZOOM_CONFIGS,
  } from '@/components/global/C_FilePreview/data'

  const props = defineProps<{
    pdfUrl: string
    totalPages: number
  }>()

  const currentPage = ref(1)
  const scale = ref(1)

  const adjustZoom = createZoomHandler(scale, ZOOM_CONFIGS.pdf)

  const changePage = (action: 'prev' | 'next' | number) => {
    if (typeof action === 'number') {
      currentPage.value = Math.max(1, Math.min(action, props.totalPages))
    } else {
      const delta = action === 'prev' ? -1 : 1
      currentPage.value = Math.max(
        1,
        Math.min(currentPage.value + delta, props.totalPages)
      )
    }
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
