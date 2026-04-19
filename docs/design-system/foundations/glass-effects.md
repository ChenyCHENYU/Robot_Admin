# 玻璃质感效果系统

> 受 iOS 毛玻璃效果启发的现代化视觉语言

## 🔮 设计原理

玻璃质感效果是 Robot Admin 设计系统的核心特征，通过模拟真实玻璃的光学特性来创造层次丰富的视觉体验。

### 核心技术

1. **backdrop-filter** - 背景模糊滤镜
2. **rgba() 透明度** - 半透明色彩叠加
3. **inset 阴影** - 内发光模拟玻璃反射
4. **多层阴影** - 营造悬浮感和深度
5. **saturate()** - 色彩饱和度增强

## 🎨 玻璃质感等级

### Level 1: 轻微玻璃 (Subtle Glass)

适用于：背景面板、次要卡片

```scss
@mixin glass-subtle($opacity: 0.08) {
  background: rgba(255, 255, 255, $opacity);
  backdrop-filter: blur(8px) saturate(150%);
  -webkit-backdrop-filter: blur(8px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, $opacity + 0.05);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);

  [data-theme='dark'] & {
    background: rgba(255, 255, 255, $opacity * 0.5);
    border: 1px solid rgba(255, 255, 255, $opacity);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 1px rgba(255, 255, 255, 0.1);
  }
}
```

### Level 2: 标准玻璃 (Standard Glass)

适用于：主要卡片、弹窗、侧边栏

```scss
@mixin glass-standard($opacity: 0.12) {
  background: rgba(255, 255, 255, $opacity);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, $opacity + 0.15);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 1px rgba(255, 255, 255, 0.3),
    inset 0 -1px 1px rgba(0, 0, 0, 0.02);

  [data-theme='dark'] & {
    background: rgba(255, 255, 255, $opacity * 0.6);
    border: 1px solid rgba(255, 255, 255, $opacity);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 1px rgba(255, 255, 255, 0.15),
      inset 0 -1px 1px rgba(0, 0, 0, 0.05);
  }
}
```

### Level 3: 强烈玻璃 (Intense Glass)

适用于：重要提示、焦点元素、Hero 区域

```scss
@mixin glass-intense($opacity: 0.18) {
  background: rgba(255, 255, 255, $opacity);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, $opacity + 0.2);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 2px 4px rgba(255, 255, 255, 0.4),
    inset 0 -2px 4px rgba(0, 0, 0, 0.03);

  [data-theme='dark'] & {
    background: rgba(255, 255, 255, $opacity * 0.7);
    border: 1px solid rgba(255, 255, 255, $opacity + 0.1);
    box-shadow:
      0 16px 48px rgba(0, 0, 0, 0.5),
      0 8px 24px rgba(0, 0, 0, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.2),
      inset 0 -2px 4px rgba(0, 0, 0, 0.08);
  }
}
```

## 🌈 彩色玻璃变体

### 蓝色玻璃 (Primary Glass)

```scss
@mixin glass-primary($opacity: 0.12) {
  background: rgba(32, 128, 240, $opacity);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(32, 128, 240, $opacity + 0.1);
  box-shadow:
    0 8px 32px rgba(32, 128, 240, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}
```

### 绿色玻璃 (Success Glass)

```scss
@mixin glass-success($opacity: 0.12) {
  background: rgba(24, 160, 88, $opacity);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(24, 160, 88, $opacity + 0.1);
  box-shadow:
    0 8px 32px rgba(24, 160, 88, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}
```

## 🎭 动态玻璃效果

### 悬停增强

```scss
.glass-card {
  @include glass-standard();
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    @include glass-intense();
    transform: translateY(-4px);
    box-shadow:
      0 20px 48px rgba(0, 0, 0, 0.15),
      0 8px 24px rgba(0, 0, 0, 0.08),
      inset 0 2px 4px rgba(255, 255, 255, 0.4);
  }
}
```

### 渐变玻璃

```scss
.glass-gradient {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 40%,
      rgba(255, 255, 255, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover::before {
    opacity: 1;
  }
}
```

## 📱 响应式适配

### 移动端优化

```scss
@media (max-width: 768px) {
  .glass-card {
    // 减少模糊强度以提升性能
    backdrop-filter: blur(8px) saturate(150%);
    -webkit-backdrop-filter: blur(8px) saturate(150%);

    // 简化阴影
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}
```

### 性能优化

```scss
// 禁用动画时的回退
@media (prefers-reduced-motion: reduce) {
  .glass-card {
    backdrop-filter: none;
    background: var(--n-card-color);
    border: 1px solid var(--n-border-color);
  }
}

// 低端设备检测
@supports not (backdrop-filter: blur(1px)) {
  .glass-card {
    background: var(--n-card-color);
    border: 1px solid var(--n-border-color);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}
```

## 🎨 使用示例

### 统计卡片

```vue
<template>
  <div class="stat-card glass-standard">
    <div class="stat-icon">📊</div>
    <div class="stat-content">
      <h3>总用户数</h3>
      <p class="stat-number">12,345</p>
    </div>
  </div>
</template>

<style scoped>
  .stat-card {
    @include glass-standard();
    padding: 1.5rem;
    border-radius: 16px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      @include glass-intense();
      transform: translateY(-4px);
    }
  }
</style>
```

### 导航面板

```vue
<template>
  <nav class="nav-panel glass-subtle">
    <div class="nav-header">
      <h2>导航菜单</h2>
    </div>
    <ul class="nav-list">
      <li class="nav-item">首页</li>
      <li class="nav-item active">用户管理</li>
    </ul>
  </nav>
</template>

<style scoped>
  .nav-panel {
    @include glass-subtle();
    padding: 1rem;
    border-radius: 12px;
  }

  .nav-item.active {
    @include glass-primary(0.1);
    border-radius: 8px;
    padding: 0.5rem 1rem;
  }
</style>
```

## ⚠️ 注意事项

1. **性能考虑** - backdrop-filter 是 GPU 密集型操作，避免过度使用
2. **浏览器兼容** - 提供 fallback 样式给不支持的浏览器
3. **对比度** - 确保文字在玻璃背景上有足够的对比度
4. **层级管理** - 合理使用 z-index 避免玻璃效果重叠问题
5. **主题适配** - 暗色主题下需要调整透明度和边框颜色

---

_最后更新：2026年4月19日_
