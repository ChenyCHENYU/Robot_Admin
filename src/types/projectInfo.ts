/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\types\projectInfo.ts
 * @Description: 关于页的构建版本展示契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export interface ProjectDependency {
  name: string
  version: string
  declaredVersion: string
  description: string
  url: string
}

export interface ProjectInfo {
  version: string
  dependencies: ProjectDependency[]
  devDependencies: ProjectDependency[]
}
