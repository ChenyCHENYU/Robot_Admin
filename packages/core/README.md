# @robot/core

Robot Admin 核心基础设施包 - 提供所有 Robot Admin 应用共享的核心功能。

## 📦 包含内容

### 🔐 认证工具 (`utils/auth`)
- `d_getTimeStamp()` - 获取缓存的时间戳
- `d_setTimeStamp()` - 设置缓存时间戳
- `d_refreshTokenExpire()` - 刷新过期时间
- `d_isCheckTimeout()` - 检查是否超时

### 💾 存储工具 (`utils/storage`)
- `setItem()` - 存储数据 (支持类型推断)
- `getItem()` - 获取数据 (安全反序列化)
- `removeItem()` - 删除指定数据
- `removeAllItem()` - 清空所有数据

### 🗂️ 路由工具 (`utils/route`)
- `getShowMenuList()` - 过滤显示的菜单列表
- `getKeepAliveRouterName()` - 获取需要缓存的路由名称

### 📋 菜单工具 (`utils/menu`)
- `normalizeMenuOptions()` - 格式化菜单选项为 NMenu 格式

### 🌐 Axios 封装 (`axios`)
- `service` - 配置好的 axios 实例
- `getData()` - GET 请求快捷方法
- `postData()` - POST 请求快捷方法
- `putData()` - PUT 请求快捷方法
- `deleteData()` - DELETE 请求快捷方法
- 插件系统: 请求去重、缓存、重试、取消等

### 🎨 指令系统 (`directives`)
- `v-permission` - 权限指令
- `v-loading` - 加载指令
- `v-copy` - 复制指令
- 等其他指令...

### 📝 类型定义 (`types`)
- `MenuOptions` - 菜单选项类型
- `UserInfo` - 用户信息类型
- `DynamicRoute` - 动态路由类型
- `EnhancedAxiosRequestConfig` - 增强的 Axios 配置类型

## 📖 使用示例

```typescript
// 导入认证工具
import { d_setTimeStamp, d_isCheckTimeout } from '@robot/core/utils'

// 导入存储工具
import { setItem, getItem } from '@robot/core/utils'

// 导入请求方法
import { getData, postData } from '@robot/core/axios'

// 导入类型
import type { MenuOptions, UserInfo } from '@robot/core/types'

// 使用示例
d_setTimeStamp()
setItem('user', { username: 'admin' })
const user = getItem<UserInfo>('user')
const data = await getData('/api/users')
```

## 🔧 配置说明

所有应用共享相同的核心配置:
- Token 超时检查
- 请求拦截器
- 响应拦截器  
- 错误处理逻辑
- 路由守卫逻辑

## 🎯 设计原则

1. **零配置使用** - 开箱即用,无需额外配置
2. **类型完善** - 完整的 TypeScript 类型支持
3. **高度复用** - 所有 Robot Admin 应用共享
4. **可扩展性** - 支持应用级自定义扩展
