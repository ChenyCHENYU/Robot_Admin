/** 首次检出时生成 Vite 插件维护的自动导入与组件声明。 */
import { existsSync } from 'node:fs'

const declarations = [
  'src/types/auto-imports.d.ts',
  'src/types/components.d.ts',
]

if (!declarations.every(existsSync)) {
  const { build } = await import('vite')
  await build({ configFile: 'vite.config.ts', configLoader: 'native', mode: 'production' })
}
