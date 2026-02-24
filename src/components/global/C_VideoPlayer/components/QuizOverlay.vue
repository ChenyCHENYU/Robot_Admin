<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\components\QuizOverlay.vue
 * @Description: 测验弹窗
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <Transition name="vp-quiz-fade">
    <div
      v-if="quiz"
      class="vp-quiz-overlay"
    >
      <div class="vp-quiz-card">
        <!-- 标题 -->
        <div class="vp-quiz-header">
          <span class="vp-quiz-type-tag">
            {{ typeLabel }}
          </span>
          <h3 class="vp-quiz-title">{{ quiz.title }}</h3>
        </div>

        <!-- 选项 -->
        <div class="vp-quiz-options">
          <template v-if="quiz.type === 'multiple'">
            <NCheckboxGroup
              v-model:value="multiAnswer"
              :disabled="showResult"
            >
              <div
                v-for="opt in quiz.options"
                :key="opt.key"
                class="vp-quiz-option"
              >
                <NCheckbox
                  :value="opt.key"
                  :label="`${opt.key}. ${opt.label}`"
                />
              </div>
            </NCheckboxGroup>
          </template>

          <template v-else>
            <NRadioGroup
              v-model:value="singleAnswer"
              :disabled="showResult"
            >
              <div
                v-for="opt in quiz.options"
                :key="opt.key"
                class="vp-quiz-option"
              >
                <NRadio
                  :value="opt.key"
                  :label="`${opt.key}. ${opt.label}`"
                />
              </div>
            </NRadioGroup>
          </template>
        </div>

        <!-- 结果反馈 -->
        <div
          v-if="showResult"
          class="vp-quiz-result"
          :class="isCorrect ? 'is-correct' : 'is-wrong'"
        >
          {{ isCorrect ? '✓ 回答正确！' : '✗ 回答错误，请重试' }}
        </div>

        <!-- 操作按钮 -->
        <div class="vp-quiz-actions">
          <NButton
            v-if="!showResult"
            type="primary"
            :disabled="!hasAnswer"
            @click="$emit('submit')"
          >
            提交答案
          </NButton>

          <template v-else>
            <NButton
              v-if="!isCorrect && quiz.required"
              type="warning"
              @click="$emit('retry')"
            >
              重新作答
            </NButton>
            <NButton
              v-if="isCorrect || !quiz.required"
              type="primary"
              @click="$emit('close')"
            >
              继续学习
            </NButton>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import type { VideoQuiz } from '../types'

  interface Props {
    quiz: VideoQuiz | null
    showResult?: boolean
    isCorrect?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showResult: false,
    isCorrect: false,
  })

  defineEmits<{
    submit: []
    retry: []
    close: []
  }>()

  /** 单选答案 */
  const singleAnswer = ref<string>('')

  /** 多选答案 */
  const multiAnswer = ref<string[]>([])

  /** 当前选中的答案（对外） */
  const currentAnswer = defineModel<string | string[]>('answer', {
    default: '',
  })

  /** 题目类型标签 */
  const typeLabel = computed(() => {
    const map: Record<string, string> = {
      single: '单选题',
      multiple: '多选题',
      judge: '判断题',
    }
    return map[props.quiz?.type ?? 'single'] ?? '单选题'
  })

  /** 是否已选答案 */
  const hasAnswer = computed(() => {
    if (props.quiz?.type === 'multiple') {
      return multiAnswer.value.length > 0
    }
    return singleAnswer.value !== ''
  })

  // 同步答案到外部
  watch(singleAnswer, val => {
    if (props.quiz?.type !== 'multiple') {
      currentAnswer.value = val
    }
  })

  watch(multiAnswer, val => {
    if (props.quiz?.type === 'multiple') {
      currentAnswer.value = [...val]
    }
  })

  // 重置答案
  watch(
    () => props.quiz?.id,
    () => {
      singleAnswer.value = ''
      multiAnswer.value = []
    }
  )
</script>

<style scoped lang="scss">
  .vp-quiz-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    z-index: 100;
    backdrop-filter: blur(4px);
  }

  .vp-quiz-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    max-width: 480px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .vp-quiz-header {
    margin-bottom: 16px;
  }

  .vp-quiz-type-tag {
    display: inline-block;
    padding: 2px 8px;
    font-size: 12px;
    background: var(--primary-color, #18a058);
    color: #fff;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .vp-quiz-title {
    margin: 0;
    font-size: 16px;
    line-height: 1.5;
  }

  .vp-quiz-options {
    margin-bottom: 16px;
  }

  .vp-quiz-option {
    padding: 6px 0;
  }

  .vp-quiz-result {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 16px;

    &.is-correct {
      background: #e8f5e9;
      color: #2e7d32;
    }

    &.is-wrong {
      background: #fbe9e7;
      color: #c62828;
    }
  }

  .vp-quiz-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .vp-quiz-fade-enter-active,
  .vp-quiz-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .vp-quiz-fade-enter-from,
  .vp-quiz-fade-leave-to {
    opacity: 0;
  }
</style>
