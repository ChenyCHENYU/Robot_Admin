<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_CollapsePanel\index.vue
 * @Description: 折叠面板组件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    ref="containerRef"
    class="c-collapse-panel"
    :class="[
      `c-collapse-panel--${variant}`,
      {
        'c-collapse-panel--bordered': bordered,
        'c-collapse-panel--icon-right': expandIconPosition === 'right',
      },
    ]"
  >
    <div
      v-for="item in items"
      :key="item.key"
      :ref="el => setPanelRef(item.key, el as HTMLElement)"
      class="collapse-item"
      :class="{
        'collapse-item--active': isExpanded(item.key),
        'collapse-item--disabled': item.disabled,
      }"
    >
      <!-- 面板头部 -->
      <div
        class="collapse-item__header"
        role="button"
        :aria-expanded="isExpanded(item.key)"
        :aria-controls="`collapse-content-${item.key}`"
        :aria-disabled="item.disabled"
        :tabindex="item.disabled ? -1 : 0"
        @click="!item.disabled && toggle(item.key)"
        @keydown="handleKeyDown($event, item.key)"
      >
        <!-- 展开图标 -->
        <span
          class="collapse-item__arrow"
          :class="{ 'collapse-item__arrow--expanded': isExpanded(item.key) }"
        >
          <Icon icon="mdi:chevron-right" />
        </span>

        <!-- 标题区域 -->
        <div class="collapse-item__title-area">
          <slot
            :name="`header-${item.key}`"
            :item="item"
            :expanded="isExpanded(item.key)"
          >
            <div class="collapse-item__title-group">
              <Icon
                v-if="item.icon"
                :icon="item.icon"
                class="collapse-item__icon"
              />
              <span class="collapse-item__title">{{ item.title }}</span>
              <span
                v-if="item.subtitle"
                class="collapse-item__subtitle"
              >
                {{ item.subtitle }}
              </span>
            </div>
          </slot>
        </div>

        <!-- 头部右侧操作区 -->
        <div
          v-if="$slots[`extra-${item.key}`]"
          class="collapse-item__extra"
          @click.stop
        >
          <slot
            :name="`extra-${item.key}`"
            :item="item"
            :expanded="isExpanded(item.key)"
          />
        </div>
      </div>

      <!-- 面板内容 -->
      <Transition
        name="collapse-slide"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @leave="onLeave"
        @after-leave="onAfterLeave"
      >
        <div
          v-show="isExpanded(item.key)"
          :id="`collapse-content-${item.key}`"
          class="collapse-item__content-wrapper"
          role="region"
          :aria-labelledby="`collapse-header-${item.key}`"
        >
          <div
            v-if="shouldRender(item)"
            class="collapse-item__content"
          >
            <slot
              :name="`panel-${item.key}`"
              :item="item"
              :expanded="isExpanded(item.key)"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useCollapsePanel } from '@/composables/CollapsePanel/useCollapsePanel'
  import type {
    CollapsePanelExpose,
    CollapsePanelItem,
    CollapsePanelVariant,
    ExpandIconPosition,
  } from '@/types/modules/collapse-panel'
  import { Icon } from '@iconify/vue'

  interface Props {
    /** 面板项配置数组 */
    items: CollapsePanelItem[]
    /** 当前激活面板的 key 数组（v-model） */
    activeKeys?: string[]
    /** 默认展开的面板 key 数组 */
    defaultActiveKeys?: string[]
    /** 是否手风琴模式 */
    accordion?: boolean
    /** 面板样式变体 */
    variant?: CollapsePanelVariant
    /** 展开图标位置 */
    expandIconPosition?: ExpandIconPosition
    /** 是否显示边框 */
    bordered?: boolean
    /** 展开状态 localStorage 持久化 key */
    persistKey?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    activeKeys: undefined,
    defaultActiveKeys: () => [],
    accordion: false,
    variant: 'default',
    expandIconPosition: 'left',
    bordered: true,
    persistKey: undefined,
  })

  const emit = defineEmits<{
    'update:activeKeys': [keys: string[]]
    expand: [key: string]
    collapse: [key: string]
    change: [activeKeys: string[]]
  }>()

  const containerRef = ref<HTMLElement | null>(null)
  const panelRefs = ref<Map<string, HTMLElement>>(new Map())

  const setPanelRef = (key: string, el: HTMLElement | null) => {
    if (el) {
      panelRefs.value.set(key, el)
    } else {
      panelRefs.value.delete(key)
    }
  }

  const {
    isExpanded,
    shouldRender,
    toggle,
    expandAll,
    collapseAll,
    getActiveKeys,
    handleKeyDown,
  } = useCollapsePanel({
    items: toRef(props, 'items'),
    activeKeys: toRef(props, 'activeKeys'),
    defaultActiveKeys: props.defaultActiveKeys,
    accordion: toRef(props, 'accordion'),
    persistKey: toRef(props, 'persistKey'),
    onChange: keys => {
      emit('update:activeKeys', keys)
      emit('change', keys)
    },
    onExpand: key => emit('expand', key),
    onCollapse: key => emit('collapse', key),
  })

  // ─── 展开/折叠动画 ────────────────────────────
  const onEnter = (el: Element) => {
    const element = el as HTMLElement
    element.style.height = '0'
    element.style.overflow = 'hidden'
    // 强制 reflow
    void element.offsetHeight
    element.style.height = `${element.scrollHeight}px`
  }

  const onAfterEnter = (el: Element) => {
    const element = el as HTMLElement
    element.style.height = ''
    element.style.overflow = ''
  }

  const onLeave = (el: Element) => {
    const element = el as HTMLElement
    element.style.height = `${element.scrollHeight}px`
    element.style.overflow = 'hidden'
    void element.offsetHeight
    element.style.height = '0'
  }

  const onAfterLeave = (el: Element) => {
    const element = el as HTMLElement
    element.style.height = ''
    element.style.overflow = ''
  }

  // ─── 滚动到指定面板 ───────────────────────────
  const scrollToPanel = (key: string) => {
    const el = panelRefs.value.get(key)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // ─── 暴露方法 ────────────────────────────────
  defineExpose<CollapsePanelExpose>({
    expandAll,
    collapseAll,
    toggle,
    getActiveKeys,
    scrollToPanel,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
