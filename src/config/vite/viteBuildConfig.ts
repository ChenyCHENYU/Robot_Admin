import type { BuildOptions } from 'vite'

const buildConfig: BuildOptions = {
  // 减少构建时的无意义警告和耗时统计
  chunkSizeWarningLimit: 800,
  reportCompressedSize: false,

  rollupOptions: {
    output: {
      /**
       * 手动分包配置 - 稳定版本
       * 使用对象方式明确指定每个包的模块，避免模糊匹配导致的问题
       */
      manualChunks: {
        // Vue 核心生态
        'vue-vendor': ['vue', 'vue-router', 'pinia'],

        // UI 组件库
        'ui-vendor': ['naive-ui'],

        // 编辑器相关（不包含 echarts，避免冲突）
        'editor-vendor': ['@kangc/v-md-editor', 'wangeditor', 'highlight.js'],

        // Office 文档处理
        'office-vendor': ['xlsx', 'mammoth'],

        // 日历组件
        'calendar-vendor': [
          '@fullcalendar/core',
          '@fullcalendar/vue3',
          '@fullcalendar/daygrid',
          '@fullcalendar/interaction',
          '@fullcalendar/list',
        ],

        // 3D 渲染
        'spline-vendor': ['@splinetool/runtime'],

        // 流程图/图编辑器
        'graph-vendor': ['@antv/x6', '@vue-flow/core'],

        // 可视化库
        'viz-vendor': ['@visactor/vtable-gantt'],
      },

      // 优化文件组织结构
      chunkFileNames: 'js/[name]-[hash].js',
      entryFileNames: 'js/[name]-[hash].js',
      assetFileNames: assetInfo => {
        const name = assetInfo.name || ''

        // 按文件类型分目录
        if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) {
          return 'images/[name]-[hash].[ext]'
        }
        if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
          return 'fonts/[name]-[hash].[ext]'
        }
        if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i.test(name)) {
          return 'media/[name]-[hash].[ext]'
        }

        return 'assets/[name]-[hash].[ext]'
      },
    },
  },
} as const

export default buildConfig
