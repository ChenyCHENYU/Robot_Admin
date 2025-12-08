<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-10 10:24:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-17 16:01:55
 * @FilePath: \Robot_Admin\src\components\global\C_FormSearch\index.vue
 * @Description: 表单搜索组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NCard
    class="form-search-card custom-card"
    :bordered="bordered"
  >
    <NForm
      class="form-search"
      :model="formParams"
      ref="formRef"
      :size="size"
    >
      <!-- 动态渲染表单项 -->
      <div
        class="form-search-item-box"
        v-for="(item, index) of disposeFormItemList"
        :key="index"
      >
        <NFormItem
          class="form-item-input"
          v-if="item.type !== '%'"
          :path="item.prop"
          :show-feedback="false"
          :show-label="false"
        >
          <!-- 基本 input 检索 -->
          <NInput
            v-if="item.type === 'input'"
            clearable
            v-model:value="formParams[item.prop]"
            :placeholder="item.placeholder"
            @focus="handleFocus(item.prop)"
            @blur="handleBlur"
          />

          <!-- 缓存的input检索历史信息 -->
          <div
            class="input-history"
            v-if="item.isFocus"
          >
            <div
              class="history-item"
              @click="selectHisItem(_hisItem, item.prop)"
              v-for="(_hisItem, hisIndex) of item.hisList"
              :key="_hisItem"
            >
              <span class="history-text">{{ _hisItem }}</span>
              <NIcon
                class="delete-icon"
                size="14"
                @click.stop="deleteHistoryItem(item.prop, hisIndex)"
              >
                <div class="i-mdi:close" />
              </NIcon>
            </div>
            <div
              class="history-footer"
              v-if="item.hisList && item.hisList.length > 0"
            >
              <span
                class="clear-all"
                @click.stop="clearAllHistory(item.prop)"
              >
                清空历史记录
              </span>
            </div>
          </div>

          <!-- 基本 select 检索 -->
          <NSelect
            v-if="item.type === 'select'"
            v-model:value="formParams[item.prop]"
            :placeholder="item.placeholder || '请选择'"
            clearable
            :options="
              item.list?.map((opt: any) => ({
                label: opt.label || opt.labelDefault,
                value:
                  opt.value !== undefined
                    ? opt.value
                    : opt.label || opt.labelDefault,
              }))
            "
          />

          <!-- 基本 双向时间选择器 检索 -->
          <NDatePicker
            v-if="item.type === 'date-range'"
            type="datetimerange"
            v-model:value="formParams[item.prop]"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            clearable
          />
        </NFormItem>
      </div>

      <!-- 搜索、重置、展开按钮 -->
      <div class="form-search-item-box">
        <div class="form-item-input">
          <div class="button-label-placeholder"></div>
          <NSpace>
            <NTooltip trigger="hover">
              <template #trigger>
                <NButton
                  type="primary"
                  @click="searchFn"
                  :loading="searching"
                >
                  <template #icon>
                    <div class="i-mdi:search w-4 h-4" />
                  </template>
                </NButton>
              </template>
              搜索
            </NTooltip>

            <NTooltip trigger="hover">
              <template #trigger>
                <NButton @click="cleanFn()">
                  <template #icon>
                    <div class="i-mdi:refresh w-4 h-4" />
                  </template>
                </NButton>
              </template>
              重置
            </NTooltip>

            <NTooltip
              v-if="hasExpandButton"
              trigger="hover"
            >
              <template #trigger>
                <NButton @click="changeFoldState">
                  <template #icon>
                    <div
                      :class="
                        flag
                          ? 'i-mdi:chevron-up w-4 h-4'
                          : 'i-mdi:chevron-down w-4 h-4'
                      "
                    />
                  </template>
                </NButton>
              </template>
              {{ flag ? '收起' : '展开' }}
            </NTooltip>
          </NSpace>
        </div>
      </div>
    </NForm>
  </NCard>
</template>

