// =================== 样式常量 ===================
const BASE_TABLE_STYLE = {
  background: 'transparent',
  color: '#fff',
  textAlign: 'center' as const,
}

export const TABLE_HEADER_STYLE = {
  ...BASE_TABLE_STYLE,
  fontSize: '12px',
  fontWeight: 'bold',
}

export const TABLE_CELL_STYLE = {
  ...BASE_TABLE_STYLE,
  fontSize: '12px',
}

export const SMALL_TABLE_HEADER_STYLE = {
  ...TABLE_HEADER_STYLE,
  fontSize: '11px',
}
export const SMALL_TABLE_CELL_STYLE = { ...TABLE_CELL_STYLE, fontSize: '11px' }

// =================== 类型定义 ===================
export interface FactoryData {
  id: number
  costCenter: string
  costCenterDesc: string
  acctDate: string
  type: { key: number; value: string }
  wgt: number
  amtReal: number
  amtUnitReal: number
  amtStandard: number
  amtUnitDiff: number
  amtUnitDiffRate: number
  wgtDiff: number
  wgtDiffRate: number
  mom: number
  yoy: number
  progressPercentage?: number
  standardPercentage?: number
}

export interface KpiData {
  wgtDiffRate: number
  amtUnitDiffRate: number
  amtUnitDiff: number
  amtReal?: number
  amtStandard?: number
  materialCostRate?: number
  laborCostRate?: number
  energyCostRate?: number
  efficiencyRate?: number
}

export interface TrendDataItem {
  acctDate: string
  amtUnitReal: number
  day: number
}

interface ProcessedTrendData {
  day: string
  value: number
}

interface KeyIndicator {
  icon: string
  value: string
  unit: string
  name: string
}

interface ChartDataItem {
  value: number
  name: string
  itemStyle: { color: string }
}

// =================== 页面配置 ===================
export const pageConfig = {
  title: '日 成 本 管 控 大 屏',
  headerInfo: {
    datePrefix: '日期',
    temperature: '☀ 17°C',
  },
  panels: {
    factoryTitle: '分厂日成本',
    keyIndicatorsTitle: '关键指标',
    costChartTitle: '成本构成',
    costChartSubtitle: '成本构成数据数据库',
    dataTableTitle: '成本中心日成本',
    analysisTableTitle: '分厂原材料成本数据（占比）',
    trendChartTitle: '分厂日单本成本近30日趋势图',
    productionTableTitle: '成本中心日产量',
    productionNotice: '厂成本实际产量',
  },
}

// =================== 表格配置 ===================
export const tableColumns = {
  dataTable: [
    { prop: 'costCenterDesc', label: '厂别', width: 180 },
    { prop: 'wgt', label: '产量', formatter: true },
    { prop: 'amtReal', label: '综合成本', formatter: true },
    { prop: 'amtUnitReal', label: '综合单本', formatter: true },
    { prop: 'amtStandard', label: '标准成本', formatter: true },
    { prop: 'amtUnitDiff', label: '偏差' },
    { prop: 'amtUnitDiffRate', label: '偏差率', width: 80, type: 'status' },
  ],
  analysisTable: [
    { prop: 'costCenterDesc', label: '日成本单本分析', width: 100 },
    { prop: 'mom', label: '环比', width: 60 },
    { prop: 'yoy', label: '同比', width: 60 },
    {
      prop: 'amtUnitReal',
      label: '综合单成本',
      minWidth: 80,
      type: 'cost-status',
    },
  ],
  productionTable: [
    { prop: 'costCenterDesc', label: '分厂日成本实际产量', minWidth: 100 },
    { prop: 'wgt', label: '计划产量', minWidth: 80, type: 'cost-status' },
    { prop: 'wgtDiff', label: '计划偏差', minWidth: 70, formatter: true },
  ],
}

export const factoryHeaders = {
  name: '分厂',
  labels: ['实际成本', '标准成本', '成本偏差'],
}

export const costLegendItems = [
  { color: '#ff6b6b', label: '原材料消耗成本' },
  { color: '#4ecdc4', label: '人工成本' },
  { color: '#45b7d1', label: '能耗' },
  { color: '#f9ca24', label: '制造费用' },
]

