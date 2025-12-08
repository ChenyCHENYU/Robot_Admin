# @robot/shared

Robot Admin Monorepo 共享工具包。

## 📦 包含内容

### 工具函数 (`utils`)

- `cn()` - 类名合并工具，基于 clsx

### 类型定义 (`types`)

- `ObjectValues<T>` - 获取对象值的类型
- `Optional<T, K>` - 可选的部分属性
- `Required<T, K>` - 必需的部分属性
- `ID` - 通用 ID 类型

### 常量 (`constants`)

- `REGEX` - 常用正则表达式集合
  - EMAIL - 邮箱
  - PHONE - 手机号
  - URL - 网址
  - ID_CARD - 身份证
  - CHINESE - 中文字符
  - NUMBER - 数字
  - INTEGER - 整数
  - DECIMAL - 小数

## 📖 使用方式

### 在 admin 应用中使用

```typescript
// 导入工具函数
import { cn } from '@robot/shared'

// 导入类型
import type { ID, ObjectValues } from '@robot/shared'

// 导入常量
import { REGEX } from '@robot/shared'

// 使用示例
const className = cn('foo', 'bar', { baz: true })
const isEmail = REGEX.EMAIL.test('test@example.com')
```

### 按模块导入

```typescript
import { cn } from '@robot/shared/utils'
import type { ID } from '@robot/shared/types'
import { REGEX } from '@robot/shared/constants'
```

## 🚀 开发

```bash
# 类型检查
bun run type-check
```

## 📝 版本

当前版本：**1.0.0**

## 🎯 迁移记录

- ✅ `cn()` - 从 `apps/admin/src/lib/utils.ts` 迁移
- ✅ `ObjectValues` - 从 `apps/admin/src/lib/utils.ts` 迁移
- ✅ `REGEX` - 新增常用正则表达式
