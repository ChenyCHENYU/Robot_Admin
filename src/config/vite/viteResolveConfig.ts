import { fileURLToPath, URL } from 'node:url'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

// 🔗 只在明确指定时才使用本地包（避免版本不一致问题）
const getLocalPackages = () => {
  // 只有设置环境变量才检测本地包
  if (process.env.USE_LOCAL_PACKAGES !== 'true') return {}

  const localPath = resolve(process.cwd(), '../robot-admin-packages/packages')
  if (!existsSync(localPath)) {
    console.warn('⚠️  未找到本地包目录，将使用 npm 包')
    return {}
  }

  console.log('\n🔗 使用本地包进行开发调试：')
  const aliases: Record<string, string> = {}

  readdirSync(localPath).forEach(pkg => {
    const srcPath = resolve(localPath, pkg, 'src')
    if (existsSync(srcPath)) {
      aliases[`@robot-admin/${pkg}`] = srcPath
      console.log(`  ✓ @robot-admin/${pkg}`)
    }
  })

  return aliases
}

export default {
  alias: {
    '@': fileURLToPath(new URL('../../../src', import.meta.url)),
    _views: fileURLToPath(new URL('../../../src/views', import.meta.url)),
    ...getLocalPackages(), // 仅在 dev:local 时注入
  },

  // ⚡ 优化扩展名解析顺序（Vite 7 性能优化）
  // 默认: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  // 优化: 保留必要扩展名（.mjs 用于 naive-ui/es），按使用频率排序
  extensions: ['.vue', '.ts', '.tsx', '.js', '.mjs', '.json'],
}
