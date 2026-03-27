import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { federation } from '@module-federation/vite'

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, '../../envs', '')

  return {
    plugins: [
      vue(),
      // 🔮 作为 Host 消费 robotAdmin 远程组件
      federation({
        name: 'logistics',
        filename: 'remoteEntry.js',
        remotes: {
          robotAdmin: {
            type: 'module',
            name: 'robotAdmin',
            entry:
              env.VITE_MF_REMOTE_URL || 'http://localhost:1988/remoteEntry.js',
          },
        },
        // 共享依赖 — 与主应用保持一致
        shared: {
          vue: { singleton: true, requiredVersion: '^3.5.0' },
          'vue-router': { singleton: true },
          pinia: { singleton: true },
          'naive-ui': { singleton: true },
          '@vueuse/core': { singleton: true },
          '@iconify/vue': { singleton: true },
          '@robot-admin/naive-ui-components': { singleton: true },
          '@robot-admin/request-core': { singleton: true },
          '@robot-admin/directives': { singleton: true },
        },
      }),
    ],

    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        '@federation': new URL('../../federation', import.meta.url).pathname,
      },
    },

    server: {
      port: 2001,
      host: '0.0.0.0',
      cors: true,
      origin: 'http://localhost:2001',
    },

    build: {
      target: 'esnext',
      outDir: 'dist',
    },
  }
})
