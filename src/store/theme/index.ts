/*
 * @Author: ChenYu
 * @Date: 2022-04-16 11:44:54
 * @LastEditors: ChenYu
 * @LastEditTime: 2022-04-18 01:19:22
 * @FilePath: \v3-el-components\src\store\theme\index.ts
 * @Description: 主题仓库
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

import { getItem, setItem } from '_hooks/useStorage'
import { MAIN_COLOR, DEFAULT_COLOR } from '@/constant'
import variables from '@/styles/var.module.scss'
import { d_generateColors } from '_utils/d_theme'

export const s_themeStore = defineStore('theme', {
  state: () => {
    return {
      mainColor: getItem(MAIN_COLOR) || DEFAULT_COLOR,
      variables,
    }
  },
  getters: {
    changeCssVar(state) {
      return {
        ...state.variables,
        ...d_generateColors(getItem(MAIN_COLOR)),
      }
    },
  },

  actions: {
    setMainColor(newColor) {
      this.mainColor = newColor
      this.variables.menuBg = newColor
      setItem(MAIN_COLOR, newColor)
    },
  },
})
