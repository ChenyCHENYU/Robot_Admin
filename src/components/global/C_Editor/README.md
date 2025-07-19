
# C_Editor 富文本编辑器组件

> 📝 基于 WangEditor 的强大富文本编辑器，让内容创作变得简单而高效

## ✨ 特性

- **📝 所见即所得**: 基于 WangEditor 的强大编辑能力，支持丰富的文本格式
- **🎨 自定义配置**: 支持工具栏配置、主题定制、占位符等个性化设置
- **🔧 双向绑定**: 完整的 v-model 支持，数据响应式更新
- **📱 响应式设计**: 自适应不同屏幕尺寸，移动端友好
- **🔒 状态控制**: 支持禁用、只读模式，灵活的权限控制
- **🌍 国际化**: 内置多语言支持，轻松本地化
- **💪 TypeScript**: 完整的类型定义和类型安全
- **⚡ 高性能**: 优化的渲染机制和内存管理
- **🔌 插件系统**: 支持扩展插件，功能可定制
- **🎯 事件丰富**: 完整的生命周期和交互事件回调

## 📦 安装

```bash
# 安装 WangEditor 相关依赖
bun add @wangeditor/editor @wangeditor/editor-for-vue
```

## 🎯 快速开始

### 基础用法

```vue
<template>
  <!-- 最简单的富文本编辑器 -->
  <C_Editor
    v-model="content"
    placeholder="请输入内容..."
    @editor-mounted="handleEditorMounted"
    @editor-change="handleContentChange"
  />
</template>

<script setup>
const content = ref('<p>Hello World!</p>')

const handleEditorMounted = (editor) => {
  console.log('编辑器已初始化:', editor)
}

const handleContentChange = (html) => {
  console.log('内容已更新:', html)
}
</script>
```

### 完整功能示例

```vue
<template>
  <div class="editor-demo">
    <!-- 控制面板 -->
    <n-space class="mb-20px" align="center">
      <n-switch v-model:value="editorConfig.disabled">
        <template #checked>已禁用</template>
        <template #unchecked>已启用</template>
      </n-switch>

      <n-switch v-model:value="editorConfig.readonly">
        <template #checked>只读</template>
        <template #unchecked>可编辑</template>
      </n-switch>

      <n-input-number
        v-model:value="editorConfig.height"
        :min="200"
        :max="800"
        :step="50"
        style="width: 120px"
      >
        <template #prefix>高度</template>
      </n-input-number>

      <n-button type="primary" @click="insertSampleContent">
        插入示例内容
      </n-button>

      <n-button type="warning" @click="clearContent"> 清空内容 </n-button>
    </n-space>

    <!-- 富文本编辑器 -->
    <C_Editor
      ref="editorRef"
      v-model="editorContent"
      :editor-id="editorId"
      :placeholder="editorConfig.placeholder"
      :height="editorConfig.height"
      :disabled="editorConfig.disabled"
      :readonly="editorConfig.readonly"
      :toolbar-config="toolbarConfig"
      :editor-config="customEditorConfig"
      @editor-mounted="handleEditorMounted"
      @editor-change="handleEditorChange"
      @editor-focus="handleEditorFocus"
      @editor-blur="handleEditorBlur"
      class="demo-editor"
    />

    <!-- 内容预览 -->
    <n-card class="mt-20px" title="内容预览" size="small">
      <n-space vertical>
        <n-tag type="info">字符数: {{ contentLength }}</n-tag>
        <n-tag type="success">HTML长度: {{ htmlLength }}</n-tag>
        <n-collapse>
          <n-collapse-item title="查看HTML源码" name="html">
            <n-code :code="editorContent" language="html" />
          </n-collapse-item>
        </n-collapse>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
const editorRef = ref()
const message = useMessage()
const dialog = useDialog()

// 编辑器配置
const editorId = ref('demo-editor-' + Date.now())
const editorContent = ref(`
  <h2>欢迎使用富文本编辑器</h2>
  <p>这是一个基于 <strong>WangEditor</strong> 封装的 Vue3 富文本编辑器组件。</p>
  <h3>主要特性：</h3>
  <ul>
    <li>所见即所得编辑</li>
    <li>丰富的工具栏功能</li>
    <li>支持图片、视频、链接等媒体</li>
    <li>完整的 Vue3 集成</li>
  </ul>
`)

const editorConfig = reactive({
  height: 400,
  placeholder: '请输入内容...',
  disabled: false,
  readonly: false,
})

// 工具栏配置
const toolbarConfig = {
  excludeKeys: [
    'group-video', // 排除视频功能
  ],
}

// 编辑器高级配置
const customEditorConfig = {
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload-image',
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedFileTypes: ['image/*'],
      onSuccess: (file, res) => {
        console.log('图片上传成功:', res)
      },
      onFailed: (file, res) => {
        message.error('图片上传失败')
      },
    },
    insertLink: {
      checkLink: (text, link) => {
        if (!link) return '链接不能为空'
        if (!link.startsWith('http')) return '链接必须以 http 开头'
        return true
      },
    },
  },
}

// 计算属性
const contentLength = computed(() => {
  if (!editorContent.value) return 0
  return editorContent.value.replace(/<[^>]*>/g, '').length
})

const htmlLength = computed(() => {
  return editorContent.value?.length || 0
})

// 事件处理函数
const handleEditorMounted = (editor) => {
  console.log('编辑器挂载完成:', editor)
  message.success('富文本编辑器初始化成功！')
}

const handleEditorChange = (html) => {
  console.log('内容变化:', html.length + ' 字符')
}

const handleEditorFocus = () => {
  console.log('编辑器获得焦点')
}

const handleEditorBlur = () => {
  console.log('编辑器失去焦点')
}

// 操作方法
const insertSampleContent = () => {
  const sampleContent = `
    <h3>示例内容 - ${new Date().toLocaleString()}</h3>
    <p>这是通过方法插入的示例内容，包含：</p>
    <ol>
      <li><strong>粗体文本</strong></li>
      <li><em>斜体文本</em></li>
      <li><u>下划线文本</u></li>
      <li><span style="color: #ff6b6b;">彩色文本</span></li>
    </ol>
    <blockquote>
      <p>这是一个引用块，用于突出重要信息。</p>
    </blockquote>
  `

  if (editorRef.value) {
    editorRef.value.setContent(sampleContent)
    message.success('示例内容已插入')
  }
}

const clearContent = () => {
  dialog.warning({
    title: '确认清空',
    content: '确定要清空编辑器中的所有内容吗？此操作不可撤销。',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      if (editorRef.value) {
        editorRef.value.setContent('')
        message.success('内容已清空')
      }
    },
  })
}

// 监听配置变化
watch(
  () => editorConfig.disabled,
  (disabled) => {
    if (disabled) {
      message.warning('编辑器已禁用')
    } else {
      message.success('编辑器已启用')
    }
  }
)

watch(
  () => editorConfig.readonly,
  (readonly) => {
    if (readonly) {
      message.info('编辑器已切换到只读模式')
    } else {
      message.success('编辑器已切换到编辑模式')
    }
  }
)
</script>

<style scoped>
.editor-demo {
  padding: 20px;
}

.demo-editor {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}
</style>
```

