---
outline: 'deep'
---

# C_Cron 表达式编辑器

> ⏰ 纯逻辑实现的 Cron 表达式可视化编辑器，零外部依赖。支持「秒 分 时 日 月 周」六字段可视化编辑，双向绑定，实时校验，未来执行时间预测，中文描述自动生成。

## 🚀 特性

- **🎯 可视化编辑** — 秒/分/时/日/月/周 Tabs 切换，每字段支持「每」「范围」「步进」「指定」四种模式
- **🔄 双向绑定** — 可视化编辑 ↔ 文本输入实时同步，支持 `v-model`
- **✅ 语法校验** — 实时校验 + 错误定位（日/周互斥、范围越界、非法步进等）
- **📅 执行预测** — 预览未来 N 次执行时间（可配置 1~50 次），含星期显示
- **⚡ 模板快选** — 12 个常用模板一键填入（每天 0 点 / 每小时 / 工作日 / 月末…）
- **📝 中文描述** — 自动生成人类可读的中文描述（如「每天 08:30:00 执行」）
- **🌗 主题适配** — 自动跟随 Naive UI 亮色/暗色主题，无需额外配置
- **🚫 零依赖** — 解析 / 校验 / 预测 / 描述全部纯逻辑实现，无外部三方库
- **📱 响应式** — 768px 以下自动切换为上下布局，移动端友好

## 📦 安装

无需安装任何额外依赖，组件已全局注册。

## 🎯 快速开始

### 最简用法

```vue {3-6,11}
<template>
  <C_Cron
    v-model="cronExpr"
    @change="onChange"
  />
</template>

<script setup lang="ts">
  // 无需导入，已全局注册

  const cronExpr = ref('0 30 8 * * ?')

  function onChange(value: string) {
    console.log('表达式变更:', value)
  }
</script>
```

::: details 📋 定时任务配置 — 完整的表单集成示例

```vue {5-8,20-28}
<template>
  <NForm
    ref="formRef"
    :model="formData"
    :rules="rules"
  >
    <NFormItem
      label="任务名称"
      path="name"
    >
      <NInput
        v-model:value="formData.name"
        placeholder="请输入任务名称"
      />
    </NFormItem>
    <NFormItem
      label="执行计划"
      path="cronExpr"
    >
      <C_Cron
        v-model="formData.cronExpr"
        :show-second="false"
        @validation-change="onCronValidation"
      />
    </NFormItem>
    <NFormItem>
      <NButton
        type="primary"
        @click="handleSubmit"
        >提交</NButton
      >
    </NFormItem>
  </NForm>
</template>

<script setup lang="ts">
  import type { CronValidation } from '@/types/modules/cron'

  const formData = reactive({
    name: '',
    cronExpr: '0 0 8 * * ?',
  })

  const cronValid = ref(true)

  function onCronValidation(result: CronValidation) {
    cronValid.value = result.valid
  }

  function handleSubmit() {
    if (!cronValid.value) {
      console.error('Cron 表达式不合法')
      return
    }
    console.log('提交:', formData)
  }
</script>
```

:::

::: details 🎛️ 精简模式 — 表单内嵌（无模板/预览面板）

```vue {4-5}
<template>
  <C_Cron
    v-model="cronExpr"
    :show-templates="false"
    :show-preview="false"
  />
</template>

<script setup lang="ts">
  const cronExpr = ref('0 0 0 * * ?')
</script>
```

适合空间有限的弹窗、抽屉等场景，仅保留核心字段编辑器和表达式输入框。

:::

::: details ⏱️ 隐藏秒字段 — 5 字段模式

```vue {4}
<template>
  <C_Cron
    v-model="cronExpr"
    :show-second="false"
  />
</template>

<script setup lang="ts">
  const cronExpr = ref('0 0 12 * * ?')
</script>
```

不需要秒级精度时使用，Tabs 仅显示「分/时/日/月/周」五个字段。

:::

::: details 🔧 编程式控制 — 通过 ref 调用组件 API

