/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-06
 * @FilePath: \Robot_Admin\e2e\fixtures\runtime\picker.ts
 * @Description: 从独立发布入口加载候选表，避免预先引入 C_Table
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { createApp, h } from 'vue'
import { C_DataPicker } from '@robot-admin/naive-ui-components/C_DataPicker'
import '@robot-admin/naive-ui-components/C_DataPicker/style.css'

interface Customer {
  id: number
  name: string
}

createApp({
  render: () =>
    h(C_DataPicker<Customer>, {
      columns: [{ key: 'name', title: '客户名称' }],
      source: {
        rowKey: 'id',
        label: row => row.name,
        request: async () => ({
          rows: [{ id: 1, name: '星海科技' }],
          total: 1,
        }),
      },
    }),
}).mount('#app')
