/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-02
 * @Description: 组件预览路由 - 免登录白名单路由
 * 用于文档站通过 iframe 嵌入真实组件演示页面
 * 所有 /preview/* 路径无需登录即可访问，不走动态路由
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { RouteRecordRaw } from 'vue-router'

/**
 * 组件预览路由表
 * - 白名单免登录（permission.ts 中 /preview 前缀放行）
 * - 使用独立 PreviewLayout（无 admin 侧边栏/头部）
 * - 直接复用 views/demo 下已有的完整演示页面
 */
export const previewRoutes: RouteRecordRaw = {
  path: '/preview',
  name: 'preview',
  component: () => import('_views/preview/PreviewLayout.vue'),
  redirect: '/preview/icon',
  meta: { title: '组件预览', hidden: true },
  children: [
    // ==================== 基础组件 ====================
    {
      path: 'icon',
      name: 'preview-icon',
      component: () => import('_views/demo/01-icon/index.vue'),
      meta: { title: '图标' },
    },
    {
      path: 'cascade',
      name: 'preview-cascade',
      component: () => import('_views/demo/02-area-cascade/index.vue'),
      meta: { title: '级联选择' },
    },
    {
      path: 'progress',
      name: 'preview-progress',
      component: () => import('_views/demo/03-progress/index.vue'),
      meta: { title: '进度条' },
    },
    {
      path: 'time',
      name: 'preview-time',
      component: () => import('_views/demo/04-time/index.vue'),
      meta: { title: '时间选择' },
    },
    {
      path: 'date',
      name: 'preview-date',
      component: () => import('_views/demo/05-date/index.vue'),
      meta: { title: '日期选择' },
    },
    {
      path: 'city',
      name: 'preview-city',
      component: () => import('_views/demo/06-city/index.vue'),
      meta: { title: '城市选择' },
    },

    // ==================== 表单 ====================
    {
      path: 'form',
      name: 'preview-form',
      component: () => import('_views/demo/07-form/index.vue'),
      meta: { title: '表单' },
    },
    {
      path: 'form-search',
      name: 'preview-form-search',
      component: () => import('_views/demo/09-form-search/index.vue'),
      meta: { title: '搜索表单' },
    },

    // ==================== 表格 ====================
    {
      path: 'table',
      name: 'preview-table',
      component: () => import('_views/demo/10-table/index.vue'),
      meta: { title: '表格' },
    },

    // ==================== 操作/导航 ====================
    {
      path: 'action-bar',
      name: 'preview-action-bar',
      component: () => import('_views/demo/13-action-bar/index.vue'),
      meta: { title: '操作按钮组' },
    },
    {
      path: 'calendar',
      name: 'preview-calendar',
      component: () => import('_views/demo/13-calendar/index.vue'),
      meta: { title: '日历' },
    },
    {
      path: 'steps',
      name: 'preview-steps',
      component: () => import('_views/demo/31-steps/index.vue'),
      meta: { title: '步骤条' },
    },

    // ==================== 编辑器 ====================
    {
      path: 'code',
      name: 'preview-code',
      component: () => import('_views/demo/14-code-editor/index.vue'),
      meta: { title: '代码编辑器' },
    },
    {
      path: 'markdown',
      name: 'preview-markdown',
      component: () => import('_views/demo/15-markdown-editor/index.vue'),
      meta: { title: 'Markdown 编辑器' },
    },
    {
      path: 'editor',
      name: 'preview-editor',
      component: () => import('_views/demo/16-text-editor/index.vue'),
      meta: { title: '富文本编辑器' },
    },
    {
      path: 'formula-editor',
      name: 'preview-formula-editor',
      component: () => import('_views/demo/47-formula-editor/index.vue'),
      meta: { title: '公式编辑器' },
    },

    // ==================== 拖拽/布局 ====================
    {
      path: 'draggable',
      name: 'preview-draggable',
      component: () => import('_views/demo/20-dragable/index.vue'),
      meta: { title: '拖拽' },
    },
    {
      path: 'split-pane',
      name: 'preview-split-pane',
      component: () => import('_views/demo/43-split-pane/index.vue'),
      meta: { title: '分割面板' },
    },
    {
      path: 'collapse-panel',
      name: 'preview-collapse-panel',
      component: () => import('_views/demo/44-collapse-panel/index.vue'),
      meta: { title: '折叠面板' },
    },

    // ==================== 流程/图表 ====================
    {
      path: 'workflow',
      name: 'preview-workflow',
      component: () => import('_views/demo/28-work-flow-editor/index.vue'),
      meta: { title: '工作流' },
    },
    {
      path: 'antv',
      name: 'preview-antv',
      component: () => import('_views/demo/29-antv-x6-editor/index.vue'),
      meta: { title: 'AntV 图编辑' },
    },
    {
      path: 'vtable-gantt',
      name: 'preview-vtable-gantt',
      component: () => import('_views/demo/33-v-table-gantt/index.vue'),
      meta: { title: '甘特图' },
    },

    // ==================== 媒体/文件 ====================
    {
      path: 'file-preview',
      name: 'preview-file-preview',
      component: () => import('_views/demo/32-file-preview/index.vue'),
      meta: { title: '文件预览' },
    },
    {
      path: 'video-player',
      name: 'preview-video-player',
      component: () => import('_views/demo/37-video-player/index.vue'),
      meta: { title: '视频播放器' },
    },
    {
      path: 'upload',
      name: 'preview-upload',
      component: () => import('_views/demo/38-upload/index.vue'),
      meta: { title: '文件上传' },
    },
    {
      path: 'image-cropper',
      name: 'preview-image-cropper',
      component: () => import('_views/demo/45-image-cropper/index.vue'),
      meta: { title: '图片裁剪' },
    },

    // ==================== 数据展示 ====================
    {
      path: 'barcode',
      name: 'preview-barcode',
      component: () => import('_views/demo/35-barcode/index.vue'),
      meta: { title: '条形码' },
    },
    {
      path: 'qrcode',
      name: 'preview-qrcode',
      component: () => import('_views/demo/39-qrcode/index.vue'),
      meta: { title: '二维码' },
    },
    {
      path: 'map',
      name: 'preview-map',
      component: () => import('_views/demo/36-map/index.vue'),
      meta: { title: '地图' },
    },
    {
      path: 'signature',
      name: 'preview-signature',
      component: () => import('_views/demo/42-signature/index.vue'),
      meta: { title: '电子签名' },
    },
    {
      path: 'cron',
      name: 'preview-cron',
      component: () => import('_views/demo/46-cron/index.vue'),
      meta: { title: 'Cron 表达式' },
    },
    {
      path: 'waterfall',
      name: 'preview-waterfall',
      component: () => import('_views/demo/48-waterfall/index.vue'),
      meta: { title: '瀑布流' },
    },

    // ==================== 通讯 / 交互 ====================
    {
      path: 'chat',
      name: 'preview-chat',
      component: () => import('_views/demo/49-chat/index.vue'),
      meta: { title: '聊天' },
    },
    {
      path: 'timeline',
      name: 'preview-timeline',
      component: () => import('_views/demo/50-timeline/index.vue'),
      meta: { title: '时间线' },
    },
    {
      path: 'context-menu',
      name: 'preview-context-menu',
      component: () => import('_views/demo/51-context-menu/index.vue'),
      meta: { title: '右键菜单' },
    },
    {
      path: 'transfer',
      name: 'preview-transfer',
      component: () => import('_views/demo/52-transfer/index.vue'),
      meta: { title: '穿梭框' },
    },
    {
      path: 'avatar-group',
      name: 'preview-avatar-group',
      component: () => import('_views/demo/53-avatar-group/index.vue'),
      meta: { title: '头像组' },
    },
    {
      path: 'audio-player',
      name: 'preview-audio-player',
      component: () => import('_views/demo/54-audio-player/index.vue'),
      meta: { title: '音频播放器' },
    },
  ],
}
