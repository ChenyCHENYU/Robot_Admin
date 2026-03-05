<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\components\global\C_ContextMenu\index.vue
 * @Description: 右键菜单组件 — 声明式配置、快捷键标注、嵌套子菜单
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <!-- 遮罩层 -->
  <Teleport to="body">
    <div
      v-if="visible"
      class="c-context-menu-overlay"
      :style="{ zIndex: props.zIndex - 1 }"
      @click="close"
      @contextmenu.prevent="close"
    />

    <!-- 菜单面板 -->
    <div
      v-if="visible"
      ref="menuRef"
      class="c-context-menu"
      :style="menuStyle"
      role="menu"
      tabindex="-1"
      @keydown.escape="close"
    >
      <template
        v-for="item in visibleItems"
        :key="item.key"
      >
        <!-- 分割线 -->
        <div
          v-if="item.divider"
          class="c-context-menu__divider"
          role="separator"
        />

        <!-- 普通菜单项 -->
        <div
          v-else
          :class="[
            'c-context-menu__item',
            {
              'is-disabled': item.disabled,
              'is-danger': item.danger,
            },
          ]"
          role="menuitem"
          :aria-disabled="item.disabled"
          @click="handleItemClick(item)"
          @mouseenter="handleMouseEnter(item)"
          @mouseleave="handleMouseLeave"
        >
          <!-- 图标 -->
          <span
            v-if="item.icon"
            class="c-context-menu__icon"
          >
            <C_Icon :name="item.icon" />
          </span>

          <!-- 文本 -->
          <span class="c-context-menu__label">{{ item.label }}</span>

          <!-- 快捷键 -->
          <span
            v-if="item.shortcut"
            class="c-context-menu__shortcut"
          >
            {{ item.shortcut }}
          </span>

          <!-- 子菜单箭头 -->
          <span
            v-if="item.children?.length"
            class="c-context-menu__arrow"
          >
            <C_Icon name="mdi:chevron-right" />
          </span>

          <!-- 子菜单（递归） -->
          <C_ContextMenu
            v-if="item.children?.length && activeSubKey === item.key"
            :items="item.children"
            :min-width="props.minWidth"
            :max-width="props.maxWidth"
            :sub-menu-placement="props.subMenuPlacement"
            :auto-close="props.autoClose"
            :z-index="props.zIndex + 1"
            class="c-context-menu__submenu"
            :class="`is-${props.subMenuPlacement}`"
            :style="{ position: 'absolute' }"
            @select="handleSubSelect"
          />
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import {
    DEFAULT_CONTEXT_MENU_PROPS,
    type ContextMenuItem,
    type ContextMenuProps,
  } from './types'

  defineOptions({ name: 'C_ContextMenu' })

  const props = withDefaults(defineProps<ContextMenuProps>(), {
    items: () => [],
    minWidth: DEFAULT_CONTEXT_MENU_PROPS.minWidth,
    maxWidth: DEFAULT_CONTEXT_MENU_PROPS.maxWidth,
    subMenuPlacement: DEFAULT_CONTEXT_MENU_PROPS.subMenuPlacement,
    autoClose: DEFAULT_CONTEXT_MENU_PROPS.autoClose,
    disabled: DEFAULT_CONTEXT_MENU_PROPS.disabled,
    zIndex: DEFAULT_CONTEXT_MENU_PROPS.zIndex,
  })

  const emit = defineEmits<{
    (e: 'select', item: ContextMenuItem): void
    (e: 'open', position: { x: number; y: number }): void
    (e: 'close'): void
  }>()

  // ===== 状态 =====
  const visible = ref(false)
  const position = ref({ x: 0, y: 0 })
  const menuRef = ref<HTMLElement>()
  const activeSubKey = ref<string | null>(null)

  let subTimer: ReturnType<typeof setTimeout> | null = null

  // ===== 可见项 =====
  const visibleItems = computed(() => props.items.filter(item => !item.hidden))

  // ===== 菜单定位样式 =====
  const menuStyle = computed(() => ({
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    minWidth: `${props.minWidth}px`,
    maxWidth: `${props.maxWidth}px`,
    zIndex: props.zIndex,
  }))

  // ===== 边界校正 =====
  const adjustPosition = () => {
    nextTick(() => {
      const el = menuRef.value
      if (!el) return
      const rect = el.getBoundingClientRect()
      const { innerWidth, innerHeight } = window

      if (rect.right > innerWidth) {
        position.value.x = innerWidth - rect.width - 8
      }
      if (rect.bottom > innerHeight) {
        position.value.y = innerHeight - rect.height - 8
      }
      if (position.value.x < 0) position.value.x = 8
      if (position.value.y < 0) position.value.y = 8
    })
  }

  // ===== 打开/关闭 =====
  const open = (x: number, y: number) => {
    if (props.disabled) return
    position.value = { x, y }
    visible.value = true
    emit('open', { x, y })
    adjustPosition()

    // 聚焦以支持 Escape 关闭
    nextTick(() => menuRef.value?.focus())
  }

  const close = () => {
    visible.value = false
    activeSubKey.value = null
    emit('close')
  }

  // ===== 菜单项点击 =====
  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return
    if (item.children?.length) return // 有子菜单不触发

    emit('select', item)
    if (props.autoClose) close()
  }

  // ===== 子菜单悬停 =====
  const handleMouseEnter = (item: ContextMenuItem) => {
    if (subTimer) {
      clearTimeout(subTimer)
      subTimer = null
    }
    if (item.children?.length && !item.disabled) {
      subTimer = setTimeout(() => {
        activeSubKey.value = item.key
      }, 150)
    } else {
      activeSubKey.value = null
    }
  }

  const handleMouseLeave = () => {
    if (subTimer) {
      clearTimeout(subTimer)
      subTimer = null
    }
    subTimer = setTimeout(() => {
      activeSubKey.value = null
    }, 300)
  }

  // ===== 子菜单选择向上冒泡 =====
  const handleSubSelect = (item: ContextMenuItem) => {
    emit('select', item)
    if (props.autoClose) close()
  }

  // ===== 暴露 API =====
  defineExpose({
    /** 在指定坐标打开菜单 */
    open,
    /** 关闭菜单 */
    close,
    /** 当前是否可见 */
    visible: computed(() => visible.value),
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
