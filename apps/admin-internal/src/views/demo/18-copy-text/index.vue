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
              @click="
                () =>
                  handleCopy(
                    () => copyText(textInput, '自定义文本复制成功！'),
                    'text'
                  )
              "
            >
              <template #icon>
                <i class="i-mdi:content-copy" />
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
                  handleCopy(
                    () => copyText(DEMO_TEXT, '示例文本复制成功！'),
                    'demoText'
                  )
              "
            >
              <template #icon>
                <i class="i-mdi:text" />
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
              @click="() => handleCopy(() => copyURL(urlInput), 'url')"
            >
              <template #icon>
                <i class="i-mdi:link" />
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
                @click="() => handleCopy(() => copyURL(url), `url-${url}`)"
              >
                <template #icon>
                  <i class="i-mdi:link-variant" />
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
                () => handleCopy(() => copyJSON(example.data), `json-${index}`)
              "
            >
              <template #icon>
                <i class="i-mdi:content-copy" />
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
                  handleCopy(
                    () => copyCode(code.content, code.language),
                    `code-${index}`
                  )
              "
            >
              <template #icon>
                <i class="i-mdi:code-tags" />
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
        <NDataTable
          :columns="CSV_COLUMNS"
          :data="CSV_DATA"
          :pagination="false"
          size="small"
          class="csv-table"
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
                  handleCopy(
                    () =>
                      copy(contact.value, {
                        dataType: contact.type as any,
                        successTip: `${contact.label}复制成功！`,
                      }),
                    `contact-${index}`
                  )
              "
            >
              <template #icon>
                <i class="i-mdi:content-copy" />
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
              <i class="i-mdi:clipboard-text" />
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
            @click="clearHistory"
          >
            <template #icon>
              <i class="i-mdi:delete" />
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
  import { useCopy } from '@/hooks/useCopy'
  import {
    DEMO_TEXT,
    DEMO_URLS,
    JSON_EXAMPLES,
    CODE_EXAMPLES,
    CSV_DATA,
    CSV_COLUMNS,
    CONTACTS,
  } from './data'

  // 使用 useCopy Hook
  const {
    state,
    copy,
    copyText,
    copyJSON,
    copyURL,
    copyCode,
    readClipboard,
    clearHistory,
  } = useCopy({
    showMessage: true,
  })

  // ==================== 响应式数据 ====================
  const loadingStates = reactive<Record<string, boolean>>({})
  const textInput = ref('Hello, World!')
  const urlInput = ref('www.example.com')
  const jsonInput = ref('{"name": "张三", "age": 25, "city": "北京"}')
  const clipboardContent = ref('')

  // ==================== 按钮组配置（C_ActionBar） ====================
  const jsonCopyActions = computed(() => [
    {
      label: '格式化复制',
      type: 'success' as const,
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

  const csvCopyActions = computed(() => [
    {
      label: '复制 CSV',
      type: 'warning' as const,
      icon: 'mdi:file-delimited',
      loading: loadingStates.csv,
      buttonProps: { size: 'small' as const },
      onClick: () =>
        handleCopy(
          () =>
            copy(CSV_DATA, {
              dataType: 'csv',
              successTip: 'CSV 数据复制成功！',
            }),
          'csv'
        ),
    },
    {
      label: '复制 JSON',
      type: 'info' as const,
      icon: 'mdi:code-json',
      loading: loadingStates.csvJson,
      buttonProps: { size: 'small' as const },
      onClick: () => handleCopy(() => copyJSON(CSV_DATA), 'csvJson'),
    },
  ])

  // ==================== 通用处理函数 ====================
  const handleCopy = async (copyFn: () => Promise<any>, key: string) => {
    if (key.includes('text') && !textInput.value.trim()) return
    if (key.includes('url') && !urlInput.value.trim()) return

    loadingStates[key] = true
    try {
      await copyFn()
    } finally {
      loadingStates[key] = false
    }
  }

  const handleCopyJSON = async (formatted: boolean, key: string) => {
    if (!jsonInput.value.trim()) return

    loadingStates[key] = true
    try {
      const data = JSON.parse(jsonInput.value)
      await copyJSON(data, formatted)
    } catch {
      await copyText(jsonInput.value, 'JSON 文本复制成功')
    } finally {
      loadingStates[key] = false
    }
  }

  const handleReadClipboard = async () => {
    loadingStates.readClipboard = true
    try {
      const content = await readClipboard()
      clipboardContent.value = content
    } catch (error) {
      console.error('读取剪贴板失败:', error)
    } finally {
      loadingStates.readClipboard = false
    }
  }

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
