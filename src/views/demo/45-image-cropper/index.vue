<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 图片裁剪工作台，素材、场景、编辑与输出形成完整路径
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="crop-workspace">
    <header class="crop-heading"
      ><div
        ><span>IMAGE STUDIO / LOCAL FIRST</span><h1>图片裁剪工作台</h1
        ><p
          >从头像到内容封面，选好用途，调整画面，得到可直接使用的图片。</p
        ></div
      ><NButton
        size="small"
        :disabled="page.exporting"
        @click="page.fileRef?.click()"
        ><template #icon><span class="i-mdi:upload" /></template
        >选择本地图片</NButton
      ></header
    >
    <nav
      class="crop-flow"
      aria-label="裁剪步骤"
      ><span><b>01</b> 选择素材与用途</span><i /><span
        ><b>02</b> 调整裁剪区域</span
      ><i /><span><b>03</b> 预览并下载</span></nav
    >
    <div
      class="crop-presets"
      aria-label="裁剪用途"
    >
      <button
        v-for="item in CROP_PRESETS"
        :key="item.key"
        type="button"
        :aria-pressed="page.preset === item.key"
        :disabled="page.exporting"
        @click="page.applyPreset(item.key)"
        ><span :class="item.icon" /><span
          ><strong>{{ item.label }}</strong
          ><small>{{ item.note }}</small></span
        ><span
          class="crop-presets__check"
          aria-hidden="true"
          >{{ page.preset === item.key ? '✓' : '' }}</span
        ></button
      >
    </div>
    <div class="crop-layout">
      <section class="crop-editor">
        <header class="crop-source"
          ><img
            :src="page.src"
            alt="当前素材缩略图"
          /><div
            ><strong>{{ page.fileName }}</strong
            ><span
              >{{ page.sourceInfo.width }} × {{ page.sourceInfo.height }} px
              <template v-if="page.sourceInfo.size"
                >· {{ page.formatFileSize(page.sourceInfo.size) }}</template
              ></span
            ></div
          ><NButton
            size="tiny"
            :disabled="!page.ready || page.exporting"
            @click="page.modalRef?.open(page.src)"
            >弹窗编辑</NButton
          ></header
        >
        <div
          class="crop-stage"
          :class="{ 'is-dropping': page.dropping }"
          @dragover.prevent="page.dropping = true"
          @dragleave.prevent="page.dropping = false"
          @drop.prevent="page.onDrop"
          @pointerup="page.markStale"
          @wheel.passive="page.markStale"
        >
          <C_ImageCropper
            ref="cropperRef"
            :src="page.src"
            :aspect-ratio="page.ratio"
            :output-format="page.format"
            :output-quality="page.quality / 100"
            :max-output-width="page.maxWidth || 0"
            :show-toolbar="false"
            :show-preview="false"
            :disabled="page.exporting"
            :height="440"
            @ready="page.onReady"
            @error="page.onError"
          />
          <div
            v-if="page.dropping"
            class="crop-stage__drop"
            >松开以替换图片</div
          >
        </div>
        <div class="crop-tools"
          ><C_ActionBar
            :actions="transformActions"
            :config="{ size: 'tiny', wrap: true }"
          /><NButton
            size="tiny"
            :disabled="!page.ready || page.exporting"
            @click="showAnnotations = true"
          >
            <template #icon><span class="i-mdi-image-outline" /></template>
            标注原图
          </NButton></div
        >
        <footer class="crop-editor__footer"
          ><span><i />拖动画面调整位置，拖动裁剪框改变范围</span
          ><span>图片仅在本地处理</span></footer
        >
      </section>
      <aside class="crop-output">
        <section class="crop-output__settings"
          ><header><span>输出设置</span><small>EXPORT</small></header>
          <label
            >文件格式<NSelect
              v-model:value="page.format"
              :options="FORMAT_OPTIONS"
              size="small"
              :disabled="page.exporting"
              aria-label="输出文件格式"
          /></label>
          <label
            >最大输出宽度
            <NInputNumber
              v-model:value="page.maxWidth"
              :min="64"
              :max="4096"
              :step="64"
              size="small"
              :disabled="page.exporting"
              aria-label="最大输出宽度"
              ><template #suffix>px</template></NInputNumber
            ><small>保持裁剪比例，原图较小时不放大。</small></label
          >
          <label
            v-if="page.format !== 'png'"
            class="crop-quality"
            ><span
              >图片质量 <strong>{{ page.quality }}%</strong></span
            ><NSlider
              v-model:value="page.quality"
              :min="30"
              :max="100"
              :step="5"
              :disabled="page.exporting"
              aria-label="图片质量"
          /></label>
          <p
            v-else
            class="crop-output__note"
            >PNG 保留透明背景，适合 Logo 与需要透明边缘的素材。</p
          >
          <NCheckbox
            v-model:checked="page.circular"
            :disabled="page.exporting"
            >圆形预览</NCheckbox
          >
          <NButton
            block
            type="primary"
            size="small"
            :disabled="!page.ready"
            :loading="page.exporting"
            @click="page.exportCrop"
            ><template #icon><span class="i-mdi:crop" /></template
            >生成裁剪结果</NButton
          >
        </section>
        <section
          class="crop-result"
          aria-label="输出预览"
          ><header
            ><span>输出预览</span
            ><NTag
              v-if="page.result"
              size="small"
              :type="page.stale ? 'warning' : 'success'"
              :bordered="false"
              >{{ page.stale ? '需要重新生成' : '已生成' }}</NTag
            ></header
          >
          <div
            class="crop-result__canvas"
            :class="{ 'is-circular': page.circular }"
            ><img
              v-if="page.result"
              :src="page.result.base64"
              alt="裁剪输出结果"
            /><div
              v-else
              class="crop-result__empty"
              ><span class="i-mdi:image-outline" /><strong
                >成片会显示在这里</strong
              ><p>调整好画面后，点击上方生成按钮</p></div
            ></div
          >
          <template v-if="page.result"
            ><div class="crop-result__meta"
              ><span>{{ page.result.width }} × {{ page.result.height }} px</span
              ><span
                >{{ page.result.format.toUpperCase() }} ·
                {{ page.formatFileSize(page.result.blob.size) }}</span
              ></div
            ><NButton
              block
              size="small"
              :disabled="page.stale || page.exporting"
              @click="page.download"
              ><template #icon><span class="i-mdi:download" /></template
              >下载图片</NButton
            ></template
          >
          <small
            v-if="page.circular"
            class="crop-result__hint"
            >圆形仅用于预览，文件保留矩形画布。</small
          >
        </section>
      </aside>
    </div>
    <section class="crop-samples"
      ><div
        ><h2>先用示例试一试</h2
        ><p>内置品牌素材，无需上传即可体验完整流程。</p></div
      ><button
        v-for="sample in SAMPLE_IMAGES"
        :key="sample.key"
        type="button"
        :disabled="page.exporting"
        @click="page.selectSample(sample)"
        ><img
          :src="sample.src"
          alt=""
        /><span>{{ sample.label }}</span></button
      ><small>支持 PNG / JPEG / WebP，单张不超过 15 MB</small></section
    >
    <input
      ref="fileRef"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      class="crop-file-input"
      aria-label="上传裁剪图片"
      @change="page.onFileChange"
    />
    <C_ImageCropper
      ref="modalRef"
      modal
      modal-title="放大编辑图片"
      :aspect-ratio="page.ratio"
      :output-format="page.format"
      :output-quality="page.quality / 100"
      :max-output-width="page.maxWidth || 0"
      :circular="page.circular"
      @confirm="page.acceptModalResult"
      @error="page.onError"
    />
    <NModal
      v-model:show="showAnnotations"
      preset="card"
      title="原图标注"
      class="crop-annotation-dialog"
    >
      <C_ImageAnnotator
        v-if="showAnnotations"
        v-model="annotations"
        :src="page.sourceFile ?? page.src"
        :alt="page.fileName"
      />
      <output
        v-if="annotations.length"
        class="crop-annotation-result"
        data-testid="crop-annotation-result"
      >
        已保存 {{ annotations.length }} 处标注 · 坐标按原图比例记录
      </output>
    </NModal>
  </div>