## 📖 API 文档

### Props

| 参数              | 类型                    | 默认值                  | 说明                   |
| ----------------- | ----------------------- | ----------------------- | ---------------------- |
| **modelValue**    | `string`                | `''`                    | 编辑器内容（双向绑定） |
| **editorId**      | `string`                | `'editor-' + timestamp` | 编辑器唯一标识         |
| **placeholder**   | `string`                | `'请输入内容...'`       | 占位符文本             |
| **height**        | `number`                | `300`                   | 编辑器高度（像素）     |
| **disabled**      | `boolean`               | `false`                 | 是否禁用编辑器         |
| **readonly**      | `boolean`               | `false`                 | 是否只读模式           |
| **toolbarConfig** | `IToolbarConfig`        | `{}`                    | 工具栏配置对象         |
| **editorConfig**  | `IEditorConfig`         | `{}`                    | 编辑器配置对象         |
| **mode**          | `'default' \| 'simple'` | `'default'`             | 编辑器模式             |

### Events

| 事件名                | 参数                   | 说明                   |
| --------------------- | ---------------------- | ---------------------- |
| **update:modelValue** | `(html: string)`       | 内容更新时触发         |
| **editor-mounted**    | `(editor: IDomEditor)` | 编辑器初始化完成时触发 |
| **editor-change**     | `(html: string)`       | 编辑器内容变化时触发   |
| **editor-focus**      | `(editor: IDomEditor)` | 编辑器获得焦点时触发   |
| **editor-blur**       | `(editor: IDomEditor)` | 编辑器失去焦点时触发   |
| **editor-destroyed**  | `()`                   | 编辑器销毁时触发       |

### 暴露方法

| 方法名            | 参数             | 返回值       | 说明                 |
| ----------------- | ---------------- | ------------ | -------------------- |
| **getEditor**     | `-`              | `IDomEditor` | 获取编辑器实例       |
| **getContent**    | `-`              | `string`     | 获取编辑器 HTML 内容 |
| **getText**       | `-`              | `string`     | 获取编辑器纯文本内容 |
| **setContent**    | `(html: string)` | `void`       | 设置编辑器内容       |
| **insertContent** | `(html: string)` | `void`       | 在光标位置插入内容   |
| **focus**         | `-`              | `void`       | 聚焦编辑器           |
| **blur**          | `-`              | `void`       | 失焦编辑器           |
| **clear**         | `-`              | `void`       | 清空编辑器内容       |
| **undo**          | `-`              | `void`       | 撤销操作             |
| **redo**          | `-`              | `void`       | 重做操作             |

### 类型定义

#### 工具栏配置接口

```typescript
interface IToolbarConfig {
  excludeKeys?: string[] // 排除的工具栏按钮
  insertKeys?: {
    // 插入自定义按钮
    index: number
    keys: string[]
  }
  modalAppendToBody?: boolean // 弹窗是否挂载到 body
}
```

#### 编辑器配置接口

```typescript
interface IEditorConfig {
  placeholder?: string // 占位符
  readOnly?: boolean // 是否只读
  autoFocus?: boolean // 是否自动聚焦
  maxLength?: number // 最大字符数限制
  MENU_CONF?: {
    // 菜单配置
    uploadImage?: UploadImageConfig
    insertLink?: InsertLinkConfig
    // ... 其他菜单配置
  }
}
```

#### 上传图片配置

```typescript
interface UploadImageConfig {
  server: string // 上传接口地址
  fieldName?: string // 上传字段名
  maxFileSize?: number // 最大文件大小（字节）
  maxNumberOfFiles?: number // 最大文件数量
  allowedFileTypes?: string[] // 允许的文件类型
  onBeforeUpload?: (file: File) => boolean | Promise<boolean>
  onProgress?: (progress: number) => void
  onSuccess?: (file: File, res: any) => void
  onFailed?: (file: File, res: any) => void
  onError?: (file: File, err: any) => void
}
```

## 🎨 使用示例

### 场景 1: 博客文章编辑器

