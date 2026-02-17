/** 编程语言 → 图标 UnoCSS class 映射 */
export const LANGUAGE_ICON_MAP: Record<string, string> = {
  javascript: 'i-mdi:language-javascript',
  typescript: 'i-mdi:language-typescript',
  python: 'i-mdi:language-python',
  html: 'i-mdi:language-html5',
  css: 'i-mdi:language-css3',
  vue: 'i-mdi:vuejs',
  react: 'i-mdi:react',
  json: 'i-mdi:code-json',
  java: 'i-mdi:language-java',
  cpp: 'i-mdi:language-cpp',
  go: 'i-mdi:language-go',
  rust: 'i-mdi:language-rust',
  php: 'i-mdi:language-php',
  csharp: 'i-mdi:language-csharp',
  sql: 'i-mdi:database',
  yaml: 'i-mdi:file-code',
  xml: 'i-mdi:xml',
  markdown: 'i-mdi:language-markdown',
  bash: 'i-mdi:bash',
  shell: 'i-mdi:console',
  powershell: 'i-mdi:powershell',
  swift: 'i-mdi:language-swift',
  kotlin: 'i-mdi:language-kotlin',
  ruby: 'i-mdi:language-ruby',
}

/** 编程语言 → 显示标题映射 */
export const LANGUAGE_TITLE_MAP: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  csharp: 'C#',
  php: 'PHP',
  go: 'Go',
  rust: 'Rust',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  bash: 'Bash',
  shell: 'Shell',
  yaml: 'YAML',
  xml: 'XML',
  markdown: 'Markdown',
  sql: 'SQL',
  powershell: 'PowerShell',
  swift: 'Swift',
  kotlin: 'Kotlin',
  ruby: 'Ruby',
  vue: 'Vue',
  react: 'React',
}

/** 获取语言图标 class，未匹配返回默认图标 */
export const getLanguageIcon = (lang: string): string =>
  LANGUAGE_ICON_MAP[lang.toLowerCase()] || 'i-mdi:code-braces'

/** 获取语言显示标题，未匹配返回大写语言名 */
export const getLanguageTitle = (lang: string): string =>
  LANGUAGE_TITLE_MAP[lang.toLowerCase()] || lang.toUpperCase()
