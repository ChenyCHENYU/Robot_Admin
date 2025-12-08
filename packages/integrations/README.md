# @robot/integrations

Robot Admin 第三方集成包 - 统一封装所有第三方库的集成配置。

## 📦 包含内容 (占位)

### 📊 图表集成
- ECharts 默认配置
- AntV X6 默认配置
- 其他图表库配置

### ✏️ 编辑器集成
- Markdown 编辑器配置
- 代码编辑器配置
- 富文本编辑器配置

### 🗓️ 其他集成
- 日历组件配置
- 地图组件配置
- PDF 查看器配置

## 🎯 设计原则

1. **统一配置** - 所有应用使用相同的第三方库配置
2. **版本锁定** - 统一管理第三方库版本
3. **按需导入** - 支持 Tree-shaking
4. **配置分离** - 配置与业务逻辑分离

## 📝 说明

当前此包作为**占位包**存在,提供默认配置。

将来可以封装:
- 图表主题配置
- 编辑器插件配置
- 地图服务配置
- 统一的初始化函数

## 📖 使用示例

```typescript
// 导入默认配置
import { CHART_DEFAULT_CONFIG, EDITOR_DEFAULT_CONFIG } from '@robot/integrations'

// 使用 ECharts 默认配置
const chartOption = {
  ...CHART_DEFAULT_CONFIG.echarts,
  // 自定义配置
}

// 使用编辑器默认配置
const editorConfig = {
  ...EDITOR_DEFAULT_CONFIG.markdown,
  // 自定义配置
}
```
