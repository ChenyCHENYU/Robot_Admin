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
          v-for="(section, sectionIndex) in config.sections"
          :key="sectionIndex"
          class="detail-section"
          :class="{ 'not-last': sectionIndex < config.sections.length - 1 }"
        >
          <!-- 区域标题 -->
          <h4 class="section-title">{{ section.title }}</h4>

          <!-- 区域内容 -->
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
                <!-- 标签类型 -->
                <NTag
                  v-if="item.type === 'tag'"
                  :type="item.tagType || 'default'"
                  size="small"
                >
                  {{ getDisplayValue(item) }}
                </NTag>

                <!-- 邮箱类型 -->
                <span
                  v-else-if="item.type === 'email'"
                  class="email-value"
                >
                  {{ getDisplayValue(item) }}
                </span>

                <!-- 普通文本类型 -->
                <span v-else>{{ getDisplayValue(item) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NSpin>

    <template #action>
      <NButton
        @click="handleClose"
        type="primary"
      >
        关闭
      </NButton>
    </template>
  </NModal>
</template>

<script setup lang="ts">
  import type { C_DetailProps, DetailItem } from './data'

  // ================= Props 定义 =================
  const props = withDefaults(defineProps<C_DetailProps>(), {
    title: '详情信息',
    width: '600px',
    visible: false,
    loading: false,
  })

  // ================= Emits 定义 =================
  const emit = defineEmits<{
    'update:visible': [value: boolean]
    close: []
  }>()

  // ================= 响应式状态 =================
  const modalVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value),
  })

  const modalWidth = computed(() => {
    return typeof props.width === 'number' ? `${props.width}px` : props.width
  })

  // ================= 工具函数 =================
  /**
   * 获取显示值
   */
  const getDisplayValue = (item: DetailItem) => {
    const value = props.data[item.key]

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
        return value || '暂无'
    }
  }

  /**
   * 格式化日期
   */
  const formatDate = (date: string | number | Date) => {
    if (!date) return '暂无'
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '暂无'
    return dateObj.toLocaleDateString('zh-CN')
  }

  /**
   * 格式化数字
   */
  const formatNumber = (num: number) => {
    if (typeof num !== 'number') return num
    return num.toLocaleString()
  }

  // ================= 事件处理 =================
  const handleClose = () => {
    emit('close')
    modalVisible.value = false
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
