<template>
  <!-- 使用 @robot-admin/layout 包中的 SettingsDrawer 组件 -->
  <SettingsDrawer v-model:show="visible" />

  <!-- 菜单风格切换 — 注入到设置面板的外观 Tab 顶部 -->
  <Teleport
    v-if="injectReady"
    :to="injectTarget!"
  >
    <div class="settings-section menu-style-section">
      <div class="section-title">菜单风格</div>
      <div class="menu-style-grid">
        <button
          v-for="preset in MENU_STYLE_OPTIONS"
          :key="preset.type"
          class="menu-style-card"
          :class="{ active: themeStore.menuTheme === preset.type }"
          @click="themeStore.setMenuTheme(preset.type)"
        >
          <div class="card-preview">
            <div
              class="preview-sidebar"
              :style="{ background: preset.sidebarBg }"
            >
              <div
                class="preview-item active"
                :style="{ background: preset.activeBg }"
              />
              <div class="preview-item" />
              <div class="preview-item" />
            </div>
            <div class="preview-content">
              <div class="preview-header" />
              <div class="preview-body" />
            </div>
          </div>
          <span class="card-label">{{ preset.icon }} {{ preset.name }}</span>
          <span class="card-desc">{{ preset.description }}</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { SettingsDrawer } from '@robot-admin/layout'
  import '@robot-admin/layout/style.scss'
  import { s_themeStore, type MenuThemeType } from '@/stores/theme'

  /**
   * 设置抽屉组件包装器
   *
   * 包含：@robot-admin/layout 提供的完整设置面板
   * 扩展：菜单风格切换（通过 Teleport 注入到外观 Tab）
   */
  defineOptions({
    name: 'CSettings',
  })

  const visible = defineModel<boolean>('show', { default: false })
  const themeStore = s_themeStore()

  /** 菜单风格选项（仅用于 UI 显示） */
  const MENU_STYLE_OPTIONS: {
    type: MenuThemeType
    name: string
    icon: string
    description: string
    sidebarBg: string
    activeBg: string
  }[] = [
    {
      type: 'signature',
      name: '个性',
      icon: '✨',
      description: '深邃星空 · 玻璃质感',
      sidebarBg: '#0d1425',
      activeBg: 'rgba(100, 108, 255, 0.8)',
    },
    {
      type: 'standard',
      name: '标准',
      icon: '📋',
      description: '经典明暗 · 跟随主题',
      sidebarBg: '#ffffff',
      activeBg: 'rgba(32, 128, 240, 0.08)',
    },
  ]

  // Teleport 注入目标
  const injectTarget = shallowRef<Element | null>(null)
  const injectReady = ref(false)

  /**
   * * @description: 查找设置面板的外观 Tab 容器作为注入锚点
   * ! @return {Element | null} 目标元素
   */
  const findAppearancePane = (): Element | null => {
    // settings-tabs 是 @robot-admin/layout 的稳定类名
    const tabs = document.querySelector('.settings-tabs')
    if (!tabs) return null
    // Naive UI NTabPane 渲染在 .n-tab-pane 中，外观 Tab 是第一个
    const pane = tabs.querySelector('.n-tab-pane')
    return pane
  }

  /**
   * * @description: 在目标容器首部创建注入锚点
   * ? @param {Element} pane Tab 面板容器
   * ! @return {Element} 锚点元素
   */
  const ensureAnchor = (pane: Element): Element => {
    const ANCHOR_ID = 'menu-style-inject-anchor'
    let anchor = pane.querySelector(`#${ANCHOR_ID}`)
    if (!anchor) {
      anchor = document.createElement('div')
      anchor.id = ANCHOR_ID
      pane.insertBefore(anchor, pane.firstChild)
    }
    return anchor
  }

  // 监听抽屉开关，延迟注入（等待 drawer 动画和 DOM 渲染）
  watch(visible, show => {
    if (!show) {
      injectReady.value = false
      injectTarget.value = null
      return
    }

    // 递归 rAF 轮询 DOM 就绪（避免 await in loop）
    const pollForPane = (retriesLeft: number) => {
      if (retriesLeft <= 0) return
      nextTick(() => {
        const pane = findAppearancePane()
        if (pane) {
          const anchor = ensureAnchor(pane)
          injectTarget.value = anchor
          injectReady.value = true
          return
        }
        requestAnimationFrame(() => pollForPane(retriesLeft - 1))
      })
    }
    pollForPane(15)
  })
</script>

<style lang="scss">
  /* 菜单风格选择卡片 — 使用 settings-section 风格复用布局包样式 */
  .menu-style-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--n-border-color);
  }

  .menu-style-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 12px;
  }

  .menu-style-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 10px 10px;
    border-radius: 10px;
    border: 2px solid var(--n-border-color);
    background: var(--n-color);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;

    &:hover {
      border-color: var(--app-primary, #2080f0);
      box-shadow: 0 2px 12px rgba(32, 128, 240, 0.12);
    }

    &.active {
      border-color: var(--app-primary, #2080f0);
      background: rgba(32, 128, 240, 0.04);
      box-shadow: 0 2px 12px rgba(32, 128, 240, 0.15);

      &::after {
        content: '✓';
        position: absolute;
        top: 6px;
        right: 8px;
        font-size: 11px;
        color: var(--app-primary, #2080f0);
        font-weight: 700;
      }
    }
  }

  /* 卡片内的迷你布局预览 */
  .card-preview {
    display: flex;
    width: 100%;
    height: 52px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.08);

    .preview-sidebar {
      width: 28%;
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 5px 4px;
      flex-shrink: 0;
    }

    .preview-item {
      height: 6px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.15);

      &.active {
        background: rgba(255, 255, 255, 0.6);
      }
    }

    .preview-content {
      flex: 1;
      background: #f5f5f5;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 5px 6px;
    }

    .preview-header {
      height: 8px;
      border-radius: 2px;
      background: #e8e8e8;
    }

    .preview-body {
      flex: 1;
      border-radius: 2px;
      background: #ffffff;
      border: 1px solid #eee;
    }
  }

  /* 标准模式（白色侧边栏）的预览适配 */
  .menu-style-card:nth-child(2) .card-preview {
    .preview-sidebar {
      border-right: 1px solid rgba(0, 0, 0, 0.06);
    }

    .preview-item {
      background: rgba(0, 0, 0, 0.08);

      &.active {
        background: rgba(32, 128, 240, 0.2);
      }
    }
  }

  .card-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--n-text-color);
    line-height: 1;
  }

  .card-desc {
    font-size: 11px;
    color: var(--n-text-color-3, #999);
    line-height: 1;
  }

  /* 暗色模式适配 */
  [data-theme='dark'] .card-preview {
    border-color: rgba(255, 255, 255, 0.08);

    .preview-content {
      background: #2a2a2a;
    }

    .preview-header {
      background: #383838;
    }

    .preview-body {
      background: #333;
      border-color: #444;
    }
  }
</style>
