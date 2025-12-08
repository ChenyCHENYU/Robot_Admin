/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-24 14:20:31
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-24 14:27:12
 * @FilePath: \Robot_Admin\src\views\demo\01-icon\data.ts
 * @Description: 图标组件演示数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import IconCommunity from '@/components/icons/IconCommunity.vue'
import IconDocumentation from '@/components/icons/IconDocumentation.vue'

// 类型定义
export interface IconConfig {
  key: string
  props: Record<string, any>
  label: string | (() => string)
  handler?: () => void
}

export interface DemoSection {
  id: string
  language: string
  title: string
  badge: string
  badgeText: string
  icons: IconConfig[]
  code: string
  note?: string
}

// SVG 路径常量
export const SVG_PATHS = {
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z',
  cross:
    'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z',
}

// 代码示例配置
export const codeExamples = {
  iconify: `<!-- 基础用法 -->
<C_Icon name="mdi:home" />

<!-- 自定义大小和颜色 -->
<C_Icon name="mdi:settings" size="24" />
<C_Icon name="material-symbols:favorite" color="red" size="32" />

<!-- 可点击交互 -->
<C_Icon name="lucide:star" clickable @click="handleClick" />`,

  unocss: `<!-- UnoCSS 图标需要指定 type -->
<C_Icon type="unocss" name="i-mdi-home" />
<C_Icon type="unocss" name="i-mdi-settings" size="24" />
<C_Icon type="unocss" name="i-mdi-user" color="#42b883" size="32" />

<!-- 支持交互 -->
<C_Icon type="unocss" name="i-mdi-heart" clickable @click="handleClick" />`,

  svg: `<!-- SVG 路径图标 -->
<C_Icon
  type="svg"
  name="custom-check"
  :svg-path="checkPath"
  color="green"
  size="24"
/>

<script setup>
const checkPath = "M9 16.17L4.83 12l-1.42 1.41L9 19..."
</script>`,

  component: `<!-- 组件方式图标 -->
<script setup>
import IconCommunity from '@/components/icons/IconCommunity.vue'
</script>

<C_Icon
  type="component"
  :name="IconCommunity"
  :component-props="{ width: 32, height: 32 }"
/>`,

  image: `<!-- 本地图片 - 自动使用 useImage -->
<C_Icon type="image" name="avatar" size="32" />
<C_Icon type="image" name="icons/home" size="32" />

<!-- 远程图片 - 直接使用 URL -->
<C_Icon
  type="image"
  name="https://cdn.jsdelivr.net/gh/devicons/..."
  size="32"
/>

<!-- 手动控制本地处理 -->
<C_Icon
  type="image"
  name="logo"
  :use-local-image="true"
  fallback-icon="mdi:image"
/>`,

  interactive: `<!-- 可点击图标 -->
<C_Icon name="mdi:thumb-up" clickable @click="handleLike" />

<!-- 加载状态 -->
<C_Icon name="mdi:loading" :loading="loading" clickable />

<!-- 旋转和翻转效果 -->
<C_Icon name="mdi:refresh" :rotate="rotation" clickable />
<C_Icon name="mdi:arrow-right" :flip="flipped ? 'horizontal' : undefined" />`,

  error: `<!-- 错误时显示 fallback 图标 -->
<C_Icon
  name="nonexistent:icon"
  fallback-icon="mdi:help-circle"
  @error="handleError"
/>

<C_Icon
  type="image"
  name="https://nonexistent.com/image.png"
  fallback-icon="mdi:image-broken"
  @error="handleError"
/>`,

  custom: `<!-- 自定义动画样式 -->
<C_Icon
  name="mdi:star"
  size="48"
  color="gold"
  custom-class="sparkle-icon"
/>

<style>
.sparkle-icon {
  animation: sparkle 2s ease-in-out infinite;
}
</style>`,
}

/**
 * * @description 创建事件处理器集合
 * ? @param loading - 加载状态响应式引用
 * ? @param rotation - 旋转角度响应式引用
 * ? @param flipped - 翻转状态响应式引用
 * ! @return 包含所有事件处理函数的对象
 */