```vue
<template>
  <div class="blog-editor">
    <n-card title="博客文章编辑">
      <!-- 文章信息 -->
      <div class="article-meta mb-20px">
        <n-space>
          <n-input
            v-model:value="articleData.title"
            placeholder="文章标题"
            style="width: 300px"
          />
          <n-select
            v-model:value="articleData.category"
            :options="categoryOptions"
            placeholder="选择分类"
            style="width: 150px"
          />
          <n-tag-input
            v-model:value="articleData.tags"
            placeholder="添加标签"
            style="width: 200px"
          />
        </n-space>
      </div>

      <!-- 富文本编辑器 -->
      <C_Editor
        ref="blogEditorRef"
        v-model="articleData.content"
        :height="500"
        :editor-config="blogEditorConfig"
        :toolbar-config="blogToolbarConfig"
        placeholder="开始撰写你的文章..."
        @editor-change="handleContentChange"
        @editor-mounted="handleEditorMounted"
      />

      <!-- 操作按钮 -->
      <div class="mt-20px">
        <n-space>
          <n-button type="primary" @click="saveArticle"> 保存文章 </n-button>
          <n-button @click="previewArticle"> 预览 </n-button>
          <n-button @click="saveDraft"> 保存草稿 </n-button>
          <n-popconfirm @positive-click="clearArticle">
            <template #trigger>
              <n-button type="error"> 清空内容 </n-button>
            </template>
            确定要清空所有内容吗？
          </n-popconfirm>
        </n-space>
      </div>
    </n-card>

    <!-- 文章统计 -->
    <n-card class="mt-20px" title="文章统计" size="small">
      <n-grid cols="4" x-gap="16">
        <n-grid-item>
          <n-statistic label="字符数" :value="articleStats.charCount" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="段落数" :value="articleStats.paragraphCount" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="图片数" :value="articleStats.imageCount" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic
            label="预计阅读时间"
            :value="articleStats.readTime"
            suffix="分钟"
          />
        </n-grid-item>
      </n-grid>
    </n-card>
  </div>
</template>

<script setup>
const blogEditorRef = ref()
const message = useMessage()

const articleData = reactive({
  title: '',
  category: '',
  tags: [],
  content: '',
  status: 'draft',
  publishedAt: null,
})

const categoryOptions = [
  { label: '技术分享', value: 'tech' },
  { label: '生活随笔', value: 'life' },
  { label: '产品思考', value: 'product' },
  { label: '团队管理', value: 'management' },
]

// 博客编辑器专用配置
const blogEditorConfig = {
  placeholder: '开始撰写你的精彩文章...',
  maxLength: 50000,
  MENU_CONF: {
    uploadImage: {
      server: '/api/blog/upload-image',
      fieldName: 'image',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
      onSuccess: (file, res) => {
        message.success('图片上传成功')
      },
      onFailed: (file, res) => {
        message.error('图片上传失败')
      },
    },
    insertLink: {
      checkLink: (text, link) => {
        if (!link) return '链接不能为空'
        if (!link.match(/^https?:\/\//)) return '请输入有效的链接地址'
        return true
      },
    },
  },
}

const blogToolbarConfig = {
  excludeKeys: [
    'group-video', // 博客通常不需要视频
    'fullScreen', // 移除全屏按钮
  ],
}

// 文章统计
const articleStats = computed(() => {
  const content = articleData.content
  const textContent = content.replace(/<[^>]*>/g, '')

  return {
    charCount: textContent.length,
    paragraphCount: (content.match(/<p>/g) || []).length,
    imageCount: (content.match(/<img/g) || []).length,
    readTime: Math.ceil(textContent.length / 200), // 按每分钟200字计算
  }
})

const handleEditorMounted = (editor) => {
  console.log('博客编辑器初始化完成')

  // 设置自动保存
  setInterval(() => {
    if (articleData.content) {
      saveDraft()
    }
  }, 30000) // 每30秒自动保存草稿
}

const handleContentChange = (html) => {
  // 内容变化时的处理
  if (articleStats.value.charCount > 45000) {
    message.warning('文章内容较长，建议分段发布')
  }
}

const saveArticle = async () => {
  if (!articleData.title.trim()) {
    message.error('请输入文章标题')
    return
  }

  try {
    articleData.status = 'published'
    articleData.publishedAt = new Date()

    // 调用保存接口
    await api.saveArticle(articleData)

    message.success('文章发布成功！')
  } catch (error) {
    message.error('发布失败，请重试')
  }
}

const saveDraft = async () => {
  try {
    await api.saveDraft(articleData)
    message.info('草稿已自动保存')
  } catch (error) {
    console.error('草稿保存失败:', error)
  }
}

const previewArticle = () => {
  const previewWindow = window.open('', '_blank')
  previewWindow.document.write(`
    <html>
      <head><title>${articleData.title}</title></head>
      <body>
        <h1>${articleData.title}</h1>
        <div>${articleData.content}</div>
      </body>
    </html>
  `)
}

const clearArticle = () => {
  Object.assign(articleData, {
    title: '',
    category: '',
    tags: [],
    content: '',
    status: 'draft',
    publishedAt: null,
  })

  if (blogEditorRef.value) {
    blogEditorRef.value.clear()
  }
}
</script>

<style scoped>
.blog-editor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.article-meta {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}
</style>
```

### 场景 2: 邮件编辑器

