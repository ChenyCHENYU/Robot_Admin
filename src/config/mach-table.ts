/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\src\config\mach-table.ts
 * @Description: 全局网格外观约定，业务场景使用 MachTable 内置 list/detail
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { MachTableRuntimeConfig } from '@agile-team/mach-table-vue'

export default {
  defaults: {
    size: 'compact',
    columnLayout: 'fit',
    stripedRows: true,
    showCellBorders: true,
  },
} satisfies MachTableRuntimeConfig