// =================== 工具函数 ===================
export const getStatus = (rate: number | null | undefined): string => {
  if (!rate && rate !== 0) return 'green'
  const numRate = Math.abs(parseFloat(rate.toString()))
  if (numRate <= 0.05) return 'green'
  if (numRate <= 0.2) return 'yellow'
  return 'red'
}

export const formatNumber = (row: any, column: any, cellValue: any): any => {
  return typeof cellValue === 'number' ? cellValue.toLocaleString() : cellValue
}

// =================== 模拟数据生成 ===================

// 分厂名称列表
const FACTORY_NAMES = [
  '球团矿',
  '石灰车间',
  '烧结矿',
  '炼铁厂-炼钢铁水',
  '炼钢一厂',
  '炼钢二厂',
  '棒线厂-高棒(RRB613,YRY613)',
  '棒线厂-普棒(RRB612,YRY612)',
  '热轧厂-1580轧线',
  '热轧厂-900轧线',
  '冷轧厂-酸轧',
  '冷轧厂-罩平',
  '冷轧厂-镀锌#1',
  '冷轧厂-镀锌#2',
  '冷轧厂-镀锌#3',
  '冷轧厂-彩涂',
  '冷轧厂-酸平',
]

// 生成随机数值
const randomBetween = (min: number, max: number): number =>
  Math.random() * (max - min) + min

// 生成分厂数据
const generateFactoryData = (name: string, index: number): FactoryData => {
  const baseWgt = randomBetween(500000, 800000)
  const baseAmtReal = randomBetween(8000000, 12000000)
  const baseAmtUnitReal = randomBetween(150, 250)
  const baseAmtStandard = baseAmtReal * randomBetween(0.95, 1.05)
  const amtUnitDiff = baseAmtUnitReal - baseAmtStandard / baseWgt
  const amtUnitDiffRate = amtUnitDiff / baseAmtUnitReal

  return {
    id: index + 1,
    costCenter: `CC${(index + 1).toString().padStart(3, '0')}`,
    costCenterDesc: name,
    acctDate: '20250914',
    type: { key: 1, value: '日成本' },
    wgt: Math.round(baseWgt),
    amtReal: Math.round(baseAmtReal),
    amtUnitReal: Math.round(baseAmtUnitReal * 100) / 100,
    amtStandard: Math.round(baseAmtStandard),
    amtUnitDiff: Math.round(amtUnitDiff * 100) / 100,
    amtUnitDiffRate: Math.round(amtUnitDiffRate * 10000) / 10000,
    wgtDiff: randomBetween(-50000, 50000),
    wgtDiffRate: randomBetween(-0.1, 0.1),
    mom: randomBetween(-15, 15), // 环比
    yoy: randomBetween(-25, 25), // 同比
    // 添加百分比显示数据
    progressPercentage: Math.round(randomBetween(60, 95)), // 实际成本百分比
    standardPercentage: Math.round(randomBetween(85, 100)), // 标准成本百分比
  }
}

// 生成KPI数据
const generateKpiData = (factory: FactoryData | null): KpiData | null => {
  if (!factory) return null

  return {
    wgtDiffRate: randomBetween(-0.15, 0.15),
    amtUnitDiffRate: randomBetween(-0.2, 0.2),
    amtUnitDiff: randomBetween(-50, 50),
    amtReal: factory.amtReal || randomBetween(8000000, 12000000),
    amtStandard: factory.amtStandard || randomBetween(7500000, 11500000),
    // 新增的KPI指标
    materialCostRate: randomBetween(0.4, 0.65), // 原材料成本占比
    laborCostRate: randomBetween(0.12, 0.25), // 人工成本占比
    energyCostRate: randomBetween(0.15, 0.3), // 能耗成本占比
    efficiencyRate: randomBetween(0.75, 0.95), // 生产效率
  }
}

// 生成趋势数据
const generateTrendData = (factory: FactoryData | null): TrendDataItem[] => {
  if (!factory) return []

  const baseValue = factory.amtUnitReal || 200
  const data: TrendDataItem[] = []

  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))

    // 生成有趋势的数据
    const trend = Math.sin(i * 0.2) * 20 // 波动趋势
    const randomVariation = randomBetween(-15, 15) // 随机变化
    const value = baseValue + trend + randomVariation

    data.push({
      acctDate: date.toISOString().slice(0, 10).replace(/-/g, ''),
      amtUnitReal: Math.max(value, 100), // 确保最小值为100
      day: i + 1,
    })
  }

  return data
}

