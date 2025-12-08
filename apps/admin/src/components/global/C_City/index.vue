<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-30 08:19:51
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-02 22:45:10
 * @FilePath: \Robot_Admin\src\components\global\C_City\index.vue
 * @Description: 城市选择器组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->
<template>
  <NPopover
    v-model:show="visible"
    placement="bottom-start"
    :width="430"
    trigger="click"
    :show-arrow="false"
  >
    <template #trigger>
      <!-- 使用插槽可以在使用侧自定义触发器 -->
      <slot
        name="trigger"
        :value="modelValue"
        :visible="visible"
      >
        <!-- 默认触发器 -->
        <div
          class="city-selector-trigger"
          ref="triggerRef"
        >
          <span class="city-selector-trigger__text">{{
            modelValue || placeholder
          }}</span>
        </div>
      </slot>
    </template>

    <div class="city-selector-content">
      <!-- 头部控制区域 -->
      <div class="city-selector-header">
        <NRadioGroup
          v-model:value="radioValue"
          size="small"
        >
          <NRadioButton value="city">按城市</NRadioButton>
          <NRadioButton value="province">按省份</NRadioButton>
        </NRadioGroup>

        <NSelect
          v-model:value="searchValue"
          class="city-selector-search"
          :options="searchOptions"
          filterable
          clearable
          placeholder="搜索城市"
          @update:value="handleSearchSelect"
        />
      </div>

      <!-- 字母导航 -->
      <div
        class="city-selector-letters"
        v-if="showLetters"
      >
        <span
          v-for="letter in letters"
          :key="letter"
          class="city-selector-letter"
          @click="scrollToLetter(letter)"
        >
          {{ letter }}
        </span>
      </div>

      <!-- 城市列表 -->
      <NScrollbar class="city-selector-body">
        <!-- 按城市显示 -->
        <div
          v-if="radioValue === 'city'"
          class="city-list"
        >
          <div
            v-for="(cities, letter) in cityDataByLetter"
            :key="letter"
            :id="`letter-${letter}`"
            class="city-group"
          >
            <div class="city-group__letter">{{ letter }}:</div>
            <div class="city-group__cities">
              <span
                v-for="(city, index) in cities"
                :key="`${letter}-${index}`"
                class="city-item"
                :class="{ 'is-active': modelValue === city.name }"
                @click="handleCitySelect(city.name)"
              >
                {{ city.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- 按省份显示 -->
        <div
          v-else
          class="province-list"
        >
          <div
            v-for="province in allProvinces"
            :key="province.id"
            :id="`letter-${province.id}`"
            class="province-group"
          >
            <div class="province-group__name">{{ province.name }}:</div>
            <div class="province-group__cities">
              <span
                v-for="(city, index) in province.data"
                :key="`${province.id}-${index}`"
                class="city-item"
                :class="{ 'is-active': modelValue === city }"
                @click="handleCitySelect(city)"
              >
                {{ city }}
              </span>
            </div>
          </div>
        </div>
      </NScrollbar>
    </div>
  </NPopover>
</template>

<script setup lang="ts">
  import { type SelectOption } from 'naive-ui/es/select'
  import cityData from './city'
  import provinceData from '@/assets/data/province.json'

  /**
   * * @description: 城市数据项接口
   */
  interface CityItem {
    id: number
    spell: string
    name: string
  }

  /**
   * * @description: 省份数据项接口
   */
  interface ProvinceItem {
    id?: string
    name: string
    data: string[]
  }

  /**
   * * @description: 组件 Props 接口
   */
  interface Props {
    modelValue?: string
    placeholder?: string
    showLetters?: boolean
  }

  /**
   * * @description: 组件 Emits 接口
   */
  interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
  }

  withDefaults(defineProps<Props>(), {
    placeholder: '请选择城市',
    showLetters: true,
  })

  const emit = defineEmits<Emits>()

  // 响应式数据
  const visible = ref(false)
  const radioValue = ref<'city' | 'province'>('city')
  const searchValue = ref('')
  const triggerRef = ref<HTMLElement>()

  /**
   * * @description: 获取所有省份数据
   * ! @return {ProvinceItem[]} 省份数组
   */
  const allProvinces = computed(() => {
    const provinces: ProvinceItem[] = []
    Object.values(provinceData).forEach(group => {
      provinces.push(...group)
    })
    return provinces
  })

  /**
   * * @description: 按字母分组的城市数据
   * ! @return {Record<string, CityItem[]>} 城市分组对象
   */
  const cityDataByLetter = computed(() => {
    // 如果有城市数据，直接使用
    if (cityData && cityData.cities) {
      return cityData.cities
    }

    // 如果没有城市数据，从省份数据中提取
    const cities: Record<string, CityItem[]> = {}
    let cityId = 1

    // 从省份数据中提取所有城市并去重
    const citySet = new Set<string>()
    allProvinces.value.forEach(province => {
      province.data.forEach(cityName => {
        citySet.add(cityName)
      })
    })

    // 将城市按拼音首字母分组
    Array.from(citySet).forEach(cityName => {
      const letter = cityName[0].toUpperCase()
      if (!cities[letter]) {
        cities[letter] = []
      }
      cities[letter].push({
        id: cityId++,
        name: cityName,
        spell: '',
      })
    })

    // 按字母排序并对每组内的城市排序
    const sortedCities: Record<string, CityItem[]> = {}
    Object.keys(cities)
      .sort()
      .forEach(letter => {
        sortedCities[letter] = cities[letter].sort((a, b) =>
          a.name.localeCompare(b.name, 'zh-CN')
        )
      })

    return sortedCities
  })

  /**
   * * @description: 获取所有字母导航
   * ! @return {string[]} 字母数组
   */
  const letters = computed(() => {
    if (radioValue.value === 'city') {
      return Object.keys(cityDataByLetter.value).sort()
    } else {
      // 获取省份的首字母
      const provinceLetters = new Set<string>()
      Object.keys(provinceData).forEach(key => {
        if (key !== '直辖市' && key !== '港澳') {
          provinceLetters.add(key)
        }
      })
      // 添加特殊分类
      const result = Array.from(provinceLetters).sort()
      result.push('直辖市', '港澳')
      return result
    }
  })

  /**
   * * @description: 获取搜索选项
   * ! @return {SelectOption[]} 搜索下拉选项
   */
  const searchOptions = computed((): SelectOption[] => {
    if (radioValue.value === 'city') {
      const options: SelectOption[] = []
      Object.values(cityDataByLetter.value).forEach(cities => {
        cities.forEach(city => {
          options.push({
            label: city.name,
            value: city.name,
          })
        })
      })
      return options
    } else {
      return allProvinces.value.flatMap(province =>
        province.data.map(city => ({
          label: `${city} (${province.name})`,
          value: city,
        }))
      )
    }
  })

  /**
   * * @description: 处理城市选择
   * ? @param {string} cityName 城市名称
   * ! @return {void}
   */
  const handleCitySelect = (cityName: string): void => {
    emit('update:modelValue', cityName)
    emit('change', cityName)
    visible.value = false
  }

  /**
   * * @description: 处理搜索选择
   * ? @param {string} value 选中的城市名称
   * ! @return {void}
   */
  const handleSearchSelect = (value: string): void => {
    if (value) {
      handleCitySelect(value)
      searchValue.value = ''
    }
  }

  /**
   * * @description: 滚动到指定字母位置
   * ? @param {string} letter 字母
   * ! @return {void}
   */
  const scrollToLetter = (letter: string): void => {
    const element = document.getElementById(`letter-${letter}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  /**
   * * @description: 监听点击外部关闭弹窗
   */
  watch(visible, newVal => {
    if (newVal) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
  })

  /**
   * * @description: 处理点击外部事件
   * ? @param {MouseEvent} event 鼠标事件
   * ! @return {void}
   */
  const handleClickOutside = (event: MouseEvent): void => {
    const target = event.target as HTMLElement
    const popover = document.querySelector('.n-popover')

    if (
      triggerRef.value &&
      !triggerRef.value.contains(target) &&
      popover &&
      !popover.contains(target)
    ) {
      visible.value = false
    }
  }

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
