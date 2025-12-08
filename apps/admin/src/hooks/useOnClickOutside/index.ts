/*
 * @Author: ChenYu
 * @Date: 2022-03-18 23:53:27
 * @LastEditors: ChenYu ycyplus@163.com
 * @LastEditTime: 2022-11-10 12:35:23
 * @FilePath: \vue3_vite3_elementPlus_admin\src\hooks\useOnClickOutside\index.ts
 * @Description: 点击外侧模态框使其关闭
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

import { onClickOutside } from '@vueuse/core'
import type { Ref } from 'vue'

/**
 * @description: 处理模态框外部点击关闭模态框钩子
 * @param targetRef 绑定的目标模板节点
 * @param visible 控制该模态框隐藏显示的自定义值
 * @param className 点击被冒泡要控制visible节点的指定父元素
 * @return {*} 变更后的控制隐显模态框 Ref 对象
 */
export const useOnClickOutside = (
  targetRef: Ref<null>,
  visible: Ref<boolean>,
  className = 'el-main'
) => {
  return onClickOutside(targetRef, ({ target }) => {
    const _class = (target as HTMLDivElement).getAttribute('class')
    if (_class === className) visible.value = false
    return visible
  })
}
