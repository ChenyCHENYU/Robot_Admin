<!-- 文件预览组件使用示例 - 精简版 -->
<template>
  <div class="file-preview-demo">
    <div class="demo-header">
      <NH1>文件预览组件场景示例</NH1>
    </div>

    <div class="demo-content">
      <!-- 场景选择卡片 -->
      <div class="scenario-cards">
        <NCard
          v-for="scenario in scenarios"
          :key="scenario.id"
          :class="{ 'active-card': activeScenario === scenario.id }"
          hoverable
          @click="switchScenario(scenario.id)"
          class="scenario-card"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <C_Icon
                :name="scenario.icon"
                :size="18"
              />
              {{ scenario.title }}
            </div>
          </template>
          <p class="text-sm text-gray-600">{{ scenario.description }}</p>
        </NCard>
      </div>

      <!-- 演示区域 -->
      <div class="demo-section">
        <!-- 场景1: 文件上传预览 -->
        <div
          v-if="activeScenario === 'upload'"
          class="upload-demo"
        >
          <div class="upload-area">
            <NUpload
              ref="uploadRef"
              :file-list="fileList"
              :max="1"
              @change="handleUploadChange"
              @remove="handleUploadRemove"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              :show-file-list="false"
            >
              <NUploadDragger>
                <div class="upload-content">
                  <C_Icon
                    name="ic:outline-cloud-upload"
                    :size="36"
                    color="#3b82f6"
                    class="mb-2 mr-10px align-middle"
                  />
                  <NText class="text-lg">点击或拖拽文件到此区域上传</NText>
                  <NText
                    depth="3"
                    class="text-sm"
                  >
                    支持 PDF、Word (.doc/.docx)、Excel (.xls/.xlsx) 格式
                  </NText>
                </div>
              </NUploadDragger>
            </NUpload>
          </div>

          <div
            v-if="uploadedFile"
            class="preview-section"
          >
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">文件预览</h3>
              <NButton
                size="small"
                @click="clearUpload"
              >
                <template #icon>
                  <C_Icon name="ic:outline-clear" />
                </template>
                清除
              </NButton>
            </div>
            <div class="preview-container">
              <C_FilePreview :file="uploadedFile" />
            </div>
          </div>
        </div>

        <!-- 场景2: URL预览 -->
        <div
          v-if="activeScenario === 'url'"
          class="url-demo"
        >
          <div class="url-input-section">
            <h3 class="text-lg font-semibold mb-4">URL 文件预览</h3>
            <div class="flex gap-3 mb-4">
              <NInput
                v-model:value="fileUrl"
                placeholder="请输入文件URL (支持 PDF、Word、Excel)"
                class="flex-1"
              />
              <NButton
                type="primary"
                @click="loadUrlFile"
                :loading="urlLoading"
              >
                <template #icon>
                  <C_Icon name="ic:outline-preview" />
                </template>
                预览
              </NButton>
            </div>

            <!-- 预设URL示例 -->
            <div class="preset-urls">
              <p class="text-sm text-gray-600 mb-2"
                >快速示例：(需要将示例文件放在 public/demo-files/ 目录下)</p
              >
              <div class="flex flex-wrap gap-2">
                <NTag
                  v-for="preset in presetUrls"
                  :key="preset.name"
                  :type="preset.type"
                  clickable
                  @click="selectPresetUrl(preset)"
                  class="cursor-pointer"
                >
                  <template #icon>
                    <C_Icon :name="preset.icon" />
                  </template>
                  {{ preset.name }}
                </NTag>
              </div>
            </div>
          </div>

          <div
            v-if="currentUrlFile"
            class="preview-section"
          >
            <div class="preview-container">
              <C_FilePreview
                :url="currentUrlFile.url"
                :fileName="currentUrlFile.name"
              />
            </div>
          </div>
        </div>

        <!-- 场景3: 批量预览 -->
        <div
          v-if="activeScenario === 'batch'"
          class="batch-demo"
        >
          <div class="batch-upload-section">
            <h3 class="text-lg font-semibold mb-4">批量文件预览</h3>
            <NUpload
              multiple
              :file-list="batchFileList"
              @change="handleBatchUploadChange"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              :show-file-list="false"
            >
              <NButton>
                <template #icon>
                  <C_Icon name="ic:outline-add" />
                </template>
                添加文件
              </NButton>
            </NUpload>
          </div>

          <div
            v-if="batchFileList.length > 0"
            class="batch-list"
          >
            <div class="flex justify-between items-center mb-4">
              <NTabs
                v-model:value="activeFileIndex"
                type="card"
                class="flex-1"
              >
                <NTabPane
                  v-for="(file, index) in batchFileList"
                  :key="index"
                  :name="index"
                  :tab="file.name"
                />
              </NTabs>
              <NButton
                size="small"
                @click="clearBatchFiles"
                class="ml-4"
              >
                <template #icon>
                  <C_Icon name="ic:outline-clear-all" />
                </template>
                清空全部
              </NButton>
            </div>

            <div class="preview-container">
              <C_FilePreview
                v-if="currentBatchFile"
                :file="currentBatchFile.file as File"
              />
            </div>
          </div>
        </div>

        <!-- 场景4: 配置选项演示 -->
        <div
          v-if="activeScenario === 'config'"
          class="config-demo"
        >
          <h3 class="text-lg font-semibold mb-4">配置选项演示</h3>

          <div class="config-preview">
            <div class="config-file-selector mb-4">
              <NSelect
                v-model:value="selectedConfigFile"
                :options="configFileOptions"
                placeholder="选择演示文件"
              />
            </div>

            <div
              v-if="selectedConfigFile"
              class="preview-container"
            >
              <C_FilePreview
                :url="selectedConfigFile.url"
                :fileName="selectedConfigFile.name"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="usage-info">
      <NCard
        title="使用说明"
        size="small"
      >
        <NText depth="3">
          这是一个功能完善的文件预览组件，支持 PDF、Word、Excel 文件预览。
          <br />
          • PDF: 支持缩放、翻页、内置浏览器预览
          <br />
          • Word: 支持目录导航、缩放、格式化显示
          <br />
          • Excel: 支持多工作表、分页、数据类型识别、合并单元格显示
          <br />
          <strong>推荐使用文件上传功能进行测试</strong>
        </NText>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { UploadFileInfo } from 'naive-ui/es'

  const message = useMessage()

  // 当前激活的场景
  const activeScenario = ref('upload')

  // 场景配置
  const scenarios = [
    {
      id: 'upload',
      title: '文件上传预览',
      description: '上传本地文件进行预览',
      icon: 'ic:outline-cloud-upload',
    },
    {
      id: 'url',
      title: 'URL文件预览',
      description: '通过URL加载远程文件',
      icon: 'ic:outline-link',
    },
    {
      id: 'batch',
      title: '批量文件预览',
      description: '同时预览多个文件',
      icon: 'ic:outline-folder-open',
    },
    {
      id: 'config',
      title: '配置选项',
      description: '自定义预览组件配置',
      icon: 'ic:outline-settings',
    },
  ]

  // 场景1: 文件上传
  const uploadRef = ref()
  const fileList = ref<UploadFileInfo[]>([])
  const uploadedFile = ref<File | null>(null)

  // 场景2: URL预览
  const fileUrl = ref('')
  const urlLoading = ref(false)
  const currentUrlFile = ref<{ url: string; name: string } | null>(null)

  const presetUrls = [
    {
      name: '本地PDF示例',
      url: '/demo-files/sample.pdf',
      type: 'error' as const,
      icon: 'ic:outline-picture-as-pdf',
    },
    {
      name: '本地Excel示例',
      url: '/demo-files/sample.xlsx',
      type: 'success' as const,
      icon: 'ic:outline-grid-on',
    },
    {
      name: '本地Word示例',
      url: '/demo-files/sample.docx',
      type: 'info' as const,
      icon: 'ic:outline-description',
    },
  ]

  // 场景3: 批量预览
  const batchFileList = ref<UploadFileInfo[]>([])
  const activeFileIndex = ref(0)

  // 场景4: 配置选项
  const selectedConfigFile = ref<{ url: string; name: string } | null>(null)

  const configFileOptions = [
    {
      label: 'PDF文档',
      value: { url: '/demo-files/sample.pdf', name: 'sample.pdf' },
    },
    {
      label: 'Excel表格',
      value: { url: '/demo-files/sample.xlsx', name: 'sample.xlsx' },
    },
  ]

  // 计算属性
  const currentBatchFile = computed(() => {
    return batchFileList.value[activeFileIndex.value] || null
  })

  // 方法
  const switchScenario = (scenarioId: string) => {
    activeScenario.value = scenarioId
  }

  // 场景1方法
  const handleUploadChange = (options: { file: UploadFileInfo }) => {
    const { file } = options
    if (file.file) {
      uploadedFile.value = file.file
      fileList.value = [file]
      message.success(`已上传文件: ${file.name}`)
    }
  }

  const handleUploadRemove = () => {
    uploadedFile.value = null
    fileList.value = []
  }

  const clearUpload = () => {
    uploadedFile.value = null
    fileList.value = []
    if (uploadRef.value) {
      uploadRef.value.clear()
    }
  }

  // 场景2方法
  const loadUrlFile = () => {
    if (!fileUrl.value) {
      message.warning('请输入文件URL')
      return
    }

    urlLoading.value = true
    currentUrlFile.value = {
      url: fileUrl.value,
      name: fileUrl.value.split('/').pop() || 'document',
    }

    setTimeout(() => {
      urlLoading.value = false
      message.success('文件加载成功')
    }, 1000)
  }

  const selectPresetUrl = (preset: (typeof presetUrls)[0]) => {
    fileUrl.value = preset.url
    loadUrlFile()
  }

  // 场景3方法
  const handleBatchUploadChange = (options: { fileList: UploadFileInfo[] }) => {
    batchFileList.value = options.fileList.filter(file => file.file)
    if (batchFileList.value.length > 0) {
      activeFileIndex.value = batchFileList.value.length - 1
      message.success(`已添加 ${batchFileList.value.length} 个文件`)
    }
  }

  const clearBatchFiles = () => {
    batchFileList.value = []
    activeFileIndex.value = 0
  }
</script>

<style lang="scss" scoped>
  .file-preview-demo {
    padding: 24px;
    margin: 0 auto;

    .demo-header {
      margin-bottom: 32px;
    }

    .scenario-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 32px;

      .scenario-card {
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        &.active-card {
          border: 2px solid #18a058;
          box-shadow: 0 4px 12px rgba(24, 160, 88, 0.2);
        }
      }
    }

    .demo-section {
      min-height: 600px;

      .upload-demo {
        .upload-area {
          margin-bottom: 24px;

          .upload-content {
            text-align: center;
            padding: 40px;
          }
        }
      }

      .url-demo {
        .preset-urls {
          margin-top: 16px;
        }
      }

      .batch-demo {
        .batch-list {
          .flex {
            margin-bottom: 16px;
          }
        }
      }

      .preview-section {
        margin-top: 24px;
      }

      .preview-container {
        height: 600px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
      }
    }

    .usage-info {
      margin-top: 32px;
      text-align: center;
    }
  }
</style>
