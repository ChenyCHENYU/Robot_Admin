<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-01 13:27:49
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-05 11:05:43
 * @FilePath: \Robot_Admin\src\components\global\C_Editor\index.vue
 * @Description: 富文本编辑器组件（简化主题版）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <!-- 编辑器容器 -->
  <div
    ref="editorContainer"
    :id="editorId"
    v-show="isInitialized"
    class="w-full"
    :class="{ 'editor-dark': isDark }"
    @focusin="handleEditorFocus"
    @focusout="handleEditorBlur"
  ></div>
</template>

<script setup lang="ts">
  import E from 'wangeditor'

  /**
   * * @description 编辑器组件属性接口
   * ! @interface Props
   */
  interface Props {
    /** 编辑器唯一标识 */
    editorId: string
    /** 编辑器初始值 */
    modelValue?: string
    /** 占位符 */
    placeholder?: string
    /** 是否禁用 */
    disabled?: boolean
    /** 是否只读 */
    readonly?: boolean
    /** 编辑器高度 */
    height?: number
    /** 主题模式 */
    theme?: 'light' | 'dark'
  }

  /**
   * * @description 编辑器组件事件接口
   * ! @interface Emits
   */
  interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'editor-mounted', editor: any): void
    (e: 'editor-change', html: string): void
  }

  // ================= 组件属性和事件 =================

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '',
    disabled: false,
    readonly: false,
    height: 240,
    theme: 'light',
  })

  const emit = defineEmits<Emits>()

  // ================= 响应式状态 =================

  const editorContainer = ref<HTMLElement | null>(null)
  const editorInstance = ref<any>(null)
  const isInitialized = ref<boolean>(false)

  // 获取当前是否为暗色主题
  const isDark = computed(() => props.theme === 'dark')

  // ================= 编辑器初始化 =================

  /**
   * * @description 初始化编辑器
   */
  const initializeEditor = (): void => {
    if (!editorContainer.value || isInitialized.value) return

    try {
      const editor = new E(editorContainer.value)

      // 配置编辑器 - 使用类型断言避免TypeScript错误
      const editorConfig = editor.config as any
      editorConfig.placeholder = props.placeholder

      // 🎯 设置编辑器高度限制
      editorConfig.height = props.height - 50 // 减去工具栏高度

      // 监听内容变化
      editorConfig.onchange = (html: string) => {
        emit('update:modelValue', html)
        emit('editor-change', html)
      }

      // 创建编辑器
      editor.create()

      // 🎯 编辑器创建后立即稳定化
      nextTick(() => {
        // 设置初始内容
        if (props.modelValue) {
          editor.txt.html(props.modelValue)
        }

        // 设置只读状态
        if (props.readonly) {
          editor.disable()
        }

        // 保存实例并标记为已初始化
        editorInstance.value = editor
        isInitialized.value = true

        // 触发挂载事件
        emit('editor-mounted', editor)
      })
    } catch (error) {
      console.error(
        `[EditorComponent] 编辑器初始化失败: ${props.editorId}`,
        error
      )
    }
  }

  /**
   * * @description 销毁编辑器
   */
  const destroyEditor = (): void => {
    if (editorInstance.value && isInitialized.value) {
      try {
        editorInstance.value.destroy()
        editorInstance.value = null
        isInitialized.value = false
      } catch (error) {
        console.error(
          `[EditorComponent] 编辑器销毁失败: ${props.editorId}`,
          error
        )
      }
    }
  }

  /**
   * * @description 设置编辑器内容
   * ? @param html HTML内容
   */
  const setContent = (html: string): void => {
    if (editorInstance.value && isInitialized.value) {
      try {
        editorInstance.value.txt.html(html)
      } catch (error) {
        console.warn(
          `[EditorComponent] 设置编辑器内容失败: ${props.editorId}`,
          error
        )
      }
    }
  }

  /**
   * * @description 获取编辑器内容
   * ! @return HTML内容
   */
  const getContent = (): string => {
    if (editorInstance.value && isInitialized.value) {
      try {
        return editorInstance.value.txt.html()
      } catch (error) {
        console.warn(
          `[EditorComponent] 获取编辑器内容失败: ${props.editorId}`,
          error
        )
        return ''
      }
    }
    return ''
  }

  // ================= 监听器 =================

  // 监听modelValue变化
  watch(
    () => props.modelValue,
    newValue => {
      if (editorInstance.value && isInitialized.value) {
        const currentContent = editorInstance.value.txt.html()
        if (currentContent !== newValue) {
          editorInstance.value.txt.html(newValue || '')
        }
      }
    }
  )

  // 监听禁用状态
  watch(
    () => props.disabled,
    disabled => {
      if (editorInstance.value && isInitialized.value) {
        try {
          if (disabled) {
            editorInstance.value.disable()
          } else {
            editorInstance.value.enable()
          }
        } catch (error) {
          console.warn(
            `[EditorComponent] 设置编辑器状态失败: ${props.editorId}`,
            error
          )
        }
      }
    }
  )

  // 监听只读状态
  watch(
    () => props.readonly,
    readonly => {
      if (editorInstance.value && isInitialized.value) {
        try {
          if (readonly) {
            editorInstance.value.disable()
          } else {
            editorInstance.value.enable()
          }
        } catch (error) {
          console.warn(
            `[EditorComponent] 设置编辑器只读状态失败: ${props.editorId}`,
            error
          )
        }
      }
    }
  )

  // ================= 防溢出处理 =================

  /**
   * * @description 处理编辑器聚焦时的溢出问题
   */
  const handleEditorFocus = (): void => {
    if (!editorContainer.value) return

    const container = editorContainer.value.closest(
      '.form-demo'
    ) as HTMLElement | null
    if (container) {
      // 添加聚焦类名
      container.classList.add('editor-focused')

      // 确保容器宽度稳定
      const containerWidth = container.scrollWidth
      container.style.maxWidth = `${containerWidth}px`
    }
  }

  /**
   * * @description 处理编辑器失焦
   */
  const handleEditorBlur = (): void => {
    if (!editorContainer.value) return

    const container = editorContainer.value.closest(
      '.form-demo'
    ) as HTMLElement | null
    if (container) {
      // 移除聚焦类名和固定宽度
      container.classList.remove('editor-focused')
      container.style.maxWidth = ''
    }
  }

  // ================= 生命周期 =================

  onMounted(() => {
    // 确保 DOM 渲染完成后初始化编辑器
    nextTick(() => {
      initializeEditor()
    })
  })

  onBeforeUnmount(() => {
    destroyEditor()
  })

  // ================= 对外暴露 =================

  defineExpose({
    initializeEditor,
    destroyEditor,
    setContent,
    getContent,
    handleEditorFocus,
    handleEditorBlur,
    editorInstance: readonly(editorInstance),
    isInitialized: readonly(isInitialized),
  })
