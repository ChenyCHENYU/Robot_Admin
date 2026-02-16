<!--
  WordViewer — Word 文档预览子组件
  负责: 目录导航 + 缩放 + 文档内容渲染
-->
<template>
  <div class="file-container word-container">
    <div class="file-toolbar">
      <div class="flex gap-2 items-center">
        <NButton
          size="small"
          @click="showOutline = !showOutline"
        >
          <template #icon>
            <C_Icon name="ic:outline-list" />
          </template>
          {{ showOutline ? '隐藏' : '显示' }}目录
        </NButton>
        <NDivider vertical />
        <NButton
          size="small"
          :disabled="wordZoom <= 50"
          @click="adjustWordZoom('out')"
        >
          <template #icon>
            <C_Icon name="ic:outline-zoom-out" />
          </template>
        </NButton>
        <span class="text-sm text-gray-600 min-w-12 text-center">
          {{ wordZoom }}%
        </span>
        <NButton
          size="small"
          :disabled="wordZoom >= 200"
          @click="adjustWordZoom('in')"
        >
          <template #icon>
            <C_Icon name="ic:outline-zoom-in" />
          </template>
        </NButton>
        <NButton
          size="small"
          @click="adjustWordZoom('reset')"
        >
          <template #icon>
            <C_Icon name="ic:outline-fit-screen" />
          </template>
          重置
        </NButton>
      </div>
    </div>

    <div class="word-layout">
      <div class="word-main">
        <!-- 侧边栏目录 -->
        <div
          v-if="showOutline"
          class="word-outline"
        >
          <div class="outline-header">
            <h3 class="text-sm font-semibold">文档目录</h3>
          </div>
          <div class="outline-content">
            <div
              v-for="(heading, index) in headings"
              :key="index"
              class="outline-item"
              :class="`level-${heading.level}`"
              @click="scrollToHeading(heading.id)"
            >
              {{ heading.text }}
            </div>
          </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="word-content">
          <div
            class="word-document"
            :style="{
              transform: `scale(${wordZoom / 100})`,
              transformOrigin: 'top center',
            }"
            v-html="content"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    createZoomHandler,
    ZOOM_CONFIGS,
  } from '@/components/global/C_FilePreview/data'

  defineProps<{
    content: string
    headings: DocHeading[]
  }>()

  const showOutline = ref(true)
  const wordZoom = ref(100)

  const adjustWordZoom = createZoomHandler(wordZoom, ZOOM_CONFIGS.word)

  const scrollToHeading = (headingId: string) => {
    document
      .getElementById(headingId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
