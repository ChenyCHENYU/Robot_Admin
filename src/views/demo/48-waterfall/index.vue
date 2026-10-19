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
          :aria-pressed="category === item"
          @click="category = item"
          >{{ item }}</button
        ></div
      ><div class="workspace-actions"
        ><NInput
          v-model:value="search"
          size="small"
          clearable
          placeholder="搜索素材标题"
          :input-props="{ 'aria-label': '搜索素材标题' }" /><NSelect
          v-model:value="columns"
          size="small"
          :options="COLUMN_OPTIONS"
          aria-label="素材列数" /></div
    ></div>
    <section class="gallery-content"
      ><C_WaterFall
        ref="galleryRef"
        :items="visibleItems"
        :columns="columns || undefined"
        :gap="20"
        :lazy="true"
        :infinite="false"
        :loading="false"
        :no-more="visibleItems.length >= filteredItems.length"
        @item-click="openItem"
      /><div
        v-if="!visibleItems.length"
        class="workspace-empty"
        >没有匹配的素材，换个关键词试试。</div
      ></section
    ><footer class="gallery-footer"
      ><span
        >已展示 {{ visibleItems.length }} /
        {{ filteredItems.length }} 份素材</span
      ><NButton
        size="small"
        :disabled="limit >= filteredItems.length"
        @click="limit += 8"
        >查看更多素材</NButton
      ><span>内置设计示例 · 无需外部图片服务</span></footer
    >
    <NModal
      v-model:show="showItem"
      preset="card"
      :title="selected?.title"
      :style="{ width: 'min(720px,calc(100vw - 32px))' }"
      ><img
        v-if="selected"
        :src="selected.src"
        :alt="selected.title"
        class="gallery-preview"
      /><template #footer
        ><div class="workspace-actions"
          ><NButton
            size="small"
            @click="download"
            >下载 SVG 素材</NButton
          ><span class="workspace-hint"
            >{{ selected?.width }} × {{ selected?.height }} px</span
          ></div
        ></template
      ></NModal
    >
  </div>
</template>
<script setup lang="ts">
  import type {
    WaterFallExpose,
    WaterFallItem,
  } from '@robot-admin/naive-ui-components/C_WaterFall'
  import { GALLERY_ITEMS, GALLERY_CATEGORIES } from './data'
  defineOptions({ name: 'Demo48Waterfall' })
  const galleryRef = ref<WaterFallExpose | null>(null)
  const category = ref('全部素材')
  const search = ref('')
  const columns = ref(0)
  const limit = ref(8)
  const selected = shallowRef<WaterFallItem | null>(null)
  const showItem = ref(false)
  const COLUMN_OPTIONS = [
    { label: '自动列数', value: 0 },
    { label: '两列', value: 2 },
    { label: '三列', value: 3 },
    { label: '四列', value: 4 },
  ]
  const filteredItems = computed(() =>
    GALLERY_ITEMS.filter(
      item =>
        (category.value === '全部素材' || item.category === category.value) &&
        item.title!.includes(search.value.trim())
    )
  )
  const visibleItems = computed(() => filteredItems.value.slice(0, limit.value))
  const openItem = (item: WaterFallItem) => {
    selected.value = item
    showItem.value = true
  }
  const download = () => {
    if (!selected.value) return
    const anchor = document.createElement('a')
    anchor.href = selected.value.src
    anchor.download = `${selected.value.id}.svg`
    anchor.click()
  }
  watch([category, search], () => {
    limit.value = 8
  })
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
