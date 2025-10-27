<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-20 16:15:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-10-27 16:18:53
 * @FilePath: \Robot_Admin\src\components\global\C_Markdown\index.vue
 * @Description: Markdown 编辑器封装组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    class="c-markdown-wrapper"
    :class="{ 'is-dark': isDark }"
  >
    <v-md-editor
      :model-value="modelValue"
      :height="height"
      :placeholder="placeholder"
      :toolbar="toolbar"
      :mode="mode"
      :upload-image-config="computedUploadImageConfig"
      :toc-nav-position="tocNavPosition"
      :default-fullscreen="defaultFullscreen"
      :autofocus="autofocus"
      :include-level="includeLevel"
      :left-toolbar="leftToolbar"
      :right-toolbar="rightToolbar"
      :default-show-toc="true"
      @update:model-value="handleInput"
      @change="handleChange"
      @save="handleSave"
      @upload-image="handleUploadImage"
      @fullscreen-change="handleFullscreenChange"
      @copy-code-success="handleCopyCodeSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { useThemeVars } from 'naive-ui/es'

  /**
   * 类型定义
   */
  export type InsertImageFunction = (config: {
    url: string
    desc?: string
    width?: string | number
    height?: string | number
  }) => void

  /**
   * Props 定义
   */
  interface Props {
    modelValue?: string
    height?: string | number
    disabled?: boolean
    placeholder?: string
    mode?: 'edit' | 'editable' | 'preview'
    toolbar?: object
    uploadImageConfig?: {
      accept?: string
      multiple?: boolean
      [key: string]: any
    }
    tocNavPosition?: 'left' | 'right'
    defaultFullscreen?: boolean
    autofocus?: boolean
    includeLevel?: number[]
    leftToolbar?: string
    rightToolbar?: string
    // 自定义扩展 props
    maxLength?: number
    showWordCount?: boolean
    autoSave?: boolean
    autoSaveInterval?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    height: '400px',
    disabled: false,
    placeholder: '请输入 Markdown 内容...',
    mode: 'editable',
    tocNavPosition: 'right',
    defaultFullscreen: false,
    autofocus: false,
    includeLevel: () => [1, 2, 3, 4, 5, 6],
    leftToolbar:
      'undo redo clear | h bold italic strikethrough quote | ul ol table hr | link image code | save',
    rightToolbar: 'preview toc sync-scroll fullscreen',
    maxLength: 50000,
    showWordCount: true,
    autoSave: false,
    autoSaveInterval: 30000, // 30秒
  })

  /**
   * Emits 定义
   */
  interface Emits {
    'update:modelValue': [value: string]
    change: [text: string, html: string]
    save: [text: string, html: string]
    'upload-image': [
      event: Event,
      insertImage: InsertImageFunction,
      files: FileList,
    ]
    'fullscreen-change': [isFullscreen: boolean]
    'copy-code-success': [text: string]
    // 自定义事件
    'word-count-change': [count: number]
    'auto-save': [text: string]
    'max-length-exceeded': [currentLength: number, maxLength: number]
  }

  const emit = defineEmits<Emits>()

  // 获取 Naive UI 主题变量
  const themeVars = useThemeVars()

  // 检测是否为暗色主题
  const isDark = computed(() => {
    return (
      themeVars.value.baseColor === '#000' ||
      themeVars.value.bodyColor?.includes('18') || // 检测暗色背景
      document.documentElement.classList.contains('dark')
    )
  })

  /**
   * 计算属性
   */
  const wordCount = computed(() => {
    return props.modelValue?.length || 0
  })

  /**
   * 上传图片配置
   */
  const computedUploadImageConfig = computed(() => {
    const defaultConfig = {
      accept: 'image/*',
      multiple: false,
    }

    return props.uploadImageConfig
      ? { ...defaultConfig, ...props.uploadImageConfig }
      : defaultConfig
  })

  /**
   * 生命周期
   */
  onMounted(() => {
    // 初始化字数统计，确保预设内容也能被统计
    if (props.showWordCount && props.modelValue) {
      emit('word-count-change', props.modelValue.length)
    }
  })

  /**
   * 监听器
   */
  // 监听 modelValue 变化，立即更新字数统计
  watch(
    () => props.modelValue,
    newValue => {
      if (props.showWordCount) {
        emit('word-count-change', newValue?.length || 0)
      }
    },
    { immediate: true }
  )

  /**
   * 事件处理函数
   */
  const handleInput = (value: string) => {
    // 检查最大长度限制
    if (value.length > props.maxLength) {
      emit('max-length-exceeded', value.length, props.maxLength)
      return
    }

    emit('update:modelValue', value)

    // 字数统计变化
    if (props.showWordCount) {
      emit('word-count-change', value.length)
    }
  }

  const handleChange = (text: string, html: string) => {
    emit('change', text, html)

    // 自动保存
    if (props.autoSave) {
      autoSave(text)
    }
  }

  const handleSave = (text: string, html: string) => {
    emit('save', text, html)
  }

  const handleUploadImage = (
    event: Event,
    insertImage: InsertImageFunction,
    files: FileList
  ) => {
    emit('upload-image', event, insertImage, files)
  }

  const handleFullscreenChange = (isFullscreen: boolean) => {
    emit('fullscreen-change', isFullscreen)
  }

  const handleCopyCodeSuccess = (text: string) => {
    emit('copy-code-success', text)
  }

  /**
   * 自动保存功能
   */
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

  const autoSave = (text: string) => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    autoSaveTimer = setTimeout(() => {
      emit('auto-save', text)
    }, props.autoSaveInterval)
  }

  /**
   * 暴露的方法
   */
  const focus = () => {
    // 获取编辑器实例并聚焦
    // 这里需要根据实际的 v-md-editor 实例来实现
  }

  const getHtml = () => {
    // 获取 HTML 内容
    // 需要根据实际的 v-md-editor 实例来实现
    return ''
  }

  const insertText = (_text: string) => {
    console.log('🚀 ~ insertText ~ _text:', _text)
    // 插入文本
    // 这里需要根据实际的 v-md-editor 实例来实现
  }

  // 暴露方法给父组件
  defineExpose({
    focus,
    getHtml,
    insertText,
    wordCount, // 直接暴露响应式对象，而不是 .value
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
