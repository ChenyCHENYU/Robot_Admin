/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\src\utils\unocss\icon-safelist.ts
 * @Description: 外部组件库中无法由 UnoCSS 扫描到的图标类契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/**
 * @robot-admin/naive-ui-components 0.11.x 仍使用的 UnoCSS 图标类。
 * 删除项前必须先确认组件库产物已不再引用，避免按需入口出现无图标回归。
 */
export const iconSafelist = [
  'i-mdi:align-horizontal-left',
  'i-mdi:align-horizontal-right',
  'i-mdi:arrow-left-right-bold',
  'i-mdi:check',
  'i-mdi:chevron-down',
  'i-mdi:chevron-up',
  'i-mdi:clock-time-four-outline',
  'i-mdi:close',
  'i-mdi:delete-outline',
  'i-mdi:drag-vertical',
  'i-mdi:file-document-outline',
  'i-mdi:inbox-outline',
  'i-mdi:magnify',
  'i-mdi:menu',
  'i-mdi:refresh',
  'i-mdi:search',
  'i-mdi:tally-mark-5',
] as const
