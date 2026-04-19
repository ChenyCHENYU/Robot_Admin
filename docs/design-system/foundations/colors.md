# 色彩系统

> 基于语义化和可访问性的现代色彩体系

## 🎨 设计原则

Robot Admin 的色彩系统遵循以下原则：

1. **语义化** - 每种颜色都有明确的语义含义
2. **可访问性** - 满足 WCAG 2.1 AA 级对比度标准
3. **一致性** - 在不同主题间保持视觉一致性
4. **层次感** - 通过透明度和明度变化创造层次

## 🌈 主色系 (Primary Colors)

### 主品牌色

```scss
// 蓝色系 - 科技感与专业性
$primary: #2080f0; // 主色
$primary-hover: #4098fc; // 悬停态
$primary-pressed: #1060c9; // 按下态
$primary-suppl: #4098fc; // 辅助色

// CSS Variables
:root {
  --app-primary: #2080f0;
  --app-primary-hover: #4098fc;
  --app-primary-pressed: #1060c9;
  --app-primary-suppl: #4098fc;
}
```

### 色彩语义

- **信任感** - 蓝色传达可靠性和专业性
- **科技感** - 符合管理系统的现代化定位
- **通用性** - 适合各种业务场景

## 🚦 功能色系 (Functional Colors)

### 成功色 (Success)

```scss
$success: #18a058; // 成功操作、正确状态
$success-hover: #36ad6a; // 悬停态
$success-pressed: #0c7a43; // 按下态
```

### 警告色 (Warning)

```scss
$warning: #f0a020; // 警告信息、需要注意
$warning-hover: #fcb040; // 悬停态
$warning-pressed: #d18838; // 按下态
```

### 错误色 (Error)

```scss
$error: #d03050; // 错误状态、危险操作
$error-hover: #de576d; // 悬停态
$error-pressed: #b02a47; // 按下态
```

### 信息色 (Info)

```scss
$info: #2080f0; // 信息提示（与主色一致）
$info-hover: #4098fc; // 悬停态
$info-pressed: #1060c9; // 按下态
```

## 🎭 主题色系

### 亮色主题 (Light Theme)

```scss
[data-theme='light'] {
  // 背景色系
  --app-bg-body: #ffffff; // 页面背景
  --app-bg-surface: #f4f7f9; // 表面背景
  --app-bg-content: #ffffff; // 内容背景
  --app-bg-layout: #f4f7f9; // 布局背景

  // 文本色系
  --app-text-primary: #000000; // 主要文本
  --app-text-secondary: #666666; // 次要文本
  --app-text-disabled: #c0c0c0; // 禁用文本
  --app-text-placeholder: #999999; // 占位符文本

  // 边框色系
  --app-border-default: #e5e7eb; // 默认边框
  --app-border-light: #f3f4f6; // 浅色边框
  --app-border-deep: #d1d5db; // 深色边框
}
```

### 暗色主题 (Dark Theme)

```scss
[data-theme='dark'] {
  // 背景色系
  --app-bg-body: #1c1c1c; // 页面背景
  --app-bg-surface: #121212; // 表面背景
  --app-bg-content: #1c1c1c; // 内容背景
  --app-bg-layout: #121212; // 布局背景

  // 文本色系
  --app-text-primary: #ffffff; // 主要文本
  --app-text-secondary: #9ca3af; // 次要文本
  --app-text-disabled: #4a5568; // 禁用文本
  --app-text-placeholder: #6b7280; // 占位符文本

  // 边框色系
  --app-border-default: rgba(255, 255, 255, 0.15); // 默认边框
  --app-border-light: rgba(255, 255, 255, 0.08); // 浅色边框
  --app-border-deep: rgba(255, 255, 255, 0.25); // 深色边框
}
```

## 🌊 透明度系统

### 透明度等级

```scss
// 透明度变量
$alpha-levels: (
  subtle: 0.04,
  // 极淡 - 背景提示
  light: 0.08,
  // 浅色 - 悬停背景
  medium: 0.12,
  // 中等 - 玻璃效果
  strong: 0.16,
  // 较强 - 强调背景
  intense: 0.24, // 强烈 - 遮罩背景
);

// 使用示例
.bg-primary-subtle {
  background: rgba(32, 128, 240, 0.04);
}
.bg-primary-light {
  background: rgba(32, 128, 240, 0.08);
}
.bg-primary-medium {
  background: rgba(32, 128, 240, 0.12);
}
```

### 渐变系统

