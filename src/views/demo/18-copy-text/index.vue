<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-23 15:11:06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-10 10:38:01
 * @FilePath: \Robot_Admin\src\views\demo\18-copy-text\index.vue
 * @Description:  复制文本 useCopy Hooks 演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="copy-demo-container">
    <c_vTitle
      title="复制 Text - [useCopy] 场景示例"
      icon="mdi:content-copy"
      description="基于原生 Clipboard API 封装的 useCopy Hook，支持文本、URL、JSON、代码、CSV等多种格式复制"
    />

    <!-- 基础文本复制 & URL 链接复制 - 两栏布局 -->
    <div class="section-grid-2">
      <NCard
        class="demo-section"
        title="基础文本复制"
      >
        <div class="copy-examples">
          <div class="copy-item">
            <NInput
              v-model:value="textInput"
              placeholder="输入要复制的文本"
              class="copy-input"
            />
            <NButton
              type="primary"
              :loading="loadingStates.text"
              @click="copyInputText"
            >
              <template #icon>
                <i class="i-mdi-content-copy" />
              </template>
              复制
            </NButton>
          </div>

          <div class="copy-item">
            <div class="copy-content">{{ DEMO_TEXT }}</div>
            <NButton
              type="default"
              :loading="loadingStates.demoText"
              @click="
                () =>
                  runAction(
                    () => clipboard.copyText(DEMO_TEXT, '示例文本复制成功！'),
                    'demoText'
                  )
              "
            >
              <template #icon>
                <i class="i-mdi-text" />
              </template>
              复制示例
            </NButton>
          </div>
        </div>
      </NCard>

      <NCard
        class="demo-section"
        title="URL 链接复制"
      >
        <div class="copy-examples">
          <div class="copy-item">
            <NInput
              v-model:value="urlInput"
              placeholder="输入网址（自动添加协议）"
              class="copy-input"
            />
            <NButton
              type="info"
              :loading="loadingStates.url"
              @click="copyLink(urlInput, 'url')"
            >
              <template #icon>
                <i class="i-mdi-link" />
              </template>
              复制
            </NButton>
          </div>

          <div class="url-examples">
            <div
              v-for="url in DEMO_URLS"
              :key="url"
              class="url-item"
            >
              <span class="url-text">{{ url }}</span>
              <NButton
                size="small"
                type="info"
                :loading="loadingStates[`url-${url}`]"
                :aria-label="`复制链接 ${url}`"
                @click="copyLink(url, `url-${url}`)"
              >
                <template #icon>
                  <i class="i-mdi-link-variant" />
                </template>
              </NButton>
            </div>
          </div>
        </div>
      </NCard>
    </div>

    <!-- JSON 数据复制 -->
    <NCard
      class="demo-section"
      title="JSON 数据复制"
    >
      <div class="json-section">
        <div class="json-input-area">
          <NInput
            v-model:value="jsonInput"
            type="textarea"
            placeholder="输入 JSON 数据"
            :rows="6"
            class="json-textarea"
          />
          <C_ActionBar :actions="jsonCopyActions" />
        </div>

        <div class="json-examples">
          <h4>预设示例</h4>
          <div
            v-for="(example, index) in JSON_EXAMPLES"
            :key="index"
            class="json-example"
          >
            <div class="json-label">{{ example.label }}</div>
            <pre class="json-preview">{{
              JSON.stringify(example.data, null, 2)
            }}</pre>
            <NButton
              size="small"
              type="success"
              :loading="loadingStates[`json-${index}`]"
              @click="
                () =>
                  runAction(
                    () => clipboard.copyJSON(example.data),
                    `json-${index}`
                  )
              "
            >
              <template #icon>
                <i class="i-mdi-content-copy" />
              </template>
              复制
            </NButton>
          </div>
        </div>
      </div>
    </NCard>

    <!-- 代码片段复制 - 三栏布局 -->
    <NCard
      class="demo-section"
      title="代码片段复制"
    >
      <div class="code-examples">
        <div
          v-for="(code, index) in CODE_EXAMPLES"
          :key="code.language"
          class="code-example"
        >
          <div class="code-header">
            <span class="code-language">{{ code.language }}</span>
            <NButton
              size="small"
              type="primary"
              :loading="loadingStates[`code-${index}`]"
              @click="
                () =>
                  runAction(
                    () => clipboard.copyCode(code.content, code.language),
                    `code-${index}`
                  )
              "
            >
              <template #icon>
                <i class="i-mdi-code-tags" />
              </template>
              复制代码
            </NButton>
          </div>
          <pre class="code-content">{{ code.content }}</pre>
        </div>
      </div>
    </NCard>

    <!-- CSV 数据复制 & 联系信息复制 - 两栏布局 -->
    <div class="section-grid-2">
      <NCard
        class="demo-section"
        title="CSV 数据复制"
      >
        <C_Table
          :columns="CSV_COLUMNS"
          :data="CSV_DATA"
          class="csv-table"
          :config="{
            toolbar: { show: false },
            pagination: false,
            display: { striped: false, size: 'small' },
          }"
        />
        <C_ActionBar
          class="mt-3"
          :actions="csvCopyActions"
        />
      </NCard>

      <NCard
        class="demo-section"
        title="联系信息复制"
      >
        <div class="contact-examples">
          <div
            v-for="(contact, index) in CONTACTS"
            :key="contact.type"
            class="contact-item"
          >
            <div class="contact-info">
              <i
                :class="contact.icon"
                class="contact-icon"
              />
              <div class="contact-details">
                <div class="contact-label">{{ contact.label }}</div>
                <div class="contact-value">{{ contact.value }}</div>
              </div>
            </div>
            <NButton
              :type="contact.type === 'email' ? 'success' : 'info'"
              size="small"
              :loading="loadingStates[`contact-${index}`]"
              @click="
                () =>
                  runAction(
                    () =>
                      clipboard.copy(contact.value, {
                        dataType: contact.type,
                        successTip: `${contact.label}复制成功！`,
                      }),
                    `contact-${index}`
                  )
              "
            >
              <template #icon>
                <i class="i-mdi-content-copy" />
              </template>
              复制
            </NButton>
          </div>
        </div>
      </NCard>
    </div>

    <!-- 高级功能 -->
    <NCard
      class="demo-section"
      title="高级功能"
    >
      <div class="advanced-features">
        <div class="feature-item">
          <div class="feature-info">
            <h4>读取剪贴板</h4>
            <p>读取当前剪贴板中的内容（需要用户授权）</p>
          </div>
          <NButton
            type="default"
            :loading="loadingStates.readClipboard"
            @click="handleReadClipboard"
          >
            <template #icon>
              <i class="i-mdi-clipboard-text" />
            </template>
            读取剪贴板
          </NButton>
        </div>

        <div
          v-if="clipboardContent"
          class="clipboard-result"
        >
          <div class="result-label">剪贴板内容：</div>
          <div class="result-content">{{ clipboardContent }}</div>
        </div>

        <div class="feature-item">
          <div class="feature-info">
            <h4>清除复制历史</h4>
            <p>清除当前会话的复制历史记录</p>
          </div>
          <NButton
            type="error"
            @click="clipboard.clearHistory"
          >
            <template #icon>
              <i class="i-mdi-delete" />
            </template>
            清除历史
          </NButton>
        </div>
      </div>
    </NCard>

    <!-- 最后复制的内容 -->
    <NCard
      v-if="state.lastCopied"
      class="demo-section"
      title="最后复制的内容"
    >
      <div class="last-copied">
        <div class="last-copied-content">
          {{ state.lastCopied.slice(0, 200) }}
          {{ state.lastCopied.length > 200 ? '...' : '' }}
        </div>
        <div class="last-copied-meta">
          复制时间：{{ formatTime(state.lastCopyTime!) }}
        </div>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo18CopyText' })
  import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'
  import { useCopy } from '@/composables/useCopy'
  import {
    DEMO_TEXT,
    DEMO_URLS,
    JSON_EXAMPLES,
    CODE_EXAMPLES,
    CSV_DATA,
    CSV_COLUMNS,
    CONTACTS,
  } from './data'

  const clipboard = useCopy({ showMessage: true })
  const { state } = clipboard
  const message = useMessage()

  type CopyAction =
    | 'text'
    | 'demoText'
    | 'url'
    | 'jsonFormatted'
    | 'jsonCompressed'
    | 'csv'
    | 'csvJson'
    | 'readClipboard'
    | `url-${string}`
    | `json-${number}`
    | `code-${number}`
    | `contact-${number}`

  const loadingStates = reactive<Partial<Record<CopyAction, boolean>>>({})
  const textInput = ref('Hello, World!')
  const urlInput = ref('www.example.com')
  const jsonInput = ref('{"name": "张三", "age": 25, "city": "北京"}')
  const clipboardContent = ref('')

  // ==================== 按钮组配置（C_ActionBar） ====================
  const jsonCopyActions = computed<ActionItem[]>(() => [
    {
      label: '格式化复制',
      type: 'success',
      icon: 'mdi:code-json',
      loading: loadingStates.jsonFormatted,
      onClick: () => handleCopyJSON(true, 'jsonFormatted'),
    },
    {
      label: '压缩复制',
      icon: 'mdi:code-braces',
      loading: loadingStates.jsonCompressed,
      onClick: () => handleCopyJSON(false, 'jsonCompressed'),
    },
  ])

  const csvCopyActions = computed<ActionItem[]>(() => [
    {
      label: '复制 CSV',
      type: 'warning',
      icon: 'mdi:file-delimited',
      loading: loadingStates.csv,
      buttonProps: { size: 'small' },
      onClick: () =>
        runAction(
          () =>
            clipboard.copy(CSV_DATA, {
              dataType: 'csv',
              successTip: 'CSV 数据复制成功！',
            }),
          'csv'
        ),
    },
    {
      label: '复制 JSON',
      type: 'info',
      icon: 'mdi:code-json',
      loading: loadingStates.csvJson,
      buttonProps: { size: 'small' },
      onClick: () => runAction(() => clipboard.copyJSON(CSV_DATA), 'csvJson'),
    },
  ])

  const runAction = async (action: () => Promise<unknown>, key: CopyAction) => {
    loadingStates[key] = true
    try {
      await action()
    } finally {
      loadingStates[key] = false
    }
  }

  const copyInputText = () => {
    if (textInput.value.trim()) {
      return runAction(
        () => clipboard.copyText(textInput.value, '自定义文本复制成功！'),
        'text'
      )
    }
  }

  const copyLink = (url: string, key: 'url' | `url-${string}`) => {
    if (url.trim()) return runAction(() => clipboard.copyURL(url), key)
  }

  const handleCopyJSON = (formatted: boolean, key: CopyAction) => {
    if (!jsonInput.value.trim()) return
    return runAction(async () => {
      try {
        const parsed: unknown = JSON.parse(jsonInput.value)
        const value = typeof parsed === 'string' ? jsonInput.value : parsed
        await clipboard.copyJSON(value, formatted)
      } catch {
        await clipboard.copyText(jsonInput.value, 'JSON 文本复制成功')
      }
    }, key)
  }

  const handleReadClipboard = () =>
    runAction(async () => {
      try {
        clipboardContent.value = await clipboard.readClipboard()
      } catch (error) {
        message.error(error instanceof Error ? error.message : '读取剪贴板失败')
      }
    }, 'readClipboard')

  const formatTime = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
