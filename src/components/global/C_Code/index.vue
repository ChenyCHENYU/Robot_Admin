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
  import {
    getLanguageIcon,
    getLanguageTitle,
  } from '@/components/global/C_Code/data'

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

  /** 当前语言图标 class */
  const languageIcon = computed(() => getLanguageIcon(props.language))

  /** 代码区域最大高度样式 */
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

  /** 复制代码到剪贴板 */
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

  /** 切换全屏显示状态 */
  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
    emit('fullscreen', isFullscreen.value)
  }

  defineExpose({
    copyCode,
    toggleFullscreen,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
