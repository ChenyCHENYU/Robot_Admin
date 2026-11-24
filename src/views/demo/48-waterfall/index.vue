<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 灵感素材库，以一个内容场景展示瀑布流布局
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace gallery-workspace"
    ><header class="workspace-heading"
      ><div
        ><small>IDEAS & VISUAL STUDIES</small><h1>瀑布流场景示例</h1
        ><p
          >浏览不同尺寸的设计素材，在一个素材库中体验筛选、布局与预览。</p
        ></div
      ><NButton
        size="small"
        @click="galleryRef?.scrollToTop()"
        >回到素材顶部</NButton
      ></header
    >
    <div class="gallery-toolbar"
      ><div class="gallery-categories"
        ><button
          v-for="item in GALLERY_CATEGORIES"
          :key="item"
          type="button"
          :aria-pressed="gallery.category === item"
          @click="gallery.category = item"
          >{{ item }}</button
        ></div
      ><div class="workspace-actions"
        ><NSelect
          v-model:value="gallery.collectionSize"
          class="gallery-collection-select"
          size="small"
          :options="COLLECTION_OPTIONS"
          aria-label="素材库规模" /><NInput
          v-model:value="gallery.search"
          size="small"
          clearable
          placeholder="搜索素材标题"
          :input-props="{ 'aria-label': '搜索素材标题' }" /><NSelect
          v-model:value="gallery.columns"
          size="small"
          :options="COLUMN_OPTIONS"
          aria-label="素材列数" /></div
    ></div>
    <section class="gallery-content"
      ><C_WaterFall
        ref="galleryRef"
        :items="gallery.visibleItems"
        :columns="gallery.columns || undefined"
        :gap="20"
        @item-click="gallery.openItem"
      /><div
        v-if="!gallery.visibleItems.length"
        class="workspace-empty"
        >没有匹配的素材，换个关键词试试。</div
      ></section
    ><footer class="gallery-footer"
      ><span
        >已展示 {{ gallery.visibleItems.length }} /
        {{ gallery.filteredItems.length }} 份素材</span
      ><NButton
        size="small"
        :disabled="gallery.limit >= gallery.filteredItems.length"
        @click="gallery.loadMore"
        >查看更多素材</NButton
      ><span>内置设计示例 · 无需外部图片服务</span></footer
    >
    <NModal
      v-model:show="gallery.showItem"
      preset="card"
      :title="gallery.selected?.title"
      :style="{ width: 'min(720px,calc(100vw - 32px))' }"
      ><img
        v-if="gallery.selected"
        :src="gallery.selected.src"
        :alt="gallery.selected.title"
        class="gallery-preview"
      /><template #footer
        ><div class="workspace-actions"
          ><NButton
            size="small"
            @click="gallery.download"
            >下载 SVG 素材</NButton
          ><span class="workspace-hint"
            >{{ gallery.selected?.width }} ×
            {{ gallery.selected?.height }} px</span
          ></div
        ></template
      ></NModal
    >
  </div>
</template>
<script setup lang="ts">
  import {
    COLUMN_OPTIONS,
    COLLECTION_OPTIONS,
    GALLERY_CATEGORIES,
  } from './data'
  import { useGalleryWorkspace } from './useGalleryWorkspace'
  defineOptions({ name: 'Demo48Waterfall' })
  const controller = useGalleryWorkspace()
  const gallery = proxyRefs(controller)
  const { galleryRef } = controller
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