```vue
<template>
  <div class="email-editor">
    <n-card title="撰写邮件">
      <!-- 邮件头部信息 -->
      <div class="email-header">
        <n-space vertical size="large">
          <n-input
            v-model:value="emailData.to"
            placeholder="收件人邮箱，多个邮箱用逗号分隔"
            clearable
          >
            <template #prefix>收件人:</template>
          </n-input>

          <n-input
            v-model:value="emailData.cc"
            placeholder="抄送邮箱，多个邮箱用逗号分隔"
            clearable
          >
            <template #prefix>抄&nbsp;&nbsp;&nbsp;送:</template>
          </n-input>

          <n-input
            v-model:value="emailData.subject"
            placeholder="邮件主题"
            clearable
          >
            <template #prefix>主&nbsp;&nbsp;&nbsp;题:</template>
          </n-input>
        </n-space>
      </div>

      <!-- 邮件内容编辑器 -->
      <div class="email-content mt-20px">
        <C_Editor
          ref="emailEditorRef"
          v-model="emailData.content"
          :height="400"
          :editor-config="emailEditorConfig"
          :toolbar-config="emailToolbarConfig"
          placeholder="请输入邮件内容..."
          @editor-mounted="handleEmailEditorMounted"
        />
      </div>

      <!-- 附件上传 -->
      <div class="email-attachments mt-20px">
        <n-upload
          v-model:file-list="emailData.attachments"
          :max="10"
          multiple
          :show-preview-button="false"
        >
          <n-button>
            <template #icon>
              <i class="i-mdi:attachment"></i>
            </template>
            添加附件
          </n-button>
        </n-upload>
      </div>

      <!-- 操作按钮 -->
      <div class="email-actions mt-20px">
        <n-space>
          <n-button type="primary" @click="sendEmail" :loading="sending">
            <template #icon>
              <i class="i-mdi:send"></i>
            </template>
            发送邮件
          </n-button>

          <n-button @click="saveDraft">
            <template #icon>
              <i class="i-mdi:content-save"></i>
            </template>
            保存草稿
          </n-button>

          <n-dropdown :options="templateOptions" @select="insertTemplate">
            <n-button>
              <template #icon>
                <i class="i-mdi:file-document-outline"></i>
              </template>
              插入模板
            </n-button>
          </n-dropdown>

          <n-button @click="previewEmail">
            <template #icon>
              <i class="i-mdi:eye"></i>
            </template>
            预览
          </n-button>
        </n-space>
      </div>
    </n-card>
  </div>
</template>

<script setup>
const emailEditorRef = ref()
const message = useMessage()
const dialog = useDialog()

const sending = ref(false)

const emailData = reactive({
  to: '',
  cc: '',
  subject: '',
  content: '',
  attachments: [],
  priority: 'normal',
})

// 邮件编辑器配置
const emailEditorConfig = {
  placeholder: '请输入邮件内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/api/email/upload-image',
      fieldName: 'image',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      onSuccess: (file, res) => {
        message.success('图片插入成功')
      },
    },
    insertLink: {
      checkLink: (text, link) => {
        if (!link) return '链接不能为空'
        return true
      },
    },
  },
}

const emailToolbarConfig = {
  excludeKeys: [
    'group-video', // 邮件中通常不插入视频
    'fullScreen', // 移除全屏
    'code', // 移除代码块
    'codeSelectLang', // 移除代码语言选择
  ],
}

// 邮件模板选项
const templateOptions = [
  {
    label: '商务邮件模板',
    key: 'business',
  },
  {
    label: '感谢邮件模板',
    key: 'thanks',
  },
  {
    label: '邀请邮件模板',
    key: 'invitation',
  },
  {
    label: '通知邮件模板',
    key: 'notification',
  },
]

const emailTemplates = {
  business: `
    <p>尊敬的 [收件人姓名]：</p>
    <p>您好！</p>
    <p>[邮件正文内容]</p>
    <p>如有任何问题，请随时与我联系。</p>
    <p>此致</p>
    <p>敬礼！</p>
    <p><br></p>
    <p>[您的姓名]</p>
    <p>[您的职位]</p>
    <p>[公司名称]</p>
    <p>[联系方式]</p>
  `,
  thanks: `
    <p>亲爱的 [收件人姓名]：</p>
    <p>感谢您的 [具体事项]！</p>
    <p>[感谢的具体内容和原因]</p>
    <p>再次感谢您的支持与帮助。</p>
    <p>祝好！</p>
    <p><br></p>
    <p>[您的姓名]</p>
  `,
  invitation: `
    <p>尊敬的 [收件人姓名]：</p>
    <p>我们诚挚邀请您参加 [活动名称]。</p>
    <p><strong>活动详情：</strong></p>
    <ul>
      <li>时间：[活动时间]</li>
      <li>地点：[活动地点]</li>
      <li>主题：[活动主题]</li>
    </ul>
    <p>期待您的参与！</p>
    <p>如需确认参加，请回复此邮件。</p>
    <p><br></p>
    <p>[您的姓名]</p>
    <p>[组织名称]</p>
  `,
  notification: `
    <p>各位同事：</p>
    <p>现通知如下事项：</p>
    <p><strong>[通知标题]</strong></p>
    <p>[通知内容详情]</p>
    <p><strong>注意事项：</strong></p>
    <ul>
      <li>[注意事项1]</li>
      <li>[注意事项2]</li>
    </ul>
    <p>如有疑问，请及时联系。</p>
    <p><br></p>
    <p>[发布人]</p>
    <p>[发布时间]</p>
  `,
}

const handleEmailEditorMounted = (editor) => {
  console.log('邮件编辑器初始化完成')

  // 设置邮件签名
  const signature = `
    <p><br></p>
    <hr>
    <p><small>
      此邮件由系统自动发送，请勿直接回复。<br>
      如有问题请联系：support@example.com
    </small></p>
  `

  // 如果内容为空，添加默认签名
  if (!emailData.content.trim()) {
    editor.setHtml(signature)
  }
}

const insertTemplate = (key) => {
  const template = emailTemplates[key]
  if (template && emailEditorRef.value) {
    emailEditorRef.value.setContent(template)
    message.success('模板已插入')
  }
}

const sendEmail = async () => {
  // 验证邮件信息
  if (!emailData.to.trim()) {
    message.error('请输入收件人邮箱')
    return
  }

  if (!emailData.subject.trim()) {
    message.error('请输入邮件主题')
    return
  }

  if (!emailData.content.trim()) {
    message.error('请输入邮件内容')
    return
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const toEmails = emailData.to.split(',').map((email) => email.trim())
  const invalidEmails = toEmails.filter((email) => !emailRegex.test(email))

  if (invalidEmails.length > 0) {
    message.error(`邮箱格式不正确: ${invalidEmails.join(', ')}`)
    return
  }

  try {
    sending.value = true

    // 构建邮件数据
    const mailData = {
      ...emailData,
      content: emailEditorRef.value.getContent(),
      attachments: emailData.attachments.map((file) => ({
        name: file.name,
        size: file.file?.size,
        url: file.url,
      })),
    }

    // 发送邮件
    await api.sendEmail(mailData)

    message.success('邮件发送成功！')

    // 清空表单
    Object.assign(emailData, {
      to: '',
      cc: '',
      subject: '',
      content: '',
      attachments: [],
    })

    if (emailEditorRef.value) {
      emailEditorRef.value.clear()
    }
  } catch (error) {
    message.error('邮件发送失败，请重试')
  } finally {
    sending.value = false
  }
}

const saveDraft = async () => {
  try {
    await api.saveDraft({
      ...emailData,
      content: emailEditorRef.value?.getContent() || '',
    })
    message.success('草稿已保存')
  } catch (error) {
    message.error('草稿保存失败')
  }
}

const previewEmail = () => {
  if (!emailData.content.trim()) {
    message.warning('邮件内容为空')
    return
  }

  const previewContent = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="border-bottom: 1px solid #eee; padding: 20px 0;">
        <p><strong>收件人:</strong> ${emailData.to}</p>
        ${emailData.cc ? `<p><strong>抄送:</strong> ${emailData.cc}</p>` : ''}
        <p><strong>主题:</strong> ${emailData.subject}</p>
      </div>
      <div style="padding: 20px 0;">
        ${emailData.content}
      </div>
    </div>
  `

  const previewWindow = window.open('', '_blank')
  previewWindow.document.write(previewContent)
}
</script>

<style scoped>
.email-editor {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.email-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
}

.email-content {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
}

