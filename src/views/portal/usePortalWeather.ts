/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @Description: 门户天气请求、超时与状态转换
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { ref } from 'vue'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { withRequestTimeout } from '@/utils/abort'

const UNAVAILABLE = {
  temperature: '--',
  description: '天气暂不可用',
  humidity: '--',
  windDirection: '--',
  windPower: '--',
}
const WIND_DIR_MAP: Record<string, string> = {
  N: '北',
  NNE: '东北偏北',
  NE: '东北',
  ENE: '东北偏东',
  E: '东',
  ESE: '东南偏东',
  SE: '东南',
  SSE: '东南偏南',
  S: '南',
  SSW: '西南偏南',
  SW: '西南',
  WSW: '西南偏西',
  W: '西',
  WNW: '西北偏西',
  NW: '西北',
  NNW: '西北偏北',
}

const WIND_LEVELS: Array<[number, string]> = [
  [1, '微风'],
  [5, '≤1'],
  [11, '≤2'],
  [19, '≤3'],
  [28, '≤4'],
  [38, '≤5'],
  [49, '≤6'],
  [Infinity, '7级以上'],
]

const asRecord = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
const asText = (value: unknown, fallback = '') =>
  typeof value === 'string' && value ? value : fallback
const firstDescription = (value: unknown) =>
  Array.isArray(value) ? asText(asRecord(value[0])?.value) : ''

const weatherFrom = (payload: unknown) => {
  const conditions = asRecord(payload)?.current_condition
  const current = Array.isArray(conditions)
    ? asRecord(conditions[0])
    : undefined
  if (!current) return UNAVAILABLE
  const direction = asText(current.winddir16Point, '西南')
  const speed = Number(asText(current.windspeedKmph)) || 0
  return {
    temperature: asText(current.temp_C, '--'),
    description:
      firstDescription(current.lang_zh) ||
      firstDescription(current.weatherDesc) ||
      '晴',
    humidity: asText(current.humidity, '--'),
    windDirection: WIND_DIR_MAP[direction] ?? direction,
    windPower: WIND_LEVELS.find(([max]) => speed < max)?.[1] ?? '≤3',
  }
}

/** 超时或失败可展示降级内容，过期及卸载的请求结果由统一请求控制器丢弃。 */
export function usePortalWeather() {
  const weather = ref({ ...UNAVAILABLE, description: '加载中...' })
  const { run } = useLatestRequest()
  const fetchWeather = async () => {
    const result = await run(async signal => {
      try {
        return await withRequestTimeout(
          async requestSignal => {
            const response = await fetch('https://wttr.in/西安?format=j1', {
              signal: requestSignal,
            })
            if (!response.ok) return UNAVAILABLE
            return weatherFrom(await response.json())
          },
          signal,
          6000
        )
      } catch {
        return UNAVAILABLE
      }
    })
    if (result) weather.value = result
  }
  return { weather, fetchWeather }
}
