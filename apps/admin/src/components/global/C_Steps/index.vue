<template>
  <div
    class="c-steps"
    :class="[`steps-${direction}`]"
  >
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="step-item"
      :class="[
        `step-${getStatus(index)}`,
        { 'step-clickable': clickable && !step.disabled },
      ]"
      @click="handleClick(index)"
    >
      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <!-- 图标 -->
        <div class="step-icon">
          <i
            v-if="step.icon"
            :class="step.icon"
          ></i>
          <i
            v-else-if="getStatus(index) === 'finish'"
            class="i-mdi:check"
          ></i>
          <span
            v-else
            class="step-index"
            >{{ index + 1 }}</span
          >
        </div>

        <!-- 连接线 -->
        <div
          v-if="index < steps.length - 1"
          class="step-line"
        />
      </div>

      <!-- 步骤内容 -->
      <div class="step-content">
        <div class="step-title">{{ step.title }}</div>
        <div
          v-if="step.time"
          class="step-time"
          >{{ step.time }}</div
        >
        <div
          v-if="step.description"
          class="step-description"
          >{{ step.description }}</div
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  export interface StepItem {
    title: string
    description?: string
    time?: string
    icon?: string
    status?: 'wait' | 'process' | 'finish' | 'error'
    disabled?: boolean
    detail?: string
  }

  const props = withDefaults(
    defineProps<{
      steps: StepItem[]
      current?: number
      direction?: 'horizontal' | 'vertical'
      clickable?: boolean
    }>(),
    {
      current: 0,
      direction: 'horizontal',
      clickable: false,
    }
  )

  const emit = defineEmits<{
    'update:current': [number]
    change: [number]
  }>()

  // 获取步骤状态
  const getStatus = (index: number) => {
    if (props.steps[index].status) {
      return props.steps[index].status
    }
    if (index < props.current) return 'finish'
    if (index === props.current) return 'process'
    return 'wait'
  }

  // 处理点击
  const handleClick = (index: number) => {
    if (!props.clickable || props.steps[index].disabled) return
    emit('update:current', index)
    emit('change', index)
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
