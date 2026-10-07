/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 15:11:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-01 16:02:03
 * @FilePath: \Robot_Admin\src\config\vite\viteAutoImportConfig.ts
 * @Description: Vite 自动导入配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import AutoImport from 'unplugin-auto-import/vite'

export default AutoImport({
  // 本地链接的包会解析到仓库 dist，已编译产物不能再次注入自动导入。
  exclude: [/[\\/]node_modules[\\/]/, /[\\/]dist[\\/]/, /[\\/]\.git[\\/]/],
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
        'NSpace',
        'NTag',
        'NBadge',
        'NCollapse',
        'NCollapseItem',
        'NCode',
        'NAlert',
        'NSpin',
        'NInputNumber',
        'NDatePicker',
        'NSelect',
        'NInput',
        'NSwitch',
        'NIcon',
        'NTooltip',
        'NButton',
        'NButtonGroup',
        'NModal',
        'NPopconfirm',
        'NDropdown',
        'NDataTable',
      ],
    },
  ],
  dts: 'src/types/auto-imports.d.ts', // 生成类型声明文件
  dirs: ['src/composables'], // 自动导入自定义组合式函数
  vueTemplate: true, // 支持模板自动导入
})