// =================== 数据处理函数 ===================
const formatValue = (
  value: number | null | undefined,
  isPercentage: boolean = false
): string => {
  if (value === null || value === undefined || isNaN(value)) return '0.0'
  const val = Math.abs(isPercentage ? value * 100 : value)
  return val.toFixed(1)
}

export const createKeyIndicators = (
  kpiData: KpiData | null
): KeyIndicator[] => {
  // 如果没有数据，返回默认值（8个指标）
  if (!kpiData) {
    return [
      { icon: '🔵', value: '2.5', unit: '%', name: '钢铁料偏差' },
      { icon: '🔵', value: '1.8', unit: '%', name: '综合成本偏差' },
      { icon: '🔵', value: '12.3', unit: '元', name: '计划成本偏差' },
      { icon: '🔵', value: '3.2', unit: '%', name: '差异率' },
      { icon: '🟢', value: '52.6', unit: '%', name: '原料成本占比' },
      { icon: '🟡', value: '18.4', unit: '%', name: '人工成本占比' },
      { icon: '🟠', value: '22.1', unit: '%', name: '能耗成本占比' },
      { icon: '🟣', value: '88.5', unit: '%', name: '生产效率' },
    ]
  }

  return [
    {
      icon: '🔵',
      value: formatValue(kpiData.wgtDiffRate, true),
      unit: '%',
      name: '钢铁料偏差',
    },
    {
      icon: '🔵',
      value: formatValue(kpiData.amtUnitDiffRate, true),
      unit: '%',
      name: '综合成本偏差',
    },
    {
      icon: '🔵',
      value: formatValue(kpiData.amtUnitDiff),
      unit: '元',
      name: '实际计划成本偏差',
    },
    {
      icon: '🔵',
      value: formatValue(kpiData.amtUnitDiffRate, true),
      unit: '%',
      name: '差异率',
    },
    {
      icon: '🟢',
      value: formatValue(kpiData.materialCostRate, true),
      unit: '%',
      name: '原料成本占比',
    },
    {
      icon: '🟡',
      value: formatValue(kpiData.laborCostRate, true),
      unit: '%',
      name: '人工成本占比',
    },
    {
      icon: '🟠',
      value: formatValue(kpiData.energyCostRate, true),
      unit: '%',
      name: '能耗成本占比',
    },
    {
      icon: '🟣',
      value: formatValue(kpiData.efficiencyRate, true),
      unit: '%',
      name: '生产效率',
    },
  ]
}

export const createTrendData = (
  trendData: TrendDataItem[] | null
): ProcessedTrendData[] => {
  // 如果没有真实数据，返回模拟数据
  if (!trendData || !Array.isArray(trendData)) {
    return Array.from({ length: 30 }, (_, i) => ({
      day: (i + 1).toString().padStart(2, '0'),
      value: 180 + Math.sin(i * 0.3) * 40 + Math.random() * 20,
    }))
  }

  // 处理真实数据
  const realData = trendData.map((item, index) => ({
    day: (index + 1).toString().padStart(2, '0'),
    value: item.amtUnitReal || 0,
  }))

  // 如果数据不足30天，用模拟数据补充
  const remainingDays = 30 - realData.length
  if (remainingDays > 0) {
    const baseValue =
      realData.length > 0 ? realData[realData.length - 1].value : 200
    for (let i = 0; i < remainingDays; i++) {
      realData.push({
        day: (realData.length + i + 1).toString().padStart(2, '0'),
        value: baseValue + (Math.random() - 0.5) * 50,
      })
    }
  }

  return realData.slice(0, 30)
}

// =================== 模拟API调用函数 ===================

// 模拟网络延迟
const mockDelay = (ms: number = 300): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

// 生成并缓存基础数据
let cachedFactoryData: FactoryData[] | null = null
const getFactoryData = (): FactoryData[] => {
  if (!cachedFactoryData) {
    cachedFactoryData = FACTORY_NAMES.map((name, index) =>
      generateFactoryData(name, index)
    )
  }
  return cachedFactoryData
}

