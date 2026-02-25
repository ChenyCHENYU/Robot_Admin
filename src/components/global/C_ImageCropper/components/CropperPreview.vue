<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 23:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_ImageCropper\components\CropperPreview.vue
 * @Description: 裁剪预览面板（基于 vue-cropper @realTime 数据）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="cropper-preview">
    <div class="preview-label">
      <C_Icon name="mdi:eye-outline" />
      <span>裁剪预览</span>
    </div>

    <!--
      vue-cropper @realTime 返回的数据结构：
      {
        w: number,                // 裁剪框宽度 px
        h: number,                // 裁剪框高度 px
        url: string,              // 原始图片 src
        div: { width, height },   // 裁剪框视口样式（绝对像素）
        img: { width, height, transform }  // 原图定位样式（transform 含 scale + translate3d + rotateZ）
      }
      预览原理：外层 div 为裁剪框大小 overflow:hidden，内层 img 用 transform 偏移只露出裁剪区域。
      缩放：用 CSS zoom 将整个结构等比缩小到预览容器尺寸。
    -->

    <!-- 主预览区 -->
    <div
      ref="mainBoxRef"
      class="preview-main"
      :class="{ 'preview-main--circular': circular }"
    >
      <template v-if="hasValidPreview">
        <div
          class="preview-main__viewport"
          :style="mainViewportStyle"
        >
          <div :style="previewData.div">
            <img
              :src="previewData.url"
              :style="previewData.img"
              alt="preview"
            />
          </div>
        </div>
      </template>
      <div
        v-else
        class="preview-empty"
      >
        <C_Icon
          name="mdi:image-outline"
          style="font-size: 32px; opacity: 0.2"
        />
      </div>
    </div>

    <!-- 缩略预览 -->
    <div class="preview-thumbs">
      <div
        v-for="item in thumbSizes"
        :key="item.label"
        class="preview-thumb"
      >
        <div
          class="preview-thumb__box"
          :class="{ 'preview-thumb__box--circular': circular }"
          :style="{ width: `${item.size}px`, height: `${item.size}px` }"
        >
          <template v-if="hasValidPreview">
            <div
              class="preview-thumb__viewport"
              :style="getThumbViewportStyle(item.size)"
            >
              <div :style="previewData.div">
                <img
                  :src="previewData.url"
                  :style="previewData.img"
                  alt="thumb"
                />
              </div>
            </div>
          </template>
        </div>
        <span class="preview-thumb__label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    /** vue-cropper @realTime 返回的数据 { w, h, div, img, url } */
    previewData: any
    circular?: boolean
  }>()

  const mainBoxRef = ref<HTMLElement | null>(null)
  const mainBoxWidth = ref(200)

  const thumbSizes = [
    { label: '80px', size: 80 },
    { label: '48px', size: 48 },
    { label: '32px', size: 32 },
  ]

  /** 是否有有效预览数据 */
  const hasValidPreview = computed(() => {
    const d = props.previewData
    return d && d.url && d.w > 0 && d.h > 0
  })

  /**
   * 主预览区视口样式
   * vue-cropper 返回的 div/img 是裁剪框原始像素尺寸，
   * 用 CSS zoom 缩放到预览容器宽度
   */
  const mainViewportStyle = computed(() => {
    if (!hasValidPreview.value) return {}
    const { w } = props.previewData
    // zoom = 预览容器宽度 / 裁剪框原始宽度
    const zoom = mainBoxWidth.value / w
    return {
      zoom,
      overflow: 'hidden',
    }
  })

  /**
   * 缩略图视口样式
   * 按目标尺寸 / 裁剪框宽度 计算 zoom
   */
  function getThumbViewportStyle(size: number) {
    if (!hasValidPreview.value) return {}
    const { w } = props.previewData
    return {
      zoom: size / w,
      overflow: 'hidden',
    }
  }

  /** 监测主预览容器宽度 */
  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    if (mainBoxRef.value) {
      mainBoxWidth.value = mainBoxRef.value.clientWidth
      resizeObserver = new ResizeObserver(entries => {
        // 使用 rAF 防止 "ResizeObserver loop completed with undelivered notifications" 错误
        requestAnimationFrame(() => {
          for (const entry of entries) {
            mainBoxWidth.value = entry.contentRect.width
          }
        })
      })
      resizeObserver.observe(mainBoxRef.value)
    }
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
  })
</script>

<style lang="scss" scoped>
  .cropper-preview {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .preview-label {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-color-2);
    }

    .preview-main {
      width: 100%;
      overflow: hidden;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background:
        linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
      background-position:
        0 0,
        0 8px,
        8px -8px,
        -8px 0;
      background-size: 16px 16px;

      &--circular {
        border-radius: 50%;
      }

      // 预览区域内的 img 不能设置 width/height/object-fit，
      // 必须完全由 vue-cropper 的内联样式控制
      &__viewport img {
        display: block;
        max-width: none !important;
      }
    }

    .preview-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      min-height: 120px;
    }

    .preview-thumbs {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      justify-content: center;
    }

    .preview-thumb {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;

      &__box {
        overflow: hidden;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--body-color);

        &--circular {
          border-radius: 50%;
        }
      }

      // 缩略图内 img 同样不能覆盖内联样式
      &__viewport img {
        display: block;
        max-width: none !important;
      }

      &__label {
        font-size: 11px;
        color: var(--text-color-3);
      }
    }
  }
</style>
