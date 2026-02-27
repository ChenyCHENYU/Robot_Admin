<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Upload\components\UploadArea.vue
 * @Description: 上传区域组件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    ref="areaRef"
    class="upload-area"
    :class="{
      'upload-area--drag-over': isDragOver,
      'upload-area--disabled': disabled,
    }"
    @click="handleClick"
  >
    <input
      ref="inputRef"
      type="file"
      class="upload-area__input"
      :accept="accept"
      :multiple="multiple"
      :webkitdirectory="directory || undefined"
      @change="handleInputChange"
    />

    <slot>
      <div class="upload-area__default">
        <C_Icon
          :name="
            isDragOver
              ? 'mdi:cloud-download-outline'
              : 'mdi:cloud-upload-outline'
          "
          class="upload-area__icon"
        />
        <div class="upload-area__text">
          <span v-if="isDragOver">释放文件到此处</span>
          <span v-else>
            点击或拖拽文件到此区域上传
            <template v-if="pasteable">
              ，支持 <kbd>Ctrl+V</kbd> 粘贴
            </template>
          </span>
        </div>
        <div
          v-if="tip"
          class="upload-area__tip"
        >
          {{ tip }}
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
  import { useDragDrop } from '@/composables/Upload/useDragDrop'

  const props = withDefaults(
    defineProps<{
      /** 接受的文件类型 */
      accept?: string
      /** 是否多选 */
      multiple?: boolean
      /** 是否目录 */
      directory?: boolean
      /** 是否禁用 */
      disabled?: boolean
      /** 是否启用拖拽 */
      draggable?: boolean
      /** 是否启用粘贴 */
      pasteable?: boolean
      /** 提示文本 */
      tip?: string
    }>(),
    {
      accept: '',
      multiple: false,
      directory: false,
      disabled: false,
      draggable: true,
      pasteable: false,
      tip: '',
    }
  )

  const emit = defineEmits<{
    files: [files: File[]]
  }>()

  const areaRef = ref<HTMLElement>()
  const inputRef = ref<HTMLInputElement>()

  // 拖拽 & 粘贴
  const { isDragOver } = useDragDrop(
    areaRef,
    computed(() => props.draggable && !props.disabled),
    computed(() => props.pasteable && !props.disabled),
    computed(() => props.accept),
    files => emit('files', files)
  )

  /** 点击触发文件选择 */
  function handleClick() {
    if (props.disabled) return
    inputRef.value?.click()
  }

  /** input change */
  function handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files ?? [])
    if (files.length > 0) {
      emit('files', files)
    }
    // 清空 input 以允许重复选择同一文件
    input.value = ''
  }

  /** 暴露触发方法 */
  defineExpose({
    triggerSelect: handleClick,
  })
</script>

<style scoped lang="scss">
  .upload-area {
    position: relative;
    box-sizing: border-box;
    padding: 32px 24px;
    border: 2px dashed var(--border-color);
    border-radius: 10px;
    cursor: pointer;
    background: var(--card-color);
    transition: all 0.25s ease;
    text-align: center;

    &:hover:not(.upload-area--disabled) {
      border-color: var(--primary-color);
      background: color-mix(
        in srgb,
        var(--primary-color) 4%,
        var(--card-color)
      );
    }

    &--drag-over {
      border-color: var(--primary-color);
      border-style: solid;
      background: color-mix(
        in srgb,
        var(--primary-color) 8%,
        var(--card-color)
      );

      .upload-area__icon {
        color: var(--primary-color);
        transform: scale(1.1);
      }
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &__input {
      display: none;
    }

    &__default {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    &__icon {
      font-size: 48px;
      color: var(--text-color-3);
      transition: all 0.25s ease;
    }

    &__text {
      font-size: 14px;
      color: var(--text-color-2);
      line-height: 1.6;

      kbd {
        padding: 1px 5px;
        font-size: 12px;
        border: 1px solid var(--border-color);
        border-radius: 3px;
        background: var(--body-color);
      }
    }

    &__tip {
      font-size: 12px;
      color: var(--text-color-4);
    }
  }
</style>
