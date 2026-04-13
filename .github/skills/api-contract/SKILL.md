---
name: api-contract
description: 'Use when: generating TypeScript API layer (type definitions + request functions) from page-spec JSON or Swagger/OpenAPI docs. Triggers on: api contract, api generation, 接口约定, 生成api, swagger to ts, openapi, 接口文件, api层.'
---

# Skill: 接口约定（api-contract）

根据 **page-spec JSON**（来自 prototype-scan）或 **Swagger/OpenAPI/接口文档**，
生成符合 Robot Admin 规范的 **TypeScript 类型定义 + API 请求函数**。

---

## 触发

- **模式 A**：接收 page-spec JSON → 按页面字段推导请求/响应类型
- **模式 B**：接收 Swagger/OpenAPI JSON/YAML → 自动映射为 TS 类型
- **模式 C**：接收接口设计文档（MD/表格） → 手动解析接口定义

---

## 前置约定

### 请求方法（@robot-admin/request-core）

```typescript
import {
  getData,
  postData,
  putData,
  deleteData,
} from '@robot-admin/request-core'
```

| 工具函数                      | HTTP Method | 典型场景             |
| ----------------------------- | ----------- | -------------------- |
| `getData<T>(url, params?)`    | GET         | 列表查询、详情获取   |
| `postData<T>(url, data?)`     | POST        | 新增、登录、复杂查询 |
| `putData<T>(url, data?)`      | PUT         | 修改更新             |
| `deleteData<T>(url, params?)` | DELETE      | 删除                 |

### URL 约定

```
/<domain>/<resource>             — 列表/新增
/<domain>/<resource>/:id         — 详情/修改/删除
/<domain>/<resource>/:id/<sub>   — 子资源
```

示例：

```
GET    /sys/users                 → 用户列表
POST   /sys/users                 → 新增用户
GET    /sys/users/:id             → 用户详情
PUT    /sys/users/:id             → 修改用户
DELETE /sys/users/:id             → 删除用户
GET    /sys/users/:id/roles       → 用户角色
```

### 统一响应体结构

```typescript
interface ApiResponse<T = unknown> {
  code: string | number // '0' | '200' | 0 | 200 为成功
  data: T
  msg: string
}
```

列表响应：

```typescript
interface ListResponse<T = Record<string, unknown>> {
  code: string | number
  data: {
    list: T[]
    total: number
  }
  msg: string
}
```

---

## 步骤

### 1. 从 page-spec 推导类型

根据 page-spec JSON 中的 `columns`、`form`、`query` 字段自动生成类型。

**命名规则：**

| HTTP Method    | 命名模式                               | 示例                         |
| -------------- | -------------------------------------- | ---------------------------- |
| GET（列表）    | `Get{Domain}{Resource}ListResponse`    | `GetSysUsersListResponse`    |
| GET（详情）    | `Get{Domain}{Resource}ByIdResponse`    | `GetSysUsersByIdResponse`    |
| POST（新增）   | `Post{Domain}{Resource}Response`       | `PostSysUsersResponse`       |
| PUT（修改）    | `Put{Domain}{Resource}ByIdResponse`    | `PutSysUsersByIdResponse`    |
| DELETE（删除） | `Delete{Domain}{Resource}ByIdResponse` | `DeleteSysUsersByIdResponse` |

### 2. 生成类型定义文件

输出文件：`src/api/generated/index.ts`（追加或更新已有类型）

```typescript
/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: {{date}}
 * @Description: API 自动生成类型 — {{module}} 模块
 * Copyright (c) {{year}} by CHENY, All Rights Reserved 😎.
 */

/** {{资源}}列表查询参数 */
export interface Get{{Resource}}ListParams {
  page?: number
  pageSize?: number
  keyword?: string
  // ... 从 page-spec.query 推导
}

/** {{资源}}列表响应 */
export interface Get{{Resource}}ListResponse {
  code: string
  data: {
    list: {{Resource}}Item[]
    total: number
  }
  msg: string
}

/** {{资源}}数据项 */
export interface {{Resource}}Item {
  id: number | string
  // ... 从 page-spec.columns + page-spec.form 合并推导
  createTime?: string
  updateTime?: string
}

/** {{资源}}新增/编辑表单数据 */
export interface {{Resource}}FormData {
  // ... 从 page-spec.form 推导
}

/** {{资源}}详情响应 */
export interface Get{{Resource}}ByIdResponse {
  code: string
  data: {{Resource}}Item
  msg: string
}

/** {{资源}}新增响应 */
export interface Post{{Resource}}Response {
  code: string
  data: {{Resource}}Item
  msg: string
}

/** {{资源}}更新响应 */
export interface Put{{Resource}}ByIdResponse {
  code: string
  data: {{Resource}}Item
  msg: string
}

/** {{资源}}删除响应 */
export interface Delete{{Resource}}ByIdResponse {
  code: string
  data: Record<string, unknown>
  msg: string
}
```

