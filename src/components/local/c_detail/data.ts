export interface DetailItem {
  label: string
  key: string
  type?: 'text' | 'tag' | 'date' | 'email' | 'number'
  tagType?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
  formatter?: (value: any) => string
  span?: 1 | 2 // 占据列数，1表示一列，2表示跨两列
}

export interface DetailSection {
  title: string
  items: DetailItem[]
  columns?: 1 | 2 // 该section的列数，默认2列
}

export interface DetailConfig {
  sections: DetailSection[]
}

export interface C_DetailProps {
  data: Record<string, any>
  config: DetailConfig
  title?: string
  width?: number | string
  visible?: boolean
  loading?: boolean
}
