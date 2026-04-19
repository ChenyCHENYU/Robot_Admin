# 动效系统

> 基于物理规律的自然动画语言

## 🎬 设计理念

Robot Admin 的动效系统受 Apple 的动画设计启发，追求自然、流畅、有意义的动画效果。每个动画都应该：

1. **有目的性** - 引导用户注意力，提供反馈
2. **自然感** - 模拟真实世界的物理运动
3. **性能优化** - 使用 GPU 加速，避免重排重绘
4. **可访问性** - 尊重用户的动画偏好设置

## ⏱️ 时间系统

### 持续时间等级

```scss
$durations: (
  instant: 0ms,
  // 即时 - 状态切换
  fast: 150ms,
  // 快速 - 按钮反馈
  base: 250ms,
  // 基础 - 悬停效果
  slow: 400ms,
  // 慢速 - 页面过渡
  slower: 600ms,
  // 更慢 - 复杂动画
  glacial: 1000ms, // 极慢 - 特殊效果
);

// CSS Variables
:root {
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;
  --duration-glacial: 1000ms;
}
```

### 使用指南

- **0-150ms** - 微交互反馈（按钮点击、开关切换）
- **150-300ms** - 悬停效果、工具提示显示
- **300-500ms** - 页面元素进入/退出
- **500ms+** - 复杂状态变化、页面转场

## 📈 缓动函数

### 标准缓动曲线

```scss
$easings: (
  // 线性
  linear: linear,

  // 标准缓动 - 最常用
  ease: cubic-bezier(0.4, 0, 0.2, 1),
  ease-in: cubic-bezier(0.4, 0, 1, 1),
  ease-out: cubic-bezier(0, 0, 0.2, 1),
  ease-in-out: cubic-bezier(0.4, 0, 0.2, 1),
  // 自定义缓动
  smooth: cubic-bezier(0.16, 1, 0.3, 1),
  // 平滑进入
  bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55),
  // 弹性效果
  sharp: cubic-bezier(0.4, 0, 0.6, 1) // 锐利切换
);

// CSS Variables
:root {
  --easing-linear: linear;
  --easing-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --easing-sharp: cubic-bezier(0.4, 0, 0.6, 1);
}
```

### 缓动选择指南

- **ease** - 通用选择，适合大部分场景
- **ease-out** - 元素进入动画
- **ease-in** - 元素退出动画
- **smooth** - 玻璃质感元素的优雅动画
- **bounce** - 成功反馈、特殊强调
- **sharp** - 快速状态切换

## 🎯 核心动画模式

### 1. 悬停提升 (Hover Lift)

```scss
@mixin hover-lift($y: -4px, $scale: 1.02, $duration: 0.3s) {
  transition: transform #{$duration} var(--easing-smooth);

  &:hover {
    transform: translateY($y) scale($scale);
  }
}

// 使用示例
.card {
  @include hover-lift(-6px, 1.01, 0.4s);
}
```

### 2. 淡入淡出 (Fade)

```scss
@mixin fade-in($duration: 0.3s, $delay: 0s) {
  opacity: 0;
  animation: fadeIn #{$duration} var(--easing-ease) #{$delay} forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@mixin fade-out($duration: 0.3s, $delay: 0s) {
  animation: fadeOut #{$duration} var(--easing-ease) #{$delay} forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
```

### 3. 滑动进入 (Slide In)

```scss
@mixin slide-in-up($distance: 20px, $duration: 0.4s) {
  transform: translateY($distance);
  opacity: 0;
  animation: slideInUp #{$duration} var(--easing-smooth) forwards;
}

@keyframes slideInUp {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@mixin slide-in-right($distance: 20px, $duration: 0.4s) {
  transform: translateX(-$distance);
  opacity: 0;
  animation: slideInRight #{$duration} var(--easing-smooth) forwards;
}

@keyframes slideInRight {
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### 4. 缩放动画 (Scale)

```scss
@mixin scale-in($duration: 0.3s, $delay: 0s) {
  transform: scale(0.8);
  opacity: 0;
  animation: scaleIn #{$duration} var(--easing-bounce) #{$delay} forwards;
}

