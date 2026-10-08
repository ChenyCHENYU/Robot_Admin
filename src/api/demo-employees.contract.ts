/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\demo-employees.contract.ts
 * @Description: 表格演示的员工与项目子表契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export interface DemoEmployeeTask {
  id: number
  project?: string
  progress?: string
  requirement?: string
  priority?: string
  service?: string
  version?: string
  status: string
}

export interface DemoEmployee {
  id: number
  name: string
  age: number
  email: string
  department: string
  role: string
  salary: number
  status: string
  hasChildren: boolean
  childData: DemoEmployeeTask[]
}