```vue {3-6,14-29}
<template>
  <C_Cron
    ref="cronRef"
    v-model="cronExpr"
  />

  <NSpace
    :size="8"
    style="margin-top: 12px"
  >
    <NButton
      type="primary"
      size="small"
      @click="cronRef?.setValue('0 0 9 ? * 2-6')"
    >
      设为工作日 9:00
    </NButton>
    <NButton
      size="small"
      @click="handleGetValue"
      >获取当前值</NButton
    >
    <NButton
      size="small"
      @click="handleValidate"
      >手动校验</NButton
    >
    <NButton
      size="small"
      @click="cronRef?.reset()"
      >重置</NButton
    >
  </NSpace>
</template>

<script setup lang="ts">
  import type { CronExpose } from '@/types/modules/cron'

  const cronRef = ref<CronExpose>()
  const cronExpr = ref('0 0 0 1 * ?')

  function handleGetValue() {
    const value = cronRef.value?.getValue()
    console.log('当前值:', value)
  }

  function handleValidate() {
    const result = cronRef.value?.validate()
    console.log('校验结果:', result?.valid, result?.message)
  }
</script>
```

:::

## 📖 API 文档

### Props

| 属性             | 类型               | 默认值          | 说明                                     |
| ---------------- | ------------------ | --------------- | ---------------------------------------- |
| `v-model`        | `string`           | `'0 0 0 * * ?'` | Cron 表达式（6 字段：秒 分 时 日 月 周） |
| `disabled`       | `boolean`          | `false`         | 禁用编辑                                 |
| `preview-count`  | `number`           | `10`            | 预览未来执行次数（1~50）                 |
| `show-templates` | `boolean`          | `true`          | 显示右侧常用模板面板                     |
| `show-preview`   | `boolean`          | `true`          | 显示右侧执行时间预览面板                 |
| `show-second`    | `boolean`          | `true`          | 显示秒字段 Tab（关闭后为 5 字段模式）    |
| `height`         | `string \| number` | `'auto'`        | 容器高度，支持数字(px)或 CSS 字符串      |

### Events

| 事件                | 参数                       | 说明                               |
| ------------------- | -------------------------- | ---------------------------------- |
| `update:modelValue` | `(value: string)`          | 表达式变更（v-model 双向绑定）     |
| `change`            | `(value: string)`          | 表达式变更回调                     |
| `validation-change` | `(result: CronValidation)` | 校验状态变更（合法/非法/错误字段） |

### Expose

| 方法         | 签名                     | 说明                               |
| ------------ | ------------------------ | ---------------------------------- |
| `getValue()` | `() => string`           | 获取当前表达式                     |
| `setValue()` | `(expr: string) => void` | 设置表达式（自动解析并更新可视化） |
| `reset()`    | `() => void`             | 重置为 v-model 初始值              |
| `validate()` | `() => CronValidation`   | 校验当前表达式，返回校验结果对象   |

## 📐 类型定义

```typescript
/** Cron 字段类型 */
type CronFieldType = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'week'

/** 单字段编辑模式 */
type CronFieldMode = 'every' | 'range' | 'step' | 'specific' | 'none'

/** 单字段值 */
interface CronFieldValue {
  mode: CronFieldMode // 编辑模式
  rangeStart: number // 范围起始
  rangeEnd: number // 范围结束
  stepStart: number // 步进起始
  stepInterval: number // 步进间隔
  specificValues: number[] // 指定具体值列表
}

/** 校验结果 */
interface CronValidation {
  valid: boolean // 是否合法
  message: string // 错误信息
  field?: CronFieldType // 出错字段（定位用）
}

/** 组件 Props */
interface CronProps {
  modelValue?: string // Cron 表达式 (v-model)
  disabled?: boolean // 禁用
  previewCount?: number // 预览次数
  showTemplates?: boolean // 显示模板面板
  showPreview?: boolean // 显示预览面板
  showSecond?: boolean // 显示秒字段
  height?: string | number // 容器高度
}

/** 组件暴露方法 */
interface CronExpose {
  getValue: () => string
  setValue: (expression: string) => void
  reset: () => void
  validate: () => CronValidation
}
```

