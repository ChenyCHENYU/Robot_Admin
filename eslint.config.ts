/*
 * ESLint Flat Config — Monorepo Root
 * 覆盖 packages/ 及根目录文件
 * 各 app 拥有独立的 eslint.config.ts（自动继承 shared-config 工厂）
 */
import { createEslintConfig } from '@robot-admin/shared-config/eslint'

export default createEslintConfig({
  extraIgnores: ['apps/**'],
})