### 3. 生成 API 请求函数文件

输出文件：`src/api/<domain>-<resource>.ts`

```typescript
/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: {{date}}
 * @Description: {{模块中文名}} — API 接口
 * Copyright (c) {{year}} by CHENY, All Rights Reserved 😎.
 */

import { getData, postData, putData, deleteData } from '@robot-admin/request-core'
import type {
  Get{{Resource}}ListResponse,
  Get{{Resource}}ByIdResponse,
  Post{{Resource}}Response,
  Put{{Resource}}ByIdResponse,
  Delete{{Resource}}ByIdResponse,
} from './generated'

/**
 * * @description: 查询{{资源中文名}}列表
 * ? @param {Record<string, any>} params 查询参数
 * ! @return {Promise<Get{{Resource}}ListResponse>} 列表响应
 */
export const get{{Resource}}ListApi = (params?: Record<string, any>) =>
  getData<Get{{Resource}}ListResponse>('/<domain>/<resource>', params)

/**
 * * @description: 新增{{资源中文名}}
 * ? @param {Record<string, any>} data 表单数据
 * ! @return {Promise<Post{{Resource}}Response>} 新增响应
 */
export const create{{Resource}}Api = (data: Record<string, any>) =>
  postData<Post{{Resource}}Response>('/<domain>/<resource>', data)

/**
 * * @description: 获取{{资源中文名}}详情
 * ? @param {number|string} id 资源ID
 * ! @return {Promise<Get{{Resource}}ByIdResponse>} 详情响应
 */
export const get{{Resource}}ByIdApi = (id: number | string) =>
  getData<Get{{Resource}}ByIdResponse>(`/<domain>/<resource>/${id}`)

/**
 * * @description: 更新{{资源中文名}}
 * ? @param {number|string} id 资源ID
 * ? @param {Record<string, any>} data 更新数据
 * ! @return {Promise<Put{{Resource}}ByIdResponse>} 更新响应
 */
export const update{{Resource}}Api = (id: number | string, data: Record<string, any>) =>
  putData<Put{{Resource}}ByIdResponse>(`/<domain>/<resource>/${id}`, data)

/**
 * * @description: 删除{{资源中文名}}
 * ? @param {number|string} id 资源ID
 * ! @return {Promise<Delete{{Resource}}ByIdResponse>} 删除响应
 */
export const delete{{Resource}}Api = (id: number | string) =>
  deleteData<Delete{{Resource}}ByIdResponse>(`/<domain>/<resource>/${id}`)
```

### 4. useTableCrud 集成（可选）

当页面模式为 `LIST` 且使用 C_Table 时，额外输出 useTableCrud 配置：

```typescript
import { useTableCrud } from '@robot-admin/request-core'

const table = useTableCrud({
  api: {
    list: '/<domain>/<resource>',
    create: '/<domain>/<resource>',
    update: '/<domain>/<resource>/:id',
    delete: '/<domain>/<resource>/:id',
    detail: '/<domain>/<resource>/:id',
  },
  columns: [...],
  pagination: { pageSize: 20 },
})
```

---

## 验证规则映射

page-spec 中的 `rules` 字段转换为 `@robot-admin/form-validate` 的预设规则：

```typescript
import { PRESET_RULES } from '@robot-admin/form-validate'
```

| 规则描述   | 转换结果                               |
| ---------- | -------------------------------------- |
| 必填       | `PRESET_RULES.required('字段名')`      |
| 长度2-20   | `PRESET_RULES.length('字段名', 2, 20)` |
| 数值 18-65 | `PRESET_RULES.range('字段名', 18, 65)` |
| 邮箱       | `PRESET_RULES.email('邮箱')`           |
| 手机号     | `PRESET_RULES.mobile('手机号')`        |
| URL        | `PRESET_RULES.url('URL')`              |
| 身份证     | `PRESET_RULES.idCard('身份证')`        |
| IP         | `PRESET_RULES.ip('IP')`                |

---

## 输出文件清单

| 文件                             | 说明                                    |
| -------------------------------- | --------------------------------------- |
| `src/api/generated/index.ts`     | 追加自动生成的 TS 类型（接口响应/参数） |
| `src/api/<domain>-<resource>.ts` | API 请求函数（CRUD 全套）               |

---

## 注意事项

1. **不破坏已有文件**：`src/api/generated/index.ts` 采用追加模式，不清空已有类型
2. **JSDoc 强制**：所有导出函数必须包含 JSDoc（`* @description` / `? @param` / `! @return`）
3. **文件头注释**：每个新建文件必须包含 `@Author` / `@Date` / `@Description` 文件头
4. **类型优先**：所有 API 函数必须标注泛型返回类型 `getData<T>(...)`
5. **路径别名**：内部导入使用 `@/api/generated`，不使用相对路径 `./generated`
6. **request-core 唯一来源**：请求方法只从 `@robot-admin/request-core` 导入，不直接使用 axios