.email-attachments {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
}
</style>
```

### 场景 3: 在线文档协作

```vue
<template>
  <div class="collaborative-editor">
    <n-card>
      <!-- 文档头部 -->
      <template #header>
        <div class="doc-header">
          <n-space align="center" justify="space-between">
            <div>
              <n-input
                v-model:value="documentData.title"
                placeholder="无标题文档"
                :bordered="false"
                size="large"
                style="font-weight: 600;"
                @blur="saveDocument"
              />
            </div>

            <div>
              <n-space align="center">
                <!-- 在线用户 -->
                <n-avatar-group
                  v-if="onlineUsers.length > 0"
                  :max="5"
                  :size="32"
                >
                  <n-tooltip
                    v-for="user in onlineUsers"
                    :key="user.id"
                    :content="user.name"
                  >
                    <n-avatar
                      :src="user.avatar"
                      :style="{ border: `2px solid ${user.cursorColor}` }"
                    />
                  </n-tooltip>
                </n-avatar-group>

                <!-- 分享按钮 -->
                <n-button type="primary" @click="shareDocument">
                  <template #icon>
                    <i class="i-mdi:share-variant"></i>
                  </template>
                  分享
                </n-button>

                <!-- 版本历史 -->
                <n-dropdown :options="versionOptions" @select="loadVersion">
                  <n-button>
                    <template #icon>
                      <i class="i-mdi:history"></i>
                    </template>
                    版本历史
                  </n-button>
                </n-dropdown>
              </n-space>
            </div>
          </n-space>
        </div>
      </template>

      <!-- 编辑器主体 -->
      <div class="collaborative-content">
        <C_Editor
          ref="collaborativeEditorRef"
          v-model="documentData.content"
          :height="600"
          :editor-config="collaborativeEditorConfig"
          :toolbar-config="collaborativeToolbarConfig"
          placeholder="开始协作编辑文档..."
          @editor-mounted="handleEditorMounted"
          @editor-change="handleContentChange"
          @editor-focus="handleEditorFocus"
          @editor-blur="handleEditorBlur"
        />
      </div>

      <!-- 底部状态栏 -->
      <template #footer>
        <div class="doc-footer">
          <n-space align="center" justify="space-between">
            <div>
              <n-space align="center">
                <n-tag :type="saveStatus.type" size="small">
                  <template #icon>
                    <i :class="saveStatus.icon"></i>
                  </template>
                  {{ saveStatus.text }}
                </n-tag>

                <span class="text-sm text-gray-500">
                  {{ documentStats.words }} 字 |
                  {{ documentStats.characters }} 字符
                </span>
              </n-space>
            </div>

            <div>
              <n-space align="center">
                <span class="text-sm text-gray-500">
                  最后编辑: {{ lastEditedBy }}
                </span>

                <!-- 评论按钮 -->
                <n-badge :value="commentsCount" :max="99">
                  <n-button size="small" @click="toggleComments">
                    <template #icon>
                      <i class="i-mdi:comment-outline"></i>
                    </template>
                    评论
                  </n-button>
                </n-badge>
              </n-space>
            </div>
          </n-space>
        </div>
      </template>
    </n-card>

    <!-- 评论侧边栏 -->
    <n-drawer
      v-model:show="showComments"
      :width="360"
      placement="right"
      title="评论"
    >
      <div class="comments-panel">
        <div v-if="comments.length === 0" class="empty-comments">
          <n-empty description="暂无评论" />
        </div>

        <div v-else class="comments-list">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <n-space>
              <n-avatar :src="comment.user.avatar" size="small" />
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.user.name }}</span>
                  <span class="comment-time">{{
                    formatTime(comment.createdAt)
                  }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
              </div>
            </n-space>
          </div>
        </div>

        <!-- 添加评论 -->
        <div class="add-comment">
          <n-input
            v-model:value="newComment"
            type="textarea"
            placeholder="添加评论..."
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
          <n-button
            type="primary"
            size="small"
            class="mt-8px"
            @click="addComment"
            :disabled="!newComment.trim()"
          >
            添加评论
          </n-button>
        </div>
      </div>
    </n-drawer>
  </div>
</template>

<script setup>
const collaborativeEditorRef = ref()
const message = useMessage()

// WebSocket连接（模拟协作）
let ws = null

const documentData = reactive({
  id: 'doc-' + Date.now(),
  title: '协作文档示例',
  content: `
    <h1>团队协作文档</h1>
    <p>这是一个支持实时协作的文档编辑器。多个用户可以同时编辑，并看到其他人的修改。</p>
    <h2>功能特性</h2>
    <ul>
      <li>实时协作编辑</li>
      <li>用户光标显示</li>
      <li>版本历史管理</li>
      <li>评论系统</li>
      <li>自动保存</li>
    </ul>
  `,
  version: 1,
  lastModified: new Date(),
})

// 在线用户
const onlineUsers = ref([
  {
    id: '1',
    name: '张三',
    avatar: '/avatars/user1.jpg',
    cursorColor: '#3f86ff',
  },
  {
    id: '2',
    name: '李四',
    avatar: '/avatars/user2.jpg',
    cursorColor: '#67c23a',
  },
])

// 保存状态
const saveStatus = reactive({
  type: 'success',
  icon: 'i-mdi:check-circle',
  text: '已保存',
})

// 评论系统
const showComments = ref(false)
const newComment = ref('')
const comments = ref([
  {
    id: '1',
    content: '这个想法很不错！',
    user: {
      name: '王五',
      avatar: '/avatars/user3.jpg',
    },
    createdAt: new Date(Date.now() - 2 * 3600000),
  },
])

const commentsCount = computed(() => comments.value.length)

// 文档统计
const documentStats = computed(() => {
  const content = documentData.content.replace(/<[^>]*>/g, '')
  return {
    words: content.split(/\s+/).filter((word) => word.length > 0).length,
    characters: content.length,
  }
})

const lastEditedBy = computed(() => {
  return `${onlineUsers.value[0]?.name || '未知用户'} ${formatTime(
    documentData.lastModified
  )}`
})

// 版本历史
const versionOptions = [
  { label: '版本 3 - 2小时前', key: '3' },
  { label: '版本 2 - 1天前', key: '2' },
  { label: '版本 1 - 3天前', key: '1' },
]

// 协作编辑器配置
const collaborativeEditorConfig = {
  placeholder: '开始协作编辑文档...',
  MENU_CONF: {
    uploadImage: {
      server: '/api/docs/upload-image',
      fieldName: 'image',
      maxFileSize: 10 * 1024 * 1024,
      onSuccess: (file, res) => {
        message.success('图片上传成功')
        broadcastChange('image_uploaded', { url: res.data.url })
      },
    },
  },
}

const collaborativeToolbarConfig = {
  insertKeys: {
    index: 0,
    keys: ['comment', 'version-history'],
  },
}

const handleEditorMounted = (editor) => {
  console.log('协作编辑器初始化完成')

  // 初始化WebSocket连接
  initWebSocket()

  // 设置自动保存
  setInterval(() => {
    if (documentData.content) {
      autoSave()
    }
  }, 10000) // 每10秒自动保存
}

const handleContentChange = (html) => {
  documentData.lastModified = new Date()

  // 更新保存状态
  saveStatus.type = 'warning'
  saveStatus.icon = 'i-mdi:pencil'
  saveStatus.text = '编辑中...'

  // 广播变更给其他用户
  broadcastChange('content_change', {
    content: html,
    cursor: getCurrentCursorPosition(),
  })

  // 防抖保存
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    autoSave()
  }, 2000)
}

let saveTimeout = null

const handleEditorFocus = () => {
  broadcastChange('user_focus', {
    userId: getCurrentUserId(),
    timestamp: Date.now(),
  })
}

const handleEditorBlur = () => {
  broadcastChange('user_blur', {
    userId: getCurrentUserId(),
    timestamp: Date.now(),
  })
}

// WebSocket相关方法
const initWebSocket = () => {
  try {
    ws = new WebSocket(`ws://localhost:8080/collaborate/${documentData.id}`)

    ws.onopen = () => {
      console.log('协作连接已建立')
      message.success('已连接到协作服务器')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleCollaborativeMessage(data)
    }

    ws.onclose = () => {
      console.log('协作连接已断开')
      message.warning('协作连接已断开，尝试重连...')
      // 重连逻辑
      setTimeout(initWebSocket, 3000)
    }

    ws.onerror = (error) => {
      console.error('协作连接错误:', error)
      message.error('协作连接出错')
    }
  } catch (error) {
    console.log('WebSocket连接失败，使用模拟协作模式')
  }
}

const broadcastChange = (type, data) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type,
        data,
        userId: getCurrentUserId(),
        timestamp: Date.now(),
      })
    )
  }
}

const handleCollaborativeMessage = (message) => {
  const { type, data, userId } = message

  // 忽略自己的消息
  if (userId === getCurrentUserId()) return

  switch (type) {
    case 'content_change':
      // 处理其他用户的内容变更
      handleRemoteContentChange(data)
      break
    case 'user_join':
      // 用户加入
      handleUserJoin(data)
      break
    case 'user_leave':
      // 用户离开
      handleUserLeave(data)
      break
    case 'cursor_change':
      // 光标位置变更
      handleCursorChange(data)
      break
  }
}

const getCurrentUserId = () => {
  return 'current-user-id' // 实际应用中从认证信息获取
}

