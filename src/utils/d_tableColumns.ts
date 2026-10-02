/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\src\utils\d_tableColumns.ts
 * @Description: C_Table 与 request-core 表格列的集中类型适配边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { TableColumn as ComponentTableColumn } from '@robot-admin/naive-ui-components'
import type { TableColumn as CrudTableColumn } from '@robot-admin/request-core/naive'

/**
 * request-core 只接受字符串字段键；C_Table 还允许数字键。
 * 业务 CRUD 列必须使用字符串键，运行时校验后复用原数组，不复制或改写配置。
 */
export const toCrudTableColumns = <T extends object>(
  columns: ComponentTableColumn<T>[]
): CrudTableColumn<T>[] => {
  for (const column of columns) {
    if ('key' in column && typeof column.key === 'number') {
      throw new TypeError('CRUD 表格列 key 必须是字符串')
    }
  }
  return columns as unknown as CrudTableColumn<T>[]
}