## 🛠️ Cron 表达式语法速查

| 字段 | 范围 | 允许字符            | 说明                                 |
| ---- | ---- | ------------------- | ------------------------------------ |
| 秒   | 0-59 | `*` `,` `-` `/`     | 每秒(\*)、指定(,)、范围(-)、步进(/)  |
| 分   | 0-59 | `*` `,` `-` `/`     | 同上                                 |
| 时   | 0-23 | `*` `,` `-` `/`     | 同上                                 |
| 日   | 1-31 | `*` `,` `-` `/` `?` | `?` 表示不指定（当周字段有值时使用） |
| 月   | 1-12 | `*` `,` `-` `/`     | 同上                                 |
| 周   | 1-7  | `*` `,` `-` `/` `?` | 1=周日 ~ 7=周六，`?` 表示不指定      |

> **日/周互斥规则**：日和周不能同时指定具体值，一方有值时另一方必须为 `?`。组件内部已自动处理此规则。

::: details 📝 常见 Cron 表达式示例

| 表达式             | 含义                  |
| ------------------ | --------------------- |
| `0 0 0 * * ?`      | 每天 00:00:00 执行    |
| `0 30 8 * * ?`     | 每天 08:30:00 执行    |
| `0 0 12 * * ?`     | 每天中午 12:00 执行   |
| `0 0/30 * * * ?`   | 每 30 分钟执行一次    |
| `0 0 9 ? * 2-6`    | 工作日 09:00 执行     |
| `0 0 0 1 * ?`      | 每月 1 号 00:00 执行  |
| `0 0 0 1,15 * ?`   | 每月 1 号和 15 号执行 |
| `0 0 8-18/2 * * ?` | 每天 8~18 点每 2 小时 |
| `* * * * * ?`      | 每秒执行              |

:::

### 内置模板

| 模板        | 表达式           | 说明                  |
| ----------- | ---------------- | --------------------- |
| 每秒执行    | `* * * * * ?`    | 每秒执行一次          |
| 每分钟执行  | `0 * * * * ?`    | 每分钟第 0 秒执行     |
| 每小时执行  | `0 0 * * * ?`    | 每小时整点执行        |
| 每天 0 点   | `0 0 0 * * ?`    | 每天凌晨 00:00 执行   |
| 每天 8:30   | `0 30 8 * * ?`   | 每天早上 08:30 执行   |
| 每天 12:00  | `0 0 12 * * ?`   | 每天中午 12:00 执行   |
| 工作日 9:00 | `0 0 9 ? * 2-6`  | 周一至周五 09:00 执行 |
| 每周一 0 点 | `0 0 0 ? * 2`    | 每周一凌晨 00:00 执行 |
| 每月 1 号   | `0 0 0 1 * ?`    | 每月 1 号凌晨执行     |
| 每 5 分钟   | `0 0/5 * * * ?`  | 每隔 5 分钟执行一次   |
| 每 30 分钟  | `0 0/30 * * * ?` | 每隔 30 分钟执行一次  |
| 每 2 小时   | `0 0 0/2 * * ?`  | 每隔 2 小时执行一次   |

## ⚠️ 注意事项

::: code-group

```vue [✅ 正确]
<!-- v-model 双向绑定，表达式为 6 字段格式 -->
<C_Cron v-model="cronExpr" />

<!-- 精简模式：关闭侧边栏 -->
<C_Cron v-model="cronExpr" :show-templates="false" :show-preview="false" />

<!-- 编程控制：通过 ref 调用 -->
<C_Cron ref="cronRef" v-model="cronExpr" />
<script setup>
  cronRef.value?.setValue('0 0 9 ? * 2-6')
  const result = cronRef.value?.validate()
</script>
```

