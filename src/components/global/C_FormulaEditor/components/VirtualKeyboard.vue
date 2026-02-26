<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_FormulaEditor\components\VirtualKeyboard.vue
 * @Description: 虚拟键盘（运算符 + 数字 + 动作键）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="vk">
    <!-- ═══════ 标题行 ═══════ -->
    <div class="vk__title">计算公式</div>

    <!-- ═══════ 键盘主体：运算符 | 数字 ═══════ -->
    <div class="vk__body">
      <!-- 运算符区 5 列 -->
      <div class="vk__half vk__half--ops">
        <button
          v-for="key in operatorKeys"
          :key="key.value"
          class="vk__key"
          :class="[key.color ? `vk__key--${key.color}` : '']"
          :disabled="disabled"
          @click="$emit('key-press', key)"
        >
          {{ key.label }}
        </button>
      </div>

      <!-- 数字区 5 列 -->
      <div class="vk__half vk__half--nums">
        <button
          v-for="key in numberKeys"
          :key="key.label + key.value"
          class="vk__key"
          :class="[key.color ? `vk__key--${key.color}` : '']"
          :disabled="disabled"
          @click="$emit('key-press', key)"
        >
          {{ key.label }}
        </button>
      </div>
    </div>

    <!-- ═══════ 动作行：⌫ + 清空 ═══════ -->
    <div class="vk__actions">
      <button
        v-for="key in actionKeys"
        :key="key.value"
        class="vk__key vk__key--action"
        :disabled="disabled"
        @click="$emit('action', key.value)"
      >
        {{ key.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { FormulaKeyboardKey } from '@/types/modules/formula-editor'
  import { OPERATOR_KEYS, NUMBER_KEYS, ACTION_KEYS } from '../constants'

  interface Props {
    disabled?: boolean
  }

  interface Emits {
    (e: 'key-press', key: FormulaKeyboardKey): void
    (e: 'action', action: string): void
  }

  withDefaults(defineProps<Props>(), {
    disabled: false,
  })

  defineEmits<Emits>()

  const operatorKeys = OPERATOR_KEYS
  const numberKeys = NUMBER_KEYS
  const actionKeys = ACTION_KEYS
</script>

<style lang="scss" scoped>
  .vk {
    // ═══════ 标题行 ═══════

    &__title {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-color-3);
      padding: 0 0 8px;
      letter-spacing: 0.5px;
    }

    // ═══════ 键盘主体 ═══════
    // 浅米黄暖色底板，对应参考截图

    &__body {
      display: flex;
      gap: 68px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(240, 160, 32, 0.2);
      background: rgba(240, 160, 32, 0.06);
    }

    &__half {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 5px;
      flex: 1;

      // 数字区：白色底板层区分
      &--nums {
        padding: 6px;
        border-radius: 6px;
        background: var(--card-color);
        border: 1px solid rgba(0, 0, 0, 0.07);
      }
    }

    // ═══════ 动作行 ═══════

    &__actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px 12px 0;
    }

    // ═══════ 经典键帽按键 ═══════
    // 3D 效果核心：border-bottom 加粗 = 键帽厚度，按下时 translateY + 底边归细

    &__key {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 34px;
      min-width: 0;
      padding: 0;
      border-radius: 5px;
      cursor: pointer;
      user-select: none;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color-1);
      background: var(--card-color);
      // 立体效果关键：底边用确定 rgba 保证可见
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-bottom: 3px solid rgba(0, 0, 0, 0.18);
      transition:
        transform 0.06s ease,
        border-bottom-width 0.06s ease,
        background 0.1s ease;

      &:hover:not(:disabled) {
        background: color-mix(
          in srgb,
          var(--primary-color) 6%,
          var(--card-color)
        );
        border-color: color-mix(in srgb, var(--primary-color) 50%, transparent);
        border-bottom-color: color-mix(
          in srgb,
          var(--primary-color) 60%,
          transparent
        );
        color: var(--primary-color);
      }

      // 按下：键帽下沉 + 底边归细
      &:active:not(:disabled) {
        transform: translateY(2px);
        border-bottom-width: 1px;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      // ─── warning（? : and or）—橙色背景块 ───

      &--warning {
        background: rgba(240, 160, 32, 0.12);
        border-color: rgba(240, 160, 32, 0.35);
        border-bottom-color: rgba(240, 160, 32, 0.55);
        color: #d48806;
        font-weight: 700;
        font-size: 15px;

        &:hover:not(:disabled) {
          background: rgba(240, 160, 32, 0.2);
          border-color: rgba(240, 160, 32, 0.55);
          border-bottom-color: rgba(240, 160, 32, 0.75);
          color: #b8760a;
        }
      }

      // ─── primary（+ − × ÷）—蓝色文字 + 蓝色底边 ───

      &--primary {
        color: var(--primary-color);
        font-weight: 700;
        font-size: 16px;
        border-color: rgba(32, 128, 240, 0.25);
        border-bottom-color: rgba(32, 128, 240, 0.55);

        &:hover:not(:disabled) {
          background: rgba(32, 128, 240, 0.06);
          color: var(--primary-color);
          border-color: rgba(32, 128, 240, 0.45);
          border-bottom-color: rgba(32, 128, 240, 0.75);
        }
      }

      // ─── 动作键（⌫ 清空）───

      &--action {
        width: 64px;
        height: 34px;
        font-size: 13px;
        color: var(--text-color-2);
        background: color-mix(
          in srgb,
          var(--text-color-3) 8%,
          var(--card-color)
        );
        border-color: rgba(0, 0, 0, 0.1);
        border-bottom-color: rgba(0, 0, 0, 0.15);

        &:hover:not(:disabled) {
          color: var(--error-color);
          border-color: color-mix(in srgb, var(--error-color) 40%, transparent);
          border-bottom-color: color-mix(
            in srgb,
            var(--error-color) 55%,
            transparent
          );
        }
      }
    }
  }
</style>