<script setup lang="ts">
  import { getItem, setItem } from '@/hooks/useStorage/index'
  import type { FormInst } from 'naive-ui/es'

  // ================= 类型定义 =================
  import type { OptionItem, ComponentType } from '@/types/modules/form'

  interface SearchFormItem {
    type: ComponentType | 'date-range' | '%'
    prop: string
    placeholder?: string
    list?: OptionItem[]
    hisList?: string[]
    isFocus?: boolean
    show?: boolean
  }

  interface SearchFormParams {
    [key: string]: any
  }

  interface Props {
    bordered?: boolean
    formItemList: SearchFormItem[]
    formParams: SearchFormParams
    formSearchInputHistoryString?: string
    size?: 'small' | 'medium' | 'large'
  }

  // ================= 组件属性 =================
  const props = withDefaults(defineProps<Props>(), {
    bordered: true,
    formItemList: () => [],
    size: 'medium',
  })

  // ================= 组件事件 =================
  const emits = defineEmits<{
    search: [params: SearchFormParams]
    reset: []
    'change-params': [params: SearchFormParams]
  }>()

  // ================= 响应式状态 =================
  const message = useMessage()
  const formRef = ref<FormInst | null>(null)
  const formItemList = ref<SearchFormItem[]>([...props.formItemList])
  const formParams = ref<SearchFormParams>({ ...props.formParams })
  const flag = ref(false)
  const searching = ref(false)

  // ================= 计算属性 =================
  const disposeFormItemList = computed(() =>
    formItemList.value.filter((item: { show: boolean }) => item.show !== false)
  )

  const hasExpandButton = computed(() => formItemList.value.length > 7)

  // ================= 核心方法 =================

  // 工具函数：设置所有字段的焦点状态
  const setAllFieldsFocus = (targetProp?: string) => {
    formItemList.value.forEach((item: SearchFormItem) => {
      item.isFocus = item.hisList && item.prop === targetProp
    })
  }

  // 处理 input 缓存历史记录
  const handleFocus = (itemProp: string) => {
    const tempFormItemList = getItem<SearchFormItem[]>(
      props.formSearchInputHistoryString!
    )
    if (tempFormItemList) {
      formItemList.value = tempFormItemList
    }
    setAllFieldsFocus(itemProp)
  }
  // 选择一条历史记录
  const selectHisItem = (value: string, itemProp: string) => {
    formParams.value[itemProp] = value
    setAllFieldsFocus() // 关闭所有历史记录面板
  }

  // 工具函数：根据prop查找字段项
  const findFieldByProp = (itemProp: string) =>
    formItemList.value.find((item: any) => item.prop === itemProp)

  // 工具函数：更新本地存储
  const updateStorage = () => {
    if (props.formSearchInputHistoryString) {
      setItem(props.formSearchInputHistoryString, formItemList.value)
    }
  }

  // 删除单条历史记录
  const deleteHistoryItem = (itemProp: string, index: number) => {
    const field = findFieldByProp(itemProp)
    if (field?.hisList) {
      field.hisList.splice(index, 1)
      if (field.hisList.length === 0) {
        field.isFocus = false
      }
      updateStorage()
    }
  }

  // 清空所有历史记录
  const clearAllHistory = (itemProp: string) => {
    const field = findFieldByProp(itemProp)
    if (field?.hisList) {
      field.hisList = []
      field.isFocus = false
      updateStorage()
    }
  }

  // input 失去焦点处理
  const handleBlur = () => {
    setTimeout(() => setAllFieldsFocus(), 200)
  }

  // 工具函数：管理历史记录列表
  const manageHistoryList = (hisList: string[], newValue: string) => {
    const existingIndex = hisList.indexOf(newValue)
    if (existingIndex > -1) {
      hisList.splice(existingIndex, 1)
    }
    hisList.unshift(newValue)
    return hisList.length > 5 ? hisList.slice(0, 5) : hisList
  }

  // 中间存值
  const saveParamsDisposeFormItemList = (itemProp: string) => {
    const field = findFieldByProp(itemProp)
    if (!field?.hisList) return

    field.isFocus = true
    const value = formParams.value[itemProp]

    if (value && value.toString().trim()) {
      const valueStr = value.toString().trim()
      field.hisList = manageHistoryList(field.hisList, valueStr)
    }

    // 关闭其他字段焦点
    formItemList.value.forEach((item: { prop: string; isFocus: boolean }) => {
      if (item.prop !== itemProp) item.isFocus = false
    })
  }

  // 工具函数：检查值是否为空
  const isEmpty = (value: any) =>
    value === undefined ||
    value === '' ||
    value === null ||
    (Array.isArray(value) && value.length === 0)

  //浏览器存检索值
  const clickInputHistoryStorage = () => {
    Object.keys(formParams.value).forEach(key => {
      if (formParams.value[key]) {
        saveParamsDisposeFormItemList(key)
      }
    })
    setAllFieldsFocus() // 恢复默认状态
    updateStorage()
  }

  // 搜索逻辑
  const searchFn = () => {
    const hasValidParams = Object.entries(formParams.value)
      .filter(([key]) => key !== 'pageNum' && key !== 'pageSize')
      .some(([key, value]) => {
        if (key.includes('Time') && Array.isArray(value)) {
          return value[0] // 时间字段特殊处理
        }
        return !isEmpty(value)
      })

    if (!hasValidParams) {
      message.warning('请输入搜索内容，或选择筛选条件')
    } else {
      if (props.formSearchInputHistoryString) clickInputHistoryStorage()
      emits('search', formParams.value)
    }
  }

  // 重置表单
  const cleanFn = () => {
    formRef.value?.restoreValidation()

    // 重置表单字段
    Object.keys(formParams.value).forEach(key => {
      if (key !== 'pageNum' && key !== 'pageSize') {
        formParams.value[key] = null
      }
    })

    emits('change-params', formParams.value)
    emits('reset')
  }

  // 展开收起 更多查询条件
  const changeFoldState = () => {
    flag.value = !flag.value

    formItemList.value.forEach((item: { show: boolean }, index: number) => {
      if (index > 6) item.show = !item.show
    })

    updateStorage()
  }

  // ================= 初始化 =================
  const initialize = () => {
    formItemList.value.forEach(
      (
        item: {
          isFocus: boolean
          show: boolean | undefined
          type: string
          placeholder: string
          prop: string | number
        },
        index: number
      ) => {
        item.isFocus = false

        // 前7个默认显示，第8个开始默认隐藏
        if (index > 6 && item.show === undefined) {
          item.show = false
        }

        // 处理select字段
        if (item.type === 'select') {
          if (!item.placeholder) item.placeholder = '请选择'
          if (formParams.value[item.prop] === undefined) {
            formParams.value[item.prop] = null
          }
        }
      }
    )
  }

  // ================= 生命周期 =================
  onMounted(() => {
    initialize()
  })

  // ================= 暴露方法 =================
  defineExpose({
    formRef,
    formParams,
    searchFn,
    cleanFn,
    changeFoldState,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
