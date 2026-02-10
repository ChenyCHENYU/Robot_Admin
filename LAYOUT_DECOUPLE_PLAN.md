# Robot Admin 布局系统解耦方案（实用版）

> **核心目标**：在主项目内解耦，便于未来迁移到 `@robot-admin/layout` 包  
> **核心原则**：不增加复杂度，使用更精简，功能零损失

---

## 🎯 为什么要解耦？

### 当前问题

每个布局组件都直接依赖业务 Stores：

```typescript
// ❌ 问题：强耦合
const permissionStore = s_permissionStore() // 业务 Store
const themeStore = useThemeStore() // 业务 Store
const settingsStore = useSettingsStore() // 业务 Store
```

**迁移困难：**

- 如果把布局搬到独立包，这些 Store 怎么办？
- 其他项目使用你的包，没有这些 Store 怎么办？
- 每个布局都重复实现 KeepAlive（40+ 行代码 × 6 = 240 行重复代码）

### 解耦目标

```typescript
// ✅ 解决方案：依赖接口而非实现
const layout = useLayoutBridge() // 抽象接口
```

**收益：**

- ✅ 布局只依赖接口，不关心数据从哪来
- ✅ 未来搬到包时，布局代码不用改
- ✅ 主项目提供一个"适配器"，把业务数据转成布局需要的格式

---

## 实施方案（3 步走）

### Step 1：创建抽象层（1-2 小时）⭐

创建两个核心文件，建立布局和业务的"桥梁"

#### 文件 1：`useLayoutBridge.ts` (数据桥接)

```typescript
// src/composables/layouts/useLayoutBridge.ts
import type { ComputedRef } from 'vue'
import { s_permissionStore } from '@/stores/permission'
import { useThemeStore } from '@/stores/theme'
import { useSettingsStore } from '@/stores/settings'

/**
 * 布局需要的最小数据集（未来的包接口）
 */
export interface LayoutData {
  // 菜单数据
  menus: ComputedRef<any[]>

  // 主题
  isDark: ComputedRef<boolean>

  // 布局配置
  layoutMode: ComputedRef<string>
  collapsed: ComputedRef<boolean>
  sidebarWidth: ComputedRef<number>
  sidebarCollapsedWidth: ComputedRef<number>
  showFooter: ComputedRef<boolean>
  showTagsView: ComputedRef<boolean>
  transitionName: ComputedRef<string>

  // 方法
  toggleCollapse: () => void
}

/**
 * 从业务 Stores 创建布局数据
 * 未来搬到包时：这个函数留在主项目作"适配器"
 */
export function useLayoutBridge(): LayoutData {
  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()
  const settingsStore = useSettingsStore()

  return {
    menus: computed(() => permissionStore.showMenuListGet),
    isDark: computed(() => themeStore.isDark),

    layoutMode: computed(() => settingsStore.layoutMode),
    collapsed: computed(() => settingsStore.collapsed || false),
    sidebarWidth: computed(() => settingsStore.sidebarWidth),
    sidebarCollapsedWidth: computed(() => settingsStore.sidebarCollapsedWidth),
    showFooter: computed(() => settingsStore.showFooter),
    showTagsView: computed(() => settingsStore.showTagsView),
    transitionName: computed(() => settingsStore.transitionName),

    toggleCollapse: () => {
      settingsStore.collapsed = !settingsStore.collapsed
    },
  }
}
```

#### 文件 2：`useLayoutCache.ts` (缓存管理)

```typescript
// src/composables/layouts/useLayoutCache.ts
import { useRoute } from 'vue-router'

/**
 * 统一的 KeepAlive 缓存管理
 * 未来可直接搬到包里
 */
export function useLayoutCache(maxCache = 20) {
  const route = useRoute()
  const cachedViews = ref<string[]>([])

  const shouldCache = (routeName: string | symbol | undefined | null) => {
    if (!routeName || typeof routeName !== 'string') return false
    return route.meta?.keepAlive === true
  }

  const addCache = (name: string) => {
    if (!cachedViews.value.includes(name) && shouldCache(name)) {
      cachedViews.value.push(name)

      if (cachedViews.value.length > maxCache) {
        cachedViews.value.shift()
      }

      if (import.meta.env.DEV) {
        console.debug(
          `[KeepAlive] ✅ ${name} (${cachedViews.value.length}/${maxCache})`
        )
      }
    }
  }

  // 自动监听路由变化
  watch(
    () => route.name,
    newName => {
      if (newName && typeof newName === 'string') {
        addCache(newName)
      }
    },
    { immediate: true }
  )

  return {
    cachedViews: readonly(cachedViews),
    maxCache,
  }
}
```

**为什么这样设计？**

- ✅ **极简**：总共不到 100 行代码
- ✅ **专注**：一个管数据，一个管缓存
- ✅ **独立**：不依赖任何业务逻辑
- ✅ **易迁移**：未来 `useLayoutCache` 直接搬到包，`useLayoutBridge` 留在主项目作适配器