const getCurrentCursorPosition = () => {
  // 获取当前光标位置的逻辑
  return { line: 1, column: 1 }
}

// 保存相关方法
const autoSave = async () => {
  try {
    await api.saveDocument({
      id: documentData.id,
      title: documentData.title,
      content: collaborativeEditorRef.value?.getContent() || '',
      version: documentData.version + 1,
    })

    saveStatus.type = 'success'
    saveStatus.icon = 'i-mdi:check-circle'
    saveStatus.text = '已保存'

    documentData.version++
  } catch (error) {
    saveStatus.type = 'error'
    saveStatus.icon = 'i-mdi:alert-circle'
    saveStatus.text = '保存失败'
  }
}

const saveDocument = () => {
  autoSave()
}

// 分享相关方法
const shareDocument = () => {
  const shareUrl = `${window.location.origin}/docs/${documentData.id}`

  navigator.clipboard
    .writeText(shareUrl)
    .then(() => {
      message.success('分享链接已复制到剪贴板')
    })
    .catch(() => {
      // 降级方案
      prompt('分享链接（请手动复制）:', shareUrl)
    })
}

// 版本历史
const loadVersion = (versionKey) => {
  message.info(`正在加载版本 ${versionKey}...`)
  // 实际应用中从服务器加载对应版本
}

// 评论相关方法
const toggleComments = () => {
  showComments.value = !showComments.value
}

const addComment = () => {
  if (!newComment.value.trim()) return

  const comment = {
    id: Date.now().toString(),
    content: newComment.value,
    user: {
      name: '当前用户',
      avatar: '/avatars/current-user.jpg',
    },
    createdAt: new Date(),
  }

  comments.value.push(comment)
  newComment.value = ''

  message.success('评论已添加')
}

const formatTime = (date) => {
  return new Date(date).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 清理资源
onUnmounted(() => {
  if (ws) {
    ws.close()
  }
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
})
</script>

<style scoped>
.collaborative-editor {
  height: 100vh;
  padding: 16px;
}

.doc-header {
  width: 100%;
}

.doc-footer {
  width: 100%;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
}

.comments-panel {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 600;
  font-size: 12px;
}

.comment-time {
  font-size: 11px;
  color: #666;
}

.comment-text {
  font-size: 13px;
  line-height: 1.4;
}

.add-comment {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.empty-comments {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}
</style>
```

## 🛠️ 高级用法

### 自定义工具栏

```vue
<template>
  <C_Editor
    ref="customEditorRef"
    v-model="content"
    :toolbar-config="customToolbarConfig"
    @editor-mounted="handleEditorMounted"
  />
</template>

<script setup>
const customEditorRef = ref()
const content = ref('')

// 自定义工具栏配置
const customToolbarConfig = {
  // 排除不需要的按钮
  excludeKeys: ['group-video', 'fullScreen', 'emotion'],

  // 插入自定义按钮
  insertKeys: {
    index: 0, // 插入位置
    keys: ['customButton1', 'customButton2'],
  },

  // 工具栏样式
  modalAppendToBody: true,
}

const handleEditorMounted = (editor) => {
  // 注册自定义按钮
  const { Boot } = window.wangEditor

  // 自定义按钮1：插入当前时间
  class InsertTimeButton {
    constructor() {
      this.title = '插入时间'
      this.iconSvg = '<svg>...</svg>' // 自定义图标SVG
      this.tag = 'button'
    }

    getValue() {
      return ''
    }

    isActive() {
      return false
    }

    isDisabled() {
      return false
    }

    exec() {
      const currentTime = new Date().toLocaleString()
      editor.insertText(`[${currentTime}]`)
    }
  }

  // 注册自定义按钮
  Boot.registerMenu({
    key: 'customButton1',
    factory() {
      return new InsertTimeButton()
    },
  })
}
</script>
```

### 内容过滤和验证

```vue
<template>
  <C_Editor
    ref="filterEditorRef"
    v-model="content"
    :editor-config="filterEditorConfig"
    @editor-change="handleContentChange"
  />
</template>

<script setup>
const filterEditorRef = ref()
const content = ref('')

// 内容过滤配置
const filterEditorConfig = {
  // 自定义HTML过滤
  MENU_CONF: {
    // 配置允许的HTML标签和属性
    allowedTags: ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'width', 'height'],
    },

    // 内容处理器
    parseElemsHtml: [
      // 过滤危险脚本
      (elemHtml, elem) => {
        if (elemHtml.includes('<script')) {
          return ''
        }
        return elemHtml
      },

      // 处理外部链接
      (elemHtml, elem) => {
        if (elem.tagName === 'A') {
          return elemHtml.replace(/<a /g, '<a target="_blank" rel="noopener" ')
        }
        return elemHtml
      },
    ],
  },
}

const handleContentChange = (html) => {
  // 实时内容验证
  validateContent(html)
}

const validateContent = (html) => {
  const rules = [
    {
      name: '字符长度',
      check: (content) => content.replace(/<[^>]*>/g, '').length <= 10000,
      message: '内容长度不能超过10000字符',
    },
    {
      name: '图片数量',
      check: (content) => (content.match(/<img/g) || []).length <= 10,
      message: '图片数量不能超过10张',
    },
    {
      name: '链接数量',
      check: (content) => (content.match(/<a/g) || []).length <= 20,
      message: '链接数量不能超过20个',
    },
  ]

  for (const rule of rules) {
    if (!rule.check(html)) {
      message.warning(rule.message)
      break
    }
  }
}
</script>
```

### 多编辑器实例管理

```vue
<template>
  <div class="multi-editor-manager">
    <n-tabs
      v-model:value="activeTab"
      type="editable-card"
      @add="addEditor"
      @close="closeEditor"
    >
      <n-tab-pane
        v-for="editor in editors"
        :key="editor.id"
        :name="editor.id"
        :tab="editor.title"
        :closable="editors.length > 1"
      >
        <C_Editor
          :ref="(el) => setEditorRef(editor.id, el)"
          v-model="editor.content"
          :editor-id="editor.id"
          :height="400"
          @editor-mounted="
            (editorInstance) => handleEditorMounted(editor.id, editorInstance)
          "
          @editor-change="(html) => handleEditorChange(editor.id, html)"
        />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
const activeTab = ref('editor-1')
const editorRefs = new Map()

const editors = ref([
  {
    id: 'editor-1',
    title: '文档1',
    content: '<p>第一个编辑器的内容</p>',
  },
])

const setEditorRef = (id, ref) => {
  if (ref) {
    editorRefs.set(id, ref)
  } else {
    editorRefs.delete(id)
  }
}

const handleEditorMounted = (editorId, editorInstance) => {
  console.log(`编辑器 ${editorId} 已挂载:`, editorInstance)
}

const handleEditorChange = (editorId, html) => {
  const editor = editors.value.find((e) => e.id === editorId)
  if (editor) {
    editor.content = html
  }
}

