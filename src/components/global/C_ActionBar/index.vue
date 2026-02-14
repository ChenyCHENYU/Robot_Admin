<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-14
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-14
 * @FilePath: \Robot_Admin\src\components\global\C_ActionBar\index.vue
 * @Description: 通用操作按钮组件 - 配置化管理任何场景的按钮组
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    class="c-action-bar"
    :class="{
      'is-compact': finalConfig.compact,
      'is-inline': finalConfig.inline,
      'is-wrap': finalConfig.wrap,
      [`is-align-${finalConfig.align}`]: true,
      'has-only-left':
        leftButtonList.length > 0 &&
        rightButtonList.length === 0 &&
        !$slots.center,
      'has-only-right':
        rightButtonList.length > 0 &&
        leftButtonList.length === 0 &&
        !$slots.center,
    }"
  >
    <!-- 左侧按钮组 -->
    <div
      v-if="leftButtonList.length > 0"
      class="actions-group actions-left"
      :style="{ gap: `${finalConfig.gap}px` }"
    >
      <template
        v-for="(action, index) in leftButtonList"
        :key="action.key || `left-${index}`"
      >
        <ActionButton
          :action="action"
          @click="handleActionClick(action)"
          @dropdown-select="item => handleDropdownClick(item, action)"
        />
        <NDivider
          v-if="
            finalConfig.showDivider &&
            index < leftButtonList.length - 1 &&
            finalConfig.dividerType === 'vertical'
          "
          vertical
          class="action-divider"
        />
      </template>
    </div>

    <!-- 中间插槽 -->
    <div
      v-if="$slots.center"
      class="actions-center"
    >
      <slot name="center" />
    </div>

    <!-- 右侧按钮组 -->
    <div
      v-if="rightButtonList.length > 0"
      class="actions-group actions-right"
      :style="{ gap: `${finalConfig.gap}px` }"
    >
      <template
        v-for="(action, index) in rightButtonList"
        :key="action.key || `right-${index}`"
      >
        <ActionButton
          :action="action"
          @click="handleActionClick(action)"
          @dropdown-select="item => handleDropdownClick(item, action)"
        />
        <NDivider
          v-if="
            finalConfig.showDivider &&
            index < rightButtonList.length - 1 &&
            finalConfig.dividerType === 'vertical'
          "
          vertical
          class="action-divider"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    unref,
    h,
    defineComponent,
    withDirectives,
    type PropType,
  } from 'vue'
  import type {
    ActionItem,
    ActionDropdownItem,
    ActionBarConfig,
    TableActionsProps,
    TableActionsEmits,
  } from '@/types/modules/action-bar'
  import C_Icon from '@/components/global/C_Icon/index.vue'

  // ================= Props & Emits =================
  const props = withDefaults(defineProps<TableActionsProps>(), {
    actions: () => [],
    leftActions: () => [],
    rightActions: () => [],
    config: () => ({}),
  })

  const emit = defineEmits<TableActionsEmits>()

  // ================= 配置合并 =================
  const defaultConfig: Required<ActionBarConfig> = {
    align: 'left',
    size: 'medium',
    gap: 8,
    wrap: false,
    showDivider: false,
    dividerType: 'vertical',
    compact: false,
    inline: true,
  }

  const finalConfig = computed<Required<ActionBarConfig>>(() => ({
    ...defaultConfig,
    ...props.config,
  }))

  // ================= 按钮列表分组 =================
  /** 左侧按钮列表 */
  const leftButtonList = computed<ActionItem[]>(() => {
    // 优先使用 leftActions
    if (props.leftActions && props.leftActions.length > 0) {
      return props.leftActions.filter(action => shouldShowAction(action))
    }

    // 如果没有 leftActions，检查 actions
    if (props.actions.length > 0) {
      const hasRightActions =
        props.rightActions && props.rightActions.length > 0
      const hasRightGroup = props.actions.some(
        action => action.group === 'right'
      )

      // 如果没有 rightActions 也没有 group='right' 的按钮，则所有 actions 显示在左侧
      if (!hasRightActions && !hasRightGroup) {
        return props.actions.filter(action => shouldShowAction(action))
      }

      // 否则只显示 group='left' 的按钮
      return props.actions.filter(
        action => action.group === 'left' && shouldShowAction(action)
      )
    }

    return []
  })

  /** 右侧按钮列表 */
  const rightButtonList = computed<ActionItem[]>(() => {
    // 优先使用 rightActions
    if (props.rightActions && props.rightActions.length > 0) {
      return props.rightActions.filter(action => shouldShowAction(action))
    }
    // 否则从 actions 中筛选 group:right
    return props.actions.filter(
      action => action.group === 'right' && shouldShowAction(action)
    )
  })

  // ================= 辅助函数 =================
  /** 判断按钮是否显示 */
  const shouldShowAction = (action: ActionItem): boolean => {
    if (action.show === undefined) return true
    return unref(action.show)
  }

  /** 判断按钮是否禁用 */
  const isActionDisabled = (action: ActionItem): boolean => {
    return unref(action.disabled) || false
  }

  /** 判断按钮是否加载中 */
  const isActionLoading = (action: ActionItem): boolean => {
    return unref(action.loading) || false
  }

  // ================= 事件处理 =================
  /** 处理按钮点击 */
  const handleActionClick = async (action: ActionItem) => {
    // 如果有下拉菜单，不触发点击事件
    if (action.dropdown && action.dropdown.length > 0) return

    emit('action-click', action)
    if (action.onClick) {
      await action.onClick()
    }
  }

  /** 处理下拉菜单项点击 */
  const handleDropdownClick = async (
    item: ActionDropdownItem,
    action: ActionItem
  ) => {
    emit('dropdown-click', item, action)
    if (item.onClick) {
      await item.onClick()
    }
  }

  // ================= 按钮渲染组件 =================
  /**
   * ActionButton 子组件
   * 渲染单个按钮或带下拉菜单的按钮
   */
  const ActionButton = defineComponent({
    name: 'ActionButton',
    props: {
      action: {
        type: Object as PropType<ActionItem>,
        required: true,
      },
    },
    emits: ['click', 'dropdown-select'],
    /**
     * @description ActionButton setup 函数
     */
    setup(props, { emit }) {
      const action = computed(() => props.action)

      // 下拉菜单选项
      const dropdownOptions = computed(() => {
        if (!action.value.dropdown) return []
        return action.value.dropdown
          .filter(item => {
            if (item.show === undefined) return true
            return unref(item.show)
          })
          .map(item => ({
            key: item.key,
            label: item.label,
            icon: item.icon
              ? () => h(C_Icon, { name: item.icon, size: 14 })
              : undefined,
            disabled: unref(item.disabled),
          }))
      })

      // 处理下拉菜单选择
      const handleDropdownSelect = (key: string) => {
        const item = action.value.dropdown?.find(d => d.key === key)
        if (item) {
          emit('dropdown-select', item)
        }
      }

      // 渲染普通按钮
      const renderButton = () => {
        const button = h(
          NButton,
          {
            type: action.value.type || 'default',
            size: action.value.size || finalConfig.value.size,
            loading: isActionLoading(action.value),
            disabled: isActionDisabled(action.value),
            onClick: () => emit('click'),
            ...action.value.buttonProps,
          },
          {
            default: () => action.value.label,
            icon: action.value.icon
              ? () => h(C_Icon, { name: action.value.icon, size: 16 })
              : undefined,
          }
        )

        // 应用自定义指令
        const vnode =
          action.value.directives && action.value.directives.length > 0
            ? withDirectives(button, action.value.directives as any)
            : button

        // 如果有 tooltip，包装 NTooltip
        if (action.value.tooltip) {
          return h(
            NTooltip,
            { placement: 'top' },
            {
              trigger: () => vnode,
              default: () => action.value.tooltip,
            }
          )
        }

        return vnode
      }

      // 渲染带下拉菜单的按钮
      const renderDropdownButton = () => {
        const button = h(
          NButton,
          {
            type: action.value.type || 'default',
            size: action.value.size || finalConfig.value.size,
            loading: isActionLoading(action.value),
            disabled: isActionDisabled(action.value),
            ...action.value.buttonProps,
          },
          {
            default: () => action.value.label,
            icon: action.value.icon
              ? () => h(C_Icon, { name: action.value.icon, size: 16 })
              : undefined,
          }
        )

        // 应用自定义指令
        const vnode =
          action.value.directives && action.value.directives.length > 0
            ? withDirectives(button, action.value.directives as any)
            : button

        return h(
          NDropdown,
          {
            options: dropdownOptions.value,
            onSelect: handleDropdownSelect,
          },
          {
            default: () => vnode,
          }
        )
      }

      return () => {
        // 如果有下拉菜单
        if (action.value.dropdown && action.value.dropdown.length > 0) {
          return renderDropdownButton()
        }
        // 普通按钮
        return renderButton()
      }
    },
  })
</script>

<script lang="ts">
  export default {
    name: 'C_ActionBar',
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