---

### Step 2：重构主入口（2-3 小时）

改造 `C_Layout/index.vue`，使用抽象层代替直接访问 Stores

#### 改动对比

**改动前：**

```vue
<script setup>
  // ❌ 直接依赖业务 Stores
  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()
  const settingsStore = useSettingsStore()

  // ❌ 自己实现 KeepAlive（40+ 行）
  const cachedViews = ref<string[]>([])
  const shouldCache = (name) => { /* ... */ }
  const addCache = (name) => { /* ... */ }
  watch(() => route.name, /* ... */)

  // 使用
  const menuData = permissionStore.showMenuListGet
  const isDarkMode = computed(() => themeStore.isDark)
</script>

<template>
  <NLayout
    v-if="settingsStore.layoutMode === 'side'"
    has-sider
  >
    <NLayoutSider
      :width="settingsStore.sidebarWidth"
      :collapsed="isCollapsed"
    >
      <C_Menu
        :data="menuData"
        :inverted="isDarkMode"
      />
    </NLayoutSider>
    <!-- ... -->
  </NLayout>
</template>
```

**改动后：**

```vue
<script setup>
  // ✅ 使用抽象层
  import { useLayoutBridge } from '@/composables/layouts/useLayoutBridge'
  import { useLayoutCache } from '@/composables/layouts/useLayoutCache'

  const layout = useLayoutBridge()
  const cache = useLayoutCache()

  // 就这么简单！所有数据都有了，KeepAlive 逻辑也统一了
</script>

<template>
  <NLayout
    v-if="layout.layoutMode.value === 'side'"
    has-sider
  >
    <NLayoutSider
      :width="layout.sidebarWidth.value"
      :collapsed="layout.collapsed.value"
    >
      <C_Menu
        :data="layout.menus.value"
        :inverted="layout.isDark.value"
      />
    </NLayoutSider>

    <!-- KeepAlive 使用统一逻辑 -->
    <RouterView v-slot="{ Component, route }">
      <Transition
        :name="layout.transitionName.value"
        mode="out-in"
      >
        <KeepAlive
          :include="cache.cachedViews.value"
          :max="cache.maxCache"
        >
          <component
            :is="Component"
            :key="route.path"
          />
        </KeepAlive>
      </Transition>
    </RouterView>
  </NLayout>
</template>
```

**改动汇总：**

1. 删除 3 个 store 导入 → 改为 2 个 composable 导入
2. 删除 40+ 行 KeepAlive 代码 → 改为 `useLayoutCache()`
3. 所有 `settingsStore.xxx` → 改为 `layout.xxx.value`
4. 所有 `menuData` → 改为 `layout.menus.value`
5. 所有 `cachedViews` → 改为 `cache.cachedViews.value`

**效果：**

- 文件从 253 行减少到 ~210 行
- 逻辑更清晰，数据来源统一

---

### Step 3：重构子布局（3-5 小时）

逐个改造 6 个子布局（TopLayout/MixLayout/等），重复 Step 2 的操作

#### 改造 TopLayout 示例

**改动前（158 行）：**

```typescript
// ❌ 每个布局都重复
const permissionStore = s_permissionStore()
const themeStore = useThemeStore()
const settingsStore = useSettingsStore()

const isDarkMode = computed(() => themeStore.isDark)
const menuData = permissionStore.showMenuListGet

// ❌ 40 行 KeepAlive 代码
const cachedViews = ref<string[]>([])
// ...
```

**改动后（~120 行）：**

```typescript
// ✅ 统一抽象
import { useLayoutBridge } from '@/composables/layouts/useLayoutBridge'
import { useLayoutCache } from '@/composables/layouts/useLayoutCache'

const layout = useLayoutBridge()
const cache = useLayoutCache()

// 就这 4 行，替代了之前 60+ 行代码
```

**预期收益：**

- TopLayout: 158 → ~120 行（-38 行）
- MixLayout: ~200 → ~160 行（-40 行）
- 其他布局: 类似减少 30-40 行

**总计减少代码：~200 行**

---

## 📊 效果预期

### 代码量变化

| 文件               | 改动前    | 改动后    | 减少        |
| ------------------ | --------- | --------- | ----------- |
| **新增抽象层**     | -         | 90 行     | +90         |
| C_Layout/index.vue | 253 行    | ~210 行   | -43         |
| TopLayout          | 158 行    | ~120 行   | -38         |
| MixLayout          | ~200 行   | ~160 行   | -40         |
| 其他布局 × 4       | ~600 行   | ~480 行   | -120        |
| **总计**           | ~1,211 行 | ~1,060 行 | **-151 行** |

### 复杂度变化

**改动前：**

- ❌ 每个布局都直接访问 3 个 Stores
- ❌ KeepAlive 逻辑重复 6 次（240+ 行重复代码）
- ❌ 数据来源分散，难以追踪

**改动后：**