</template>
<script setup lang="ts">
  import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'
  import type { ImageAnnotation } from '@robot-admin/naive-ui-components/C_ImageAnnotator'
  import { CROP_PRESETS, SAMPLE_IMAGES, FORMAT_OPTIONS } from './data'
  import { useCropWorkspace } from './useCropWorkspace'
  defineOptions({ name: 'Demo45ImageCropper' })
  const controller = useCropWorkspace()
  const page = proxyRefs(controller)
  const { cropperRef, fileRef, modalRef } = controller
  const showAnnotations = ref(false)
  const annotations = ref<readonly ImageAnnotation[]>([])
  watch(controller.src, () => {
    showAnnotations.value = false
    annotations.value = []
  })
  onDeactivated(() => {
    showAnnotations.value = false
  })
  const transformActions = computed<ActionItem[]>(() =>
    [
      {
        key: 'rotate-left',
        label: '左转',
        icon: 'mdi:rotate-left',
        onClick: () => controller.transform('left'),
      },
      {
        key: 'rotate-right',
        label: '右转',
        icon: 'mdi:rotate-right',
        onClick: () => controller.transform('right'),
      },
      {
        key: 'zoom-in',
        label: '放大',
        icon: 'mdi:magnify-plus-outline',
        onClick: () => controller.transform('zoom-in'),
      },
      {
        key: 'zoom-out',
        label: '缩小',
        icon: 'mdi:magnify-minus-outline',
        onClick: () => controller.transform('zoom-out'),
      },
      {
        key: 'flip-x',
        label: '水平翻转',
        icon: 'mdi:flip-horizontal',
        onClick: () => controller.transform('flip-x'),
      },
      {
        key: 'flip-y',
        label: '垂直翻转',
        icon: 'mdi:flip-vertical',
        onClick: () => controller.transform('flip-y'),
      },
      {
        key: 'reset',
        label: '重置',
        onClick: () => controller.transform('reset'),
      },
    ].map(item => ({
      ...item,
      disabled: !controller.ready.value || controller.exporting.value,
    }))
  )
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
