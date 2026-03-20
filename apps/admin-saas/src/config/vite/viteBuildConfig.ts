import type { BuildOptions } from 'vite'

const buildConfig: BuildOptions = {
  // 减少构建时的无意义警告和耗时统计
  chunkSizeWarningLimit: 800,
  reportCompressedSize: false,

  // Vite 8: rollupOptions → rolldownOptions（Rolldown 替代 Rollup）
  rolldownOptions: {
    output: {
      /**
       * Vite 8 手动分包配置
       * 使用 Rolldown codeSplitting 替代已移除的对象形式 manualChunks
       * @see https://rolldown.rs/in-depth/manual-code-splitting
       */
      codeSplitting: {
        groups: [
          // Vue 核心生态
          {
            name: 'vue-vendor',
            test: /[\\/]node_modules[\\/](vue|vue-router|pinia)[\\/]/,
          },
          // UI 组件库
          { name: 'ui-vendor', test: /[\\/]node_modules[\\/]naive-ui[\\/]/ },
          // 编辑器相关
          {
            name: 'editor-vendor',
            test: /[\\/]node_modules[\\/](@kangc[\\/]v-md-editor|wangeditor|highlight\.js)[\\/]/,
          },
          // ECharts 可视化
          {
            name: 'echarts-vendor',
            test: /[\\/]node_modules[\\/]echarts[\\/]/,
          },
          // Office 文档处理
          {
            name: 'office-vendor',
            test: /[\\/]node_modules[\\/](xlsx|mammoth)[\\/]/,
          },
          // 日历组件
          {
            name: 'calendar-vendor',
            test: /[\\/]node_modules[\\/]@fullcalendar[\\/]/,
          },
          // 3D 渲染
          {
            name: 'spline-vendor',
            test: /[\\/]node_modules[\\/]@splinetool[\\/]/,
          },
          // 流程图/图编辑器
          {
            name: 'graph-vendor',
            test: /[\\/]node_modules[\\/](@antv[\\/]x6|@vue-flow[\\/]core)[\\/]/,
          },
          // 可视化库
          { name: 'viz-vendor', test: /[\\/]node_modules[\\/]@visactor[\\/]/ },
        ],
      },

      /**
       * Vite 8: esbuild.drop 迁移到 Rolldown/Oxc 压缩选项
       * 生产构建时移除 console 和 debugger 语句
       * @see https://oxc.rs/docs/guide/usage/minifier/dead-code-elimination
       */
      minify: {
        compress: {
          dropConsole: true,
          dropDebugger: true,
        },
      },

      // 优化文件组织结构
      chunkFileNames: 'js/[name]-[hash].js',
      entryFileNames: 'js/[name]-[hash].js',
      assetFileNames: (assetInfo: { name?: string }) => {
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
}

export default buildConfig
