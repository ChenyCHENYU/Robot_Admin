<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-06 16:24:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-28 12:26:13
 * @FilePath: \Robot_Admin\src\views\demo\07-form\index.vue
 * @Description: 表单组件 - 演示页面 - 入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="form-demo">
    <c_vTitle
      title="表单选择器组件场景示例"
      icon="mdi:form-select"
      description="展示所有8种布局类型的完整功能和配置选项"
    />

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-grid">
        <!-- 布局选择器 -->
        <NCard
          hoverable
          class="control-card"
          :bordered="false"
        >
          <template #header>
            <div class="card-header">
              <Icon
                icon="mdi:view-dashboard-outline"
                class="header-icon"
              />
              <span>布局类型</span>
              <NTag
                size="small"
                type="info"
                round
              >
                {{ currentLayoutInfo.title }}
              </NTag>
            </div>
          </template>
          <div class="layout-buttons">
            <button
              v-for="layout in layoutOptions"
              :key="layout.value"
              :class="[
                'layout-btn',
                { active: currentLayout === layout.value },
              ]"
              @click="switchLayout(layout.value)"
            >
              {{ layout.label }}
            </button>
          </div>
          <div class="layout-description">
            <Icon icon="mdi:information-outline" />
            <span>{{ currentLayoutInfo.content }}</span>
          </div>
        </NCard>

        <!-- 配置面板 -->
        <NCard
          hoverable
          class="control-card"
          :bordered="false"
        >
          <template #header>
            <div class="card-header">
              <Icon
                icon="mdi:cog-outline"
                class="header-icon"
              />
              <span>表单配置</span>
            </div>
          </template>
          <div class="config-section">
            <div class="config-item">
              <label class="config-label">
                <Icon icon="mdi:format-align-left" />
                标签位置
              </label>
              <NRadioGroup
                v-model:value="labelPlacement"
                name="placementGroup"
              >
                <NRadioButton
                  v-for="item in LABEL_PLACEMENTS"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </NRadioGroup>
            </div>
            <div class="config-item">
              <label class="config-label">
                <Icon icon="mdi:check-circle-outline" />
                实时验证
              </label>
              <NSwitch v-model:value="validateOnChange" />
              <NTag
                size="small"
                :type="validateOnChange ? 'success' : 'default'"
              >
                {{ validateOnChange ? '已启用' : '已禁用' }}
              </NTag>
            </div>
          </div>
          <NDivider style="margin: 12px 0" />
          <div class="action-buttons">
            <NButton
              v-for="action in FORM_ACTIONS"
              :key="action.key"
              :type="
                action.type === 'fill'
                  ? 'success'
                  : action.type === 'preview'
                    ? 'info'
                    : action.type === 'clear'
                      ? 'warning'
                      : 'primary'
              "
              size="small"
              @click="handleAction(action.key)"
            >
              {{ action.label }}
            </NButton>
          </div>
        </NCard>
      </div>
    </div>

    <!-- 表单展示 -->
    <NCard
      class="form-section"
      :bordered="false"
    >
      <div class="form-header">
        <h3>{{ currentLayoutInfo.title }} - 演示</h3>
        <span class="field-badge">{{ formStats.totalFields }} 字段</span>
      </div>
      <div class="layout-info">
        <strong>{{ currentLayoutInfo.title }}</strong> -
        {{ currentLayoutInfo.content }}
      </div>

      <component
        :is="currentComponent"
        ref="layoutRef"
        v-model="formData"
        :label-placement="labelPlacement"
        :validate-on-change="validateOnChange"
        @submit="handleSubmit"
        @validate-success="errorCount = 0"
        @validate-error="handleValidateError"
        @fields-change="currentFields = $event || []"
      />
    </NCard>

    <!-- 预览模态框 -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="showModal = false"
      >
        <div class="modal-content">
          <NCard :bordered="false">
            <div class="modal-header">
              <h3>数据预览 - {{ currentLayoutInfo.title }}</h3>
              <div class="modal-actions">
                <button
                  class="modal-btn copy"
                  @click="copyData"
                  :disabled="copying"
                >
                  {{ copying ? '复制中...' : '📋 复制' }}
                </button>
                <button
                  class="modal-btn download"
                  @click="downloadData"
                  >💾 下载</button
                >
                <button
                  class="modal-btn close"
                  @click="showModal = false"
                  >✕ 关闭</button
                >
              </div>
            </div>

            <!-- 这里是关键：需要添加 modal-tabs 包装器 -->
            <div class="modal-tabs">
              <!-- 预览模式切换 -->
              <div class="preview-mode-tabs">
                <button
                  v-for="mode in PREVIEW_MODES"
                  :key="mode.value"
                  :class="['mode-tab', { active: previewMode === mode.value }]"
                  @click="previewMode = mode.value"
                >
                  {{ mode.icon }} {{ mode.label }}
                </button>
              </div>

              <!-- 预览内容 -->
              <div class="preview-content">
                <!-- JSON 格式 -->
                <div
                  v-if="previewMode === 'json'"
                  class="tab-content"
                >
                  <div class="content-header">
                    <h4>🔍 JSON 数据格式</h4>
                    <span class="data-size">{{ dataSize }}</span>
                  </div>
                  <pre class="json-display">{{ jsonData }}</pre>
                </div>

                <!-- 表格格式 -->
                <div
                  v-if="previewMode === 'table'"
                  class="tab-content"
                >
                  <div class="content-header">
                    <h4>📊 表格数据格式</h4>
                    <span class="field-count"
                      >{{ Object.keys(formData).length }} 个字段</span
                    >
                  </div>
                  <div class="table-container">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>字段名</th>
                          <th>数据类型</th>
                          <th>当前值</th>
                          <th>状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="[key, value] in Object.entries(formData)"
                          :key="key"
                          :class="{ 'filled-row': isValueFilled(value) }"
                        >
                          <td
                            ><span class="field-tag">{{ key }}</span></td
                          >
                          <td
                            ><span class="type-tag">{{
                              getValueType(value)
                            }}</span></td
                          >
                          <td class="value-cell">
                            <div class="value-display">{{
                              formatValueDisplay(value)
                            }}</div>
                          </td>
                          <td>
                            <span
                              :class="[
                                'status-badge',
                                isValueFilled(value) ? 'filled' : 'empty',
                              ]"
                            >
                              {{
                                isValueFilled(value) ? '✓ 已填写' : '○ 未填写'
                              }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- 键值对格式 -->
                <div
                  v-if="previewMode === 'pairs'"
                  class="tab-content"
                >
                  <div class="content-header">
                    <h4>📝 键值对格式</h4>
                    <span class="pair-count"
                      >{{ Object.keys(formData).length }} 对</span
                    >
                  </div>
                  <div class="pairs-container">
                    <div
                      v-for="[key, value] in Object.entries(formData)"
                      :key="key"
                      :class="['pair-item', { filled: isValueFilled(value) }]"
                    >
                      <div class="pair-key">{{ key }}</div>
                      <div class="pair-separator">:</div>
                      <div class="pair-value">
                        <span class="value-text">{{
                          formatValueDisplay(value)
                        }}</span>
                      </div>
                      <div class="pair-meta">
                        <span class="type">{{ getValueType(value) }}</span>
                        <span
                          :class="[
                            'status',
                            isValueFilled(value) ? 'filled' : 'empty',
                          ]"
                        >
                          {{ isValueFilled(value) ? '✓' : '○' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 代码格式 -->
                <div
                  v-if="previewMode === 'code'"
                  class="tab-content"
                >
                  <div class="content-header">
                    <h4>💻 JavaScript 对象</h4>
                    <span class="code-type">ES6+ 格式</span>
                  </div>
                  <pre class="code-display">{{ generatedCode }}</pre>
                </div>
              </div>
            </div>
          </NCard>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import type {
    LayoutType,
    LabelPlacement,
    FormModel,
  } from '@robot-admin/naive-ui-components'
  import { layoutOptions, layoutDescriptions, testDataConfig } from './data'

  // 导入布局组件
  import DefaultLayout from './layouts/DefaultLayout/index.vue'
  import InlineLayout from './layouts/InlineLayout/index.vue'
  import GridLayout from './layouts/GridLayout/index.vue'
  import CardLayout from './layouts/CardLayout/index.vue'
  import TabsLayout from './layouts/TabsLayout/index.vue'
  import StepsLayout from './layouts/StepsLayout/index.vue'
  import DynamicLayout from './layouts/DynamicLayout/index.vue'
  import CustomLayout from './layouts/CustomLayout/index.vue'

  const message = useMessage()

  // ========================================
  // 静态配置常量
  // ========================================
  const LAYOUT_COMPONENTS = {
    default: DefaultLayout,
    inline: InlineLayout,
    grid: GridLayout,
    card: CardLayout,
    tabs: TabsLayout,
    steps: StepsLayout,
    dynamic: DynamicLayout,
    custom: CustomLayout,
  } as const

  const LABEL_PLACEMENTS = [
    { value: 'left' as const, label: '左侧' },
    { value: 'top' as const, label: '顶部' },
  ]

  const FORM_ACTIONS = [
    { key: 'fill', type: 'fill', label: '填充测试' },
    { key: 'preview', type: 'preview', label: '预览数据' },
    { key: 'clear', type: 'clear', label: '清空数据' },
    { key: 'validate', type: 'validate', label: '验证表单' },
  ] as const

  const PREVIEW_MODES = [
    { value: 'json', label: 'JSON', icon: '🔍' },
    { value: 'table', label: '表格', icon: '📊' },
    { value: 'pairs', label: '键值对', icon: '📝' },
    { value: 'code', label: '代码', icon: '💻' },
  ] as const

  // ========================================
  // 响应式状态
  // ========================================
  const layoutRef = ref()
  const formData = ref<FormModel>({})
  const currentLayout = ref<LayoutType>('default')
  const labelPlacement = ref<LabelPlacement>('left')
  const validateOnChange = ref(false)
  const currentFields = ref<any[]>([])
  const errorCount = ref(0)
  const showModal = ref(false)
  const previewMode = ref('json')
  const copying = ref(false)

  // ========================================
  // 工具函数
  // ========================================
  const isValueFilled = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return false
    if (typeof value === 'string') return value.trim() !== ''
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'number') return value > 0
    if (typeof value === 'boolean') return value === true
    if (typeof value === 'object') return Object.keys(value).length > 0
    return false
  }

  const getValueType = (value: any): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }

  const formatValueDisplay = (value: any): string => {
    if (value === null || value === undefined) return '空值'
    if (typeof value === 'string') return value || '空字符串'
    if (Array.isArray(value)) return `[${value.length} 项]`
    if (typeof value === 'object') return `{${Object.keys(value).length} 属性}`
    return String(value)
  }

  // ========================================
  // 计算属性
  // ========================================
  const currentComponent = computed(
    () => LAYOUT_COMPONENTS[currentLayout.value]
  )

  const currentLayoutInfo = computed(
    () => layoutDescriptions[currentLayout.value] || { title: '', content: '' }
  )

  // 表单统计
  const formStats = computed(() => ({
    totalFields: currentFields.value.length,
  }))

  // 预览相关计算属性
  const jsonData = computed(() => JSON.stringify(formData.value, null, 2))

  const dataSize = computed(() => {
    const bytes = new Blob([jsonData.value]).size
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  })

  const generatedCode = computed(() => {
    return `// 表单数据对象 - ${currentLayoutInfo.value.title}
const formData = ${jsonData.value};

export default formData;`
  })

  // ========================================
  // 核心方法
  // ========================================
  const switchLayout = (layout: LayoutType) => {
    currentLayout.value = layout
    resetForm()

    const layoutName =
      layoutOptions.find(opt => opt.value === layout)?.label || '未知'
    message.info(`已切换到${layoutName}`)
  }

  const resetForm = () => {
    formData.value = {}
    errorCount.value = 0
    currentFields.value = []
  }

  // 统一的动作处理器
  const handleAction = (
    actionKey: 'fill' | 'preview' | 'clear' | 'validate'
  ) => {
    const actions = {
      fill: () => {
        const testData = testDataConfig.getTestData(currentLayout.value)
        Object.assign(formData.value, testData)
        message.success('已填充测试数据')
      },
      preview: () => {
        showModal.value = true
      },
      clear: () => {
        resetForm()
        layoutRef.value?.resetFields?.()
        message.info('已清空所有数据')
      },
      validate: async () => {
        try {
          if (!layoutRef.value?.validate) {
            message.warning('当前布局不支持验证功能')
            return
          }

          await layoutRef.value.validate()
          errorCount.value = 0
          message.success('表单验证通过')
        } catch (errors) {
          errorCount.value = Array.isArray(errors) ? errors.length : 1
          message.error('表单验证失败')
          console.error('验证错误:', errors)
        }
      },
    }

    actions[actionKey]?.()
  }

  // ========================================
  // 预览功能方法
  // ========================================
  const copyData = async () => {
    copying.value = true
    try {
      let textToCopy = jsonData.value

      if (previewMode.value === 'pairs') {
        textToCopy = Object.entries(formData.value)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join('\n')
      } else if (previewMode.value === 'code') {
        textToCopy = generatedCode.value
      }

      await navigator.clipboard.writeText(textToCopy)
      message.success('数据已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      message.error('复制失败，请手动选择文本复制')
    } finally {
      copying.value = false
    }
  }

  const downloadData = () => {
    const fileName = `form-data-${currentLayout.value}-${new Date().toISOString().slice(0, 10)}.json`
    const dataBlob = new Blob([jsonData.value], { type: 'application/json' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    message.success(`数据已下载为 ${fileName}`)
  }

  // ========================================
  // 事件处理
  // ========================================
  const handleSubmit = (payload: any) => {
    console.log('表单提交:', payload)
    message.success('表单提交成功')
  }

  const handleValidateError = (errors: any) => {
    errorCount.value = Array.isArray(errors) ? errors.length : 1
    console.error('表单验证失败:', errors)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
