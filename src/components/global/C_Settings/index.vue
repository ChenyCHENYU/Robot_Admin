<template>
  <NDrawer
    v-model:show="visible"
    :width="380"
    placement="right"
    :trap-focus="false"
    :block-scroll="false"
  >
    <NDrawerContent
      title="⚙️ 主题配置"
      closable
    >
      <!-- Tab 切换 -->
      <NTabs
        v-model:value="activeTab"
        type="line"
        animated
        class="settings-tabs"
      >
        <!-- 外观 Tab -->
        <NTabPane
          name="appearance"
          tab="🎨 外观"
        >
          <div class="settings-section">
            <div class="section-title">快速预设</div>
            <div class="section-description">一键应用预设主题方案</div>

            <!-- 预设方案网格 -->
            <div class="preset-grid">
              <div
                v-for="preset in THEME_PRESETS"
                :key="preset.name"
                class="preset-card"
                :class="{ active: isCurrentPreset(preset) }"
                @click="handleApplyPreset(preset)"
              >
                <div class="preset-icon">{{ preset.icon }}</div>
                <div class="preset-name">{{ preset.name }}</div>
                <div class="preset-color">
                  <span
                    class="color-dot"
                    :style="{ backgroundColor: preset.primaryColor }"
                  ></span>
                </div>
              </div>
            </div>
          </div>

          <!-- 主题模式 -->
          <div class="settings-section">
            <div class="section-title">主题模式</div>
            <NRadioGroup
              v-model:value="settingsStore.themeMode"
              class="mode-group"
            >
              <NRadioButton value="light">
                <span class="i-mdi:white-balance-sunny mr-1"></span>
                浅色
              </NRadioButton>
              <NRadioButton value="dark">
                <span class="i-mdi:moon-waning-crescent mr-1"></span>
                深色
              </NRadioButton>
              <NRadioButton value="auto">
                <span class="i-mdi:theme-light-dark mr-1"></span>
                自动
              </NRadioButton>
            </NRadioGroup>
          </div>

          <!-- 主题色 -->
          <div class="settings-section">
            <div class="section-title">主题色</div>
            <div class="color-picker-wrapper">
              <NColorPicker
                v-model:value="settingsStore.primaryColor"
                :show-alpha="false"
                :swatches="COLOR_SWATCHES"
                :actions="['confirm']"
              />
              <span class="color-value">{{ settingsStore.primaryColor }}</span>
            </div>
          </div>

          <!-- 圆角大小 -->
          <div class="settings-section">
            <div class="section-title">圆角大小</div>
            <NRadioGroup
              v-model:value="settingsStore.borderRadius"
              class="radius-group"
            >
              <NRadioButton value="small">小 (4px)</NRadioButton>
              <NRadioButton value="medium">中 (6px)</NRadioButton>
              <NRadioButton value="large">大 (8px)</NRadioButton>
            </NRadioGroup>
          </div>

          <!-- 页面动画 -->
          <div class="settings-section">
            <div class="section-title">页面动画</div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm">启用动画</span>
              <NSwitch v-model:value="settingsStore.enableTransition" />
            </div>
            <NRadioGroup
              v-model:value="settingsStore.transitionType"
              :disabled="!settingsStore.enableTransition"
              class="transition-group"
            >
              <NRadioButton value="fade">淡入</NRadioButton>
              <NRadioButton value="slide">滑动</NRadioButton>
              <NRadioButton value="zoom">缩放</NRadioButton>
              <NRadioButton value="none">无</NRadioButton>
            </NRadioGroup>
          </div>

          <!-- 恢复默认 -->
          <div class="settings-section">
            <NButton
              block
              secondary
              @click="handleResetAppearance"
            >
              <template #icon>
                <span class="i-mdi:restore"></span>
              </template>
              恢复外观默认设置
            </NButton>
          </div>
        </NTabPane>

        <!-- 布局 Tab -->
        <NTabPane
          name="layout"
          tab="📐 布局"
        >
          <!-- 布局模式 -->
          <div class="settings-section">
            <div class="section-title">布局模式</div>
            <div class="layout-grid">
              <div
                v-for="mode in LAYOUT_MODES"
                :key="mode.value"
                class="layout-item"
                :class="{
                  active: settingsStore.layoutMode === mode.value,
                  disabled: mode.disabled,
                }"
                @click="
                  !mode.disabled && handleLayoutChange($event, mode.value)
                "
              >
                <div class="layout-screenshot">
                  <svg
                    class="layout-svg"
                    viewBox="0 0 56 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g v-html="mode.svg"></g>
                  </svg>
                </div>
                <div class="layout-label">
                  {{ mode.label }}
                  <span
                    v-if="mode.disabled"
                    class="badge-soon"
                    >敬请期待</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 界面元素 -->
          <div class="settings-section">
            <div class="section-title">界面元素</div>
            <div class="setting-item">
              <span>显示面包屑</span>
              <NSwitch v-model:value="settingsStore.showBreadcrumb" />
            </div>
            <div class="setting-item">
              <span>显示面包屑图标</span>
              <NSwitch
                v-model:value="settingsStore.showBreadcrumbIcon"
                :disabled="!settingsStore.showBreadcrumb"
              />
            </div>
            <div class="setting-item">
              <span>显示标签页</span>
              <NSwitch v-model:value="settingsStore.showTagsView" />
            </div>
            <div class="setting-item">
              <span>显示页脚</span>
              <NSwitch v-model:value="settingsStore.showFooter" />
            </div>
          </div>

          <!-- 尺寸调整 -->
          <div class="settings-section">
            <div class="section-title">尺寸调整</div>
            <div class="slider-item">
              <div class="slider-label">
                <span>侧边栏宽度</span>
                <span class="slider-value"
                  >{{ settingsStore.sidebarWidth }}px</span
                >
              </div>
              <NSlider
                v-model:value="settingsStore.sidebarWidth"
                :min="180"
                :max="280"
                :step="10"
                :marks="{ 180: '180', 220: '220', 280: '280' }"
              />
            </div>
            <div class="slider-item">
              <div class="slider-label">
                <span>头部高度</span>
                <span class="slider-value"
                  >{{ settingsStore.headerHeight }}px</span
                >
              </div>
              <NSlider
                v-model:value="settingsStore.headerHeight"
                :min="48"
                :max="64"
                :step="4"
                :marks="{ 48: '48', 56: '56', 64: '64' }"
              />
            </div>
          </div>

          <!-- 恢复默认 -->
          <div class="settings-section">
            <NButton
              block
              secondary
              @click="handleResetLayout"
            >
              <template #icon>
                <span class="i-mdi:restore"></span>
              </template>
              恢复布局默认设置
            </NButton>
          </div>
        </NTabPane>

        <!-- 高级 Tab -->
        <NTabPane
          name="advanced"
          tab="⚡ 高级"
        >
          <div class="settings-section">
            <div class="section-title">配置管理</div>
            <div class="action-buttons">
              <NButton
                block
                @click="handleReset"
              >
                <template #icon>
                  <span class="i-mdi:restore"></span>
                </template>
                重置所有配置
              </NButton>
            </div>
          </div>

          <!-- 快捷键 -->
          <div class="settings-section">
            <div class="section-title">快捷键</div>
            <div class="setting-item">
              <span>启用快捷键</span>
              <NSwitch v-model:value="settingsStore.enableHotkeys" />
            </div>
            <div class="hotkey-list">
              <div class="hotkey-item">
                <span class="hotkey-desc">打开设置面板</span>
                <NTag size="small">Ctrl + K</NTag>
              </div>
              <div class="hotkey-item">
                <span class="hotkey-desc">切换深浅模式</span>
                <NTag size="small">Ctrl + Shift + D</NTag>
              </div>
              <div class="hotkey-item">
                <span class="hotkey-desc">重置配置</span>
                <NTag size="small">Ctrl + Shift + R</NTag>
              </div>
            </div>
          </div>

          <!-- 版本信息 -->
          <div class="settings-section">
            <div class="section-title">关于</div>
            <div class="about-info">
              <div class="about-item">
                <span>配置版本</span>
                <span class="about-value">{{ settingsStore.version }}</span>
              </div>
              <div class="about-item">
                <span>项目版本</span>
                <span class="about-value">1.0.0</span>
              </div>
            </div>
          </div>
        </NTabPane>
      </NTabs>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { ThemePreset } from '@/stores/settings/types'
  import { DEFAULT_SETTINGS } from '@/stores/settings/constants'
  import { useSettingsStore } from '@/stores/settings'
  import { COLOR_SWATCHES, LAYOUT_MODES, THEME_PRESETS } from './data'

  // ============ 数据定义 ============

  const message = useMessage()
  const dialog = useDialog()
  const settingsStore = useSettingsStore()
  const visible = defineModel<boolean>('show', { default: false })
  const activeTab = ref('appearance')

  // 处理布局切换 - 阻止抽屉关闭
  const handleLayoutChange = (e: MouseEvent, value: string) => {
    e.stopPropagation()
    settingsStore.layoutMode = value as any
  }

  // ============ 方法 ============

  /**
   * 判断是否是当前预设
   */
  const isCurrentPreset = (preset: ThemePreset) => {
    return (
      settingsStore.primaryColor === preset.primaryColor &&
      settingsStore.themeMode === preset.themeMode &&
      settingsStore.layoutMode === preset.layoutMode
    )
  }

  /**
   * 应用预设方案
   */
  const handleApplyPreset = (preset: ThemePreset) => {
    settingsStore.applyPreset(preset)
    message.success(`已应用「${preset.name}」主题方案`)
  }

  /**
   * 恢复外观默认设置
   */
  const handleResetAppearance = () => {
    settingsStore.themeMode = DEFAULT_SETTINGS.themeMode
    settingsStore.primaryColor = DEFAULT_SETTINGS.primaryColor
    settingsStore.borderRadius = DEFAULT_SETTINGS.borderRadius
    settingsStore.transitionType = DEFAULT_SETTINGS.transitionType
    settingsStore.enableTransition = DEFAULT_SETTINGS.enableTransition
    message.success('已恢复外观默认设置')
  }

  /**
   * 恢复布局默认设置
   */
  const handleResetLayout = () => {
    settingsStore.layoutMode = DEFAULT_SETTINGS.layoutMode
    settingsStore.showBreadcrumb = DEFAULT_SETTINGS.showBreadcrumb
    settingsStore.showBreadcrumbIcon = DEFAULT_SETTINGS.showBreadcrumbIcon
    settingsStore.showTagsView = DEFAULT_SETTINGS.showTagsView
    settingsStore.showFooter = DEFAULT_SETTINGS.showFooter
    settingsStore.sidebarWidth = DEFAULT_SETTINGS.sidebarWidth
    settingsStore.sidebarCollapsedWidth = DEFAULT_SETTINGS.sidebarCollapsedWidth
    settingsStore.headerHeight = DEFAULT_SETTINGS.headerHeight
    settingsStore.tagsViewHeight = DEFAULT_SETTINGS.tagsViewHeight
    message.success('已恢复布局默认设置')
  }

  /**
   * 重置配置
   */
  const handleReset = () => {
    dialog.warning({
      title: '确认重置',
      content: '确定要恢复默认配置吗？此操作不可撤销。',
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: () => {
        settingsStore.resetSettings()
        message.success('已恢复默认配置')
      },
    })
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
