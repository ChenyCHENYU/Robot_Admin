<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-26 13:38:13
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-10 09:57:23
 * @FilePath: \Robot_Admin\src\components\global\C_TagsView\index.vue
 * @Description: 标签页组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    id="guide-tags-view"
    class="tags-view-container"
  >
    <div
      class="tags-track"
      ref="tagsTrack"
      @wheel="handleWheel"
    >
      <div
        class="tags-container"
        ref="tagsContainer"
      >
        <NTag
          v-for="(tag, index) in appStore.tagsViewList"
          :key="tag.path"
          :type="isActive(tag) ? 'primary' : 'default'"
          :closable="!isAffix(tag)"
          :data-path="tag.path"
          @close.stop="handleClose(tag, index)"
          @click="navigateToTag(tag)"
          @contextmenu.prevent="
            (e: MouseEvent) => showContextMenu(e, tag, index)
          "
        >
          <template #icon>
            <C_Icon
              :name="tag.icon"
              :size="12"
            />
          </template>
          {{ tag.title }}
        </NTag>
      </div>
    </div>
    <NDropdown
      v-if="contextMenuVisible"
      :show="contextMenuVisible"
      :options="contextMenuOptions"
      :x="contextMenuX"
      :y="contextMenuY"
      @clickoutside="closeContextMenu"
      @select="handleContextMenuSelect"
    />
  </div>
</template>

