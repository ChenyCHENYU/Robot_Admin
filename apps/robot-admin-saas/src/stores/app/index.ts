/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2022-04-10 23:20:30
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-24 15:50:04
 * @FilePath: \Robot_Admin\src\stores\app\index.ts
 * @Description: 应用相关存储
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

import type { MenuTag } from '@/types/modules/menu'

export const s_appStore = defineStore('app', {
  state: () => ({
    tagsViewList: [] as MenuTag[],
    activeTag: '',
  }),

  actions: {
    initTags(tags?: MenuTag[]) {
      if (tags) {
        this.tagsViewList = tags
        this.ensureCurrentRouteTag()
      } else {
        this.tagsViewList = [
          ...new Map(
            this.tagsViewList.map((tag: MenuTag) => [tag.path, tag])
          ).values(),
        ]
      }
    },

    ensureCurrentRouteTag() {
      const route = useRoute()
      if (
        route.path &&
        !this.tagsViewList.some((t: MenuTag) => t.path === route.path)
      ) {
        this.addTag({
          path: route.path,
          title: (route.meta.title as string) || 'Unnamed Page',
          icon: route.meta.icon as string,
          meta: { affix: route.meta.affix as boolean },
        })
      }
    },

    setActiveTag(path: string) {
      this.activeTag = path
    },

    addTag(tag: MenuTag) {
      // ⚡ 使用 findIndex 但提前返回，避免不必要的查找
      const existingTagIndex = this.tagsViewList.findIndex(
        (item: MenuTag) => item.path === tag.path
      )

      if (existingTagIndex === -1) {
        // 标签不存在，添加新标签
        this.tagsViewList.push(tag)
      } else {
        // ✅ 标签已存在，仅更新必要字段（减少响应式开销）
        const existingTag = this.tagsViewList[existingTagIndex]

        // 只在值真正变化时才更新
        if (existingTag.title !== tag.title || !existingTag.originalTitle) {
          existingTag.title = tag.title
          existingTag.originalTitle =
            tag.originalTitle || existingTag.originalTitle
        }
      }

      this.setActiveTag(tag.path)
    },

    removeTag(index: number) {
      if (index >= 0 && index < this.tagsViewList.length) {
        return this.tagsViewList.splice(index, 1)[0]?.path
      }
      return null
    },

    removeOtherTags(index: number) {
      if (index === 0) {
        this.tagsViewList = [this.tagsViewList[0]].filter(Boolean)
      } else {
        this.tagsViewList = [
          this.tagsViewList[0],
          this.tagsViewList[index],
        ].filter(Boolean)
      }
    },

    removeLeftTags(index: number) {
      this.tagsViewList = [
        this.tagsViewList[0],
        ...this.tagsViewList.slice(index),
      ]
    },

    removeRightTags(index: number) {
      this.tagsViewList = this.tagsViewList.slice(0, index + 1)
    },

    removeAllTags() {
      this.tagsViewList = this.tagsViewList.filter(
        (tag: MenuTag) => tag.meta?.affix
      )
    },
  },

  persist: true,
})
