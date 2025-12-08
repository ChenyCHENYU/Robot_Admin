<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-19 13:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-23 09:43:05
 * @FilePath: \Robot_Admin\src\views\demo\14-code-editor\index.vue
 * @Description: C_Code 组件演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="code-editor-demo">
    <NH1>Code编辑器组件场景示例</NH1>
    <p class="mb-10px">
      基于 NCode 封装的 C_Code
      组件，集成多种API，预设常用的功能、代码高亮、复制、全屏等功能。
    </p>
    <NSpace
      vertical
      size="large"
    >
      <!-- 多语言支持展示 -->
      <NCard title="多语言支持">
        <NTabs
          type="line"
          animated
        >
          <NTabPane
            v-for="(code, lang) in codeExamples"
            :key="lang"
            :name="lang"
            :tab="getTabLabel(lang)"
          >
            <C_Code
              :code="code"
              :language="lang"
              :title="`${getTabLabel(lang)} 示例`"
              :max-height="lang === 'json' ? 300 : undefined"
              @copy="handleCopy"
            />
          </NTabPane>
        </NTabs>
      </NCard>

      <!-- 动态语言加载 -->
      <NCard title="动态语言加载">
        <NSpace vertical>
          <NSpace>
            <NSelect
              v-model:value="selectedLanguage"
              :options="languageOptions"
              placeholder="选择语言"
              style="width: 200px"
            />
            <NButton
              @click="loadLanguage"
              :loading="loading"
              type="primary"
            >
              加载并显示
            </NButton>
          </NSpace>

          <C_Code
            v-if="dynamicCode"
            :code="dynamicCode"
            :language="selectedLanguage"
            :title="`${selectedLanguage.toUpperCase()} 示例`"
            @copy="handleCopy"
          />
        </NSpace>
      </NCard>

      <!-- 功能演示 -->
      <NCard title="功能演示">
        <NSpace vertical>
          <NDivider title-placement="left">悬浮复制（无标题栏）</NDivider>
          <C_Code
            :code="codeExamples.simple"
            language="javascript"
            :show-header="false"
            @copy="handleCopy"
          />

          <NDivider title-placement="left">全屏查看</NDivider>
          <C_Code
            :code="codeExamples.fullscreen"
            language="typescript"
            title="全屏演示"
            :show-fullscreen="true"
            @copy="handleCopy"
            @fullscreen="handleFullscreen"
          />

          <NDivider title-placement="left">限制高度</NDivider>
          <C_Code
            :code="codeExamples.long"
            language="bash"
            title="长代码示例"
            :max-height="200"
            @copy="handleCopy"
          />
        </NSpace>
      </NCard>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
  import { useHighlight } from '@/plugins/highlight'
  import { languageOptions, codeExamples, sampleCodes } from './data'

  const message = useMessage()
  const highlight = useHighlight()

  const selectedLanguage = ref('cpp')
  const loading = ref(false)
  const dynamicCode = ref('')

  // 标签映射
  const tabLabels: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    go: 'Go',
    json: 'JSON',
  }
  /**
   * * @description 获取标签页显示名称
   * ? @param lang - 语言标识符
   * ! @return string 显示名称
   */
  function getTabLabel(lang: string): string {
    if (['simple', 'fullscreen', 'long'].includes(lang)) return ''
    return tabLabels[lang]
  }

  /**
   * * @description 处理代码复制事件
   * ? @param code - 复制的代码内容
   * ! @return void
   */
  function handleCopy(code: string): void {
    message.success(`已复制 ${code.length} 个字符`)
  }

  /**
   * * @description 处理全屏切换事件
   * ? @param isFullscreen - 是否为全屏状态
   * ! @return void
   */
  function handleFullscreen(isFullscreen: boolean): void {
    message.info(isFullscreen ? '已进入全屏' : '已退出全屏')
  }

  /**
   * * @description 加载选中的语言包并显示示例代码
   * ! @return Promise<void>
   */
  async function loadLanguage(): Promise<void> {
    if (!selectedLanguage.value) return

    loading.value = true
    try {
      await highlight.loadLanguage(selectedLanguage.value)
      dynamicCode.value = sampleCodes[selectedLanguage.value] || '// 示例代码'
      message.success(`${selectedLanguage.value} 加载成功`)
    } catch (error) {
      message.error(`加载失败: ${error}`)
    } finally {
      loading.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .code-editor-demo {
    padding: 20px;
  }
</style>