<script setup lang="ts">
  import { s_appStore } from '@/stores/app'
  import { translateRouteTitle } from '@/utils/plugins/i18n-route'

  interface Tag {
    path: string
    title: string
    icon?: string
    meta?: {
      affix?: boolean
    }
  }

  // 初始化 store、路由和路由器
  const appStore = s_appStore()
  const route = useRoute()
  const router = useRouter()

  // ✅ 在 setup 阶段（首次渲染前）重新翻译所有持久化标签
  // 必须在 watch 之前执行，确保语言切换后首帧就显示正确语言
  if (appStore.tagsViewList.length > 0) {
    const allRoutes = router.getRoutes()
    const translatedTags = appStore.tagsViewList.map((tag: any) => {
      // 优先级: tag.originalTitle > route.meta.title > tag.title
      const matchedRoute = allRoutes.find(r => r.path === tag.path)
      const originalTitle =
        tag.originalTitle || (matchedRoute?.meta?.title as string) || tag.title
      return {
        ...tag,
        originalTitle,
        title: translateRouteTitle(originalTitle),
      }
    })
    appStore.initTags(translatedTags)
  }

  // 上下文菜单相关的响应式变量
  const contextMenuVisible = ref(false)
  const contextMenuX = ref(0)
  const contextMenuY = ref(0)
  const selectedTag = ref<Tag | null>(null)
  const selectedIndex = ref<number>(-1)

  /**
   * 检查标签是否为当前活动路由
   * @param {Tag} tag - 要检查的标签
   * @returns {boolean} 如果标签是当前活动路由则返回 true，否则返回 false
   */
  const isActive = (tag: Tag): boolean => tag.path === route.path

  /**
   * * @description: 检查标签是否为固定标签
   * ? @param {Tag} tag - 要检查的标签
   * ! @returns {boolean} 如果标签是固定标签则返回 true，否则返回 false
   */
  const isAffix = (tag: Tag) => tag.meta?.affix

  // 添加 ref
  const tagsTrack = ref()
  const tagsContainer = ref()

  /** 滚轮水平平滑滚动 */
  const handleWheel = (e: WheelEvent) => {
    const container = tagsContainer.value
    if (!container) return
    e.preventDefault()
    container.scrollTo({
      left: container.scrollLeft + e.deltaY,
      behavior: 'smooth',
    })
  }

  /**
   * * @description: 滚动到指定标签（智能、零开销）
   * ? @param {string} path - 标签路径
   * ! @return {void}
   */
  const scrollToTag = (path: string) => {
    nextTick(() => {
      const targetTag = tagsContainer.value?.querySelector(
        `[data-path="${path}"]`
      ) as HTMLElement
      if (targetTag) {
        targetTag.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    })
  }

  /**
   * * @description: 导航到指定的标签
   * ? @param {Tag} tag - 要导航到的标签
   * ! @return {void}
   */
  const navigateToTag = (tag: Tag) => {
    if (tag.path !== route.path) {
      router.push(tag.path)
    }
    scrollToTag(tag.path)
  }

  /**
   * * @description: 关闭指定的标签
   * ? @param {Tag} tag - 要关闭的标签
   * ? @param {number} index - 要关闭的标签索引
   * ! @return {void}
   */
  const handleClose = (tag: Tag, index: number) => {
    if (isAffix(tag)) return

    const wasActive = isActive(tag)
    const tagsBeforeRemove = appStore.tagsViewList.length
    const removedPath = appStore.removeTag(index)

    // 如果关闭的是当前活动标签，需要跳转到其他标签
    if (wasActive && removedPath) {
      const remainingTags = appStore.tagsViewList

      // 判断关闭的是否是最后一个标签
      const wasLastTag = index === tagsBeforeRemove - 1

      if (wasLastTag) {
        // 如果是最后一个，跳转到左边的标签
        if (remainingTags[index - 1]) {
          router.push(remainingTags[index - 1].path)
        } else {
          router.push('/home')
        }
      } else {
        // 如果不是最后一个，跳转到列表的最后一个标签
        const lastTag = remainingTags[remainingTags.length - 1]
        if (lastTag) {
          router.push(lastTag.path)
        } else {
          router.push('/home')
        }
      }
    }
  }

  /**
   * * @description: 显示上下文菜单
   * ? @param {MouseEvent} event - 鼠标事件
   * ? @param {Tag} tag - 右键点击的标签
   * ? @param {number} index - 标签的索引
   * ! @return {void}
   */
  const showContextMenu = (event: MouseEvent, tag: Tag, index: number) => {
    event.preventDefault()
    selectedTag.value = tag
    selectedIndex.value = index
    contextMenuVisible.value = true
    contextMenuX.value = event.clientX
    contextMenuY.value = event.clientY
  }

  /**
   * 关闭上下文菜单
   */
  const closeContextMenu = () => (contextMenuVisible.value = false)

  /**
   * 计算上下文菜单选项
   */
  const contextMenuOptions = computed(() => [
    {
      type: 'option',
      label: '关闭',
      key: 'close',
      disabled: isAffix(selectedTag.value as Tag),
      icon: () => h('span', { class: 'i-mdi:close' }),
    },
    {
      type: 'option',
      label: '关闭其他',
      key: 'closeOthers',
      icon: () => h('span', { class: 'i-mdi:arrow-left-right-bold' }),
    },
    {
      type: 'option',
      label: '关闭左侧',
      key: 'closeLeft',
      icon: () => h('span', { class: 'i-mdi:align-horizontal-left' }),
    },
    {
      type: 'option',
      label: '关闭右侧',
      key: 'closeRight',
      icon: () => h('span', { class: 'i-mdi:align-horizontal-right' }),
    },
    {
      type: 'option',
      label: '关闭所有',
      key: 'closeAll',
      icon: () => h('span', { class: 'i-mdi:tally-mark-5' }),
    },
  ])

  /**
   * * @description: 处理上下文菜单的选项选择
   * ? @param {string} key - 选中的菜单项的 key
   * ! @return {void}
   */
  const handleContextMenuSelect = (key: string) => {
    if (!selectedTag.value || selectedIndex.value === -1) return

    switch (key) {
      case 'close':
        handleClose(selectedTag.value, selectedIndex.value)
        break
      case 'closeOthers':
        appStore.removeOtherTags(selectedIndex.value)
        break
      case 'closeLeft':
        appStore.removeLeftTags(selectedIndex.value)
        break
      case 'closeRight':
        appStore.removeRightTags(selectedIndex.value)
        break
      case 'closeAll':
        appStore.removeAllTags()
        router.push('/home')
        break
    }
    closeContextMenu()
  }
  // 监听路由变化更新标签
  watch(
    () => route.path,
    (newPath: string) => {
      // 获取原始标题
      const originalTitle =
        newPath === '/home'
          ? '首页'
          : (route.meta.title as string) || 'Unnamed Page'

      // 添加或更新当前路由标签（保存原始 title）
      appStore.addTag({
        path: newPath,
        originalTitle, // ✅ 保存原始中文
        title: translateRouteTitle(originalTitle), // 翻译后的标题
        icon: newPath === '/home' ? 'mdi:home' : (route.meta.icon as string),
        meta: { affix: route.meta.affix as boolean },
      })

      // 更新选中状态
      appStore.setActiveTag(newPath)

      // 自动滚动到当前标签
      scrollToTag(newPath)
    },
    { immediate: true } // ⚡ 首次挂载时自动添加当前路由标签
  )

  // ⚡ store 已配置 persist: true，无需手动 localStorage 同步
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
