import { fileURLToPath, URL } from 'node:url'

export default {
  alias: {
    '@': fileURLToPath(new URL('../../../src', import.meta.url)),
    _views: fileURLToPath(new URL('../../../src/views', import.meta.url)),
  },

  // ⚡ 优化扩展名解析顺序（Vite 7 性能优化）
  // 默认: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  // 优化: 保留必要扩展名（.mjs 用于 naive-ui/es），按使用频率排序
  extensions: ['.vue', '.ts', '.tsx', '.js', '.mjs', '.json'],
}
