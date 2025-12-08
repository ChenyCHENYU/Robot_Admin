<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-04 19:20:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 14:55:34
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Custom\index.vue
 * @Description: 表单组件 - 自定义布局组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="custom-layout">
    <!-- 顶部工具栏 -->
    <NCard
      :bordered="false"
      class="toolbar-card"
    >
      <div class="toolbar-content">
        <!-- 模式切换 -->
        <div class="mode-section">
          <span class="section-label">自定义模式:</span>
          <NButtonGroup>
            <NButton
              :type="isDesignMode ? 'primary' : 'default'"
              @click="isDesignMode = true"
              size="small"
            >
              🎨 设计模式
            </NButton>
            <NButton
              :type="!isDesignMode ? 'primary' : 'default'"
              @click="isDesignMode = false"
              size="small"
            >
              📝 填写模式
            </NButton>
          </NButtonGroup>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <div class="stat-item">
            <div class="stat-value">{{ customAreas.length }}</div>
            <div class="stat-label">自定义区域</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ totalFieldsCount }}</div>
            <div class="stat-label">字段总数</div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions-section">
          <template v-if="isDesignMode">
            <NButton
              secondary
              @click="handleSaveLayout"
              size="small"
            >
              💾 保存布局
            </NButton>
            <NButton
              secondary
              @click="handleResetLayout"
              size="small"
            >
              🔄 重置布局
            </NButton>
          </template>
          <template v-else>
            <NButton
              secondary
              @click="handleExportData"
              size="small"
            >
              📊 导出数据
            </NButton>
          </template>
        </div>
      </div>
    </NCard>

    <!-- 设计模式工具面板 -->
    <NCard
      v-if="isDesignMode"
      class="design-panel"
      title="🎨 设计工具"
    >
      <div class="design-tools">
        <div class="tool-group">
          <span class="group-label">添加区域:</span>
          <NButton
            @click="addArea('horizontal')"
            size="small"
          >
            ➡️ 水平区域
          </NButton>
          <NButton
            @click="addArea('vertical')"
            size="small"
          >
            ⬇️ 垂直区域
          </NButton>
          <NButton
            @click="addArea('grid')"
            size="small"
          >
            ⚏ 网格区域
          </NButton>
        </div>
      </div>
    </NCard>

    <!-- 主画布区域 -->
    <div
      class="layout-canvas"
      :class="{ 'design-mode': isDesignMode }"
    >
      <!-- 设计模式 -->
      <template v-if="isDesignMode">
        <div
          class="canvas-hint"
          v-if="customAreas.length === 0"
        >
          <div class="hint-content">
            <h3>🎨 开始自定义你的布局</h3>
            <p>点击上方按钮添加区域</p>
          </div>
        </div>

        <!-- 区域列表 -->
        <C_Draggable
          v-else
          v-model="areasForDragging"
          group="areas"
          class="areas-container"
          :animation="200"
          ghost-class="area-ghost"
          :item-key="item => String(item.id)"
          :show-empty-state="false"
        >
          <template #default="{ item: area }">
            <div
              class="custom-area"
              :class="`area-${area.type}`"
            >
              <div class="area-header">
                <div class="area-info">
                  <NInput
                    v-if="editingTitleId === area.id"
                    v-model:value="area.title"
                    size="small"
                    @blur="editingTitleId = ''"
                    @keyup.enter="editingTitleId = ''"
                    class="title-input"
                  />
                  <span
                    v-else
                    class="area-title"
                    @click="editingTitleId = area.id"
                  >
                    {{ area.title }}
                  </span>
                  <NTag size="small">{{ area.fields.length }} 字段</NTag>
                </div>
                <div class="area-controls">
                  <NButton
                    text
                    @click="deleteArea(area.id)"
                    size="tiny"
                    type="error"
                    title="删除区域"
                  >
                    🗑️
                  </NButton>
                </div>
              </div>

              <!-- 字段容器 -->
              <C_Draggable
                v-model="area.fields"
                group="fields"
                class="area-fields"
                :animation="200"
                ghost-class="field-ghost"
                :item-key="item => String(item.id)"
                :show-empty-state="false"
              >
                <template #default="{ item: field }">
                  <div class="field-item">
                    <div class="field-preview">
                      <span class="field-label">{{
                        field.label || field.prop
                      }}</span>
                      <span class="field-type">{{
                        getFieldTypeName(field.type)
                      }}</span>
                    </div>
                  </div>
                </template>
              </C_Draggable>

              <div
                class="area-drop-zone"
                v-if="area.fields.length === 0"
              >
                拖拽字段到这里
              </div>
            </div>
          </template>
        </C_Draggable>

        <!-- 字段池 -->
        <NCard
          class="field-pool"
          title="📦 可用字段"
        >
          <C_Draggable
            v-model="fieldsForDragging"
            layout="grid"
            :grid-columns="4"
            gap="12px"
            group="fields"
            :animation="200"
            :item-key="item => String(item.id)"
            :show-empty-state="false"
          >
            <template #default="{ item: field }">
              <div class="pool-field">
                <span class="field-name">{{ field.label || field.prop }}</span>
                <span class="field-type-tag">{{
                  getFieldTypeName(field.type)
                }}</span>
              </div>
            </template>
          </C_Draggable>
        </NCard>
      </template>

      <!-- 填写模式 -->
      <template v-else>
        <div
          v-if="customAreas.length === 0"
          class="empty-layout"
        >
          <NEmpty description="尚未设计布局">
            <template #extra>
              <NButton
                @click="isDesignMode = true"
                type="primary"
              >
                🎨 开始设计
              </NButton>
            </template>
          </NEmpty>
        </div>

        <div
          v-else
          class="form-container"
        >
          <div class="form-areas">
            <div
              v-for="area in customAreas"
              :key="area.id"
              class="form-area"
              :class="`area-${area.type}`"
            >
              <NCard
                v-if="area.fields.length > 0"
                :title="area.title"
              >
                <div
                  class="area-form-items"
                  :class="`layout-${area.type}`"
                >
                  <component
                    v-for="field in area.fields"
                    :key="field.prop"
                    :is="getFormItemForField(field)"
                  />
                </div>
              </NCard>
              <NEmpty
                v-else
                description="此区域暂无字段"
                size="small"
              >
                <template #extra>
                  <NButton
                    @click="isDesignMode = true"
                    size="small"
                    secondary
                  >
                    🎨 添加字段
                  </NButton>
                </template>
              </NEmpty>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'
  import type { FormOption } from '@/types/modules/form'

  // 接口定义
  interface CustomArea {
    id: string
    title: string
    type: 'horizontal' | 'vertical' | 'grid'
    fields: DraggableFormOption[]
  }

  interface DraggableFormOption extends FormOption {
    id: string
  }

  interface Props {
    options?: FormOption[]
    formItems?: VNode[]
    formData?: Record<string, any>
  }

  const props = withDefaults(defineProps<Props>(), {
    options: () => [],
    formItems: () => [],
    formData: () => ({}),
  })

  const emit = defineEmits<{
    'fields-change': [fields: FormOption[]]
    'export-data': [data: any]
  }>()

  // 响应式状态
  const isDesignMode = ref(true)
  const customAreas = ref<CustomArea[]>([])
  const availableFields = ref<DraggableFormOption[]>([])
  const editingTitleId = ref<string | number>('')

  // 计算属性
  const allFormOptions = computed(() => {
    if (props.options?.length > 0) {
      return props.options
    }

    return (
      props.formItems
        ?.map((item: VNode) => {
          const itemProps = item.props as any
          return {
            prop: itemProps?.path || '',
            label: itemProps?.label || itemProps?.path || '',
            type: 'input',
            show: true,
          } as FormOption
        })
        .filter(option => option.prop) || []
    )
  })

  const totalFieldsCount = computed(() =>
    customAreas.value.reduce((total, area) => total + area.fields.length, 0)
  )

  // 用于拖拽的数据
  const areasForDragging = computed({
    get: () => customAreas.value,
    set: value => {
      customAreas.value = value
    },
  })

  const fieldsForDragging = computed({
    get: () => availableFields.value,
    set: value => {
      console.log('🚀 ~ value:', value)
      // 字段池通过 watchEffect 自动管理
    },
  })

  // 工具函数
  const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

  const getFieldTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      input: '输入框',
      select: '下拉框',
      radio: '单选框',
      checkbox: '复选框',
      textarea: '文本域',
      date: '日期',
      number: '数字',
    }
    return typeMap[type] || type
  }

  const getFormItemForField = (field: FormOption) => {
    return (
      props.formItems?.find((item: VNode) => {
        const itemProps = item.props as any
        return itemProps?.path === field.prop
      }) || null
    )
  }

  // 布局操作
  const addArea = (type: 'horizontal' | 'vertical' | 'grid') => {
    const area: CustomArea = {
      id: generateId(),
      title: `${type === 'horizontal' ? '水平' : type === 'vertical' ? '垂直' : '网格'}区域`,
      type,
      fields: [],
    }
    customAreas.value.push(area)
  }

  const deleteArea = (areaId: string | number) => {
    const index = customAreas.value.findIndex(area => area.id === areaId)
    if (index !== -1) {
      customAreas.value.splice(index, 1)
    }
  }

  const handleSaveLayout = () => {
    const config = JSON.stringify(customAreas.value, null, 2)
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `layout-config-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleResetLayout = () => {
    customAreas.value = []
  }

  const handleExportData = () => {
    const exportData = {
      layout: customAreas.value,
      formData: props.formData,
      timestamp: new Date().toISOString(),
    }
    emit('export-data', exportData)
  }

  // 监听器
  watchEffect(() => {
    const usedProps = new Set(
      customAreas.value.flatMap(area => area.fields.map(field => field.prop))
    )

    availableFields.value = allFormOptions.value
      .filter(field => !usedProps.has(field.prop))
      .map(field => ({
        ...field,
        id: field.prop,
      }))
  })

  watch(
    () => customAreas.value,
    () => {
      const allFields = customAreas.value.flatMap(area =>
        area.fields.map(field => ({
          ...field,
          id: undefined,
        }))
      )
      emit('fields-change', allFields)
    },
    { deep: true }
  )
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