- ✅ 所有布局通过统一接口获取数据
- ✅ KeepAlive 逻辑只有 1 份实现
- ✅ 数据来源清晰：`layout` + `cache`

### 迁移准备度

**当前状态（主项目）：**

```
src/
├── composables/layouts/
│   ├── useLayoutBridge.ts    ← 适配器（主项目特有）
│   └── useLayoutCache.ts     ← 未来搬到包
├── components/global/C_Layout/
│   ├── index.vue             ← 未来搬到包
│   └── layouts/              ← 未来搬到包
```

**迁移到包后：**

```
@robot-admin/layout (包)
├── composables/
│   └── useLayoutCache.ts     ← 从主项目搬来
├── C_Layout/
│   ├── index.vue             ← 从主项目搬来
│   └── layouts/              ← 从主项目搬来
└── types.ts
    └── export interface LayoutData { ... }

Robot_Admin (主项目)
├── composables/
│   └── useLayoutBridge.ts    ← 保留，作为适配器
└── main.ts
    └── use(createLayoutPlugin({ adapter: useLayoutBridge }))
```

**为什么这样设计？**

- ✅ 包是纯粹的：不依赖任何业务 Store
- ✅ 主项目是适配器：`useLayoutBridge` 把业务数据"翻译"成包需要的格式
- ✅ 其他项目也能用：只需实现自己的 `useLayoutBridge`

---

## 🛠️ 实施步骤（详细）

### Day 1: 创建抽象层 ✅

```bash
# 1. 创建目录
mkdir -p src/composables/layouts

# 2. 创建文件（复制上面的代码）
touch src/composables/layouts/useLayoutBridge.ts    # 50 行
touch src/composables/layouts/useLayoutCache.ts     # 40 行

# 3. 测试编译
npm run dev
```

### Day 2: 重构主入口 ✅

```bash
# 1. 备份原文件
cp src/components/global/C_Layout/index.vue src/components/global/C_Layout/index.vue.backup

# 2. 修改 C_Layout/index.vue
#    - 删除 3 个 store 导入
#    - 添加 2 个 composable 导入
#    - 替换所有数据访问（约 20 处）

# 3. 测试所有布局模式能否切换
npm run dev
# 手动切换：side / top / mix / mix-top / card-layout / reverse-horizontal-mix

# 4. 确认功能正常后提交
git add .
git commit -m "refactor: C_Layout 使用抽象层"
```

### Day 3-5: 重构子布局 ✅

每个布局 30 分钟，按这个顺序：

```bash
# Day 3
1. TopLayout (30 分钟)
   git commit -m "refactor: TopLayout 使用抽象层"

2. MixLayout (30 分钟)
   git commit -m "refactor: MixLayout 使用抽象层"

# Day 4
3. MixTopLayout (30 分钟)
   git commit -m "refactor: MixTopLayout 使用抽象层"

4. CardLayout (30 分钟)
   git commit -m "refactor: CardLayout 使用抽象层"

# Day 5
5. ReverseHorizontalMixLayout (30 分钟)
   git commit -m "refactor: ReverseHorizontalMixLayout 使用抽象层"

6. 清理与测试 (1 小时)
   - 删除所有 .backup 文件
   - 完整测试所有布局
   - 更新 TypeScript 类型
```

### Day 6: 文档与总结 ✅

```bash
# 1. 更新 README
echo "布局系统已解耦，便于未来迁移到独立包" >> README.md

# 2. 创建迁移指南
touch docs/LAYOUT_MIGRATION_GUIDE.md

# 3. 最终提交
git add .
git commit -m "docs: 布局解耦完成，添加迁移指南"
git push origin layout
```

---

## 🎁 核心优势

### 1. **极简设计**

- 只有 2 个核心文件（~90 行）
- 不引入新的框架或库
- 学习成本接近零

### 2. **零功能损失**

- 所有现有功能完全保留
- 响应式完全正常
- 性能无影响

### 3. **易于理解**

- `useLayoutBridge`: "数据从哪来"
- `useLayoutCache`: "缓存怎么管"
- 就这么简单！

### 4. **迁移友好**

- 接口明确：`LayoutData` 就是未来的包接口
- 零业务依赖：布局组件不再直接访问业务 Store
- 适配器模式：`useLayoutBridge` 留在主项目
- 随时可搬：6 个布局 + `useLayoutCache` 随时可以搬到包里

---

## 🚀 立即开始？

**选项 A：我帮你实施（推荐）** 🎯

1. 我创建 `useLayoutBridge.ts` 和 `useLayoutCache.ts`
2. 我帮你改造 `C_Layout/index.vue`
3. 你测试，确认功能正常
4. 再一起改子布局

**选项 B：你自己实施**

1. 复制上面的代码
2. 按步骤一步步来
3. 有问题随时问我

**选项 C：先讨论细节**

1. 你提出疑问或顾虑
2. 我们一起优化方案

**你选哪个？** 😊
