/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-30 08:36:17
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-08 23:30:00
 * @FilePath: \Robot_Admin\src\views\demo\06-city\data.ts
 * @Description: 城市选择器组件演示数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { SelectOption } from 'naive-ui'
import provinceData from '@/assets/data/province.json'

// 生成城市选项（用于原生下拉选择）
export const cityOptions = computed((): SelectOption[] => {
  const options: SelectOption[] = []
  Object.values(provinceData).forEach(provinces => {
    provinces.forEach(province => {
      options.push({
        type: 'group',
        label: province.name,
        key: province.id || province.name,
        children: province.data.map(city => ({
          label: city,
          value: city,
        })),
      })
    })
  })
  return options
})
