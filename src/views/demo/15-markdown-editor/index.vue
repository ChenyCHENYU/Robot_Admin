<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-20 16:20:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-21 17:10:50
 * @FilePath: \Robot_Admin\src\views\demo\15-markdown-editor\index.vue
 * @Description: Markdown 编辑器演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="markdown-demo-page">
    <NH1>Markdown编辑器组件场景示例</NH1>
    <NCard class="demo-header">
      <p
        >基于 Vue 的 v-md-editor 插件，封装了Markdown
        编辑器，支持实时预览、语法高亮、图片上传等功能</p
      >
    </NCard>

    <NTabs
      v-model:value="activeTab"
      type="segment"
      animated
    >
      <!-- 基础用法 -->
      <NTabPane
        name="basic"
        tab="🔧 基础用法"
      >
        <NCard
          title="基础编辑器"
          class="demo-card"
        >
          <template #header-extra>
            <C_ActionBar
              :actions="basicHeaderActions"
              :config="{ size: 'small' }"
            />
          </template>

          <C_Markdown
            ref="basicEditorRef"
            v-model="basicContent"
            height="500px"
            placeholder="请输入你的 Markdown 内容..."
            :auto-save="true"
            :auto-save-interval="10000"
            @change="handleBasicChange"
            @save="handleBasicSave"
            @upload-image="handleUploadImage"
            @auto-save="handleAutoSave"
            @word-count-change="handleWordCountChange"
          />

          <div class="editor-info">
            <NSpace>
              <NTag
                :bordered="false"
                type="info"
              >
                字数: {{ wordCount }}
              </NTag>
              <NTag
                :bordered="false"
                type="success"
                v-if="lastSaveTime"
              >
                最后保存: {{ lastSaveTime }}
              </NTag>
              <NTag
                :bordered="false"
                type="warning"
                v-if="lastAutoSaveTime"
              >
                自动保存: {{ lastAutoSaveTime }}
              </NTag>
            </NSpace>
          </div>
        </NCard>
      </NTabPane>

      <!-- 表单集成 -->
      <NTabPane
        name="form"
        tab="📋 表单集成"
      >
        <NCard
          title="文章编辑表单"
          class="demo-card"
        >
          <NForm
            ref="formRef"
            :model="articleForm"
            :rules="formRules"
            label-placement="top"
          >
            <NFormItem
              label="文章标题"
              path="title"
            >
              <NInput
                v-model:value="articleForm.title"
                placeholder="请输入文章标题"
                :maxlength="100"
                show-count
              />
            </NFormItem>

            <NFormItem
              label="文章摘要"
              path="summary"
            >
              <NInput
                v-model:value="articleForm.summary"
                type="textarea"
                placeholder="请输入文章摘要"
                :rows="3"
                :maxlength="200"
                show-count
              />
            </NFormItem>

            <NFormItem
              label="文章分类"
              path="category"
            >
              <NSelect
                v-model:value="articleForm.category"
                placeholder="请选择文章分类"
                :options="categoryOptions"
              />
            </NFormItem>

            <NFormItem
              label="文章标签"
              path="tags"
            >
              <NDynamicTags v-model:value="articleForm.tags" />
            </NFormItem>

            <NFormItem
              label="文章内容"
              path="content"
              class="form-markdown-item"
            >
              <div class="form-markdown-wrapper">
                <C_Markdown
                  v-model="articleForm.content"
                  height="400px"
                  placeholder="请输入文章内容..."
                  :max-length="20000"
                  class="form-markdown-editor"
                  @change="handleFormContentChange"
                  @max-length-exceeded="handleMaxLengthExceeded"
                  @word-count-change="handleFormWordCountChange"
                />
                <div class="form-word-count">
                  <NSpace>
                    <NTag
                      :bordered="false"
                      type="info"
                      size="small"
                    >
                      字数统计: {{ formWordCount }} / 20000
                    </NTag>
                    <NTag
                      :bordered="false"
                      :type="
                        formWordCount > 18000
                          ? 'warning'
                          : formWordCount > 19000
                            ? 'error'
                            : 'success'
                      "
                      size="small"
                    >
                      {{
                        formWordCount <= 19000
                          ? '字数正常'
                          : formWordCount <= 19500
                            ? '接近上限'
                            : '即将超出'
                      }}
                    </NTag>
                  </NSpace>
                </div>
              </div>
            </NFormItem>

            <NFormItem>
              <C_ActionBar
                :actions="formActions"
                :config="{ gap: 12 }"
              />
            </NFormItem>
          </NForm>
        </NCard>
      </NTabPane>

      <!-- 不同模式 -->
      <NTabPane
        name="modes"
        tab="🎨 不同模式"
      >
        <NSpace
          vertical
          :size="24"
        >
          <!-- 编辑模式 -->
          <NCard
            title="编辑模式 (edit)"
            class="demo-card"
          >
            <C_Markdown
              v-model="modeContent.edit"
              mode="edit"
              height="300px"
              placeholder="编辑模式 - 可以编辑和预览"
            />
          </NCard>

          <!-- 可编辑模式 -->
          <NCard
            title="可编辑模式 (editable)"
            class="demo-card"
          >
            <C_Markdown
              v-model="modeContent.editable"
              mode="editable"
              height="300px"
              placeholder="可编辑模式 - 实时渲染"
            />
          </NCard>

          <!-- 预览模式 -->
          <NCard
            title="预览模式 (preview)"
            class="demo-card"
          >
            <C_Markdown
              v-model="modeContent.preview"
              mode="preview"
              height="300px"
              placeholder="预览模式 - 只读"
            />
          </NCard>
        </NSpace>
      </NTabPane>

      <!-- 配置选项 -->
      <NTabPane
        name="config"
        tab="⚙️ 配置选项"
      >
        <NSpace
          vertical
          :size="24"
        >
          <NCard
            title="配置面板"
            class="demo-card"
          >
            <NSpace vertical>
              <NSpace align="center">
                <NCheckbox v-model:checked="config.disabled">
                  禁用编辑器
                </NCheckbox>
                <NCheckbox v-model:checked="config.autofocus">
                  自动聚焦
                </NCheckbox>
                <NCheckbox v-model:checked="config.autoSave">
                  启用自动保存
                </NCheckbox>

                <NDivider vertical />

                <span>编辑器高度:</span>
                <NSlider
                  v-model:value="config.height"
                  :min="200"
                  :max="800"
                  :step="50"
                  style="width: 200px"
                />
                <span>{{ config.height }}px</span>
              </NSpace>
            </NSpace>
          </NCard>

          <NCard
            title="配置演示"
            class="demo-card"
          >
            <C_Markdown
              v-model="configContent"
              :height="`${config.height}px`"
              :mode="config.disabled ? 'preview' : 'editable'"
              :autofocus="config.autofocus"
              :default-fullscreen="config.defaultFullscreen"
              :autoSave="config.autoSave"
              :autoSaveInterval="5000"
              placeholder="根据左侧配置动态调整的编辑器"
              @fullscreen-change="handleFullscreenChange"
              @auto-save="handleConfigAutoSave"
            />
          </NCard>
        </NSpace>
      </NTabPane>

      <!-- 数据回显 -->
      <NTabPane
        name="echo"
        tab="🔄 数据回显"
      >
        <NSpace
          vertical
          :size="24"
        >
          <NCard
            title="模拟数据源"
            class="demo-card"
          >
            <C_ActionBar :actions="echoActions" />
          </NCard>

          <NCard
            title="数据回显编辑器"
            class="demo-card"
          >
            <template #header-extra>
              <NSpace v-if="currentArticle">
                <NTag type="info">{{ currentArticle.title }}</NTag>
                <NTag type="success">{{ currentArticle.author }}</NTag>
              </NSpace>
            </template>

            <C_Markdown
              v-model="echoContent"
              height="400px"
              placeholder="点击上方按钮加载不同的文章内容"
              @change="handleEchoChange"
              @word-count-change="handleEchoWordCountChange"
            />

            <div
              class="echo-info"
              v-if="currentArticle"
            >
              <NSpace>
                <span>
                  <strong>创建时间:</strong>
                  {{ currentArticle.createTime }}
                </span>
                <span>
                  <strong>更新时间:</strong>
                  {{ currentArticle.updateTime }}
                </span>
                <span><strong>字数:</strong> {{ echoWordCount }}</span>
              </NSpace>
            </div>
          </NCard>
        </NSpace>
      </NTabPane>
    </NTabs>

    <!-- 预览弹窗 -->
    <NModal
      v-model:show="showPreviewModal"
      preset="card"
      style="width: 90%; max-width: 1200px"
    >
      <template #header>
        <span>📖 文章预览</span>
      </template>

      <div class="article-preview">
        <h1>{{ articleForm.title || '未命名文章' }}</h1>
        <div class="article-meta">
          <NSpace>
            <NTag
              v-if="articleForm.category"
              type="primary"
            >
              {{
                categoryOptions.find(
                  (opt: any) => opt.value === articleForm.category
                )?.label
              }}
            </NTag>
            <NTag
              v-for="tag in articleForm.tags"
              :key="tag"
              type="info"
            >
              {{ tag }}
            </NTag>
            <span class="create-time">{{ new Date().toLocaleString() }}</span>
          </NSpace>
        </div>
        <div
          class="article-summary"
          v-if="articleForm.summary"
        >
          <p><strong>摘要:</strong> {{ articleForm.summary }}</p>
        </div>
        <div class="article-content">
          <C_Markdown
            :model-value="articleForm.content || '暂无内容'"
            mode="preview"
            height="auto"
            :disabled="true"
          />
        </div>
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  // 导入数据和类型
  import type { ActionItem } from '@robot-admin/naive-ui-components'
  import {
    type ArticleData,
    type InsertImageFunction,
    defaultBasicContent,
    formRules,
    categoryOptions,
    defaultModeContent,
    defaultConfig,
    defaultConfigContent,
    insertTemplate,
    mockArticles,
  } from './data'

  // 消息提示
  const message = useMessage()
  const dialog = useDialog()

  // 当前激活的标签页
  const activeTab = ref('basic')

  // 基础用法相关
  const basicContent = ref(defaultBasicContent)
  const basicEditorRef = ref()
  const wordCount = ref(0)
  const lastSaveTime = ref('')
  const lastAutoSaveTime = ref('')

  // 表单相关
  const formRef = ref()
  const submitting = ref(false)
  const savingDraft = ref(false)
  const formWordCount = ref(0)

  // 表单操作按钮配置
  const formActions = computed<ActionItem[]>(() => [
    {
      key: 'submit',
      label: '发布文章',
      icon: 'mdi:send',
      type: 'primary',
      loading: submitting.value,
      onClick: submitForm,
    },
    {
      key: 'draft',
      label: '保存草稿',
      icon: 'mdi:content-save-outline',
      loading: savingDraft.value,
      onClick: saveAsDraft,
    },
    {
      key: 'preview',
      label: '预览文章',
      icon: 'mdi:eye-outline',
      onClick: previewArticle,
    },
    {
      key: 'reset',
      label: '重置表单',
      icon: 'mdi:lock-reset',
      onClick: resetForm,
    },
  ])

  // 基础编辑器 header-extra 操作按钮
  const basicHeaderActions = computed<ActionItem[]>(() => [
    {
      key: 'insert-template',
      label: '插入模板',
      type: 'primary',
      onClick: insertTemplateContent,
    },
    {
      key: 'clear',
      label: '清空内容',
      type: 'warning',
      onClick: clearContent,
    },
  ])

  // 数据回显操作按钮
  const echoActions = computed<ActionItem[]>(() => [
    {
      key: 'load-article-1',
      label: '加载文章 1',
      type: 'primary',
      onClick: () => loadArticleData(1),
    },
    {
      key: 'load-article-2',
      label: '加载文章 2',
      type: 'primary',
      onClick: () => loadArticleData(2),
    },
    {
      key: 'load-article-3',
      label: '加载文章 3',
      type: 'primary',
      onClick: () => loadArticleData(3),
    },
    {
      key: 'clear-echo',
      label: '清空内容',
      type: 'warning',
      onClick: clearEchoContent,
    },
  ])

  const articleForm = reactive({
    title: '',
    summary: '',
    category: '',
    tags: [] as string[],
    content: '',
  })

  // 不同模式演示
  const modeContent = reactive({ ...defaultModeContent })

  // 配置选项
  const config = reactive({ ...defaultConfig })
  const configContent = ref(defaultConfigContent)

  // 数据回显
  const echoContent = ref('')
  const echoWordCount = ref(0)
  const currentArticle = ref<ArticleData | null>(null)

  // 预览弹窗
  const showPreviewModal = ref(false)

  /**
   * 生命周期
   */
  onMounted(() => {
    console.log('Markdown 编辑器演示页面已加载')
  })

  /**
   * 事件处理函数
   */
  const handleBasicChange = (text: string, html: string) => {
    console.log('内容变化:', { text: text.length, html: html.length })
  }

  const handleBasicSave = (text: string, _html: string) => {
    console.log('🚀 ~ handleBasicSave ~ _html:', _html)
    console.log('🚀 ~ handleBasicSave ~ text:', text)
    lastSaveTime.value = new Date().toLocaleString()
    message.success('内容已保存!')
  }

  const handleUploadImage = (
    _event: Event,
    insertImage: InsertImageFunction,
    files: FileList
  ) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        insertImage({
          url: e.target?.result as string,
          desc: file.name,
          width: 'auto',
          height: 'auto',
        })
      }
      reader.readAsDataURL(file)
    })
    message.success(`上传 ${files.length} 张图片`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAutoSave = (_text: string) => {
    lastAutoSaveTime.value = new Date().toLocaleString()
    message.info('自动保存成功')
  }

  const handleWordCountChange = (count: number) => {
    wordCount.value = count
  }

  const handleFormWordCountChange = (count: number) => {
    formWordCount.value = count
  }

  const handleEchoWordCountChange = (count: number) => {
    echoWordCount.value = count
  }

  const insertTemplateContent = () => {
    basicContent.value += insertTemplate
  }

  const clearContent = () => {
    dialog.warning({
      title: '确认清空',
      content: '确定要清空所有内容吗？此操作不可恢复。',
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: () => {
        basicContent.value = ''
        message.success('内容已清空')
      },
    })
  }

  // 表单处理
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFormContentChange = (_text: string, _html: string) => {
    // 表单内容变化处理
  }

  const handleMaxLengthExceeded = (
    currentLength: number,
    maxLength: number
  ) => {
    message.error(
      `内容长度超出限制！当前 ${currentLength} 字符，最大 ${maxLength} 字符`
    )
  }

  const submitForm = async () => {
    try {
      await formRef.value?.validate()
      submitting.value = true

      setTimeout(() => {
        submitting.value = false
        message.success('文章发布成功！')
      }, 2000)
    } catch {
      message.error('请完善表单信息')
    }
  }

  const saveAsDraft = async () => {
    savingDraft.value = true

    setTimeout(() => {
      savingDraft.value = false
      message.success('草稿保存成功！')
    }, 1000)
  }

  const previewArticle = () => {
    if (!articleForm.content.trim()) {
      message.warning('请先输入文章内容')
      return
    }
    showPreviewModal.value = true
  }

  const resetForm = () => {
    dialog.warning({
      title: '确认重置',
      content: '确定要重置表单吗？所有填写的内容将丢失。',
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: () => {
        Object.assign(articleForm, {
          title: '',
          summary: '',
          category: '',
          tags: [],
          content: '',
        })
        formWordCount.value = 0
        message.success('表单已重置')
      },
    })
  }

  // 配置相关
  const handleFullscreenChange = (isFullscreen: boolean) => {
    message.info(`${isFullscreen ? '进入' : '退出'}全屏模式`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleConfigAutoSave = (_text: string) => {
    message.info('配置演示编辑器自动保存成功')
  }

  // 数据回显
  const loadArticleData = (articleId: number) => {
    const article = mockArticles.find(a => a.id === articleId)
    if (article) {
      currentArticle.value = article
      echoContent.value = article.content
      echoWordCount.value = article.content.length
      message.success(`已加载文章: ${article.title}`)
    }
  }

  const clearEchoContent = () => {
    currentArticle.value = null
    echoContent.value = ''
    echoWordCount.value = 0
    message.success('内容已清空')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEchoChange = (_text: string, _html: string) => {
    if (currentArticle.value) {
      currentArticle.value.updateTime = new Date().toLocaleString()
    }
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
