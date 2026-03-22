/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-22
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-22
 * @FilePath: \Robot_Admin\src\stores\favorites\index.ts
 * @Description: 菜单收藏状态管理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { defineStore } from 'pinia'

/**
 * * @description: 收藏菜单 Store
 * 管理用户收藏的菜单快捷方式，用于门户页面展示
 */
export const s_favoritesStore = defineStore('favorites', {
  state: () => ({
    /** 收藏的菜单路径列表 */
    favorites: [] as string[],
  }),

  getters: {
    /**
     * * @description: 判断指定路径是否已收藏
     */
    isFavorite: (state) => (path: string) => state.favorites.includes(path),
  },

  actions: {
    /**
     * * @description: 添加收藏
     * ? @param {string} path 菜单路径
     */
    add(path: string) {
      if (!this.favorites.includes(path)) {
        this.favorites.push(path)
      }
    },

    /**
     * * @description: 移除收藏
     * ? @param {string} path 菜单路径
     */
    remove(path: string) {
      const idx = this.favorites.indexOf(path)
      if (idx !== -1) {
        this.favorites.splice(idx, 1)
      }
    },

    /**
     * * @description: 切换收藏状态
     * ? @param {string} path 菜单路径
     */
    toggle(path: string) {
      if (this.isFavorite(path)) {
        this.remove(path)
      } else {
        this.add(path)
      }
    },
  },

  persist: true,
})
