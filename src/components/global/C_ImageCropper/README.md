---
outline: 'deep'
---

# C_ImageCropper 图片裁剪

> 基于 [vue-cropper](https://github.com/xyxiao001/vue-cropper) 封装的 Vue 3 图片裁剪组件，
> 支持自由/固定比例裁剪、旋转缩放翻转、多格式输出、弹窗模式，適配头像上传和 Banner 裁剪等场景。

## ✨ 特性

- 🎯 **灵活比例** — 自由裁剪 / 1:1 / 16:9 / 4:3 / 自定义比例一键切换
- 🔄 **旋转缩放翻转** — 工具栏 + 编程 API 双重控制
- 👁️ **实时预览** — `@realTime` 事件驱动的零延迟预览面板
- 📦 **多格式输出** — PNG / JPEG / WebP + 质量控制 + 最大尺寸约束
- 🪟 **弹窗模式** — `modal` 属性开启弹窗裁剪，适配上传后二次裁剪
- 🎭 **圆形裁剪** — `circular` 属性实现圆形头像裁剪
- 📐 **边界约束** — `centerBox` 裁剪框始终在图片范围内，不会超出
- 🔒 **滚轮锁定** — 禁止鼠标滚轮缩放背景图，操作更可控

## 📦 依赖

| 包            | 版本     | 说明             |
| ------------- | -------- | ---------------- |
| `vue-cropper` | `^1.1.4` | Vue 3 裁剪组件库 |

> 安装：`bun add vue-cropper@next`

## 🚀 基本用法

```vue
<template>
  <C_ImageCropper
    ref="cropperRef"
    src="/path/to/image.jpg"
    :aspect-ratio="1"
    @crop="onCrop"
  />
</template>

<script setup lang="ts">
  const cropperRef = ref()

  async function onCrop(result) {
    console.log(result.base64, result.blob, result.width, result.height)
  }

  // 编程获取裁剪结果
  const result = await cropperRef.value.getCropResult()
</script>
```

## 🪟 弹窗模式

```vue
<template>
  <NButton @click="cropperRef?.open('/path/to/image.jpg')"> 打开裁剪 </NButton>
  <C_ImageCropper
    ref="cropperRef"
    modal
    modal-title="裁剪 Banner"
    :aspect-ratio="16 / 9"
    @confirm="onConfirm"
  />
</template>
```

## 🎭 圆形头像裁剪

```vue
<C_ImageCropper
  src="/avatar.jpg"
  :aspect-ratio="1"
  circular
  output-format="png"
/>
```

## 📋 API

### Props

| 属性                | 类型                        | 默认值       | 说明                      |
| ------------------- | --------------------------- | ------------ | ------------------------- |
| `src`               | `string`                    | `''`         | 图片源（URL / base64）    |
| `aspect-ratio`      | `number`                    | `0`          | 裁剪比例，0 = 自由        |
| `output-format`     | `'png' \| 'jpeg' \| 'webp'` | `'png'`      | 输出格式                  |
| `output-quality`    | `number`                    | `0.92`       | JPEG/WebP 质量 0-1        |
| `max-output-width`  | `number`                    | `0`          | 最大输出宽度 px，0 = 不限 |
| `max-output-height` | `number`                    | `0`          | 最大输出高度 px，0 = 不限 |
| `show-preview`      | `boolean`                   | `true`       | 显示预览面板              |
| `show-toolbar`      | `boolean`                   | `true`       | 显示工具栏                |
| `circular`          | `boolean`                   | `false`      | 圆形裁剪遮罩              |
| `disabled`          | `boolean`                   | `false`      | 禁用                      |
| `height`            | `string \| number`          | `'400px'`    | 容器高度                  |
| `modal`             | `boolean`                   | `false`      | 弹窗模式                  |
| `modal-title`       | `string`                    | `'图片裁剪'` | 弹窗标题                  |

### Events

| 事件      | 参数         | 说明         |
| --------- | ------------ | ------------ |
| `crop`    | `CropResult` | 裁剪完成     |
| `ready`   | —            | 图片加载完成 |
| `error`   | `Event`      | 图片加载失败 |
| `confirm` | `CropResult` | 弹窗确认     |
| `cancel`  | —            | 弹窗取消     |

### Expose

| 方法                    | 参数      | 说明                               |
| ----------------------- | --------- | ---------------------------------- |
| `getCropResult()`       | —         | 获取裁剪结果 `Promise<CropResult>` |
| `rotate(angle)`         | `number`  | 旋转（以 90° 为单位）              |
| `zoom(scale)`           | `number`  | 缩放（正数放大 / 负数缩小）        |
| `flipX()`               | —         | 水平翻转                           |
| `flipY()`               | —         | 垂直翻转                           |
| `reset()`               | —         | 重置变换                           |
| `setAspectRatio(ratio)` | `number`  | 设置裁剪比例                       |
| `loadFile(file)`        | `File`    | 从 File 加载                       |
| `open(src?)`            | `string?` | 打开弹窗（modal 模式）             |
| `close()`               | —         | 关闭弹窗                           |

### CropResult

```ts
interface CropResult {
  base64: string // base64 数据
  blob: Blob // Blob 对象
  width: number // 宽度 px
  height: number // 高度 px
  format: 'png' | 'jpeg' | 'webp'
}
```

## 📁 文件结构

```
C_ImageCropper/
├── index.vue                         # 主组件（内联 + 弹窗模式）
├── index.scss                        # 组件样式
├── components/
│   ├── CropperToolbar.vue            # 操作工具栏
│   └── CropperPreview.vue            # 预览面板（@realTime 驱动）
└── README.md

types/modules/image-cropper.d.ts      # 类型定义
composables/ImageCropper/
└── useCropperCore.ts                 # vue-cropper 实例管理 + 输出
```
