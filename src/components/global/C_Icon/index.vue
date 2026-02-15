<!--
 * @Author: ChenYu
 * @Date: 2025-05-14 09:38:08
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-24 17:33:30
 * @FilePath: \Robot_Admin\src\components\global\C_Icon\index.vue
 * @Description: 支持多种图标使用方式，默认使用Iconify图标，统一错误处理
 * Copyright (c) ${2023} by ChenYu, All Rights Reserved.
-->
<template>
  <div
    ref="iconRef"
    class="c-icon"
    :class="[
      `c-icon--${type}`,
      {
        'c-icon--clickable': clickable,
        'c-icon--loading': loading,
        'c-icon--error': hasError,
      },
    ]"
    :style="rootStyle"
    :title="title || iconDisplayName"
    :aria-label="ariaLabel || iconDisplayName"
    :role="clickable ? 'button' : 'img'"
    :tabindex="clickable ? 0 : -1"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- 方式1：Iconify图标（默认方式） -->
    <Icon
      v-if="
        (type === 'iconify' || !type) && !hasError && typeof name === 'string'
      "
      :icon="name"
      :width="size"
      :height="size"
      :color="color"
      :style="iconStyle"
      @error="() => handleError('iconify', 'Iconify图标加载失败')"
    />

    <!-- 方式2：UnoCSS图标 -->
    <div
      v-else-if="type === 'unocss' && !hasError && typeof name === 'string'"
      :class="[name, iconClasses]"
      :style="iconStyle"
      @error="() => handleError('unocss', 'UnoCSS图标渲染失败')"
    />

    <!-- 方式3：组件挂载方式 -->
    <component
      v-else-if="type === 'component' && resolvedComponent && !hasError"
      :is="resolvedComponent"
      :style="iconStyle"
      v-bind="componentProps"
      @error="() => handleError('component', '组件图标渲染失败')"
    />

    <!-- 方式4：SVG路径方式 -->
    <svg
      v-else-if="type === 'svg' && svgPath && !hasError"
      :width="size"
      :height="size"
      :viewBox="viewBox"
      :style="iconStyle"
      :fill="color"
      @error="() => handleError('svg', 'SVG图标渲染失败')"
    >
      <path
        :d="svgPath"
        :fill="color"
      />
    </svg>

    <!-- 方式5：图片方式 -->
    <img
      v-else-if="type === 'image' && getImageSrc && !hasError"
      :src="getImageSrc"
      :alt="alt || iconDisplayName"
      :width="size"
      :height="size"
      style="display: inline-block; vertical-align: middle"
      @error="() => handleError('image', '图片图标加载失败')"
      @load="handleImageLoad"
    />

    <!-- 加载状态 -->
    <div
      v-if="loading && !hasError"
      class="c-icon__loading"
      :style="iconStyle"
    >
      <div class="c-icon__spinner" />
    </div>

    <!-- 统一错误状态显示 -->
    <div
      v-else-if="hasError"
      class="c-icon__error"
      :style="iconStyle"
      :title="`图标解析失败: ${iconDisplayName} (${errorMessage})${fallbackIcon ? ` (fallback: ${fallbackIcon})` : ''}`"
    >
      ⚠️
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Icon } from '@iconify/vue'
  import { useImagePath } from '@/hooks/useImagePath'

  export interface IconProps {
    /** 图标名称/路径/组件实例 */
    name: string | any
    /** 图标类型 */
    type?: 'iconify' | 'unocss' | 'component' | 'svg' | 'image'
    /** 图标颜色 */
    color?: string
    /** 图标大小(px) */
    size?: number | string
    /** SVG路径数据(仅type=svg时使用) */
    svgPath?: string
    /** SVG viewBox(仅type=svg时使用) */
    viewBox?: string
    /** 图片alt属性(仅type=image时使用) */
    alt?: string
    /** 是否可点击 */
    clickable?: boolean
    /** 加载状态 */
    loading?: boolean
    /** 错误时的回退图标 */
    fallbackIcon?: string
    /** 工具提示 */
    title?: string
    /** 无障碍标签 */
    ariaLabel?: string
    /** 自定义样式类 */
    customClass?: string
    /** 旋转角度 */
    rotate?: number
    /** 是否翻转 */
    flip?: 'horizontal' | 'vertical' | 'both'
    /** 传递给组件的额外属性(仅type=component时使用) */
    componentProps?: Record<string, any>
  }

  const props = withDefaults(defineProps<IconProps>(), {
    name: undefined,
    type: 'iconify',
    color: 'currentColor',
    size: 18,
    svgPath: '',
    viewBox: '0 0 24 24',
    alt: '',
    clickable: false,
    loading: false,
    fallbackIcon: '',
    title: '',
    ariaLabel: '',
    customClass: '',
    rotate: 0,
    flip: undefined,
    componentProps: () => ({}),
  })

  const emit = defineEmits<{
    click: [event: MouseEvent]
    error: [type: string, error?: any]
    load: []
  }>()

  const iconRef = ref<HTMLElement>()
  const hasError = ref(false)
  const errorMessage = ref('')

  // 计算根元素样式
  const rootStyle = computed(() => ({
    fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
    color: props.color,
    cursor: props.clickable ? 'pointer' : 'default',
  }))

  // 计算图标样式
  const iconStyle = computed(() => {
    const style: Record<string, any> = {
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: typeof props.size === 'number' ? `${props.size}px` : props.size,
      height: typeof props.size === 'number' ? `${props.size}px` : props.size,
    }

    // 旋转
    if (props.rotate) {
      style.transform = `rotate(${props.rotate}deg)`
    }

    // 翻转
    if (props.flip) {
      const scaleX =
        props.flip === 'horizontal' || props.flip === 'both' ? -1 : 1
      const scaleY = props.flip === 'vertical' || props.flip === 'both' ? -1 : 1
      style.transform =
        `${style.transform || ''} scaleX(${scaleX}) scaleY(${scaleY})`.trim()
    }

    return style
  })

  // 获取图标名称用于显示
  const iconDisplayName = computed(() => {
    if (typeof props.name === 'string') {
      return props.name
    }
    if (props.name && props.name.__name) {
      return props.name.__name
    }
    if (props.name && props.name.name) {
      return props.name.name
    }
    return 'Component Icon'
  })

  // 图标类名
  const iconClasses = computed(() => [
    props.customClass,
    {
      'c-icon__rotatable': props.rotate !== 0,
      'c-icon__flippable': !!props.flip,
    },
  ])

  // 解析组件名称（纯计算属性，无副作用）
  const resolvedComponent = computed(() => {
    if (props.type !== 'component' || !props.name) return null
    return props.name
  })

  // 统一错误处理函数
  const handleError = (type: string, message: string, originalError?: any) => {
    console.warn(`[C_Icon] ${message}:`, iconDisplayName.value, originalError)
    hasError.value = true
    errorMessage.value = message
    emit('error', type, originalError)

    // 如果有回退图标，可以在这里尝试使用回退方案
    if (props.fallbackIcon && !hasError.value) {
      // 这里可以实现回退逻辑
      // 比如尝试使用fallbackIcon作为iconify图标
    }
  }

  // 处理点击事件
  const handleClick = (event: MouseEvent) => {
    if (!props.clickable || props.loading) return
    emit('click', event)
  }

  // 处理键盘事件
  const handleKeydown = (event: KeyboardEvent) => {
    if (!props.clickable || props.loading) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      emit('click', event as any)
    }
  }

  // 处理图片加载成功
  const handleImageLoad = () => {
    emit('load')
  }

  // 处理图片路径 - 使用 useImage hook
  const getImageSrc = computed(() => {
    if (props.type !== 'image' || typeof props.name !== 'string') return ''

    // 如果是完整URL，直接返回
    if (
      props.name.startsWith('http://') ||
      props.name.startsWith('https://') ||
      props.name.startsWith('//') ||
      props.name.startsWith('/')
    ) {
      return props.name
    }

    // 其他情况都当作本地图片处理
    return useImagePath(props.name)
  })

  // 验证规则映射
  const validationRules = {
    iconify: () => {
      if (!props.name.includes(':')) {
        console.warn(
          '[C_Icon] Iconify图标名称格式应为 "prefix:name"，如 "mdi:home"'
        )
      }
    },
    unocss: () => {
      if (typeof props.name !== 'string' || !props.name.startsWith('i-')) {
        console.warn('[C_Icon] UnoCSS图标名称应以 "i-" 开头')
      }
    },
    component: () => !resolvedComponent.value && '无法解析组件',
    svg: () => !props.svgPath && 'SVG路径不能为空',
    image: () => !getImageSrc.value && '图片路径无效',
  }

  // 验证配置
  const validateProps = () => {
    hasError.value = false
    errorMessage.value = ''

    // 基础验证
    if (!props.name) {
      return handleError('validation', '图标名称不能为空')
    }

    // 类型验证
    const validator = validationRules[props.type]
    if (!validator) {
      return handleError('type', '不支持的图标类型')
    }

    const errorMsg = validator()
    if (errorMsg) {
      handleError(props.type, errorMsg)
    }
  }

  // 监听关键属性变化
  watch(
    () => [props.name, props.type, props.svgPath],
    () => {
      nextTick(validateProps)
    },
    { immediate: true }
  )

  // 组件挂载后验证
  onMounted(() => {
    validateProps()
    if (!hasError.value) {
      emit('load')
    }
  })

  // 暴露方法给父组件
  defineExpose({
    /** 重新验证配置 */
    validate: validateProps,
    /** 是否有错误 */
    hasError: readonly(hasError),
    /** 错误信息 */
    errorMessage: readonly(errorMessage),
    /** DOM引用 */
    el: iconRef,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
