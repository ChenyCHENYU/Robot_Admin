<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_WaterFall\index.vue
 * @Description: 瀑布流布局组件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    ref="containerRef"
    class="c-waterfall"
  >
    <!-- 瀑布流主体 -->
    <div
      class="waterfall__body"
      :style="{ height: `${bodyHeight}px`, position: 'relative' }"
    >
      <!-- 骨架屏 -->
      <template v-if="showSkeleton">
        <div
          v-for="(sk, idx) in skeletonItems"
          :key="`sk-${idx}`"
          class="waterfall__skeleton"
          :style="{
            position: 'absolute',
            left: `${sk.x}px`,
            top: `${sk.y}px`,
            width: `${sk.width}px`,
            height: `${sk.height}px`,
            transition: `all ${props.animationDuration ?? DEFAULT_ANIMATION_DURATION}ms ease`,
          }"
        >
          <slot name="skeleton">
            <div class="waterfall__skeleton-inner" />
          </slot>
        </div>
      </template>

      <!-- 真实卡片 -->
      <div
        v-for="(lay, index) in layoutItems"
        :key="lay.item.id"
        class="waterfall__item"
        :style="{
          position: 'absolute',
          left: `${lay.x}px`,
          top: `${lay.y}px`,
          width: `${lay.width}px`,
          transition: `all ${props.animationDuration ?? DEFAULT_ANIMATION_DURATION}ms ease`,
        }"
        @click="emit('item-click', lay.item, index)"
      >
        <slot
          name="item"
          :item="lay.item"
          :index="index"
          :width="lay.width"
          :height="lay.height"
        >
          <!-- 默认渲染：图片 + 标题 -->
          <div class="waterfall__card">
            <img
              :src="lay.item.src"
              :alt="lay.item.title || ''"
              :loading="props.lazy ? 'lazy' : 'eager'"
              class="waterfall__image"
              :style="{ height: `${lay.height}px` }"
              @load="handleImageLoaded(lay, $event)"
              @error="handleImageError(lay)"
            />
            <div
              v-if="lay.item.title"
              class="waterfall__title"
            >
              {{ lay.item.title }}
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- 底部状态 -->
    <div
      v-if="props.infinite"
      class="waterfall__footer"
    >
      <div
        ref="sentinelRef"
        class="waterfall__sentinel"
      />
      <slot
        name="footer"
        :status="scrollStatus"
      >
        <div
          v-if="props.loading"
          class="waterfall__status"
        >
          <NSpin size="small" />
          <span>加载中…</span>
        </div>
        <div
          v-else-if="props.noMore"
          class="waterfall__status waterfall__status--done"
        >
          没有更多了
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    WaterFallItem,
    WaterFallLayoutItem,
    WaterFallProps,
    WaterFallExpose,
    WaterFallBreakpoint,
  } from '@/types/modules/waterfall'
  import {
    DEFAULT_GAP,
    DEFAULT_ANIMATION_DURATION,
    DEFAULT_SKELETON_COUNT,
    SKELETON_HEIGHT_RANGE,
  } from './constants'
  import { useResponsiveColumns } from '@/composables/WaterFall/useResponsiveColumns'
  import { useWaterFallLayout } from '@/composables/WaterFall/useWaterFallLayout'
  import { useInfiniteScroll } from '@/composables/WaterFall/useInfiniteScroll'

  const props = withDefaults(defineProps<WaterFallProps>(), {
    columns: undefined,
    gap: DEFAULT_GAP,
    lazy: true,
    infinite: false,
    skeleton: true,
    skeletonCount: DEFAULT_SKELETON_COUNT,
    animationDuration: DEFAULT_ANIMATION_DURATION,
    breakpoints: undefined,
    loading: false,
    noMore: false,
  })

  const emit = defineEmits<{
    'load-more': []
    'item-click': [item: WaterFallItem, index: number]
    'image-loaded': [item: WaterFallItem]
    'image-error': [item: WaterFallItem]
  }>()

  // ─── DOM refs ─────────────────────────────────

  const containerRef = ref<HTMLElement>()
  const sentinelRef = ref<HTMLElement>()

  // ─── 响应式列数 ───────────────────────────────

  const fixedColumns = computed(() => props.columns)
  const breakpointsRef = computed(() => props.breakpoints)
  const { columns, containerWidth } = useResponsiveColumns(
    containerRef,
    fixedColumns as Ref<number | undefined>,
    breakpointsRef as Ref<WaterFallBreakpoint[] | undefined>
  )

  // ─── 布局引擎 ────────────────────────────────

  const itemsRef = computed(() => props.items)
  const gapRef = computed(() => props.gap)
  const { layoutItems, containerHeight, cacheImageHeight, relayout } =
    useWaterFallLayout(itemsRef, columns, containerWidth, gapRef)

  // ─── 骨架屏占位计算 ──────────────────────────

  /** 是否显示骨架屏 */
  const showSkeleton = computed(
    () => props.skeleton && props.loading && layoutItems.value.length === 0
  )

  const skeletonItems = computed(() => {
    const cols = columns.value
    const width = containerWidth.value
    const g = props.gap
    if (cols <= 0 || width <= 0) return []

    const colWidth = (width - (cols - 1) * g) / cols
    const count = props.skeletonCount ?? DEFAULT_SKELETON_COUNT
    const colHeights = Array(cols).fill(0)
    const result: { x: number; y: number; width: number; height: number }[] = []

    for (let i = 0; i < count; i++) {
      const minIdx = colHeights.indexOf(Math.min(...colHeights))
      const h =
        SKELETON_HEIGHT_RANGE[0] +
        Math.random() * (SKELETON_HEIGHT_RANGE[1] - SKELETON_HEIGHT_RANGE[0])

      result.push({
        x: minIdx * (colWidth + g),
        y: colHeights[minIdx],
        width: colWidth,
        height: h,
      })
      colHeights[minIdx] += h + g
    }
    return result
  })

  /** 骨架屏区域总高度 */
  const skeletonHeight = computed(() => {
    if (skeletonItems.value.length === 0) return 0
    return Math.max(...skeletonItems.value.map(s => s.y + s.height))
  })

  /** 容器实际展示高度：骨架屏 or 真实布局 */
  const bodyHeight = computed(() =>
    showSkeleton.value ? skeletonHeight.value : containerHeight.value
  )

  // ─── 无限滚动 ────────────────────────────────

  const infiniteEnabled = computed(() => props.infinite)
  const loadingRef = computed(() => props.loading)
  const noMoreRef = computed(() => props.noMore)

  const { status: scrollStatus } = useInfiniteScroll(
    sentinelRef,
    infiniteEnabled,
    loadingRef,
    noMoreRef,
    () => emit('load-more')
  )

  // ─── 图片事件 ────────────────────────────────

  /** 图片加载完成 */
  function handleImageLoaded(lay: WaterFallLayoutItem, event: Event) {
    const img = event.target as HTMLImageElement
    if (img.naturalHeight && img.naturalWidth) {
      const realHeight = (img.naturalHeight / img.naturalWidth) * lay.width
      cacheImageHeight(lay.item.id, realHeight)
    }
    emit('image-loaded', lay.item)
  }

  /** 图片加载失败 */
  function handleImageError(lay: WaterFallLayoutItem) {
    emit('image-error', lay.item)
  }

  // ─── Expose ──────────────────────────────────

  /** 回到顶部 */
  function scrollToTop() {
    containerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  defineExpose<WaterFallExpose>({
    relayout,
    scrollToTop,
    getColumns: () => columns.value,
    getContainerHeight: () => containerHeight.value,
  })
</script>

<style scoped lang="scss">
  .c-waterfall {
    width: 100%;
  }

  .waterfall__body {
    overflow: hidden;
  }

  .waterfall__item {
    cursor: pointer;
  }

  .waterfall__card {
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--card-color);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    transition:
      box-shadow 0.2s ease,
      transform 0.2s ease;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  }

  .waterfall__image {
    display: block;
    width: 100%;
    object-fit: cover;
    background: var(--body-color);
  }

  .waterfall__title {
    padding: 10px 12px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-color-1);
    word-break: break-all;
  }

  // ─── 骨架屏 ──────────────────────────────────

  .waterfall__skeleton {
    overflow: hidden;
    border-radius: 8px;
  }

  .waterfall__skeleton-inner {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: linear-gradient(
      90deg,
      var(--body-color) 25%,
      color-mix(in srgb, var(--body-color) 80%, var(--border-color)) 37%,
      var(--body-color) 63%
    );
    background-size: 400% 100%;
    animation: shimmer 1.4s ease infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }

  // ─── 底部状态 ─────────────────────────────────

  .waterfall__footer {
    padding: 24px 0;
    text-align: center;
  }

  .waterfall__sentinel {
    height: 1px;
  }

  .waterfall__status {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    color: var(--text-color-3);

    &--done {
      color: var(--text-color-4);
    }
  }
</style>
