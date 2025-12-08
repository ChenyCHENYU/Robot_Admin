# @robot/shared

Robot Admin Monorepo 共享工具包。

## 📦 包含内容

### 工具函数 (`utils`)

#### 类名处理
- `cn()` - 类名合并工具，基于 clsx

#### 验证函数
- `isEmail()` - 邮箱验证
- `isMobile()` - 手机号验证
- `isIdCard()` - 身份证验证
- `isUrl()` - URL 验证
- `isIP()` - IP 地址验证
- `isUsername()` - 用户名验证
- `isStrongPassword()` - 强密码验证
- `isEmpty()` - 空值验证
- `isLength()` - 长度验证
- `isInRange()` - 数字范围验证
- `isNumeric()` - 纯数字验证
- `isChinese()` - 中文验证

#### 字符串处理
- `capitalize()` - 首字母大写
- `camelToKebab()` - 驼峰转kebab
- `kebabToCamel()` - kebab转驼峰
- `snakeToCamel()` - 下划线转驼峰
- `camelToSnake()` - 驼峰转下划线
- `truncate()` - 截断字符串
- `stripHtml()` - 移除HTML标签
- `randomString()` - 生成随机字符串
- `maskString()` - 字符串脱敏

#### 日期处理
- `formatDate()` - 格式化日期
- `getRelativeTime()` - 相对时间描述
- `isToday()` - 判断是否为今天
- `isYesterday()` - 判断是否为昨天
- `getDateRange()` - 获取日期范围
- `daysBetween()` - 计算天数差

#### 数组处理
- `unique()` - 数组去重
- `uniqueBy()` - 根据属性去重
- `chunk()` - 数组分块
- `flatten()` - 数组扁平化
- `groupBy()` - 数组分组
- `sum()` - 数组求和
- `average()` - 平均值
- `max()` / `min()` - 最大/最小值
- `shuffle()` - 随机打乱
- `sample()` - 随机取一项
- `move()` - 移动元素
- `flattenTree()` - 树形结构扁平化

#### 对象处理
- `deepClone()` - 深拷贝
- `deepMerge()` - 深度合并
- `get()` - 获取路径值
- `set()` - 设置路径值
- `omit()` - 省略属性
- `pick()` - 选取属性
- `isEmptyObject()` - 判断对象为空
- `has()` - 检查属性

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
