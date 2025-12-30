import type { BuildOptions } from 'vite'

const buildConfig: BuildOptions = {
  // Module Federation 支持
  target: 'esnext', // 🆕 支持 top-level await

  // 减少构建时的无意义警告和耗时统计
  chunkSizeWarningLimit: 800,
  reportCompressedSize: false,

  rollupOptions: {
    output: {
      /**
       * 手动分包配置 - 🔴 Module Federation 模式下禁用 manualChunks
       * 原因：manualChunks 会导致 federation 构建后白屏
       * 参考：https://github.com/originjs/vite-plugin-federation/issues/711
       */
      // manualChunks 在使用 Module Federation 时会导致白屏，已禁用

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
