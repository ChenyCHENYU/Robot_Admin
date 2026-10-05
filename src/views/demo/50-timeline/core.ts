/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\50-timeline\core.ts
 * @Description: 从实际 Changelog 提取发布记录
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export interface ReleaseRecord {
  version: string
  date: string
  notes: string[]
}
/** 提取标准版本标题，跳过未发布内容，并保留文件中的先后顺序。 */
export function parseReleaseRecords(markdown: string): ReleaseRecord[] {
  const headings = [
    ...markdown.matchAll(/^## \[([\d.]+)\][^\n]*\((\d{4}-\d{2}-\d{2})\)\s*$/gm),
  ]
  return headings.map((match, index) => ({
    version: match[1],
    date: match[2],
    notes: markdown
      .slice(
        (match.index || 0) + match[0].length,
        headings[index + 1]?.index || markdown.length
      )
      .split('\n')
      .filter(line => line.startsWith('- '))
      .map(line => line.replace(/^- /, '').replace(/\*\*|`/g, '')),
  }))
}
/** 时间线内容支持 HTML；文件说明先转义，再加入明确的段落结构。 */
export function releaseNotesHtml(notes: string[]): string {
  const escapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return notes
    .map(note => `<p>${note.replace(/[&<>"']/g, char => escapes[char])}</p>`)
    .join('')
}
