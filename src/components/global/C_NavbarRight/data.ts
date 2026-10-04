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
      popover: {
        title: '欢迎使用 Robot Admin',
        illustration: 'overview',
        description:
          '接下来认识常用入口：导航、搜索、页面标签和工作空间。你可以随时点击“跳过引导”，之后再从右上角“功能引导”重新查看。',
      },
    },
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
      element: '.enterprise-overview',
      popover: {
        title: '了解当前工作空间',
        illustration: 'overview',
        description:
          '首页显示当前公司与角色、项目版本、可访问页面数和关联公司数。页面数随当前公司的权限变化，帮助你确认正在使用的工作空间。',
        side: 'bottom',
      },
    },
    {
      element: '[data-guide="notifications"]',
      popover: {
        title: '查看通知消息',
        illustration: 'notification',
        description:
          '点击铃铛打开消息中心，可按分类查看消息、阅读详情和处理未读状态。消息中的跳转操作会打开对应页面。',
        side: 'bottom',
      },
    },
    {
      element: '[data-guide="fullscreen"]',
      popover: {
        title: '专注全屏工作',
        illustration: 'fullscreen',
        description:
          '点击此按钮进入或退出浏览器全屏，在查看大屏、图表或复杂表格时获得更大的工作区域。也可以按 Esc 退出全屏。',
        side: 'bottom',
      },
    },
    {
      element: '[data-guide="language"]',
      popover: {
        title: '切换界面语言',
        illustration: 'language',
        description:
          '从语言菜单选择界面语言，菜单标题和已配置翻译的界面文案会随之更新。业务数据仍由对应页面和服务提供。',
        side: 'bottom',
      },
    },
    {
      element: '[data-guide="theme"]',
      popover: {
        title: '选择舒适的主题',
        illustration: 'theme',
        description:
          '点击此按钮在跟随系统、浅色和深色模式之间切换。页面与引导弹层会一起适配主题，偏好会保存在当前浏览器。',
        side: 'bottom',
      },
    },
    {
      element: '[data-guide="settings"]',
      popover: {
        title: '调整布局与偏好',
        illustration: 'settings',
        description:
          '打开布局配置，可以选择六种导航布局，并调整菜单、标签页和外观偏好。关闭的界面区域会自动从引导中跳过。',
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
    {
      element: '[data-guide="guide"]',
      popover: {
        title: '随时回来查看引导',
        illustration: 'navigation',
        description:
          '这就是功能引导入口，想了解操作时点击即可重新查看。现在可以点击“开始使用”，也可以直接跳过，按自己的节奏使用系统。',
        side: 'bottom',
      },
    },
  ]
}