```vue [❌ 错误]
<!-- 不要传入 5 字段的 Cron 表达式 -->
<C_Cron v-model="'0 0 * * ?'" />
<!-- 应使用 6 字段：'0 0 0 * * ?' -->

<!-- 不要同时指定日和周 -->
<!-- 日=15 & 周=2-6 会导致冲突 -->
<!-- 组件内部会自动互斥处理，但初始传值应避免 -->

<!-- 不要手动拼接 v-model -->
<C_Cron :model-value="sec + ' ' + min + ' ' + ..." />
<!-- 应直接使用完整表达式字符串 -->
```

:::

## 🐛 故障排除

::: details ❌ 校验一直显示「错误」

请确认传入的是 6 字段的 Cron 表达式，格式为 `秒 分 时 日 月 周`，各字段用空格分隔。

```vue
<!-- ✅ 6 字段 -->
<C_Cron v-model="'0 30 8 * * ?'" />

<!-- ❌ 5 字段（缺少秒） -->
<C_Cron v-model="'30 8 * * ?'" />
```

如果使用 `show-second="false"` 隐藏秒字段，表达式仍然是 6 字段，秒固定为 `0`。

:::

::: details ❌ 日/周字段冲突提示

组件内置了日/周互斥逻辑：当你编辑日字段（选择了具体值/范围/步进时），周字段会自动切换为 `?`（不指定），反之亦然。

如果初始传入的表达式同时指定了日和周的具体值（如 `0 0 0 15 * 3`），解析时会以最后编辑的字段为准。

:::

::: details ❌ 预览面板显示「暂无匹配的执行时间」

这通常意味着 Cron 表达式在未来 2 年内没有匹配的执行时间，常见原因：

1. 日期条件过于苛刻（如 2 月 31 日）
2. 表达式本身语法错误
3. 步进间隔过大，超出了搜索时间范围

检查表达式上方的校验状态和中文描述是否正确。

:::

## 🎯 最佳实践

1. **表单集成**: 监听 `validation-change` 事件联动表单校验，仅在 `valid: true` 时允许提交
2. **空间有限**: 使用 `:show-templates="false" :show-preview="false"` 精简模式
3. **不需要秒**: 设置 `:show-second="false"` 隐藏秒字段，降低用户认知负担
4. **预填常用**: 在业务逻辑中预设合理的默认值（如 `0 0 8 * * ?` 每天 8 点），而非空表达式
5. **编程控制**: 通过 `ref` 获取实例，使用 `setValue()` / `validate()` 实现外部联动

## 📁 文件结构

```
C_Cron/
├── index.vue                         # 主组件（表达式输入 + 字段编辑器 + 侧边栏）
├── constants.ts                      # 字段元数据、默认值、12 个常用模板
├── components/
│   ├── CronFieldEditor.vue           # 单字段编辑器（每/范围/步进/指定 四模式）
│   ├── CronPreview.vue               # 未来执行时间预览面板
│   └── CronTemplates.vue             # 常用模板选择面板
└── README.md

types/modules/cron.d.ts               # 完整 TypeScript 类型定义
composables/Cron/
├── useCronParser.ts                  # 核心引擎：解析/生成/校验/日周互斥
├── useCronPreview.ts                 # 执行时间预测：匹配算法 + 日期格式化
└── useCronDescription.ts             # 中文描述生成：表达式 → 可读文本
```

## 📚 相关资源

- [演示页面源码](../../views/demo/46-cron/index.vue)
- [Cron 语法参考（维基百科）](https://en.wikipedia.org/wiki/Cron#CRON_expression)
- [Spring CronSequenceGenerator](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/support/CronSequenceGenerator.html)

## 📝 更新日志

### v1.0.0

- 🎉 初始版本
- 秒/分/时/日/月/周六字段可视化编辑
- 每/范围/步进/指定四种编辑模式
- 双向绑定 + 实时校验
- 12 个常用模板一键填入
- 未来执行时间预测（可配置次数）
- 中文描述自动生成
- 日/周互斥自动处理
- 亮色/暗色主题适配
