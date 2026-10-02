/** 首次检出时生成 Vite 插件维护的自动导入与组件声明。 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const generatedDeclarations = [
  'src/types/auto-imports.d.ts',
  'src/types/components.d.ts',
]

if (!generatedDeclarations.every(existsSync)) {
  const build = spawnSync(process.execPath, ['run', 'build'], {
    cwd: process.cwd(),
    stdio: 'inherit',
  })
  if (build.status !== 0) process.exit(build.status ?? 1)
}