const addEditor = () => {
  const newId = `editor-${Date.now()}`
  const newEditor = {
    id: newId,
    title: `文档${editors.value.length + 1}`,
    content: '<p>新建文档的内容</p>',
  }

  editors.value.push(newEditor)
  activeTab.value = newId
}

const closeEditor = (editorId) => {
  const index = editors.value.findIndex((e) => e.id === editorId)
  if (index !== -1) {
    editors.value.splice(index, 1)
    editorRefs.delete(editorId)

    // 切换到其他标签
    if (activeTab.value === editorId && editors.value.length > 0) {
      activeTab.value = editors.value[0].id
    }
  }
}

// 提供全局方法
const getAllContents = () => {
  const contents = {}
  editors.value.forEach((editor) => {
    const editorRef = editorRefs.get(editor.id)
    if (editorRef) {
      contents[editor.id] = editorRef.getContent()
    }
  })
  return contents
}

const saveAllEditors = async () => {
  const contents = getAllContents()
  try {
    await api.saveMultipleDocuments(contents)
    message.success('所有文档已保存')
  } catch (error) {
    message.error('保存失败')
  }
}

defineExpose({
  getAllContents,
  saveAllEditors,
})
</script>
```

## ⚠️ 注意事项

### 1. 编辑器初始化

```vue
<!-- ✅ 推荐：等待编辑器挂载后再进行操作 -->
<script setup>
const editorRef = ref()
const isEditorReady = ref(false)

const handleEditorMounted = (editor) => {
  isEditorReady.value = true
  // 现在可以安全地调用编辑器方法
  editor.setHtml('<p>初始内容</p>')
}

const setContent = () => {
  if (isEditorReady.value && editorRef.value) {
    editorRef.value.setContent('<p>新内容</p>')
  }
}
</script>

<!-- ❌ 不推荐：在编辑器未初始化时调用方法 -->
<script setup>
const editorRef = ref()

const setContent = () => {
  // 可能会失败，因为编辑器可能还未初始化
  editorRef.value.setContent('<p>新内容</p>')
}
</script>
```

### 2. 内容格式处理

```javascript
// ✅ 推荐：检查内容格式
const setEditorContent = (content) => {
  // 确保内容是字符串
  if (typeof content !== 'string') {
    content = String(content)
  }

  // 检查是否为有效HTML
  if (!content.includes('<')) {
    content = `<p>${content}</p>`
  }

  editorRef.value.setContent(content)
}

// ❌ 不推荐：直接设置可能有问题的内容
const setEditorContent = (content) => {
  editorRef.value.setContent(content) // 可能导致格式问题
}
```

### 3. 内存管理

```vue
<script setup>
const editorRef = ref()

// ✅ 推荐：组件销毁时清理资源
onUnmounted(() => {
  if (editorRef.value) {
    const editor = editorRef.value.getEditor()
    if (editor) {
      editor.destroy()
    }
  }
})

// 清理定时器
let autoSaveTimer = null

const startAutoSave = () => {
  autoSaveTimer = setInterval(() => {
    saveContent()
  }, 30000)
}

onUnmounted(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
})
</script>
```

### 4. 图片上传配置

```javascript
// ✅ 推荐：完整的图片上传配置
const editorConfig = {
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload-image',
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],

      // 上传前检查
      onBeforeUpload: (file) => {
        const isValidSize = file.size <= 5 * 1024 * 1024
        const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(
          file.type
        )

        if (!isValidSize) {
          message.error('图片大小不能超过5MB')
          return false
        }

        if (!isValidType) {
          message.error('只支持JPG、PNG、GIF格式的图片')
          return false
        }

        return true
      },

      // 成功回调
      onSuccess: (file, res) => {
        message.success('图片上传成功')
      },

      // 失败回调
      onFailed: (file, res) => {
        message.error('图片上传失败')
      },

      // 错误回调
      onError: (file, err) => {
        message.error('图片上传出错')
      },
    },
  },
}
```

## 🐛 故障排除

### 常见问题

#### Q1: 编辑器无法正常显示？

**A1:** 检查以下几点：

```javascript
// 1. 确保正确导入了CSS样式
import '@wangeditor/editor/dist/css/style.css'

// 2. 检查容器高度设置
const editorConfig = {
  height: 400, // 确保设置了高度
}

// 3. 检查容器的CSS样式
.editor-container {
  min-height: 300px; /* 确保容器有足够高度 */
}
```

#### Q2: v-model 双向绑定不生效？

**A2:** 检查数据绑定：

```vue
<!-- ✅ 正确的绑定方式 -->
<C_Editor v-model="content" @editor-change="handleChange" />

<script setup>
const content = ref('') // 确保是响应式数据

const handleChange = (html) => {
  console.log('内容变化:', html)
  // content 会自动更新
}
</script>
```

#### Q3: 自定义配置不生效？

**A3:** 检查配置格式：

```javascript
// ✅ 正确的配置格式
const editorConfig = {
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload',
      // 其他配置...
    },
  },
}

// ❌ 错误的配置格式
const editorConfig = {
  uploadImage: {
    // 缺少 MENU_CONF 包装
    server: '/api/upload',
  },
}
```

#### Q4: 编辑器内容无法保存？

**A4:** 检查内容获取方式：

```javascript
// ✅ 推荐的内容获取方式
const saveContent = () => {
  if (editorRef.value) {
    const content = editorRef.value.getContent()
    // 保存到服务器
    api.saveContent(content)
  }
}

// ✅ 或者使用v-model绑定的值
const saveContent = () => {
  api.saveContent(content.value)
}
```

#### Q5: 禁用/只读模式不工作？

**A5:** 检查模式设置：

```vue
<C_Editor
  v-model="content"
  :disabled="isDisabled"    <!-- 禁用模式 -->
  :readonly="isReadonly"    <!-- 只读模式 -->
/>

<script setup>
const isDisabled = ref(false)
const isReadonly = ref(false)

// 动态切换模式
const toggleMode = () => {
  isDisabled.value = !isDisabled.value
}
</script>
```

## 🎯 最佳实践

### 1. 组件封装

```javascript
// 创建可复用的编辑器组件
// components/ArticleEditor.vue
<template>
  <div class="article-editor">
    <C_Editor
      ref="editorRef"
      v-model="localContent"
      :editor-config="articleEditorConfig"
      :toolbar-config="articleToolbarConfig"
      :height="height"
      @editor-mounted="handleEditorMounted"
      @editor-change="handleContentChange"
    />

    <div class="editor-footer">
      <div class="word-count">
        字数: {{ wordCount }}
      </div>
      <div class="auto-save-status">
        <n-tag :type="saveStatus.type">{{ saveStatus.text }}</n-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
interface Props {
  modelValue: string
  height?: number
  autoSave?: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 400,
  autoSave: true,
  maxLength: 50000,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'save': [content: string]
  'change': [content: string]
}>()

