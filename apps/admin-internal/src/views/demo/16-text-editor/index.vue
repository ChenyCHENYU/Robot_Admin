<template>
  <div class="editor-demo-page">
    <c_vTitle
      title="富文本编辑器组件演示"
      icon="mdi:text-box-edit"
      description="基于 WangEditor 封装的 Vue3 富文本编辑器组件，支持主题切换、禁用/只读模式、内容获取等配置"
    />

    <div class="demo-content">
      <div class="control-panel">
        <NCard
          title="编辑器控制"
          class="control-card"
        >
          <template #header-extra>
            <i class="i-mdi:settings text-lg"></i>
          </template>

          <div class="control-section">
            <h3 class="section-title">
              <i class="i-mdi:play mr-1"></i>
              基础操作
            </h3>
            <div class="button-group">
              <NButton
                type="primary"
                @click="handleSetContent"
                :disabled="!isEditorReady"
              >
                <template #icon>
                  <i class="i-mdi:document"></i>
                </template>
                设置内容
              </NButton>

              <NButton
                type="info"
                @click="handleGetContent"
                :disabled="!isEditorReady"
              >
                <template #icon>
                  <i class="i-mdi:view-arrow-right-outline"></i>
                </template>
                获取内容
              </NButton>

              <NButton
                type="warning"
                @click="handleClearContent"
                :disabled="!isEditorReady"
              >
                <template #icon>
                  <i class="i-mdi:vacuum-cleaner-outline"></i>
                </template>
                清空内容
              </NButton>
            </div>
          </div>

          <div class="control-section">
            <h3 class="section-title">
              <i class="i-mdi:arrow-decision-outline mr-1"></i>
              状态控制
            </h3>
            <div class="switch-group">
              <div class="switch-item">
                <NSwitch
                  v-model:value="editorConfig.disabled"
                  :disabled="!isEditorReady"
                />
                <span class="switch-label">禁用编辑器</span>
              </div>

              <div class="switch-item">
                <NSwitch
                  v-model:value="editorConfig.readonly"
                  :disabled="!isEditorReady"
                />
                <span class="switch-label">只读模式</span>
              </div>
            </div>
          </div>
        </NCard>

        <NCard
          title="编辑器状态"
          class="status-card"
        >
          <template #header-extra>
            <i class="i-mdi-information text-lg"></i>
          </template>

          <div class="status-item">
            <span class="status-label">初始化状态:</span>
            <NTag :type="isEditorReady ? 'success' : 'warning'">
              <template #icon>
                <i
                  :class="
                    isEditorReady
                      ? 'mdi:check'
                      : 'i-mdi:clock-time-four-outline'
                  "
                ></i>
              </template>
              {{ isEditorReady ? '已就绪' : '初始化中' }}
            </NTag>
          </div>

          <div class="status-item">
            <span class="status-label">内容长度:</span>
            <NTag type="info"> {{ contentLength }} 字符 </NTag>
          </div>

          <div class="status-item">
            <span class="status-label">编辑器ID:</span>
            <NTag type="default">
              {{ editorId }}
            </NTag>
          </div>
        </NCard>
      </div>

      <div class="editor-area">
        <NCard
          title="富文本编辑器"
          class="editor-card"
        >
          <template #header-extra>
            <i class="i-mdi:edit-outline text-lg"></i>
          </template>

          <C_Editor
            ref="editorRef"
            :editor-id="editorId"
            v-model="editorContent"
            :placeholder="editorConfig.placeholder"
            :disabled="editorConfig.disabled"
            :readonly="editorConfig.readonly"
            :height="editorConfig.height"
            :theme="isDark ? 'dark' : 'light'"
            @editor-mounted="handleEditorMounted"
            @editor-change="handleEditorChange"
            class="demo-editor"
          />
        </NCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { s_themeStore } from '@/stores/theme'

  const message = useMessage()
  const dialog = useDialog()
  const themeStore = s_themeStore()
  const isDark = computed(() => themeStore.isDark)

  const editorRef = ref()
  const editorId = ref('demo-editor-' + Date.now())
  const editorContent = ref(
    '<h2>欢迎使用富文本编辑器</h2><p>这是一个基于 <strong>WangEditor</strong> 封装的 Vue3 富文本编辑器组件。</p>'
  )
  const isEditorReady = ref(false)

  const editorConfig = reactive({
    height: 554,
    placeholder: '请输入内容...',
    disabled: false,
    readonly: false,
  })

  const contentLength = computed(() => {
    if (!editorContent.value) return 0
    return editorContent.value.replace(/<[^>]*>/g, '').length
  })

  // 监听禁用状态变化
  watch(
    () => editorConfig.disabled,
    disabled => {
      if (isEditorReady.value) {
        nextTick(() => {
          const editorContainer = document.querySelector(
            `#${editorId.value}`
          ) as HTMLElement
          if (editorContainer) {
            if (disabled) {
              editorContainer.style.opacity = '0.4'
              editorContainer.style.pointerEvents = 'none'
              editorContainer.style.userSelect = 'none'
              editorContainer.style.filter = 'grayscale(50%)'

              message.warning('🚫 编辑器已禁用 - 完全不可交互')
            } else {
              editorContainer.style.opacity = '1'
              editorContainer.style.pointerEvents = 'auto'
              editorContainer.style.userSelect = 'auto'
              editorContainer.style.filter = 'none'

              message.success('✅ 编辑器已启用')
            }
          }
        })
      }
    }
  )

  // 监听只读状态变化
  watch(
    () => editorConfig.readonly,
    readonly => {
      if (isEditorReady.value) {
        nextTick(() => {
          const toolbar = document.querySelector(
            `#${editorId.value} .w-e-toolbar`
          ) as HTMLElement
          const textContainer = document.querySelector(
            `#${editorId.value} .w-e-text`
          ) as HTMLElement

          if (readonly) {
            if (toolbar) {
              toolbar.style.display = 'none'
            }
            if (textContainer) {
              textContainer.setAttribute('contenteditable', 'false')
            }

            message.info('👁️ 只读模式 - 工具栏已隐藏，可选择文本但不可编辑')
          } else if (!editorConfig.disabled) {
            if (toolbar) {
              toolbar.style.display = 'flex'
            }
            if (textContainer) {
              textContainer.setAttribute('contenteditable', 'true')
            }

            message.success('📝 只读模式已取消')
          }
        })
      }
    }
  )

  const handleEditorMounted = (editor: any) => {
    isEditorReady.value = true
    message.success('富文本编辑器已成功初始化！')
    console.log('[Demo] 编辑器挂载完成:', editor)
  }

  const handleEditorChange = (html: string) => {
    console.log('[Demo] 编辑器内容变化:', html.length + ' 字符')
  }

  const handleSetContent = () => {
    const currentTime = new Date().toLocaleString()
    const sampleContent = `<h2>示例内容</h2><p>这是通过 setContent 方法设置的示例内容。</p><h3>功能展示：</h3><ol><li><strong>粗体文本</strong></li><li><em>斜体文本</em></li><li><u>下划线文本</u></li></ol><p>当前时间：${currentTime}</p>`

    if (editorRef.value) {
      editorRef.value.setContent(sampleContent)
      message.success('内容设置成功！')
    }
  }

  const handleGetContent = () => {
    if (editorRef.value) {
      const content = editorRef.value.getContent()
      dialog.info({
        title: '编辑器内容',
        content: `内容长度：${content.length} 字符\n\n${content}`,
        positiveText: '确定',
      })
    }
  }

  const handleClearContent = () => {
    dialog.warning({
      title: '确认清空',
      content: '确定要清空编辑器中的所有内容吗？此操作不可撤销。',
      positiveText: '确认清空',
      negativeText: '取消',
      onPositiveClick: () => {
        if (editorRef.value) {
          editorRef.value.setContent('')
          message.success('内容已清空！')
        }
      },
    })
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