@keyframes scaleIn {
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@mixin pulse($duration: 2s) {
  animation: pulse #{$duration} var(--easing-ease) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}
```

## ✨ 特殊效果动画

### 1. 光晕脉冲 (Glow Pulse)

```scss
@mixin glow-pulse($color: var(--app-primary), $duration: 3s) {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: inherit;
    background: radial-gradient(circle, #{$color}40 0%, transparent 70%);
    opacity: 0;
    animation: glowPulse #{$duration} var(--easing-ease) infinite;
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}
```

### 2. 浮动动画 (Float)

```scss
@mixin gentle-float($duration: 4s, $distance: 6px) {
  animation: gentleFloat #{$duration} var(--easing-ease) infinite;
}

@keyframes gentleFloat {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-#{$distance / 2}) rotate(1deg);
  }
  50% {
    transform: translateY(-#{$distance}) rotate(0deg);
  }
  75% {
    transform: translateY(-#{$distance / 2}) rotate(-1deg);
  }
}
```

### 3. 彩虹弹跳 (Rainbow Bounce)

```scss
@mixin rainbow-bounce($duration: 0.6s) {
  animation: rainbowBounce #{$duration} var(--easing-bounce);
}

@keyframes rainbowBounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0) scale(1) rotateZ(0deg);
  }
  40% {
    transform: translateY(-20px) scale(1.3) rotateZ(10deg);
  }
  60% {
    transform: translateY(-10px) scale(1.15) rotateZ(-5deg);
  }
}
```

### 4. 闪烁效果 (Shimmer)

```scss
@mixin shimmer($duration: 2s, $color: rgba(255, 255, 255, 0.3)) {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #{$color}, transparent);
    animation: shimmer #{$duration} var(--easing-ease) infinite;
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
```

## 🎭 主题切换动画

### View Transition API

```scss
// 主题切换动画配置
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
  animation-timing-function: var(--easing-smooth);
}

::view-transition-old(root) {
  animation-name: theme-fade-out;
}

::view-transition-new(root) {
  animation-name: theme-fade-in;
}

@keyframes theme-fade-out {
  to {
    opacity: 0;
  }
}

@keyframes theme-fade-in {
  from {
    opacity: 0;
  }
}

// 禁用冲突动画
html.theme-transitioning *,
html.theme-transitioning *::before,
html.theme-transitioning *::after {
  transition: none !important;
  animation-duration: 0s !important;
}
```

### 传统主题切换

```scss
.theme-transition {
  transition:
    background-color 0.4s var(--easing-smooth),
    color 0.4s var(--easing-smooth),
    border-color 0.4s var(--easing-smooth),
    box-shadow 0.4s var(--easing-smooth);
}
```

## 📱 响应式动画

### 移动端优化

```scss
// 减少动画复杂度
@media (max-width: 768px) {
  .complex-animation {
    animation: none;
    transition: opacity 0.2s var(--easing-ease);
  }
}

// 尊重用户偏好
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 性能优化

```scss
// GPU 加速
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
}

// 避免重排重绘
.performance-optimized {
  // ✅ 只影响 composite 层
  transform: translateX(0);
  opacity: 1;

  // ❌ 会触发重排
  // left: 0;
  // width: 100%;
}
```

## 🎨 组合动画

### 错时动画 (Staggered)

```scss
@mixin stagger-animation($delay-increment: 0.1s, $max-items: 10) {
  @for $i from 1 through $max-items {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * $delay-increment};
    }
  }
}

// 使用示例
.list-item {
  @include fade-in(0.3s);
  @include stagger-animation(0.1s, 5);
}
```

### 连锁反应动画

```scss
.chain-animation {
  .step-1 {
    animation: fadeIn 0.3s var(--easing-ease) 0s forwards;
  }

  .step-2 {
    animation: slideInUp 0.4s var(--easing-smooth) 0.2s forwards;
  }

  .step-3 {
    animation: scaleIn 0.3s var(--easing-bounce) 0.5s forwards;
  }
}
```

## 🛠️ 实用工具

### 动画状态管理

```scss
// 动画播放状态
.animation-paused {
  animation-play-state: paused;
}

.animation-running {
  animation-play-state: running;
}

// 动画方向
.animation-reverse {
  animation-direction: reverse;
}

.animation-alternate {
  animation-direction: alternate;
}
```

### 调试工具

```scss
// 开发环境动画调试
@if $debug-animations {
  * {
    animation-duration: 3s !important;
    transition-duration: 3s !important;
  }
}
```

## 📋 使用清单

### ✅ 最佳实践

- 使用 CSS Variables 定义动画参数
- 优先使用 transform 和 opacity
- 为动画添加 will-change 属性
- 提供 prefers-reduced-motion 回退
- 使用语义化的动画名称

### ❌ 避免事项

- 过度使用复杂动画
- 同时动画过多元素
- 忽略性能影响
- 动画时间过长
- 缺少可访问性考虑

---

_最后更新：2026年4月19日_
