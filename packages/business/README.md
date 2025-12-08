# @robot/business

Robot Admin 业务逻辑包 - 提供所有 Robot Admin 应用共享的业务 Hooks 和工具函数。

## 📦 包含内容

### 🔧 业务 Hooks
- `useCopy` - 复制功能
- `useDownload` - 下载功能
- `useExcel` - Excel 导入导出
- `useFormSubmit` - 表单提交
- `useImage` - 图片处理
- `useJsZip` - 压缩解压

### 🛠️ 业务工具
- `verify` - 表单验证规则 (REGEX_PATTERNS)

## 📖 使用示例

```typescript
// 导入业务 Hooks
import { useCopy, useDownload, useExcel } from '@robot/business'

// 使用复制功能
const { copy } = useCopy()
await copy('复制的内容')

// 使用下载功能
const { download } = useDownload()
download('file.pdf', blobData)

// 使用 Excel 导入导出
const { exportExcel } = useExcel()
exportExcel(data, 'export.xlsx')

// 导入验证工具
import { REGEX_PATTERNS } from '@robot/business/utils'
const isValid = REGEX_PATTERNS.EMAIL.test(email)
```

## 🎯 设计原则

1. **业务复用** - 所有 Robot Admin 应用共享相同的业务逻辑
2. **独立无耦合** - 不依赖具体页面或路由
3. **类型完善** - 完整的 TypeScript 类型支持
4. **易扩展** - 支持应用级自定义扩展
