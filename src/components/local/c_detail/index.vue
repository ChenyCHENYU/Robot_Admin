<template>
  <NModal
    v-model:show="modalVisible"
    :mask-closable="true"
    preset="card"
    :title="title"
    class="c-detail-modal"
    :style="{ width: modalWidth }"
  >
    <NSpin :show="loading">
      <div class="c-detail-content">
        <div
          v-for="(section, sectionIndex) in detailConfig.sections"
          :key="sectionIndex"
          class="detail-section"
          :class="{
            'not-last': sectionIndex < detailConfig.sections.length - 1,
          }"
        >
          <h4 class="section-title">{{ section.title }}</h4>

          <div
            class="detail-grid"
            :class="{
              'single-column': section.columns === 1,
              'double-column': section.columns === 2 || !section.columns,
            }"
          >
            <div
              v-for="(item, itemIndex) in section.items"
              :key="itemIndex"
              class="detail-item"
              :class="{
                'full-width': item.span === 2 || section.columns === 1,
              }"
            >
              <span class="item-label">{{ item.label }}:</span>
              <div class="item-value">
                <NTag
                  v-if="item.type === 'tag'"
                  :type="getTagType(item)"
                  size="tiny"
                  :bordered="false"
                  round
                >
                  {{ getDisplayValue(item) }}
                </NTag>

                <span
                  v-else-if="item.type === 'email'"
                  class="email-value"
                >
                  {{ getDisplayValue(item) }}
                </span>

                <span v-else>{{ getDisplayValue(item) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NSpin>

    <template #action>
      <C_ActionBar
        :actions="detailActions"
        :config="{ align: 'right' }"
      />
    </template>
  </NModal>
</template>

<script setup lang="ts">
  import { defineActions } from '@robot-admin/naive-ui-components/C_ActionBar'
  import type { C_DetailProps, DetailItem } from './data'

  defineOptions({ name: 'C_Detail' })

  // ================= Props 定义 =================
  const props = withDefaults(defineProps<C_DetailProps>(), {
    title: '详情信息',
    width: '600px',
    visible: false,
    loading: false,
    config: () => ({ sections: [] }),
  })

  // ================= Emits 定义 =================
  const emit = defineEmits<{
    'update:visible': [value: boolean]
    close: []
  }>()

  // ================= 响应式状态 =================
  const modalVisible = computed({
    get: () => props.crud?.detail.visible.value ?? props.visible,
    set: value => {
      if (props.crud) {
        if (!value) props.crud.detail.close()
        return
      }
      emit('update:visible', value)
    },
  })

  const detailData = computed(() => props.crud?.detail.data.value ?? props.data)
  const detailConfig = computed(() => props.crud?.detailConfig ?? props.config)
  const title = computed(() => props.crud?.detail.title.value || props.title)
  const loading = computed(() => props.crud?.loading.value ?? props.loading)

  const modalWidth = computed(() => {
    return typeof props.width === 'number' ? `${props.width}px` : props.width
  })

  // ================= 工具函数 =================
  /**
   * 获取显示值
   */
  const getDisplayValue = (item: DetailItem): unknown => {
    const value = (detailData.value as Record<string, unknown> | undefined)?.[
      item.key
    ]

    // 如果有自定义格式化函数，优先使用
    if (item.formatter) {
      return item.formatter(value)
    }

    // 根据类型进行默认格式化
    switch (item.type) {
      case 'date':
        return formatDate(value)
      case 'number':
        return formatNumber(value)
      default:
        return value ?? '暂无'
    }
  }

  /**
   * 格式化日期
   */
  const formatDate = (date: unknown): string => {
    if (
      typeof date !== 'string' &&
      typeof date !== 'number' &&
      !(date instanceof Date)
    ) {
      return '暂无'
    }
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '暂无'
    return dateObj.toLocaleDateString('zh-CN')
  }

  /**
   * 格式化数字
   */
  const formatNumber = (num: unknown): unknown => {
    if (typeof num !== 'number') return num
    return num.toLocaleString()
  }

  const detailTagTypes = [
    'default',
    'primary',
    'info',
    'success',
    'warning',
    'error',
  ] as const
  type DetailTagType = (typeof detailTagTypes)[number]

  const isDetailTagType = (value: string): value is DetailTagType =>
    detailTagTypes.some(type => type === value)

  /** 收窄后再传给 Naive UI，避免后端扩展值污染组件属性。 */
  const getTagType = (item: DetailItem): DetailTagType => {
    const value = (detailData.value as Record<string, unknown> | undefined)?.[
      item.key
    ]
    const type = item.tagTypes?.[String(value)] ?? item.tagType
    return type && isDetailTagType(type) ? type : 'default'
  }

  // ================= 事件处理 =================
  const handleClose = () => {
    modalVisible.value = false
    emit('close')
  }

  const detailActions = defineActions([
    {
      key: 'close',
      type: 'primary',
      onClick: handleClose,
    },
  ])
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
