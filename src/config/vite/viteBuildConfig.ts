import type { BuildOptions } from 'vite'

// 第三方库分包映射
const VENDOR_CHUNKS: Record<string, string[]> = {
  'vue-vendor': ['vue', 'pinia', 'vue-router'],
  'ui-vendor': ['naive-ui'],
  'charts-vendor': ['echarts', '@antv/x6', '@vue-flow', '@visactor'],
  'editor-vendor': ['@kangc/v-md-editor', 'wangeditor', 'highlight.js'],
  'office-vendor': ['xlsx', 'mammoth', 'file-saver', 'jszip'],
  'calendar-vendor': ['@fullcalendar'],
  'spline-vendor': ['@splinetool'],
}

// 视图分包映射
const VIEW_CHUNKS: Record<string, string> = {
  '/views/home/': 'views-primary',
  '/views/dashboard/': 'views-primary',
  '/views/sys-manage/': 'views-system',
  '/views/demo/': 'views-demo',
}

const buildConfig: BuildOptions = {
  // 减少构建时的无意义警告和耗时统计
  chunkSizeWarningLimit: 800,
  reportCompressedSize: false,

  rollupOptions: {
    output: {
      /**
       * 智能分包策略 - 替代 Vite 7 移除的 splitVendorChunkPlugin
       * 作用：分离稳定的第三方库（利用浏览器缓存）和按业务模块分包
       */
      manualChunks(id) {
        // 1. 第三方库分包
        if (id.includes('node_modules')) {
          for (const [chunk, keywords] of Object.entries(VENDOR_CHUNKS)) {
            if (keywords.some(keyword => id.includes(keyword))) {
              return chunk
            }
          }
          return 'vendor-misc'
        }

        // 2. 视图组件分包
        for (const [path, chunk] of Object.entries(VIEW_CHUNKS)) {
          if (id.includes(path)) return chunk
        }

        // 3. 其他视图按目录分包
        const match = id.match(/\/views\/([^/]+)/)
        return match ? `views-${match[1]}` : undefined
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