</script>

<style scoped>
  /* 暗色主题样式 */
  .editor-dark :deep(.w-e-toolbar) {
    background-color: #1f2937 !important;
    border-color: #374151 !important;
  }

  .editor-dark :deep(.w-e-toolbar .w-e-menu .w-e-menu-item) {
    color: #e5e7eb !important;
  }

  .editor-dark :deep(.w-e-toolbar .w-e-menu .w-e-menu-item:hover) {
    background-color: #374151 !important;
    color: #ffffff !important;
  }

  .editor-dark :deep(.w-e-toolbar .w-e-menu .w-e-menu-item.w-e-active) {
    background-color: #2080f0 !important;
    color: #ffffff !important;
  }

  .editor-dark :deep(.w-e-text-container) {
    background-color: #111827 !important;
    border-color: #374151 !important;
  }

  .editor-dark :deep(.w-e-text-container .w-e-text) {
    background-color: #303033 !important;
    color: #e5e7eb !important;
  }

  .editor-dark :deep(.w-e-text-container .w-e-text:focus) {
    background-color: #111827 !important;
    color: #e5e7eb !important;
  }

  /* 防止宽度溢出的样式 */
  :deep(.w-e-toolbar),
  :deep(.w-e-text-container) {
    max-width: 100% !important;
    overflow-x: auto !important;
    box-sizing: border-box !important;
  }

  :deep(.w-e-text) {
    max-width: 100% !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }

  /* 编辑器过渡效果 */
  :deep(.w-e-toolbar),
  :deep(.w-e-text-container),
  :deep(.w-e-text) {
    transition:
      background-color 0.3s ease,
      border-color 0.3s ease,
      color 0.3s ease !important;
  }

  /* 编辑器聚焦时的特殊处理 */
  .editor-focused {
    overflow: hidden !important;
    max-width: 100% !important;
  }
</style>
