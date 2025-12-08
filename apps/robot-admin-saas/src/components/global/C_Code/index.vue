<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-19 08:26:47
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-19 17:14:34
 * @FilePath: \Robot_Admin\src\components\global\C_Code\index.vue
 * @Description: 全局代码高亮组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="c-code-wrapper">
    <!-- 代码标题栏 -->
    <div
      v-if="showHeader"
      class="c-code-header"
    >
      <div class="c-code-title">
        <div
          v-if="languageIcon"
          :class="languageIcon"
          class="mr-2 text-16px"
        />
        <span>{{ title || getLanguageTitle(language) }}</span>
      </div>
      <div class="c-code-actions">
        <NTooltip trigger="hover">
          <template #trigger>
            <NButton
              size="tiny"
              quaternary
              @click="copyCode"
              :loading="copying"
            >
              <template #icon>
                <div
                  :class="
                    copying
                      ? 'i-mdi:loading animate-spin'
                      : 'i-mdi:content-copy'
                  "
                />
              </template>
            </NButton>
          </template>
          复制代码
        </NTooltip>

        <NTooltip
          v-if="showFullscreen"
          trigger="hover"
        >
          <template #trigger>
            <NButton
              size="tiny"
              quaternary
              @click="toggleFullscreen"
            >
              <template #icon>
                <div
                  :class="
                    isFullscreen ? 'i-mdi:fullscreen-exit' : 'i-mdi:fullscreen'
                  "
                />
              </template>
            </NButton>
          </template>
          {{ isFullscreen ? '退出全屏' : '全屏查看' }}
        </NTooltip>
      </div>
    </div>

    <!-- 代码内容区域 -->
    <div class="c-code-content">
      <div
        class="code-wrapper"
        @mouseenter="showFloatingCopy = true"
        @mouseleave="showFloatingCopy = false"
      >
        <NCode
          :code="code"
          :language="language"
          :hljs="hljs"
          :show-line-numbers="showLineNumbers"
          :word-wrap="wordWrap"
          :trim="trim"
          :style="codeStyle"
          @click="emit('click', $event)"
        />

        <!-- 悬浮复制按钮 -->
        <Transition name="fade">
          <div
            v-if="showFloatingCopy && !showHeader"
            class="floating-copy-btn"
          >
            <NTooltip trigger="hover">
              <template #trigger>
                <NButton
                  size="small"
                  quaternary
                  @click="copyCode"
                  :loading="copying"
                  class="copy-floating"
                >
                  <template #icon>
                    <div
                      :class="
                        copying
                          ? 'i-mdi:loading animate-spin'
                          : 'i-mdi:content-copy'
                      "
                    />
                  </template>
                </NButton>
              </template>
              复制代码
            </NTooltip>
          </div>
        </Transition>
      </div>

      <!-- 语言加载状态 -->
      <div
        v-if="languageLoading"
        class="c-code-loading"
      >
        <NSpin size="small" />
        <span class="ml-2">正在加载 {{ language }} 语言包...</span>
      </div>
    </div>

    <!-- 全屏模态框 -->
    <NModal
      v-model:show="isFullscreen"
      :mask-closable="false"
      :show-icon="false"
      :bordered="false"
      style="width: 100vw; height: 100vh; margin: 0; padding: 0"
    >
      <div class="fullscreen-content">
        <div class="fullscreen-header">
          <div class="fullscreen-title">
            <div
              v-if="languageIcon"
              :class="languageIcon"
              class="mr-2 text-16px"
            />
            <span>{{ title || getLanguageTitle(language) }}</span>
          </div>
          <NButton
            size="small"
            quaternary
            @click="toggleFullscreen"
          >
            <template #icon>
              <div class="i-mdi:close" />
            </template>
          </NButton>
        </div>
        <div class="fullscreen-body">
          <NCode
            :code="code"
            :language="language"
            :hljs="hljs"
            :show-line-numbers="showLineNumbers"
            :word-wrap="wordWrap"
            :trim="trim"
          />
        </div>
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { useHighlight } from '@/plugins'

  interface Props {
    code: string
    language?: string
    title?: string
    showHeader?: boolean
    showLineNumbers?: boolean
    wordWrap?: boolean
    trim?: boolean
    showFullscreen?: boolean
    maxHeight?: string | number
    autoLoadLanguage?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    code: '',
    language: 'text',
    showHeader: true,
    showLineNumbers: true,
    wordWrap: false,
    trim: true,
    showFullscreen: false,
    autoLoadLanguage: true,
  })

  const emit = defineEmits<{
    copy: [code: string]
    click: [event: MouseEvent]
    fullscreen: [isFullscreen: boolean]
  }>()

  const highlight = useHighlight()
  const copying = ref(false)
  const isFullscreen = ref(false)
  const languageLoading = ref(false)
  const showFloatingCopy = ref(false)

  const hljs = computed(() => highlight.getHljs())

  // 语言图标映射
  const languageIcon = computed(() => {
    const iconMap: Record<string, string> = {
      javascript: 'i-mdi:language-javascript',
      typescript: 'i-mdi:language-typescript',
      python: 'i-mdi:language-python',
      html: 'i-mdi:language-html5',
      css: 'i-mdi:language-css3',
      vue: 'i-mdi:vuejs',
      react: 'i-mdi:react',
      json: 'i-mdi:code-json',
      java: 'i-mdi:language-java',
      cpp: 'i-mdi:language-cpp',
      go: 'i-mdi:language-go',
      rust: 'i-mdi:language-rust',
      php: 'i-mdi:language-php',
      csharp: 'i-mdi:language-csharp',
      sql: 'i-mdi:database',
      yaml: 'i-mdi:file-code',
      xml: 'i-mdi:xml',
      markdown: 'i-mdi:language-markdown',
      bash: 'i-mdi:bash',
      shell: 'i-mdi:console',
      powershell: 'i-mdi:powershell',
      swift: 'i-mdi:language-swift',
      kotlin: 'i-mdi:language-kotlin',
      ruby: 'i-mdi:language-ruby',
    }
    return iconMap[props.language.toLowerCase()] || 'i-mdi:code-braces'
  })

  // 代码样式
  const codeStyle = computed(() => {
    if (!props.maxHeight) return {}
    return {
      maxHeight:
        typeof props.maxHeight === 'number'
          ? `${props.maxHeight}px`
          : props.maxHeight,
    }
  })

  // 自动加载语言包
  watch(
    () => props.language,
    async newLanguage => {
      if (!props.autoLoadLanguage || newLanguage === 'text') return

      const loadedLanguages = highlight.getLoadedLanguages()
      if (loadedLanguages.includes(newLanguage)) return

      languageLoading.value = true
      try {
        await highlight.loadLanguage(newLanguage)
      } catch (error) {
        console.warn(`Failed to load language: ${newLanguage}, ${error}`)
      } finally {
        languageLoading.value = false
      }
    },
    { immediate: true }
  )

  /**
   * * @description 复制代码到剪贴板
   * ! @return Promise<void>
   */
  async function copyCode() {
    if (copying.value) return
    copying.value = true

    try {
      await navigator.clipboard.writeText(props.code)
      emit('copy', props.code)
    } catch (error) {
      console.error('Copy failed:', error)
    } finally {
      copying.value = false
    }
  }

  /**
   * * @description 切换全屏显示状态
   * ! @return void
   */
  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
    emit('fullscreen', isFullscreen.value)
  }

  /**
   * * @description 获取编程语言的显示标题
   * ? @param lang - 语言标识符
   * ! @return string 语言显示名称
   */
  function getLanguageTitle(lang: string): string {
    const titleMap: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
      csharp: 'C#',
      php: 'PHP',
      go: 'Go',
      rust: 'Rust',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      bash: 'Bash',
      shell: 'Shell',
      yaml: 'YAML',
      xml: 'XML',
      markdown: 'Markdown',
      sql: 'SQL',
      powershell: 'PowerShell',
      swift: 'Swift',
      kotlin: 'Kotlin',
      ruby: 'Ruby',
      vue: 'Vue',
      react: 'React',
    }
    return titleMap[lang.toLowerCase()] || lang.toUpperCase()
  }

  /**
   * * @description 处理ESC键退出全屏
   * ? @param event - 键盘事件对象
   * ! @return void
   */
  function handleEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && isFullscreen.value) {
      toggleFullscreen()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscapeKey)
  })

  defineExpose({
    copyCode,
    toggleFullscreen,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