export const fetchBoardData = async (): Promise<FactoryData[]> => {
  console.log('🔄 模拟获取面板数据...')

  try {
    const data = getFactoryData()
    await mockDelay(200) // 减少延迟，快速显示数据

    console.log('✅ 面板数据加载完成:', data.length, '个分厂')
    console.log('📊 数据示例:', data[0]) // 打印第一条数据用于调试
    return data
  } catch (error) {
    console.error('❌ 模拟API错误:', error)
    throw new Error('模拟数据加载失败')
  }
}

export const fetchKpiData = async (
  factory: FactoryData
): Promise<KpiData | null> => {
  console.log('🔄 模拟获取KPI数据...', factory?.costCenterDesc)

  if (!factory) return null

  try {
    const data = generateKpiData(factory)
    await mockDelay(200)

    console.log('✅ KPI数据加载完成:', data)
    return data
  } catch (error) {
    console.error('❌ KPI数据加载失败:', error)
    throw new Error('KPI数据获取失败')
  }
}

export const fetchTrendData = async (
  factory: FactoryData
): Promise<TrendDataItem[] | null> => {
  console.log('🔄 模拟获取趋势数据...', factory?.costCenterDesc)

  if (!factory) return null

  try {
    const data = generateTrendData(factory)
    await mockDelay(300)

    console.log('✅ 趋势数据加载完成:', data.length, '条记录')
    return data
  } catch (error) {
    console.error('❌ 趋势数据加载失败:', error)
    throw new Error('趋势数据获取失败')
  }
}

// =================== 图表配置 ===================
export const getCostChartOption = (data: ChartDataItem[]): any => ({
  backgroundColor: 'transparent',
  series: [
    {
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: 'rgba(29, 59, 120, 0.8)',
        borderWidth: 3,
      },
      label: {
        show: true,
        position: 'outside',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        formatter: (params: any) => `${params.name}\n${params.percent}%`,
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 10,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.5)',
          width: 1,
        },
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#fff',
        },
        itemStyle: {
          shadowBlur: 20,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      data,
    },
  ],
})

export const getTrendChartOption = (trendData: ProcessedTrendData[]): any => ({
  backgroundColor: 'transparent',
  grid: { top: 20, left: 40, right: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    data: trendData.map(item => item.day),
    axisLine: { lineStyle: { color: 'rgba(64, 169, 243, 0.5)' } },
    axisLabel: { color: '#fff', fontSize: 10, interval: 4 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { color: '#fff', fontSize: 10 },
    splitLine: {
      lineStyle: { color: 'rgba(64, 169, 243, 0.2)', type: 'dashed' },
    },
    axisTick: { show: false },
  },
  series: [
    {
      data: trendData.map(item => item.value),
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#00ffff', width: 3 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 255, 255, 0.4)' },
            { offset: 1, color: 'rgba(0, 255, 255, 0.05)' },
          ],
        },
      },
    },
  ],
})

export const getDefaultCostData = (): ChartDataItem[] => [
  { value: 45, name: '原材料消耗成本', itemStyle: { color: '#ff6b6b' } },
  { value: 25, name: '人工成本', itemStyle: { color: '#4ecdc4' } },
  { value: 20, name: '能耗', itemStyle: { color: '#45b7d1' } },
  { value: 10, name: '制造费用', itemStyle: { color: '#f9ca24' } },
]

// =================== 调试和开发工具 ===================

// 开发模式下的额外功能
export const devTools = {
  // 重新生成所有数据
  regenerateData: (): FactoryData[] => {
    cachedFactoryData = null
    return getFactoryData()
  },

  // 获取特定分厂数据
  getFactoryByName: (name: string): FactoryData | undefined => {
    return getFactoryData().find(f => f.costCenterDesc === name)
  },

  // 导出数据为JSON (用于调试)
  exportData: (): { factories: FactoryData[]; timestamp: string } => {
    const data = {
      factories: getFactoryData(),
      timestamp: new Date().toISOString(),
    }
    console.log('📊 导出数据:', JSON.stringify(data, null, 2))
    return data
  },
}

// 开发环境下暴露到全局
declare global {
  interface Window {
    devTools: typeof devTools
  }
}

if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    window.devTools = devTools
    console.log('🛠️ 开发工具已暴露到 window.devTools')
  }
}