export const createHandlers = (
  loading: Ref<boolean>,
  rotation: Ref<number>,
  flipped: Ref<boolean>
) => ({
  click: () => console.log('图标被点击'),
  like: () => console.log('点赞按钮被点击'),
  toggleLoading: () => {
    loading.value = !loading.value
    console.log(`加载状态: ${loading.value ? '开始' : '结束'}`)
  },
  rotate: () => {
    rotation.value += 90
    if (rotation.value >= 360) rotation.value = 0
    console.log(`旋转角度: ${rotation.value}°`)
  },
  flip: () => {
    flipped.value = !flipped.value
    console.log(`翻转状态: ${flipped.value ? '已翻转' : '正常'}`)
  },
})

/**
 * * @description 创建演示数据配置
 * ? @param handlers - 事件处理器对象
 * ? @param loading - 加载状态响应式引用
 * ? @param rotation - 旋转角度响应式引用
 * ? @param flipped - 翻转状态响应式引用
 * ! @return 完整的演示区块配置数组
 */
export const createDemoSections = (
  handlers: ReturnType<typeof createHandlers>,
  loading: Ref<boolean>,
  rotation: Ref<number>,
  flipped: Ref<boolean>
): DemoSection[] => [
  {
    id: 'iconify',
    language: 'html',
    title: '1. Iconify 图标（默认推荐）',
    badge: 'primary',
    badgeText: '默认',
    icons: [
      { key: 'home', props: { name: 'mdi:home' }, label: 'mdi:home' },
      {
        key: 'settings',
        props: { name: 'mdi:settings', size: '24' },
        label: 'size="24"',
      },
      {
        key: 'favorite',
        props: { name: 'material-symbols:favorite', color: 'red', size: '32' },
        label: 'color="red"',
      },
      {
        key: 'star',
        props: { name: 'lucide:star', clickable: true },
        label: '可点击',
        handler: handlers.click,
      },
    ],
    code: codeExamples.iconify,
  },
  {
    id: 'unocss',
    language: 'html',
    title: '2. UnoCSS 图标',
    badge: 'secondary',
    badgeText: '静态',
    icons: [
      {
        key: 'home',
        props: { type: 'unocss', name: 'i-mdi:home-assistant' },
        label: 'i-mdi-home',
      },
      {
        key: 'settings',
        props: {
          type: 'unocss',
          name: 'i-mdi:account-multiple-check-outline',
          size: '24',
        },
        label: 'size="24"',
      },
      {
        key: 'user',
        props: {
          type: 'unocss',
          name: 'i-mdi:user-group',
          color: '#42b883',
          size: '32',
        },
        label: 'color="#42b883"',
      },
      {
        key: 'heart',
        props: {
          type: 'unocss',
          name: 'i-mdi:ev-plug-chademo',
          clickable: true,
        },
        label: '可点击',
        handler: handlers.click,
      },
    ],
    code: codeExamples.unocss,
  },
  {
    id: 'svg',
    language: 'html',
    title: '3. SVG 路径图标',
    badge: 'warning',
    badgeText: '自定义',
    icons: [
      {
        key: 'check',
        props: {
          type: 'svg',
          name: 'custom-check',
          svgPath: SVG_PATHS.check,
          color: 'green',
          size: '24',
        },
        label: '✓ 成功',
      },
      {
        key: 'cross',
        props: {
          type: 'svg',
          name: 'custom-cross',
          svgPath: SVG_PATHS.cross,
          color: 'red',
          size: '24',
        },
        label: '✗ 错误',
      },
    ],
    code: codeExamples.svg,
  },
  {
    id: 'component',
    language: 'html',
    title: '4. 组件图标',
    badge: 'info',
    badgeText: '组件',
    icons: [
      {
        key: 'community',
        props: {
          type: 'component',
          name: IconCommunity,
          componentProps: { width: 32, height: 32 },
        },
        label: 'IconCommunity',
      },
      {
        key: 'docs',
        props: {
          type: 'component',
          name: IconDocumentation,
          componentProps: { color: 'gold', size: 32 },
        },
        label: 'IconDocumentation',
      },
    ],
    code: codeExamples.component,
    note: '<strong>注意：</strong>组件方式需要确保对应的图标组件已正确导入和注册',
  },
  {
    id: 'image',
    language: 'html',
    title: '5. 图片图标（集成 useImage）',
    badge: 'success',
    badgeText: '智能',
    icons: [
      {
        key: 'avatar',
        props: {
          type: 'image',
          name: 'avatar',
          size: '32',
          alt: '头像',
        },
        label: '本地: avatar',
      },
      {
        key: 'home-icon',
        props: {
          type: 'image',
          name: 'icons/home',
          size: '32',
          alt: '首页图标',
        },
        label: '本地: icons/home',
      },
      {
        key: 'vue-cdn',
        props: {
          type: 'image',
          name: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
          size: '32',
          alt: 'Vue Logo',
        },
        label: '远程: Vue CDN',
      },
      {
        key: 'logo-local',
        props: {
          type: 'image',
          name: 'robot',
          size: '32',
          fallbackIcon: 'mdi:image',
        },
        label: '本地: robot',
      },
    ],
    code: codeExamples.image,
    note: '<strong>图片处理说明：</strong><br>• 本地图片：自动使用 useImage hook 处理<br>• 远程图片：HTTP/HTTPS URL 直接使用<br>• 手动控制：use-local-image 属性强制指定处理方式',
  },
  {
    id: 'interactive',
    language: 'html',
    title: '6. 交互式功能',
    badge: 'purple',
    badgeText: '交互',
    icons: [
      {
        key: 'like',
        props: {
          name: 'mdi:thumb-up',
          clickable: true,
          size: '32',
          title: '点赞',
        },
        label: '可点击',
        handler: handlers.like,
      },
      {
        key: 'loading',
        props: {
          name: 'mdi:loading',
          loading: loading.value,
          size: '32',
          clickable: true,
          title: '切换加载状态',
        },
        label: '加载状态',
        handler: handlers.toggleLoading,
      },
      {
        key: 'rotate',
        props: {
          name: 'mdi:refresh',
          rotate: rotation.value,
          size: '32',
          clickable: true,
          title: '旋转图标',
        },
        label: () => `旋转: ${rotation.value}°`,
        handler: handlers.rotate,
      },
      {
        key: 'flip',
        props: {
          name: 'mdi:arrow-right',
          flip: flipped.value ? 'horizontal' : undefined,
          size: '32',
          clickable: true,
          title: '翻转图标',
        },
        label: () => (flipped.value ? '已翻转' : '正常'),
        handler: handlers.flip,
      },
    ],
    code: codeExamples.interactive,
  },
  {
    id: 'error',
    language: 'html',
    title: '7. 错误处理',
    badge: 'danger',
    badgeText: '容错',
    icons: [
      {
        key: 'nonexistent',
        props: { name: 'nonexistent:icon', fallbackIcon: 'mdi:help-circle' },
        label: '不存在的图标',
      },
      {
        key: 'broken-image',
        props: {
          type: 'image',
          name: 'https://nonexistent.com/image.png',
          fallbackIcon: 'mdi:image-broken',
        },
        label: '错误的图片',
      },
      {
        key: 'local-error',
        props: {
          type: 'image',
          name: 'nonexistent-local',
          fallbackIcon: 'mdi:image-off',
        },
        label: '本地图片错误',
      },
    ],
    code: codeExamples.error,
    note: '<strong>错误处理机制：</strong><br>• 自动显示 fallback-icon 作为备用图标<br>• 触发 error 事件供业务逻辑处理<br>• 支持 Iconify 和 UnoCSS 格式的 fallback',
  },
  {
    id: 'custom',
    language: 'html',
    title: '8. 自定义样式',
    badge: 'warning',
    badgeText: '样式',
    icons: [
      {
        key: 'sparkle',
        props: {
          name: 'mdi:star',
          size: '48',
          color: 'gold',
          customClass: 'sparkle-icon',
        },
        label: '闪烁动画',
      },
      {
        key: 'pulse',
        props: {
          name: 'mdi:heart',
          size: '48',
          color: 'red',
          customClass: 'pulse-icon',
        },
        label: '脉冲动画',
      },
    ],
    code: codeExamples.custom,
  },
]
