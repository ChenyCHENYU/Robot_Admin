<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-04 19:20:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-09 00:19:13
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Card\index.vue
 * @Description: 表单组件 - 卡片组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="c-form-card">
    <!-- 布局配置面板 -->
    <NCard
      v-if="hasGroups && showLayoutConfig"
      class="layout-config-panel"
      :bordered="false"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <div class="i-mdi-cog text-lg" />
          <span>布局配置</span>
        </div>
      </template>

      <div class="config-controls">
        <div class="config-item">
          <span>卡片间距</span>
          <div class="flex items-center gap-2">
            <NSlider
              v-model:value="cardGap"
              :min="12"
              :max="32"
              :step="4"
              class="w-24"
            />
            <span class="text-xs min-w-12">{{ cardGap }}px</span>
          </div>
        </div>

        <div class="config-item">
          <span>显示图标</span>
          <NSwitch
            v-model:value="showIcons"
            size="small"
          />
        </div>

        <div class="config-item">
          <span>可折叠</span>
          <NSwitch
            v-model:value="collapsible"
            size="small"
          />
        </div>

        <div class="config-item">
          <span>布局方向</span>
          <NRadioGroup
            v-model:value="currentDirection"
            size="small"
          >
            <NRadio value="vertical">垂直</NRadio>
            <NRadio value="horizontal">水平</NRadio>
          </NRadioGroup>
        </div>
      </div>
    </NCard>

    <!-- 表单内容区域 -->
    <div
      class="form-content"
      :class="layoutClass"
      :style="{ gap: `${cardGap}px` }"
    >
      <!-- 无分组时的单卡片模式 -->
      <NCard
        v-if="!hasGroups"
        class="single-card"
        hoverable
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div
              v-if="showIcons"
              class="i-mdi-form-select text-lg text-blue-500"
            />
            <span>表单信息</span>
          </div>
        </template>

        <template
          v-for="item in formItems"
          :key="item.key"
        >
          <component :is="item" />
        </template>
      </NCard>

      <!-- 有分组时的多卡片模式 -->
      <template v-else>
        <NCard
          v-for="group in groupsWithItems"
          :key="group.config.key"
          class="group-card"
          :class="[
            `${group.config.key}-card`,
            { collapsed: collapsible && collapsedGroups[group.config.key] },
          ]"
          hoverable
        >
          <template #header>
            <div class="card-header">
              <div class="header-info">
                <div
                  v-if="showIcons && group.config.icon"
                  :class="[group.config.icon, 'card-icon']"
                />
                <div
                  v-else-if="showIcons"
                  :class="[getDefaultIcon(group.config.key), 'card-icon']"
                />

                <div class="header-text">
                  <h3>{{ group.config.title }}</h3>
                  <p v-if="group.config.description">{{
                    group.config.description
                  }}</p>
                </div>
              </div>

              <div class="header-actions">
                <!-- 统计信息 -->
                <div class="field-stats">
                  <NBadge
                    :value="group.items.length"
                    type="info"
                    show-zero
                  />
                  <NBadge
                    :value="`${getFilledCount(group)}/${group.items.length}`"
                    :type="
                      getFilledCount(group) === group.items.length
                        ? 'success'
                        : 'warning'
                    "
                  />
                </div>

                <!-- 折叠按钮 -->
                <NButton
                  v-if="collapsible"
                  quaternary
                  circle
                  size="small"
                  @click="toggleGroup(group.config.key)"
                >
                  <template #icon>
                    <div
                      :class="
                        collapsedGroups[group.config.key]
                          ? 'i-mdi-chevron-down'
                          : 'i-mdi-chevron-up'
                      "
                    />
                  </template>
                </NButton>
              </div>
            </div>
          </template>

          <div
            v-show="!collapsedGroups[group.config.key]"
            class="card-content"
          >
            <!-- 进度指示器 -->
            <div
              v-if="showProgress"
              class="progress-section"
            >
              <NProgress
                :percentage="getGroupProgress(group)"
                :color="getGroupProgress(group) === 100 ? '#52c41a' : '#1890ff'"
                :show-indicator="false"
                class="mb-4"
              />
            </div>

            <!-- 表单项 -->
            <template
              v-for="item in group.items"
              :key="item.key"
            >
              <component :is="item" />
            </template>
          </div>
        </NCard>
      </template>
    </div>

    <!-- 统一操作面板 -->
    <NCard
      v-if="hasGroups && showActionPanel"
      class="action-panel"
      :bordered="false"
    >
      <div class="action-content">
        <div class="status-summary">
          <div class="status-item">
            <span class="label">完成进度:</span>
            <div class="progress-display">
              <NProgress
                :percentage="totalProgress"
                :show-indicator="false"
                :color="totalProgress === 100 ? '#52c41a' : '#1890ff'"
                class="flex-1"
              />
              <span class="text-sm min-w-12">{{ totalProgress }}%</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <NButton
            v-if="collapsible"
            @click="toggleAllGroups"
          >
            <template #icon>
              <div
                :class="
                  allCollapsed
                    ? 'i-mdi-unfold-more-horizontal'
                    : 'i-mdi-unfold-less-horizontal'
                "
              />
            </template>
            {{ allCollapsed ? '展开全部' : '折叠全部' }}
          </NButton>
        </div>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'

  /**
   * 分组配置接口
   */
  interface GroupConfig {
    key: string
    title: string
    description?: string
    icon?: string
  }

  /**
   * 分组数据接口
   */
  interface GroupWithItems {
    config: GroupConfig
    items: VNode[]
  }

  /**
   * 组件属性接口
   */
  interface Props {
    formItems: VNode[]
    layoutConfig?: {
      card?: {
        groups?: GroupConfig[]
        direction?: 'vertical' | 'horizontal'
        showLayoutConfig?: boolean
        showActionPanel?: boolean
        showProgress?: boolean
      }
    }
    options?: Array<{
      layout?: {
        group?: string
      }
      prop?: string
    }>
    formData?: Record<string, any>
  }

  const props = withDefaults(defineProps<Props>(), {
    layoutConfig: () => ({}),
    options: () => [],
    formData: () => ({}),
  })

  // ================= 响应式状态 =================
  const cardGap = ref(20)
  const showIcons = ref(true)
  const collapsible = ref(true)
  const showProgress = ref(true)
  const currentDirection = ref<'vertical' | 'horizontal'>('vertical')
  const collapsedGroups = ref<Record<string, boolean>>({})

  // ================= 计算属性 =================
  const groups = computed((): GroupConfig[] => {
    return props.layoutConfig?.card?.groups || []
  })

  const hasGroups = computed((): boolean => {
    return groups.value.length > 0
  })

  const showLayoutConfig = computed((): boolean => {
    return props.layoutConfig?.card?.showLayoutConfig ?? true
  })

  const showActionPanel = computed((): boolean => {
    return props.layoutConfig?.card?.showActionPanel ?? true
  })

  const layoutClass = computed((): string => {
    if (!hasGroups.value) return 'layout-single'
    return `layout-${currentDirection.value}`
  })

  const groupsWithItems = computed((): GroupWithItems[] => {
    if (!hasGroups.value) return []

    const groupMap = new Map<string, VNode[]>()

    // 初始化分组映射
    groups.value.forEach(group => {
      groupMap.set(group.key, [])
    })

    // 将表单项分配到对应分组
    props.formItems.forEach((item, index) => {
      const option = props.options?.[index]
      const groupKey =
        option?.layout?.group || groups.value[0]?.key || 'default'

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, [])
      }
      groupMap.get(groupKey)!.push(item)
    })

    // 只返回有表单项的分组
    return groups.value
      .map(groupConfig => ({
        config: groupConfig,
        items: groupMap.get(groupConfig.key) || [],
      }))
      .filter(group => group.items.length > 0)
  })

  const allCollapsed = computed(() => {
    const groupKeys = Object.keys(collapsedGroups.value)
    return (
      groupKeys.length > 0 && groupKeys.every(key => collapsedGroups.value[key])
    )
  })

  const totalProgress = computed(() => {
    if (!props.options || props.options.length === 0) return 0

    const filledCount = props.options.filter(option => {
      const value = props.formData?.[option.prop || '']
      return isFieldFilled(value)
    }).length

    return Math.round((filledCount / props.options.length) * 100)
  })

  // ================= 工具函数 =================
  const isFieldFilled = (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value.trim() !== ''
    return true
  }

  const getFilledCount = (group: GroupWithItems): number => {
    if (!props.options) return 0

    const groupFields = props.options.filter(
      option => option.layout?.group === group.config.key
    )

    return groupFields.filter(option => {
      const value = props.formData?.[option.prop || '']
      return isFieldFilled(value)
    }).length
  }

  const getGroupProgress = (group: GroupWithItems): number => {
    if (group.items.length === 0) return 0
    const filledCount = getFilledCount(group)
    return Math.round((filledCount / group.items.length) * 100)
  }

  const getDefaultIcon = (groupKey: string): string => {
    const iconMap: Record<string, string> = {
      basic: 'i-mdi-account',
      contact: 'i-mdi-phone',
      preferences: 'i-mdi-cog',
      settings: 'i-mdi-cog',
      info: 'i-mdi-information',
      default: 'i-mdi-form-select',
    }
    return iconMap[groupKey] || iconMap.default
  }

  // ================= 操作方法 =================
  const toggleGroup = (groupKey: string): void => {
    collapsedGroups.value[groupKey] = !collapsedGroups.value[groupKey]
  }

  const toggleAllGroups = (): void => {
    const shouldCollapse = !allCollapsed.value
    groups.value.forEach(group => {
      collapsedGroups.value[group.key] = shouldCollapse
    })
  }

  // ================= 生命周期 =================
  onMounted(() => {
    // 初始化配置
    const config = props.layoutConfig?.card
    if (config?.direction) {
      currentDirection.value = config.direction
    }

    if (config?.showProgress !== undefined) {
      showProgress.value = config.showProgress
    }

    // 初始化折叠状态
    groups.value.forEach(group => {
      collapsedGroups.value[group.key] = false
    })
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
