/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 15:11:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-17 15:23:04
 * @FilePath: \Robot_Admin\src\config\vite\plugin\viteAutoImportConfig.ts
 * @Description: Vite 自动导入配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import AutoImport from 'unplugin-auto-import/vite'

export default AutoImport({
  imports: [
    'vue',
    'vue-router',
    'pinia',
    {
      '@vueuse/core': ['useLocalStorage', 'useClipboard', 'useDebounceFn'],
    },
    {
      'naive-ui': [
        'useDialog',
        'useMessage',
        'useNotification',
        'useLoadingBar',
        'NCard',
        'NButton',
        'NSpace',
        'NTag',
        'NBadge',
        'NCollapse',
        'NCollapseItem',
        'NCode',
        'NAlert',
        'NSpin',
      ],
    },
  ],
  dts: 'src/types/auto-imports.d.ts', // 生成类型声明文件
  dirs: ['src/stores', 'src/composables', 'src/hooks'], // 自动导入自定义组合式函数
  vueTemplate: true, // 支持模板自动导入
})
