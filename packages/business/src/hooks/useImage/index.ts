/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-29 19:11:35
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-24 16:39:47
 * @FilePath: \Robot_Admin\src\hooks\useImage\index.ts
 * @Description: 图片引用函数钩子
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
/**
 * @description:  图片引用处理函数
 * @param {string} imagePath 处理前的图片路径，带目录或不带
 * @return {*} {string} 处理后图片路径
 */
export const useImage = (imagePath: string) => {
  // 处理路径，支持带或不带扩展名
  const path = imagePath.replace(/\..+$/, '') // 移除扩展名
  const dir = path.includes('/') ? path.split('/')[0] : undefined
  const imageName = path.includes('/') ? path.split('/').pop()! : path

  try {
    // 动态导入图片
    const modules = import.meta.glob(
      '@/assets/images/**/*.{png,jpg,jpeg,svg}',
      { eager: true }
    )
    const matchedPath = Object.keys(modules).find(
      key =>
        key.includes(`/images/${dir || ''}/${imageName}.`) ||
        (!dir && key.includes(`/images/${imageName}.`))
    )

    if (!matchedPath) {
      console.error(`[useImage] 未找到图片: ${imagePath}`)
      return ''
    }

    return (modules[matchedPath] as any).default
  } catch (error) {
    console.error(`[useImage] 加载图片失败: ${imagePath}`, error)
    return ''
  }
}

//? 使用例子

//TAG: 1. 直接使用图片
// const avatarUrl = useImage('avatar') // 自动查找 assets/images/avatar.png
// const iconUrl = useImage('icons/home') // 自动查找 assets/images/icons/home.png

//TAG: 2. 在模板中使用

// <template>
//   <img :src="useImage('avatar')" />
//   <img :src="useImage('nested/folder/image')" />
// </template>
