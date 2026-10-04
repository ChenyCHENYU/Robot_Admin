/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-04
 * @FilePath: \Robot_Admin\src\components\global\C_NavbarRight\data.ts
 * @Description: Robot Admin 引导的业务步骤与各布局目标；通用能力由 C_Guide 提供
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { GuideStep } from '@robot-admin/naive-ui-components/C_Guide'
import type { LayoutMode } from '@robot-admin/layout/naive'

const NAVIGATION_TARGETS: Record<LayoutMode, string> = {
  side: '[data-guide="navigation"] .n-submenu, [data-guide="navigation"] .n-menu-item',
  top: '.top-layout-container .navbar-center .n-menu',
  mix: '.mix-layout-container .first-menu-item',
  'mix-top': '.mix-top-layout-container .first-menu-item',
  'reverse-horizontal-mix':
    '.reverse-horizontal-mix-layout-container .navbar-center .n-menu',
  'card-layout': '.card-layout-container .hover-trigger-area',
}

/** 项目只配置业务内容，目标可见性、示意图、主题和实例生命周期交给组件库。 */
export function createWorkspaceGuideSteps(
  layout: LayoutMode,
  canSwitchCompany: boolean
): GuideStep[] {
  return [
    {
      element: NAVIGATION_TARGETS[layout],
      popover: {
        title: '找到功能入口',
        illustration: 'navigation',
        description:
          layout === 'card-layout'
            ? '鼠标移到这里可展开功能卡片，再选择需要打开的页面。'
            : layout === 'mix' || layout === 'mix-top'
              ? '先选择功能分组，再从展开的菜单中进入页面。菜单会随当前权限更新。'
              : '从菜单选择功能；带展开标记的分组包含更多页面。这里只显示当前权限可访问的入口。',
        side:
          layout === 'side' || layout === 'mix' || layout === 'mix-top'
            ? 'right'
            : 'bottom',
      },
    },
    {
      element: '[data-guide="search"]',
      popover: {
        title: '快速搜索功能',
        illustration: 'search',
        description:
          '点击搜索或按 Ctrl / ⌘ + K，输入页面名称，即可从有权限的功能中快速跳转。',
        side: 'bottom',
      },
    },
    {
      element: '[data-guide="tags"]',
      popover: {
        title: '管理已打开页面',
        illustration: 'tabs',
        description:
          '点击标签切换页面；右键标签可关闭其他页面、关闭右侧页面或刷新当前页面。',
        side: 'bottom',
      },
    },
    {
      element: '[data-guide="workspace"]',
      popover: {
        title: '确认公司与角色',
        illustration: 'account',
        description: canSwitchCompany
          ? '这里显示当前公司。点击头像查看身份与角色，并通过“切换公司”选择其他工作空间；切换后会重新加载权限和菜单。'
          : '这里显示当前登录身份与公司。点击头像可查看当前角色和工作空间信息。',
        side: 'bottom',
      },
    },
  ]
}
