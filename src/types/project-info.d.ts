/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\types\project-info.d.ts
 * @Description: 构建版本信息虚拟模块声明
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
declare module 'virtual:robot-admin-project-info' {
  const projectInfo: import('./projectInfo').ProjectInfo
  export default projectInfo
}
