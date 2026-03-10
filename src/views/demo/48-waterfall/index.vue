<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\48-waterfall\index.vue
 * @Description: 瀑布流组件演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="waterfall-demo-page">
    <c_vTitle
      title="瀑布流场景示例"
      icon="mdi:view-grid-outline"
      description="瀑布流布局广泛应用于图片库、素材管理、商品展示等场景，支持响应式列数、懒加载、无限滚动、骨架屏等特性"
    />

    <!-- 1. 基础瀑布流 —— 响应式 + 无限滚动 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:view-dashboard-outline"
          class="title-icon"
        />
        基础用法（响应式 + 无限滚动）
      </h2>
      <div class="section-desc">
        默认按断点自动计算列数（6 → 5 → 4 → 3 → 2 → 1 列，依容器宽度递减），
        开启 <code>infinite</code> 属性后滚动到底部自动加载更多，
        初次加载显示骨架屏占位动画。
      </div>
      <div class="section-content">
        <div class="demo-toolbar">
          <div class="toolbar-item">
            <span>列数：</span>
            <NSelect
              v-model:value="basicColumns"
              :options="COLUMN_OPTIONS"
              size="small"
              style="width: 100px"
            />
          </div>
          <div class="toolbar-item">
            <span>间距：</span>
            <NSelect
              v-model:value="basicGap"
              :options="GAP_OPTIONS"
              size="small"
              style="width: 90px"
            />
          </div>
          <div class="toolbar-item">
            <NSwitch
              v-model:value="basicLazy"
              size="small"
            />
            <span>懒加载</span>
          </div>
          <div class="toolbar-item">
            <NSwitch
              v-model:value="basicSkeleton"
              size="small"
            />
            <span>骨架屏</span>
          </div>
        </div>

        <C_WaterFall
          ref="basicRef"
          :items="basicItems"
          :columns="basicColumns || undefined"
          :gap="basicGap"
          :lazy="basicLazy"
          :skeleton="basicSkeleton"
          infinite
          :loading="basicLoading"
          :no-more="basicNoMore"
          @load-more="handleLoadMore"
          @item-click="handleItemClick"
        />

        <div class="demo-stats">
          <NTag
            type="info"
            size="small"
          >
            已加载 {{ basicItems.length }} 张
          </NTag>
          <NTag
            :type="basicNoMore ? 'warning' : 'success'"
            size="small"
          >
            {{ basicNoMore ? '已全部加载' : '滚动加载中…' }}
          </NTag>
          <NButton
            size="small"
            @click="handleReset"
          >
            重置
          </NButton>
        </div>
      </div>
    </div>

    <!-- 2. 自定义卡片渲染 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:card-text-outline"
          class="title-icon"
        />
        自定义卡片渲染（Slot）
      </h2>
      <div class="section-desc">
        通过 <code>#item</code> 插槽完全控制卡片渲染内容、样式。 插槽提供
        <code>item</code>、<code>index</code>、<code>width</code>、<code
          >height</code
        >
        四个参数，可自由组合图片、文字、按钮等。
      </div>
      <div class="section-content">
        <C_WaterFall
          :items="customItems"
          :columns="3"
          :gap="16"
          :lazy="true"
          @item-click="handleItemClick"
        >
          <template #item="{ item, height }">
            <div class="custom-card">
              <img
                :src="item.src"
                :alt="item.title"
                class="custom-card__image"
                :style="{ height: `${height}px` }"
              />
              <div class="custom-card__body">
                <div class="custom-card__title">
                  {{ item.title }}
                </div>
                <div class="custom-card__desc">
                  {{ item.description }}
                </div>
              </div>
              <div class="custom-card__footer">
                <NButton
                  text
                  type="primary"
                  size="tiny"
                >
                  <template #icon>
                    <C_Icon name="mdi:heart-outline" />
                  </template>
                  收藏
                </NButton>
                <NButton
                  text
                  size="tiny"
                >
                  <template #icon>
                    <C_Icon name="mdi:download-outline" />
                  </template>
                  下载
                </NButton>
              </div>
            </div>
          </template>
        </C_WaterFall>
      </div>
    </div>

    <!-- 3. 固定列数 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:view-column-outline"
          class="title-icon"
        />
        固定列数（2 列商品布局）
      </h2>
      <div class="section-desc">
        通过 <code>:columns="2"</code> 固定为两列布局，忽略响应式断点。
        适合移动端商品列表、对比图展示等场景。关闭无限滚动仅展示静态数据。
      </div>
      <div class="section-content">
        <C_WaterFall
          :items="fixedItems"
          :columns="2"
          :gap="12"
          :lazy="true"
        />
      </div>
    </div>

    <!-- 4. 编程控制 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:code-braces"
          class="title-icon"
        />
        编程控制（Expose API）
      </h2>
      <div class="section-desc">
        通过 <code>ref</code> 获取组件实例，调用
        <code>relayout()</code> 强制重排、<code>scrollToTop()</code> 回顶、
        <code>getColumns()</code> 查看当前列数。
      </div>
      <div class="section-content">
        <NSpace
          :size="8"
          style="margin-bottom: 12px"
        >
          <NButton
            type="primary"
            size="small"
            @click="basicRef?.relayout()"
          >
            强制重排
          </NButton>
          <NButton
            size="small"
            @click="basicRef?.scrollToTop()"
          >
            回到顶部
          </NButton>
          <NButton
            size="small"
            @click="handleShowColumns"
          >
            查看列数
          </NButton>
          <NButton
            size="small"
            @click="handleShowHeight"
          >
            查看容器高度
          </NButton>
        </NSpace>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    WaterFallItem,
    WaterFallExpose,
  } from '@robot-admin/naive-ui-components'
  import {
    INITIAL_ITEMS,
    PAGE_SIZE,
    MAX_TOTAL,
    COLUMN_OPTIONS,
    GAP_OPTIONS,
    generateItems,
  } from './data'

  const message = useMessage()

  // ─── 1. 基础用法 ──────────────────────────────

  const basicRef = ref<WaterFallExpose>()
  const basicItems = ref<WaterFallItem[]>([])
  const basicLoading = ref(true)
  const basicNoMore = ref(false)
  const basicColumns = ref(0) // 0 = 自动
  const basicGap = ref(16)
  const basicLazy = ref(true)
  const basicSkeleton = ref(true)

  /** 模拟首屏加载（展示骨架屏） */
  onMounted(async () => {
    await new Promise(r => setTimeout(r, 1200))
    basicItems.value = [...INITIAL_ITEMS]
    basicLoading.value = false
  })

  /** 加载更多（模拟异步） */
  async function handleLoadMore() {
    if (basicLoading.value || basicNoMore.value) return
    basicLoading.value = true

    // 模拟网络延迟
    await new Promise(r => setTimeout(r, 800))

    const newItems = generateItems(basicItems.value.length, PAGE_SIZE)
    basicItems.value.push(...newItems)

    if (basicItems.value.length >= MAX_TOTAL) {
      basicNoMore.value = true
    }
    basicLoading.value = false
  }

  /** 重置（含骨架屏演示） */
  async function handleReset() {
    basicItems.value = []
    basicNoMore.value = false
    basicLoading.value = true
    await new Promise(r => setTimeout(r, 1200))
    basicItems.value = [...INITIAL_ITEMS]
    basicLoading.value = false
  }

  // ─── 2. 自定义卡片 ───────────────────────────

  const customItems = ref<WaterFallItem[]>(generateItems(100, 12))

  // ─── 3. 固定列数 ─────────────────────────────

  const fixedItems = ref<WaterFallItem[]>(generateItems(200, 8))

  // ─── 公共事件 ────────────────────────────────

  /** 卡片点击 */
  function handleItemClick(item: WaterFallItem, index: number) {
    message.info(`点击了 ${item.title}（索引 ${index}）`)
  }

  /** 查看列数 */
  function handleShowColumns() {
    const cols = basicRef.value?.getColumns()
    message.success(`当前列数：${cols}`)
  }

  /** 查看容器高度 */
  function handleShowHeight() {
    const h = basicRef.value?.getContainerHeight()
    message.success(`容器高度：${Math.round(h ?? 0)}px`)
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
