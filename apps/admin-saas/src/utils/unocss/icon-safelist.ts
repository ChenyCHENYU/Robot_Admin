/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 14:12:17
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-03 16:51:38
 * @FilePath: \Robot_Admin\src\utils\unocss\icon-safelist.ts
 * @Description: 处理动态加载图标的白名单，配合unocss.config，解决按需加载无法动态的情况
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import * as IconsIconifyMdi from '@iconify-json/mdi'

// 这里的100是为了限制图标数量，避免过多的图标影响性能

export const iconSafelist = [
  // 原有动态生成的图标
  ...Object.entries(IconsIconifyMdi.chars)
    .slice(0, 100)
    .map(([, name]) => `i-mdi:${name}`),

  // 新增静态图标类名
  'i-mdi:home-assistant',
  'i-mdi:monitor-dashboard',
  'i-mdi:google-analytics',
  'i-mdi:face-man-profile',
  'i-mdi:ev-plug-chademo',
  'i-mdi:simple-icons',
  'i-mdi:multicast',
  'i-mdi:progress-helper',
  'i-mdi:clock-time-eight-outline',
  'i-mdi:weather-date',
  'i-mdi:city',
  'i-mdi:form',
  'i-mdi:form-outline',
  'i-mdi:form-dropdown',
  'i-mdi:file-table-outline',
  'i-mdi:file-table-box-multiple-outline',
  'i-mdi:table-pivot',
  'i-mdi:table-multiple',
  'i-mdi:calendar-month',
  'i-mdi:data-matrix-edit',
  'i-mdi:microsoft-visual-studio-code',
  'i-mdi:language-markdown',
  'i-mdi:text-shadow',
  'i-mdi:file-export-outline',
  'i-mdi:drag-variant',
  'i-mdi:alpha-t-circle',
  'i-mdi:directions',
  'i-mdi:content-copy',
  'i-mdi:watermark',
  'i-mdi:drag',
  'i-mdi:debian',
  'i-mdi:bathroom-tap',
  'i-mdi:hand-double-tap',
  'i-mdi:user-tie',
  'i-mdi:user-badge',
  'i-mdi:user-group',
  'i-mdi:account-multiple-check-outline',
  'i-mdi:microsoft-windows',
  'i-mdi:menu-open',
  'i-mdi:microsoft-excel',
  'i-mdi:iframe-array',
  'i-mdi:file-document-edit',
  'i-mdi:file-document-box-search',
  'i-mdi:github',
  'i-mdi:gitlab',
  'i-mdi:text-box-search-outline',
]
