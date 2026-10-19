/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 无外部资源依赖的设计灵感素材集
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { WaterFallItem } from '@robot-admin/naive-ui-components/C_WaterFall'
export interface GalleryItem extends WaterFallItem {
  category: string
}
const studies = [
  ['信息层级', '交互设计'],
  ['交付节奏', '工程实践'],
  ['数据视野', '数据表达'],
  ['组件秩序', '工程实践'],
  ['留白与节奏', '交互设计'],
  ['指标与口径', '数据表达'],
  ['状态反馈', '交互设计'],
  ['工作空间', '工程实践'],
  ['趋势的阅读', '数据表达'],
  ['节点与关系', '数据表达'],
  ['筛选与聚焦', '交互设计'],
  ['设计变量', '工程实践'],
  ['可访问体验', '交互设计'],
  ['质量的边界', '工程实践'],
  ['表格的密度', '数据表达'],
  ['清晰的路径', '交互设计'],
]
const palettes = [
  ['#182b48', '#95b8ed', '#e6edfa'],
  ['#e6dcd2', '#a17967', '#403b3d'],
  ['#dce9e5', '#4f8d7c', '#18463b'],
  ['#e7def1', '#8b6baf', '#392d51'],
]
/** 用仓库可控的矢量素材演示多种比例，不依赖随机远程图片。 */
export const GALLERY_ITEMS: GalleryItem[] = studies.map(
  ([title, category], index) => {
    const [bg, accent, ink] = palettes[index % palettes.length]
    const height = [520, 680, 460, 600][index % 4]
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="${height}" viewBox="0 0 640 ${height}"><rect width="640" height="${height}" fill="${bg}"/><path d="M40 100H600M40 ${height - 80}H600" stroke="${accent}" opacity=".5"/><text x="40" y="58" font-family="sans-serif" font-size="14" fill="${ink}" letter-spacing="4">ROBOT ADMIN / STUDY ${String(index + 1).padStart(2, '0')}</text><circle cx="470" cy="${height / 2}" r="110" fill="${accent}" opacity=".25"/><rect x="70" y="${height / 2 - 80}" width="310" height="150" rx="16" fill="${accent}"/><rect x="96" y="${height / 2 - 50}" width="95" height="12" rx="6" fill="${bg}"/><rect x="96" y="${height / 2 - 20}" width="250" height="8" rx="4" fill="${bg}" opacity=".6"/><rect x="96" y="${height / 2 + 5}" width="170" height="8" rx="4" fill="${bg}" opacity=".6"/><text x="40" y="${height - 35}" font-family="sans-serif" font-size="24" fill="${ink}">${title}</text></svg>`
    return {
      id: `study-${index + 1}`,
      title,
      description: `${category} · 设计素材 ${String(index + 1).padStart(2, '0')}`,
      category,
      width: 640,
      height,
      src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    }
  }
)
export const GALLERY_CATEGORIES = [
  '全部素材',
  '交互设计',
  '工程实践',
  '数据表达',
]
