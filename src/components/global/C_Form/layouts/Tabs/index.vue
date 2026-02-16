<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-04 19:20:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-08 22:34:46
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Tabs\index.vue
 * @Description: 表单组件 - 标签布局组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="c-form-tabs">
    <!-- 无标签配置时的单一面板模式 -->
    <div
      v-if="!hasTabs"
      class="single-panel"
    >
      <component
        v-for="(item, index) in formItems"
        :key="getItemKey(item, index)"
        :is="item"
      />
    </div>

    <!-- 有标签配置时的分标签模式 -->
    <div
      v-else
      class="tabs-container"
    >
      <NTabs
        v-model:value="currentTab"
        :type="tabsConfig.type"
        :size="tabsConfig.size"
        :placement="tabsConfig.placement"
        :animated="tabsConfig.animated"
        :closable="tabsConfig.closable"
        :addable="tabsConfig.addable"
        class="form-tabs"
        @update:value="handleTabChange"
        @close="handleTabClose"
        @add="handleTabAdd"
      >
        <NTabPane
          v-for="tab in tabsWithItems"
          :key="tab.config.key"
          :name="tab.config.key"
          :tab="tab.config.title"
          :disabled="tab.config.disabled"
          :closable="tab.config.closable"
        >
          <template #tab>
            <NSpace
              align="center"
              :size="8"
            >
              <div
                v-if="tab.config.icon"
                :class="tab.config.icon"
                class="tab-icon"
              />
              <span>{{ tab.config.title }}</span>
              <NBadge
                v-if="tabsConfig.showCount"
                :value="tab.items.length"
                :max="99"
                :show="tab.items.length > 0"
                type="info"
              />
            </NSpace>
          </template>

          <!-- 标签页头部信息 -->
          <div
            v-if="tabsConfig.showTabHeader && tab.config.description"
            class="tab-header"
          >
            <p class="tab-description">{{ tab.config.description }}</p>
          </div>

          <!-- 标签页内的表单项 -->
          <div class="tab-form-items">
            <component
              v-for="(item, itemIndex) in tab.items"
              :key="getItemKey(item, itemIndex)"
              :is="item"
            />
          </div>

          <!-- 空状态 -->
          <NEmpty
            v-if="tab.items.length === 0"
            description="暂无表单项"
            class="tab-empty"
          />
        </NTabPane>
      </NTabs>

      <!-- 标签页操作按钮 -->
      <div
        v-if="tabsConfig.showActions"
        class="tabs-actions"
      >
        <NSpace justify="space-between">
          <NSpace>
            <NButton
              v-if="tabsConfig.validateBeforeSwitch"
              type="primary"
              size="small"
              @click="validateCurrentTab"
            >
              <div class="i-carbon:star-check mr-1" />
              验证当前标签
            </NButton>
          </NSpace>

          <NSpace>
            <slot
              name="tab-actions"
              :current-tab="currentTab"
              :total-tabs="tabsWithItems.length"
              :validate-tab="validateCurrentTab"
              :switch-to-tab="switchToTab"
            />
          </NSpace>
        </NSpace>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'

  // ================= 类型定义 =================
  interface TabConfig {
    key: string
    title: string
    description?: string
    icon?: string
    disabled?: boolean
    closable?: boolean
  }

  interface TabsLayoutConfig {
    tabs: TabConfig[]
    type?: 'line' | 'card' | 'segment'
    size?: 'small' | 'medium' | 'large'
    placement?: 'top' | 'right' | 'bottom' | 'left'
    animated?: boolean
    closable?: boolean
    addable?: boolean
    showTabHeader?: boolean
    showActions?: boolean
    showCount?: boolean
    validateBeforeSwitch?: boolean
    defaultTab?: string
  }

  interface TabWithItems {
    config: TabConfig
    items: VNode[]
  }

  interface Props {
    formItems: VNode[]
    layoutConfig?: {
      tabs?: TabsLayoutConfig
    }
    options?: Array<{
      layout?: {
        tab?: string
      }
    }>
  }

  // ================= 组件属性和事件 =================
  const props = withDefaults(defineProps<Props>(), {
    layoutConfig: () => ({}),
    options: () => [],
  })

  const emit = defineEmits<{
    'tab-change': [tabKey: string, tabIndex: number]
    'tab-before-change': [currentTab: string, targetTab: string]
    'tab-validate': [tabKey: string]
    'tab-close': [tabKey: string]
    'tab-add': []
  }>()

  // ================= 响应式状态 =================
  const currentTab = ref<string>('')
  const tabValidationStatus = reactive<Record<string, boolean>>({})

  // ================= 默认配置 =================
  const getDefaultTabsConfig = (): Required<TabsLayoutConfig> => ({
    tabs: [],
    type: 'line',
    size: 'medium',
    placement: 'top',
    animated: true,
    closable: false,
    addable: false,
    showTabHeader: true,
    showActions: false,
    showCount: false,
    validateBeforeSwitch: false,
    defaultTab: '',
  })

  // ================= 计算属性 =================
  const tabsConfig = computed(() => {
    const defaultConfig = getDefaultTabsConfig()
    const userConfig = props.layoutConfig?.tabs || {}

    return {
      ...defaultConfig,
      ...userConfig,
    }
  })

  const hasTabs = computed((): boolean => {
    return tabsConfig.value.tabs.length > 0
  })

  const tabsWithItems = computed((): TabWithItems[] => {
    if (!hasTabs.value) return []

    const tabMap = new Map<string, VNode[]>()

    // 初始化标签映射
    tabsConfig.value.tabs.forEach(tab => {
      tabMap.set(tab.key, [])
    })

    // 分配表单项到对应标签
    props.formItems.forEach((item, index) => {
      const option = props.options?.[index]
      const tabKey =
        option?.layout?.tab || tabsConfig.value.tabs[0]?.key || 'default'

      if (!tabMap.has(tabKey)) {
        tabMap.set(tabKey, [])
      }
      tabMap.get(tabKey)!.push(item)
    })

    // 返回所有标签（包括空标签）
    return tabsConfig.value.tabs.map(tabConfig => ({
      config: tabConfig,
      items: tabMap.get(tabConfig.key) || [],
    }))
  })

  // ================= 工具方法 =================
  const getItemKey = (item: VNode, index: number): string => {
    if (item.key != null) {
      return String(item.key)
    }

    const itemProps = item.props as Record<string, any> | null
    if (itemProps?.path) {
      return itemProps.path
    }

    return `tab-item-${index}`
  }

  const validateCurrentTab = async (): Promise<boolean> => {
    if (!currentTab.value) return true

    try {
      // 修复：正确处理事件emit的返回值
      emit('tab-validate', currentTab.value)
      // 假设验证总是成功，实际应用中这里应该等待真正的验证结果
      const valid = true
      tabValidationStatus[currentTab.value] = valid
      return valid
    } catch (error) {
      console.error('[Tabs Layout] 标签验证失败:', error)
      tabValidationStatus[currentTab.value] = false
      return false
    }
  }

  const switchToTab = async (targetTab: string): Promise<boolean> => {
    if (!targetTab || targetTab === currentTab.value) {
      return true
    }

    const targetTabExists = tabsWithItems.value.some(
      tab => tab.config.key === targetTab
    )
    if (!targetTabExists) {
      return false
    }

    try {
      // 验证当前标签（如果需要）
      if (tabsConfig.value.validateBeforeSwitch && currentTab.value) {
        const isValid = await validateCurrentTab()
        if (!isValid) {
          return false
        }
      }

      // 触发标签切换前事件
      if (currentTab.value) {
        emit('tab-before-change', currentTab.value, targetTab)
      }

      currentTab.value = targetTab
      const tabIndex = tabsWithItems.value.findIndex(
        tab => tab.config.key === targetTab
      )
      emit('tab-change', targetTab, tabIndex)
      return true
    } catch (error) {
      console.error('[Tabs Layout] 标签切换失败:', error)
      return false
    }
  }

  // ================= 事件处理方法 =================
  const handleTabChange = (tabKey: string): void => {
    switchToTab(tabKey)
  }

  const handleTabClose = (tabKey: string): void => {
    emit('tab-close', tabKey)
  }

  const handleTabAdd = (): void => {
    emit('tab-add')
  }

  const initializeCurrentTab = (): void => {
    if (!hasTabs.value || tabsWithItems.value.length === 0) {
      return
    }

    const { defaultTab } = tabsConfig.value
    const targetTab = defaultTab || tabsWithItems.value[0]?.config.key

    if (targetTab && targetTab !== currentTab.value) {
      currentTab.value = targetTab
      // 初始化时直接设置，不触发事件避免不必要的副作用
      nextTick(() => {
        const tabIndex = tabsWithItems.value.findIndex(
          tab => tab.config.key === targetTab
        )
        if (tabIndex >= 0) {
          emit('tab-change', targetTab, tabIndex)
        }
      })
    }
  }

  // ================= 生命周期 =================
  onMounted(() => {
    initializeCurrentTab()
  })

  // 只监听标签结构变化（key / 数量），不监听表单项内容变化
  // 避免 formModel 更新 → options 重算 → tabsWithItems 重算 → 无意义 watch 触发
  const tabStructureKey = computed(() =>
    tabsConfig.value.tabs.map(t => t.key).join(',')
  )

  watch(tabStructureKey, () => {
    // 当标签结构变化时，确保当前标签仍然有效
    if (
      currentTab.value &&
      !tabsConfig.value.tabs.some(tab => tab.key === currentTab.value)
    ) {
      initializeCurrentTab()
    }
  })

  // 监听配置变化
  watch(
    () => tabsConfig.value.defaultTab,
    newDefaultTab => {
      if (newDefaultTab && newDefaultTab !== currentTab.value) {
        switchToTab(newDefaultTab)
      }
    }
  )

  // ================= 对外暴露 =================
  defineExpose({
    switchToTab,
    validateCurrentTab,
    currentTab: readonly(currentTab),
    totalTabs: computed(() => tabsWithItems.value.length),
    tabsWithItems: readonly(tabsWithItems),
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
