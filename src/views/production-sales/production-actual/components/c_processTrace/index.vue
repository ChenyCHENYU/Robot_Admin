<!--
  @Author: ChenYu ycyplus@gmail.com
  @Date: 2026-11-05
  @FilePath: \Robot_Admin\src\views\production-sales\production-actual\components\c_processTrace\index.vue
  @Description: 炉次工序时间轴与异常追踪
  Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="trace-body">
    <div class="trace-toolbar">
      <p>{{ trace.steps.length }} 道工序 · {{ exceptions.length }} 项异常</p>
      <NButton
        size="small"
        :type="exceptionOnly ? 'warning' : 'default'"
        :aria-pressed="exceptionOnly"
        @click="exceptionOnly = !exceptionOnly"
        >仅看异常</NButton
      >
    </div>
    <template v-if="currentStep">
      <div
        class="trace-chart"
        role="group"
        aria-label="工序时间轴"
      >
        <div
          class="trace-axis"
          aria-hidden="true"
        >
          <span>工序</span>
          <div class="trace-ticks">
            <span
              v-for="tick in trace.ticks"
              :key="tick"
              >{{ tick }}</span
            >
          </div>
        </div>
        <button
          v-for="step in visibleSteps"
          :key="step.key"
          type="button"
          class="trace-step"
          :class="{ 'is-exception': step.exception }"
          :aria-label="`${step.title}，${step.startTime} 至 ${step.endTime}${step.exception ? '，异常' : ''}`"
          :aria-pressed="currentStep.key === step.key"
          @click="selectedKey = step.key"
        >
          <span
            class="trace-step-label"
            aria-hidden="true"
          >
            {{ step.title
            }}<span
              v-if="step.exception"
              class="trace-marker"
              >异常</span
            >
          </span>
          <span
            class="trace-track"
            aria-hidden="true"
          >
            <span
              class="trace-bar"
              :style="{ insetInlineStart: step.left, width: step.width }"
            />
          </span>
        </button>
      </div>
      <div class="trace-details">
        <div
          class="trace-detail-copy"
          aria-live="polite"
        >
          <div class="trace-detail-title">
            <h3>{{ currentStep.title }}</h3>
            <NTag
              size="small"
              :bordered="false"
              :type="currentStep.exception ? 'warning' : 'success'"
              >{{ currentStep.exception ? '有异常' : '已完成' }}</NTag
            >
          </div>
          <dl>
            <div
              ><dt>时间</dt
              ><dd
                >{{ currentStep.startTime }}–{{ currentStep.endTime }}</dd
              ></div
            >
            <div
              ><dt>用时</dt><dd>{{ currentStep.duration }} 分钟</dd></div
            >
            <div
              ><dt>设备</dt><dd>{{ currentStep.equipment }}</dd></div
            >
            <div
              ><dt>班组</dt><dd>{{ currentStep.team }}</dd></div
            >
          </dl>
          <p>{{ currentStep.exception ?? currentStep.note }}</p>
        </div>
        <NButton
          size="small"
          @click="emit('navigate', currentStep.section)"
        >
          查看对应实绩
        </NButton>
      </div>
    </template>
    <NEmpty
      v-else
      class="trace-empty"
      size="small"
      description="当前炉次暂无过程异常"
    />
  </div>
</template>

<script setup lang="ts">
  import { createActualProcessTrace, type ActualHeat } from '../../data'

  defineOptions({ name: 'ProductionActualProcessTrace' })

  const props = defineProps<{ heat: ActualHeat }>()
  const emit = defineEmits<{ navigate: [section: string] }>()

  const exceptionOnly = ref(false)
  const selectedKey = ref<string>()
  const trace = computed(() => createActualProcessTrace(props.heat))
  const exceptions = computed(() =>
    trace.value.steps.filter(step => step.exception)
  )
  const visibleSteps = computed(() =>
    exceptionOnly.value ? exceptions.value : trace.value.steps
  )
  const currentStep = computed(
    () =>
      visibleSteps.value.find(step => step.key === selectedKey.value) ??
      visibleSteps.value[0]
  )

  watch(
    () => props.heat.id,
    () => {
      selectedKey.value = undefined
      exceptionOnly.value = false
    }
  )
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
