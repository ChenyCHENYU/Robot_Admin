/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\demo-employees.ts
 * @Description: 展开和动态表格演示按数据模式选择独立内存源或真实接口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  createMemoryTableSource,
  type TableCrudSource,
} from '@robot-admin/request-core/naive'
import { isMockDataMode } from '@/config/dataMode'
import type { DemoEmployee } from './demo-employees.contract'
import { DEMO_EMPLOYEES } from './demo-employees.mock'

/** 每个实例独立拥有示例数据，真实接口失败不能回退为演示数据。 */
export function createDemoEmployeeSource(
  list: string
): TableCrudSource<DemoEmployee> {
  return isMockDataMode() ? createMemoryTableSource(DEMO_EMPLOYEES) : { list }
}