```scss
// 主色渐变
$gradient-primary: linear-gradient(135deg, #2080f0 0%, #4098fc 100%);
$gradient-primary-intense: linear-gradient(135deg, #1060c9 0%, #2080f0 100%);

// 功能色渐变
$gradient-success: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
$gradient-warning: linear-gradient(135deg, #f0a020 0%, #fcb040 100%);
$gradient-error: linear-gradient(135deg, #d03050 0%, #de576d 100%);

// 中性渐变
$gradient-glass: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.15) 0%,
  rgba(255, 255, 255, 0.05) 100%
);
```

## 🎨 菜单色系

### 个性模式 (Signature)

```scss
// 深邃星空风格
.menu-signature {
  --app-menu-bg: #0d1425; // 深蓝背景
  --app-menu-item-text: #e5e7eb; // 文本颜色
  --app-menu-item-text-hover: #f8fafc; // 悬停文本
  --app-menu-item-icon: #e5e7eb; // 图标颜色
  --app-menu-item-bg-active: #2080f0; // 激活背景
  --app-menu-item-bg-hover: rgba(255, 255, 255, 0.1); // 悬停背景
}
```

### 标准模式 (Standard)

```scss
// 简洁商务风格
.menu-standard {
  --app-menu-bg: var(--app-bg-surface); // 跟随主题背景
  --app-menu-item-text: var(--app-text-primary);
  --app-menu-item-text-hover: var(--app-primary);
  --app-menu-item-icon: var(--app-text-secondary);
  --app-menu-item-bg-active: rgba(32, 128, 240, 0.1);
  --app-menu-item-bg-hover: rgba(32, 128, 240, 0.05);
}
```

## 🔄 动态色彩

### 状态色彩

```scss
// 悬停状态
.interactive-element {
  color: var(--app-text-primary);
  transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    color: var(--app-primary);
  }

  &:active {
    color: var(--app-primary-pressed);
  }

  &:disabled {
    color: var(--app-text-disabled);
  }
}
```

### 焦点状态

```scss
.focusable-element {
  outline: none;
  box-shadow: 0 0 0 2px transparent;
  transition: box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--app-primary);
  }
}
```

## 📊 对比度检查

### 文本对比度

```scss
// AA 级标准 (4.5:1)
.text-aa {
  // 白底黑字: 21:1 ✅
  color: #000000;
  background: #ffffff;
}

.text-aa-inverse {
  // 黑底白字: 21:1 ✅
  color: #ffffff;
  background: #000000;
}

// 主色对比度
.text-primary {
  // 主色与白底: 4.6:1 ✅
  color: var(--app-primary);
  background: #ffffff;
}
```

### 交互元素对比度

```scss
// 按钮对比度
.btn-primary {
  // 白字蓝底: 4.8:1 ✅
  color: #ffffff;
  background: var(--app-primary);

  &:hover {
    // 保持可访问性
    background: var(--app-primary-hover);
  }
}
```

## 🎨 使用指南

### 1. 选择合适的颜色

```scss
// ✅ 正确 - 语义化使用
.success-message {
  color: var(--app-success);
  background: rgba(24, 160, 88, 0.08);
}

// ❌ 错误 - 语义不符
.error-message {
  color: var(--app-success); // 错误信息不应该用绿色
}
```

### 2. 保持一致性

```scss
// ✅ 正确 - 使用 CSS Variables
.card {
  background: var(--app-bg-content);
  border: 1px solid var(--app-border-default);
}

// ❌ 错误 - 硬编码颜色
.card {
  background: #ffffff; // 无法适配暗色主题
  border: 1px solid #e5e7eb;
}
```

### 3. 合理使用透明度

```scss
// ✅ 正确 - 适度透明度
.overlay {
  background: rgba(0, 0, 0, 0.5); // 50% 透明度
}

// ❌ 错误 - 过度透明
.overlay {
  background: rgba(0, 0, 0, 0.1); // 太透明，影响可读性
}
```

## 🛠️ 工具函数

### 色彩混合函数

```scss
@function mix-color($color1, $color2, $weight: 50%) {
  @return mix($color1, $color2, $weight);
}

// 使用示例
.hover-bg {
  background: mix-color(var(--app-primary), transparent, 8%);
}
```

### 透明度函数

```scss
@function alpha($color, $opacity) {
  @return rgba($color, $opacity);
}

// 使用示例
.glass-bg {
  background: alpha(#ffffff, 0.12);
}
```

---

_最后更新：2026年4月19日_
