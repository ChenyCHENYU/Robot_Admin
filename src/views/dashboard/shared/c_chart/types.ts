/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\dashboard\shared\c_chart\types.ts
 * @Description: 按需 ECharts 图表实例的数据契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { EChartsCoreOption } from 'echarts/core'
export interface ChartProps {
  option: EChartsCoreOption
  label: string
  empty?: boolean
}
