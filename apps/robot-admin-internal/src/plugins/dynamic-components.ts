/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-25 14:11:31
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-25 15:58:27
 * @FilePath: \Robot_Admin\src\plugins\dynamic-components.ts
 * @Description: 动态组件加载插件(处理:is 动态组件加载)
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import {
  type App,
  type VNode,
  type Component,
  defineAsyncComponent,
  h,
} from 'vue'

/**
 * * @description 组件路径映射表，键为组件名称，值为异步导入组件的函数
 */
const componentPaths: Record<string, () => Promise<unknown>> = {}

/**
 * * @description 这里使用 `import.meta.glob` 异步导入 `@/components` 目录下及其子目录下的所有 `.vue` 文件
 * ? @param path - 文件的完整路径
 */
const modules = import.meta.glob('@/components/**/*.vue')

/**
 * * @description 提取文件路径中的文件名和目录名
 * ? @param path - 文件的完整路径
 * ! @returns 包含文件名和目录名的对象
 */
const extractFileAndDirName = (path: string) => {
  const parts = path.split('/')
  // 提取文件名并去除 `.vue` 后缀
  const fileName = parts.pop()?.replace('.vue', '') || ''
  // 提取目录名
  const dirName = parts[parts.length - 1]
  return { fileName, dirName }
}

/**
 * * @description 处理不同类型组件的映射
 * ? @param componentPaths - 组件路径映射表
 * ? @param fileName - 文件名
 * ? @param parentDir - 父目录名
 * ? @param importFn - 异步导入组件的函数
 * ! @returns void
 */
const handleComponentMapping = (
  componentPaths: Record<string, () => Promise<unknown>>,
  fileName: string,
  parentDir: string,
  importFn: () => Promise<unknown>
) => {
  // 如果文件名是 index，则使用父目录名作为键
  if (fileName === 'index') {
    componentPaths[parentDir] = importFn
  }
}

/**
 * * @description 处理全局组件的映射
 * ? @param componentPaths - 组件路径映射表
 * ? @param fileName - 文件名
 * ? @param importFn - 异步导入组件的函数
 * ! @returns void
 */
const handleGlobalComponent = (
  componentPaths: Record<string, () => Promise<unknown>>,
  fileName: string,
  importFn: () => Promise<unknown>
) => {
  if (fileName.startsWith('C_')) {
    // 如果文件名以 C_ 开头，直接使用文件名作为键
    componentPaths[fileName] = importFn
  } else if (fileName !== 'index') {
    // 如果文件名不是 index，添加 C_ 前缀作为键
    componentPaths[`C_${fileName}`] = importFn
  }
}

/**
 * * @description 处理局部组件的映射
 * ? @param componentPaths - 组件路径映射表
 * ? @param fileName - 文件名
 * ? @param importFn - 异步导入组件的函数
 * ! @returns void
 */
const handleLocalComponent = (
  componentPaths: Record<string, () => Promise<unknown>>,
  fileName: string,
  importFn: () => Promise<unknown>
) => {
  if (fileName.startsWith('c_')) {
    // 如果文件名以 c_ 开头，直接使用文件名作为键
    componentPaths[fileName] = importFn
  } else if (fileName !== 'index') {
    // 如果文件名不是 index，添加 c_ 前缀作为键
    componentPaths[`c_${fileName}`] = importFn
  }
}

/**
 * * @description 处理组件路径和名称，将组件信息添加到映射表中
 * ! @returns void
 */
Object.entries(modules).forEach(([path, importFn]) => {
  const { fileName, dirName } = extractFileAndDirName(path)
  const parentDir = path.split('/').slice(-2, -1)[0]

  // 直接使用完整路径作为键
  componentPaths[path] = importFn
  // 使用文件名作为键
  componentPaths[fileName] = importFn

  handleComponentMapping(componentPaths, fileName, parentDir, importFn)

  if (dirName === 'global' || path.includes('/global/')) {
    // 处理全局组件
    handleGlobalComponent(componentPaths, fileName, importFn)
  } else if (dirName === 'local' || path.includes('/local/')) {
    // 处理局部组件
    handleLocalComponent(componentPaths, fileName, importFn)
  }
})

/**
 * * @description 动态注册组件到 Vue 应用实例
 * ? @param app - Vue 应用实例
 * ! @returns void
 */
export function setupDynamicComponents(app: App) {
  /**
   * * @description 按需注册组件
   * ? @param name - 组件名称
   * ! @returns 注册成功返回 true，否则返回 false
   */
  const registerComponent = (name: string) => {
    // console.log('尝试注册组件:', name, '是否存在路径:', !!componentPaths[name])

    if (!app.component(name) && componentPaths[name]) {
      // console.log('注册组件:', name)
      // 进行类型断言，确保异步导入的是组件
      const asyncComponent = defineAsyncComponent(
        () => componentPaths[name]() as Promise<Component>
      )
      app.component(name, asyncComponent)
      return true
    }
    return false
  }

  // 全局注册获取组件方法
  /**
   * * @description 全局注册获取组件方法
   * ? @param name - 组件名称
   * ! @returns 组件实例或 undefined
   */
  app.config.globalProperties.$getComponent = (name: string) => {
    registerComponent(name)
    return app.component(name)
  }

  // 提供注入，方便在组件中使用
  /**
   * * @description 提供注入，方便在组件中使用
   * ? @param name - 组件名称
   * ! @returns 组件实例或 undefined
   */
  app.provide('getComponent', (name: string) => {
    registerComponent(name)
    return app.component(name)
  })

  // 注册全局动态组件
  app.component('DynamicComponent', {
    props: {
      name: { type: String, required: true },
    },
    /**
     * * @description 渲染动态组件
     * ! @returns 渲染的 VNode 节点或 null
     */
    render(this: {
      name: string
      $attrs: Record<string, unknown>
    }): VNode | null {
      const { name } = this // 使用对象解构获取组件名称
      // console.log('渲染动态组件:', name)

      const Component =
        app.component(name) || (registerComponent(name) && app.component(name))

      if (!Component) {
        console.warn(`动态渲染的组件 "${name}" 未找到`)
        return null
      }

      return h(Component, this.$attrs)
    },
  })
}
