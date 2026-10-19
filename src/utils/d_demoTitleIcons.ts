/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 来自已安装 Iconify 图标集的演示标题图标，离线直接绘制
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { IconifyIcon } from '@iconify/vue'
// 新增标题图标时同步维护此静态映射；未知名称使用文档图标，避免空白。
export const DEMO_TITLE_ICONS: Record<string, IconifyIcon> = {
  'mdi:account-group': {
    body: '<path fill="currentColor" d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"/>',
    width: 24,
    height: 24,
  },
  'mdi:barcode': {
    body: '<path fill="currentColor" d="M2 6h2v12H2zm3 0h1v12H5zm2 0h3v12H7zm4 0h1v12h-1zm3 0h2v12h-2zm3 0h3v12h-3zm4 0h1v12h-1z"/>',
    width: 24,
    height: 24,
  },
  'mdi:calendar': {
    body: '<path fill="currentColor" d="M19 19H5V8h14m-3-7v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1m-1 11h-5v5h5z"/>',
    width: 24,
    height: 24,
  },
  'mdi:chart-donut': {
    body: '<path fill="currentColor" d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92c0 .9-.18 1.75-.5 2.54l2.62 1.53c.56-1.24.88-2.62.88-4.07c0-5.18-3.95-9.45-9-9.95M12 19a7 7 0 0 1-7-7c0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95a10 10 0 0 0 10 10c3.3 0 6.23-1.61 8.05-4.09l-2.6-1.53A6.89 6.89 0 0 1 12 19"/>',
    width: 24,
    height: 24,
  },
  'mdi:city': {
    body: '<path fill="currentColor" d="M19 15h-2v-2h2m0 6h-2v-2h2M13 7h-2V5h2m0 6h-2V9h2m0 6h-2v-2h2m0 6h-2v-2h2m-6-6H5V9h2m0 6H5v-2h2m0 6H5v-2h2m8-6V5l-3-3l-3 3v2H3v14h18V11z"/>',
    width: 24,
    height: 24,
  },
  'mdi:clock-outline': {
    body: '<path fill="currentColor" d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z"/>',
    width: 24,
    height: 24,
  },
  'mdi:cloud-download': {
    body: '<path fill="currentColor" d="M6.5 20q-2.28 0-3.89-1.57Q1 16.85 1 14.58q0-1.95 1.17-3.48q1.18-1.53 3.08-1.95q.58-2.02 2.14-3.4Q8.95 4.38 11 4.08v8.07L9.4 10.6L8 12l4 4l4-4l-1.4-1.4l-1.6 1.55V4.08q2.58.35 4.29 2.31T19 11q1.73.2 2.86 1.5q1.14 1.28 1.14 3q0 1.88-1.31 3.19T18.5 20Z"/>',
    width: 24,
    height: 24,
  },
  'mdi:content-copy': {
    body: '<path fill="currentColor" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"/>',
    width: 24,
    height: 24,
  },
  'mdi:drag': {
    body: '<path fill="currentColor" d="M7 19v-2h2v2zm4 0v-2h2v2zm4 0v-2h2v2zm-8-4v-2h2v2zm4 0v-2h2v2zm4 0v-2h2v2zm-8-4V9h2v2zm4 0V9h2v2zm4 0V9h2v2zM7 7V5h2v2zm4 0V5h2v2zm4 0V5h2v2z"/>',
    width: 24,
    height: 24,
  },
  'mdi:drag-variant': {
    body: '<path fill="currentColor" d="m22.67 12l-4.49 4.5l-2.51-2.5l1.98-2l-1.98-1.96l2.51-2.51zM12 1.33l4.47 4.49l-2.51 2.51L12 6.35l-2 1.98l-2.5-2.51zm0 21.34l-4.47-4.49l2.51-2.51L12 17.65l2-1.98l2.5 2.51zM1.33 12l4.49-4.5L8.33 10l-1.98 2l1.98 1.96l-2.51 2.51zM12 10a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"/>',
    width: 24,
    height: 24,
  },
  'mdi:file-document-outline': {
    body: '<path fill="currentColor" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 2h7v5h5v11H6zm2 8v2h8v-2zm0 4v2h5v-2z"/>',
    width: 24,
    height: 24,
  },
  'mdi:file-tree-outline': {
    body: '<path fill="currentColor" d="M12 13H7v5h5v2H5V10h2v1h5zM8 4v2H4V4zm2-2H2v6h8zm10 9v2h-4v-2zm2-2h-8v6h8zm-2 9v2h-4v-2zm2-2h-8v6h8z"/>',
    width: 24,
    height: 24,
  },
  'mdi:folder-open-outline': {
    body: '<path fill="currentColor" d="M6.1 10L4 18V8h17a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h15c.9 0 1.7-.6 1.9-1.5l2.3-8.5zM19 18H6l1.6-6h13z"/>',
    width: 24,
    height: 24,
  },
  'mdi:folder-zip': {
    body: '<path fill="currentColor" d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m-2 6h-2v2h2v2h-2v2h-2v-2h2v-2h-2v-2h2v-2h-2V8h2v2h2z"/>',
    width: 24,
    height: 24,
  },
  'mdi:form-dropdown': {
    body: '<path fill="currentColor" d="M17 5h3l-1.5 2zM3 2h18a2 2 0 0 1 2 2v4c0 1.11-.89 2-2 2h-5v10c0 1.11-.89 2-2 2H3a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2m0 2v4h11V4zm18 4V4h-5v4zM3 20h11V10H3zm2-8h7v2H5zm0 4h7v2H5z"/>',
    width: 24,
    height: 24,
  },
  'mdi:form-select': {
    body: '<path fill="currentColor" d="M15 5h3l-1.5 2zM5 2h14a2 2 0 0 1 2 2v16c0 1.11-.89 2-2 2H5a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2m0 2v4h14V4zm0 16h14V10H5zm2-8h10v2H7zm0 4h10v2H7z"/>',
    width: 24,
    height: 24,
  },
  'mdi:gesture-tap-button': {
    body: '<path fill="currentColor" d="M13 5c2.21 0 4 1.79 4 4c0 1.5-.8 2.77-2 3.46v-1.22c.61-.55 1-1.35 1-2.24c0-1.66-1.34-3-3-3s-3 1.34-3 3c0 .89.39 1.69 1 2.24v1.22C9.8 11.77 9 10.5 9 9c0-2.21 1.79-4 4-4m7 15.5c-.03.82-.68 1.47-1.5 1.5H13c-.38 0-.74-.15-1-.43l-4-4.2l.74-.77c.19-.21.46-.32.76-.32h.2L12 18V9c0-.55.45-1 1-1s1 .45 1 1v4.47l1.21.13l3.94 2.19c.53.24.85.77.85 1.35zM20 2H4c-1.1 0-2 .9-2 2v8a2 2 0 0 0 2 2h4v-2H4V4h16v8h-2v2h2v-.04l.04.04c1.09 0 1.96-.91 1.96-2V4a2 2 0 0 0-2-2"/>',
    width: 24,
    height: 24,
  },
  'mdi:gesture-tap-hold': {
    body: '<path fill="currentColor" d="M10 9a1 1 0 0 1 1-1a1 1 0 0 1 1 1v4.47l1.21.13l4.94 2.19c.53.24.85.77.85 1.35v4.36c-.03.82-.68 1.47-1.5 1.5H11c-.38 0-.74-.15-1-.43l-4.9-4.2l.74-.77c.19-.21.46-.32.74-.32h.22L10 19zm-1 3.44V9a2 2 0 0 1 2-2a2 2 0 0 1 2 2v3.44c1.19-.69 2-1.97 2-3.44a4 4 0 0 0-4-4a4 4 0 0 0-4 4c0 1.47.81 2.75 2 3.44"/>',
    width: 24,
    height: 24,
  },
  'mdi:magnify': {
    body: '<path fill="currentColor" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"/>',
    width: 24,
    height: 24,
  },
  'mdi:map-marker-multiple': {
    body: '<path fill="currentColor" d="M14 11.5A2.5 2.5 0 0 0 16.5 9A2.5 2.5 0 0 0 14 6.5A2.5 2.5 0 0 0 11.5 9a2.5 2.5 0 0 0 2.5 2.5M14 2c3.86 0 7 3.13 7 7c0 5.25-7 13-7 13S7 14.25 7 9a7 7 0 0 1 7-7M5 9c0 4.5 5.08 10.66 6 11.81L10 22S3 14.25 3 9c0-3.17 2.11-5.85 5-6.71C6.16 3.94 5 6.33 5 9"/>',
    width: 24,
    height: 24,
  },
  'mdi:microsoft-excel': {
    body: '<path fill="currentColor" d="M21.17 3.25q.33 0 .59.25q.24.24.24.58v15.84q0 .34-.24.58q-.26.25-.59.25H7.83q-.33 0-.59-.25q-.24-.24-.24-.58V17H2.83q-.33 0-.59-.24Q2 16.5 2 16.17V7.83q0-.33.24-.59Q2.5 7 2.83 7H7V4.08q0-.34.24-.58q.26-.25.59-.25M7 13.06l1.18 2.22h1.79L8 12.06l1.93-3.17H8.22L7.13 10.9l-.04.06l-.03.07q-.26-.53-.56-1.07q-.25-.53-.53-1.07H4.16l1.89 3.19L4 15.28h1.78m8.1 4.22V17H8.25v2.5m5.63-3.75v-3.12H12v3.12m1.88-4.37V8.25H12v3.13M13.88 7V4.5H8.25V7m12.5 12.5V17h-5.62v2.5m5.62-3.75v-3.12h-5.62v3.12m5.62-4.37V8.25h-5.62v3.13M20.75 7V4.5h-5.62V7Z"/>',
    width: 24,
    height: 24,
  },
  'mdi:palette-outline': {
    body: '<path fill="currentColor" d="M12 22A10 10 0 0 1 2 12A10 10 0 0 1 12 2c5.5 0 10 4 10 9a6 6 0 0 1-6 6h-1.8c-.3 0-.5.2-.5.5c0 .1.1.2.1.3c.4.5.6 1.1.6 1.7c.1 1.4-1 2.5-2.4 2.5m0-18a8 8 0 0 0-8 8a8 8 0 0 0 8 8c.3 0 .5-.2.5-.5c0-.2-.1-.3-.1-.4c-.4-.5-.6-1-.6-1.6c0-1.4 1.1-2.5 2.5-2.5H16a4 4 0 0 0 4-4c0-3.9-3.6-7-8-7m-5.5 6c.8 0 1.5.7 1.5 1.5S7.3 13 6.5 13S5 12.3 5 11.5S5.7 10 6.5 10m3-4c.8 0 1.5.7 1.5 1.5S10.3 9 9.5 9S8 8.3 8 7.5S8.7 6 9.5 6m5 0c.8 0 1.5.7 1.5 1.5S15.3 9 14.5 9S13 8.3 13 7.5S13.7 6 14.5 6m3 4c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5"/>',
    width: 24,
    height: 24,
  },
  'mdi:qrcode': {
    body: '<path fill="currentColor" d="M3 11h2v2H3zm8-6h2v4h-2zm-2 6h4v4h-2v-2H9zm6 0h2v2h2v-2h2v2h-2v2h2v4h-2v2h-2v-2h-4v2h-2v-4h4v-2h2v-2h-2zm4 8v-4h-2v4zM15 3h6v6h-6zm2 2v2h2V5zM3 3h6v6H3zm2 2v2h2V5zM3 15h6v6H3zm2 2v2h2v-2z"/>',
    width: 24,
    height: 24,
  },
  'mdi:shield-check-outline': {
    body: '<path fill="currentColor" d="M21 11c0 5.55-3.84 10.74-9 12c-5.16-1.26-9-6.45-9-12V5l9-4l9 4zm-9 10c3.75-1 7-5.46 7-9.78V6.3l-7-3.12L5 6.3v4.92C5 15.54 8.25 20 12 21m-2-4l-4-4l1.41-1.41L10 14.17l6.59-6.59L18 9"/>',
    width: 24,
    height: 24,
  },
  'mdi:speedometer': {
    body: '<path fill="currentColor" d="M12 16a3 3 0 0 1-3-3c0-1.12.61-2.1 1.5-2.61l9.71-5.62l-5.53 9.58c-.5.98-1.51 1.65-2.68 1.65m0-13c1.81 0 3.5.5 4.97 1.32l-2.1 1.21C14 5.19 13 5 12 5a8 8 0 0 0-8 8c0 2.21.89 4.21 2.34 5.65h.01c.39.39.39 1.02 0 1.41s-1.03.39-1.42.01A9.97 9.97 0 0 1 2 13A10 10 0 0 1 12 3m10 10c0 2.76-1.12 5.26-2.93 7.07c-.39.38-1.02.38-1.41-.01a.996.996 0 0 1 0-1.41A7.95 7.95 0 0 0 20 13c0-1-.19-2-.54-2.9L20.67 8C21.5 9.5 22 11.18 22 13"/>',
    width: 24,
    height: 24,
  },
  'mdi:steering': {
    body: '<path fill="currentColor" d="M13 19.92c1.8-.22 3.35-.97 4.65-2.27S19.7 14.8 19.92 13h-3c-.22 1-.68 1.84-1.38 2.54S14 16.7 13 16.92zM10 8h4l3 3h2.92c-.25-1.95-1.13-3.62-2.65-5C15.76 4.66 14 4 12 4s-3.76.66-5.27 2c-1.52 1.38-2.4 3.05-2.65 5H7zm1 11.92v-3c-1-.22-1.84-.68-2.54-1.38S7.3 14 7.08 13h-3c.22 1.77.97 3.3 2.27 4.6S9.2 19.67 11 19.92M12 2c2.75 0 5.1 1 7.05 2.95S22 9.25 22 12s-1 5.1-2.95 7.05S14.75 22 12 22s-5.1-1-7.05-2.95S2 14.75 2 12s1-5.1 2.95-7.05S9.25 2 12 2"/>',
    width: 24,
    height: 24,
  },
  'mdi:table': {
    body: '<path fill="currentColor" d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m0 4v4h6V8zm8 0v4h6V8zm-8 6v4h6v-4zm8 0v4h6v-4z"/>',
    width: 24,
    height: 24,
  },
  'mdi:table-arrow-down': {
    body: '<path fill="currentColor" d="M4 3h14a2 2 0 0 1 2 2v7.08a6 6 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4zm11.94 5.5h2v-4h2v4h2l-3 3z"/>',
    width: 24,
    height: 24,
  },
  'mdi:table-large': {
    body: '<path fill="currentColor" d="M4 3h16a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 4v3h4V7zm6 0v3h4V7zm10 3V7h-4v3zM4 12v3h4v-3zm0 8h4v-3H4zm6-8v3h4v-3zm0 8h4v-3h-4zm10 0v-3h-4v3zm0-8h-4v3h4z"/>',
    width: 24,
    height: 24,
  },
  'mdi:table-sync': {
    body: '<path fill="currentColor" d="M19 12v1.5c2.21 0 4 1.79 4 4c0 .82-.24 1.58-.67 2.21l-1.09-1.09c.17-.34.26-.72.26-1.12A2.5 2.5 0 0 0 19 15v1.5l-2.25-2.25zm0 11v-1.5c-2.21 0-4-1.79-4-4c0-.82.25-1.58.67-2.21l1.09 1.09c-.17.34-.26.72-.26 1.12A2.5 2.5 0 0 0 19 20v-1.5l2.25 2.25zM4 3h14a2 2 0 0 1 2 2v6h-.5c-1.84 0-3.5.77-4.69 2H12v4h1v.5c0 .5.06 1 .17 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2m0 4v4h6V7zm8 0v4h6V7zm-8 6v4h6v-4z"/>',
    width: 24,
    height: 24,
  },
  'mdi:text-box-edit': {
    body: '<path fill="currentColor" d="M10 19.11L12.11 17H7v-2h7v.12L16.12 13H7v-2h10v1.12l1.24-1.23c.48-.48 1.11-.75 1.8-.75c.33 0 .66.07.96.19V5a2 2 0 0 0-2-2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h5zM7 7h10v2H7zm14.7 7.35l-1 1l-2.05-2.05l1-1a.55.55 0 0 1 .77 0l1.28 1.28c.21.21.21.56 0 .77M12 19.94l6.06-6.06l2.05 2.05L14.06 22H12z"/>',
    width: 24,
    height: 24,
  },
  'mdi:timer-outline': {
    body: '<path fill="currentColor" d="M12 20a7 7 0 0 1-7-7a7 7 0 0 1 7-7a7 7 0 0 1 7 7a7 7 0 0 1-7 7m7.03-12.61l1.42-1.42c-.45-.51-.9-.97-1.41-1.41L17.62 6c-1.55-1.26-3.5-2-5.62-2a9 9 0 0 0-9 9a9 9 0 0 0 9 9c5 0 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61M11 14h2V8h-2m4-7H9v2h6z"/>',
    width: 24,
    height: 24,
  },
  'mdi:video-outline': {
    body: '<path fill="currentColor" d="M15 8v8H5V8zm1-2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4V7a1 1 0 0 0-1-1"/>',
    width: 24,
    height: 24,
  },
  'mdi:view-dashboard-outline': {
    body: '<path fill="currentColor" d="M19 5v2h-4V5zM9 5v6H5V5zm10 8v6h-4v-6zM9 17v2H5v-2zM21 3h-8v6h8zM11 3H3v10h8zm10 8h-8v10h8zm-10 4H3v6h8z"/>',
    width: 24,
    height: 24,
  },
  'mdi:view-split-vertical': {
    body: '<path fill="currentColor" d="M13 5h8v14h-8zM3 5h8v2H3zm0 6V9h8v2zm0 8v-2h8v2zm0-4v-2h8v2z"/>',
    width: 24,
    height: 24,
  },
  'mdi:watermark': {
    body: '<path fill="currentColor" d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16h-9v-6h9z"/>',
    width: 24,
    height: 24,
  },
}