const editorRef = ref()
const localContent = ref(props.modelValue)
const saveStatus = reactive({
  type: 'success' as const,
  text: '已保存',
})

// 配置文章编辑器
const articleEditorConfig = computed(() => ({
  placeholder: '开始撰写你的文章...',
  maxLength: props.maxLength,
  MENU_CONF: {
    uploadImage: {
      server: '/api/article/upload-image',
      fieldName: 'image',
      maxFileSize: 10 * 1024 * 1024,
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
    },
  },
}))

const wordCount = computed(() => {
  return localContent.value.replace(/<[^>]*>/g, '').length
})

// 监听内容变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== localContent.value) {
      localContent.value = newVal
    }
  }
)

watch(
  localContent,
  (newVal) => {
    emit('update:modelValue', newVal)
    emit('change', newVal)

    if (props.autoSave) {
      debouncedSave()
    }
  }
)

// 防抖保存
const debouncedSave = debounce(() => {
  emit('save', localContent.value)
  saveStatus.type = 'success'
  saveStatus.text = '已保存'
}, 2000)

const handleContentChange = (html: string) => {
  saveStatus.type = 'warning'
  saveStatus.text = '编辑中...'
}
</script>
```

### 2. 错误处理和重试机制

```javascript
// 带错误处理的编辑器操作
class EditorOperationManager {
  constructor(editorRef) {
    this.editorRef = editorRef
    this.retryCount = 0
    this.maxRetries = 3
  }

  async setContent(content, retryCount = 0) {
    try {
      if (!this.editorRef.value) {
        throw new Error('编辑器未初始化')
      }

      this.editorRef.value.setContent(content)
      this.retryCount = 0 // 重置重试次数

      return true
    } catch (error) {
      console.error('设置内容失败:', error)

      if (retryCount < this.maxRetries) {
        console.log(`重试设置内容 (${retryCount + 1}/${this.maxRetries})`)

        // 等待一段时间后重试
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return this.setContent(content, retryCount + 1)
      }

      throw new Error(`设置内容失败，已重试${this.maxRetries}次`)
    }
  }

  async uploadImage(file) {
    const maxRetries = 3
    let lastError

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await api.uploadImage(file)
        return result
      } catch (error) {
        lastError = error
        console.warn(`图片上传失败 (${i + 1}/${maxRetries}):`, error)

        if (i < maxRetries - 1) {
          // 指数退避
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 1000)
          )
        }
      }
    }

    throw lastError
  }
}

// 使用示例
const editorManager = new EditorOperationManager(editorRef)

const handleSetContent = async (content) => {
  try {
    await editorManager.setContent(content)
    message.success('内容设置成功')
  } catch (error) {
    message.error(error.message)
  }
}
```

### 3. 性能优化

```javascript
// 优化大文档编辑性能
const useEditorPerformance = (editorRef) => {
  const isLargeDocument = ref(false)
  const performanceMode = ref(false)

  // 监控文档大小
  const checkDocumentSize = (content) => {
    const size = content.length
    const isLarge = size > 100000 // 100KB

    if (isLarge !== isLargeDocument.value) {
      isLargeDocument.value = isLarge

      if (isLarge && !performanceMode.value) {
        enablePerformanceMode()
      } else if (!isLarge && performanceMode.value) {
        disablePerformanceMode()
      }
    }
  }

  const enablePerformanceMode = () => {
    performanceMode.value = true

    // 减少不必要的工具栏功能
    if (editorRef.value) {
      const editor = editorRef.value.getEditor()

      // 禁用一些消耗性能的功能
      editor.config.placeholder = '大文档模式 - 某些功能已优化'
    }

    message.info('已启用性能优化模式')
  }

  const disablePerformanceMode = () => {
    performanceMode.value = false
    message.info('已关闭性能优化模式')
  }

  return {
    isLargeDocument,
    performanceMode,
    checkDocumentSize,
  }
}

// 防抖和节流优化
const useOptimizedEditor = () => {
  // 防抖的内容保存
  const debouncedSave = debounce(async (content) => {
    try {
      await api.saveContent(content)
    } catch (error) {
      console.error('保存失败:', error)
    }
  }, 2000)

  // 节流的字数统计
  const throttledWordCount = throttle((content) => {
    const words = content.replace(/<[^>]*>/g, '').length
    updateWordCount(words)
  }, 500)

  return {
    debouncedSave,
    throttledWordCount,
  }
}
```

### 4. 内容验证和安全

```javascript
// 内容安全验证
const useContentSecurity = () => {
  const sanitizeContent = (html) => {
    // 移除潜在危险的标签和属性
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form']
    const dangerousAttrs = ['onclick', 'onload', 'onerror', 'javascript:']

    let sanitized = html

    // 移除危险标签
    dangerousTags.forEach((tag) => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi')
      sanitized = sanitized.replace(regex, '')
    })

    // 移除危险属性
    dangerousAttrs.forEach((attr) => {
      const regex = new RegExp(`${attr}[^>]*`, 'gi')
      sanitized = sanitized.replace(regex, '')
    })

    return sanitized
  }

  const validateContent = (content) => {
    const errors = []

    // 检查长度
    if (content.length > 500000) {
      errors.push('内容长度超出限制')
    }

    // 检查图片数量
    const imageCount = (content.match(/<img/g) || []).length
    if (imageCount > 50) {
      errors.push('图片数量过多')
    }

    // 检查链接数量
    const linkCount = (content.match(/<a/g) || []).length
    if (linkCount > 100) {
      errors.push('链接数量过多')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  return {
    sanitizeContent,
    validateContent,
  }
}
```

## 📝 更新日志

### v1.0.0 (2025-07-19)

- ✨ 基于 WangEditor 的完整 Vue 3 组件封装
- ✨ 支持所见即所得富文本编辑
- ✨ 完整的双向数据绑定支持
- ✨ 支持禁用和只读模式
- ✨ 自定义工具栏配置
- ✨ 图片上传和媒体插入功能
- ✨ 内置内容过滤和安全防护
- ✨ 完整的 TypeScript 类型定义
- ✨ 响应式设计和移动端适配
- ✨ 丰富的生命周期事件回调
- ✨ 支持自定义主题和样式
- ✨ 内置性能优化机制

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

Copyright (c) 2025 by ChenYu, All Rights Reserved.

---

**💡 提示**: 这个富文本编辑器组件基于强大的 WangEditor 构建，提供了完整的所见即所得编辑体验和丰富的功能扩展。支持图片上传、链接插入、表格编辑等常用功能，同时具备良好的安全性和性能表现。无论是博客编辑、邮件撰写还是文档协作，都能提供专业级的编辑体验。结合 TypeScript 支持和响应式设计，让富文本编辑既强大又易用。如果遇到问题请先查看文档，或者在团队群里讨论。让我们一起打造更高效的内容创作体验！ 📝
