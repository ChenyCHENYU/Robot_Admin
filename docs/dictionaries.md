# 字典、枚举与字段翻译

RobotAdmin 已接入 `@robot-admin/dictionary`。页面只声明后台字典码，应用统一管理请求、缓存、作用域与销毁；NUI 和 MachTable 负责各自呈现。

| 你要做什么                  | 阅读位置                          |
| --------------------------- | --------------------------------- |
| 新页面使用远程字典          | [页面场景](#二页面怎么用)         |
| 更换后台接口、检查启动接入  | [应用接入](#一项目已经接好了什么) |
| 静态枚举或本页覆盖          | [局部差异](#三静态枚举与页面覆盖) |
| 失败重试、字典维护后更新    | [错误与维护](#四空失败重试和维护) |
| 切换用户/公司、性能与大数据 | [边界](#五身份与性能边界)         |

## 一、项目已经接好了什么

**新增远程字典不改这些文件，也不建立逐项注册清单。** 字段直接使用后台类型码，例如 `user_status`；不要再添加 `user-status` 前端别名。

| 文件                                                          | 职责                                        | 什么时候才改                 |
| ------------------------------------------------------------- | ------------------------------------------- | ---------------------------- |
| [dictionary-options.ts](../src/api/dictionary-options.ts)     | 通用 API 适配，检查业务码、解包并返回选项   | 接真实后台、后台响应格式变化 |
| [d_dictionaryContext.ts](../src/utils/d_dictionaryContext.ts) | 创建应用 Store、提供 `useAppDictionaries`   | 应用加载策略需要调整         |
| [dictionary.ts](../src/plugins/dictionary.ts)                 | 启动提供实例，绑定用户/租户/公司/语言及销毁 | 应用上下文维度变化           |
| [enums.ts](../src/config/enums.ts)                            | 稳定的业务静态枚举                          | 确有静态枚举变化             |
| [useDictLabels.ts](../src/composables/useDictLabels.ts)       | 详情读取当前 Provider 的精简封装            | 通常不用改                   |

启动顺序已在 `src/main.ts` 完成：Pinia → Request Core → `setupDictionaries(app)` → Router。页面不再调用 `setupDictionaries` 或创建应用 Store。

接入的核心是 `createDictionaryStore(getDictionaryOptionsApi)`。本项目还声明了演示用静态 `order-status` 并加认证判断，未显式声明的远程码自动交给通用 API。

接口函数接收 `(code, { signal, scope })`，返回 `{ value, label, disabled? }[]`。当前 `user_status` 复用已有 `/sys/dictionaries` 树接口；真实后台若提供按类型或批量接口，只改 API 适配，不改页面字段。不要每个字典都拉全目录、再另外建立目录缓存。

其他项目的从零接入见 [SDK 接入指南](https://github.com/ChenyCHENYU/robot-admin-packages/blob/main/packages/dictionary/docs/guide.md#一接入只做一次)。`useDictLabels` 是项目自动导入封装，不是 SDK 导出。

## 二、页面怎么用

各段放在页面 `data.ts` / 组合函数的 setup 调用链中，模板放 `index.vue`。已有字段只补 `dictionary`；以下给出独立场景的完整字段定义，按需选用，不要求全部复制。

### 1. 表单下拉

```ts
import type { FormOption } from '@robot-admin/naive-ui-components/C_Form'

interface UserForm {
  account: string
}
const model = ref<UserForm>({ account: '1' })
const fields: FormOption<UserForm>[] = [
  {
    prop: 'account',
    label: '账户状态',
    type: 'select',
    dictionary: 'user_status',
  },
]
```

```vue
<C_Form v-model="model" :options="fields" />
```

界面显示标签，提交继续读取 `model.account` 原码。无需另外 `onMounted` 加载或给字段手写一份 options。多选字段使用数组模型，并在字段中配置 `attrs: { multiple: true }`。

### 2. 搜索条件

```ts
import type { SearchFormItem } from '@robot-admin/naive-ui-components/C_FormSearch'

interface UserQuery {
  account: string | null
}
const query = ref<UserQuery>({ account: null })
const searchFields: SearchFormItem<UserQuery>[] = [
  {
    prop: 'account',
    label: '账户状态',
    type: 'select',
    dictionary: 'user_status',
  },
]
```

```vue
<C_FormSearch v-model="query" :form-item-list="searchFields" />
```

与表单共享同码字典；选中后向接口提交 `query.account`，不是中文标签。查询、重置、序列化沿用搜索组件既有配置。

### 3. C_Table 列表

```ts
import { defineTableColumns } from '@robot-admin/naive-ui-components/C_Table'

interface UserRow {
  id: string
  account: string
}
const rows = ref<UserRow[]>([{ id: 'U-1', account: '1' }])
const columns = defineTableColumns<UserRow>([
  { key: 'account', title: '账户状态', dictionary: 'user_status' },
])
```

```vue
<C_Table :data="rows" :columns="columns" row-key="id" />
```

异步完成后更新标签，行数据仍保存字符串原码。普通字典保持文字；明确属于业务状态的列再单独配置 `status`，颜色不写进全局翻译逻辑。

### 4. 详情与弹窗

**已有表单字段**时，直接复用其 `fields`：`useDictLabels(record, fields)`；已有表格列同样支持 `key/field + dictionary`。没有这些字段定义的独立详情，可用下面的最小定义：

```ts
const record = ref<{ account: string } | null>(null)
const visible = ref(false)
const fields = [{ prop: 'account', dictionary: 'user_status' }] as const
const { labels, loading, error, reload } = useDictLabels(record, fields, {
  enabled: visible,
})

// 详情接口完成后，用原始记录打开；翻译不会修改 record。
const showDetail = (user: { account: string }) => {
  record.value = user
  visible.value = true
}
```

```vue
<NModal
  v-model:show="visible"
  preset="card"
  title="账户详情"
  style="width: min(520px, calc(100vw - 32px))"
>
  <NDescriptions :column="1">
    <NDescriptionsItem label="账户状态">{{ labels.account }}</NDescriptionsItem>
  </NDescriptions>
  <NAlert v-if="error" type="warning">
    字典加载失败。<NButton :loading="loading" @click="reload">重试</NButton>
  </NAlert>
</NModal>
```

记录未到达或弹窗未打开时不订阅、不请求。关闭保留最后展示快照，重开读取当前身份的数据。模板用 `labels.account`，脚本用 `labels.value.account`；不要在模板中逐字段调用翻译函数。

`reload()` 返回按字典去重的 `allSettled` 结果。非字典字段被忽略，既有 formatter、renderer、校验和表单显式选项仍由各组件解释。

### 5. MachTable

MachTable 使用自己的公开列策略，不直接读取 C_Table 的 `dictionary` 属性。下面的组合函数可在页面 setup 调用并解构其返回值：

```ts
import { useAppDictionaries } from '@/utils/d_dictionaryContext'
import {
  useDictionary,
  useDictionaryRefresh,
} from '@robot-admin/dictionary/vue'
import { defineVueColumns, useMachTable } from '@agile-team/mach-table-vue'
import { createDictionaryColumn } from '@agile-team/mach-table-vue/business'

export function useAccountGrid() {
  const table = useMachTable<{ id: string; account: string }>()
  const rows = ref([{ id: 'U-1', account: '1' }])
  const source = useAppDictionaries().getDictionary('user_status')
  if (!source) throw new Error('字典实例不可用')
  const state = useDictionary(source)
  const columns = defineVueColumns<{ id: string; account: string }>([
    {
      field: 'account',
      headerName: '账户状态',
      ...createDictionaryColumn(source, { options: source.getOptions }),
    },
  ])
  useDictionaryRefresh([source], () => table.api.value?.view.refreshCells())
  const reload = async () => {
    try {
      await state.reload()
    } catch {
      /* state.error 已保存失败，由局部提示反馈。 */
    }
  }
  return { table, rows, columns, state, reload }
}
```

模板需要从 `@agile-team/mach-table-vue` 导入 `MachTable`：

```vue
<NAlert v-if="state.error.value" type="warning">
  字典加载失败。<NButton @click="reload">重试</NButton>
</NAlert>
<MachTable
  :ref="table.ref"
  :row-data="rows"
  :column-defs="columns"
  style="height: 260px"
/>
```

表单、详情与网格仍是同一份应用源。单元格同步 Map 查询，选项变化后合并刷新；加载/错误状态变化不重绘。复制和导出的原码/标签策略在列配置中单独选择。

## 三、静态枚举与页面覆盖

### 稳定静态枚举

应用已有 `order-status` 演示枚举（数字 0/1/2），字段写 `dictionary: 'order-status'`。新增真正稳定的枚举时，在 `src/config/enums.ts` 定义可复用选项，再在应用工厂显式声明该名称；远程字典不走这一步。

仅页面使用的枚举可以直接放局部 Store，无需进入全局。字典翻译与状态配色分别配置；`0`、`false`、`'0'` 和 `'001'` 不自动互转。

### 只覆盖当前页面

在页面 setup 调用链中组合一次；下方 `record/fields` 复用前面的详情场景：

```ts
import {
  createDictionaryStore,
  createDictionaryProvider,
} from '@robot-admin/dictionary'
import { DICTIONARY_PROVIDER_KEY } from '@robot-admin/naive-ui-components/config'
import { useAppDictionaries } from '@/utils/d_dictionaryContext'

const local = createDictionaryStore({
  user_status: [{ value: '1', label: '本页正常' }],
})
const provider = createDictionaryProvider(local, useAppDictionaries())
provide(DICTIONARY_PROVIDER_KEY, provider)
onScopeDispose(() => local.destroy())
const { labels } = useDictLabels(record, fields, { provider })
```

本层详情显式传 `provider`，子组件自动继承最近 Provider。只有本页没有声明的名称才回退应用；本页源失败、为空或没有匹配值都不换源。局部 Store 不配置通用 loader，避免接管所有名称。

页面只销毁自己的 Store；局部远程源还需同步业务 scope。不要销毁应用 Store、修改全局枚举，或在单个消费者里再建一套兜底链。

## 四、空、失败、重试和维护

| 情况                               | 用户看到什么/应该怎么做                  |
| ---------------------------------- | ---------------------------------------- |
| 没有消费该码、关闭详情、记录未到达 | 不请求，按需启用                         |
| 成功空数组                         | 暂无选项，保留已有原码；不弹失败消息     |
| 接口/业务码失败、格式异常、超时    | 保留同身份旧标签，控件就地提示并提供重试 |
| 未知历史编码                       | 原码仍可见，不回写 DTO                   |
| 停用项                             | 历史标签可显示，新选择受控               |

Form/Search/C_Table 已接管字典状态；独立详情和 MachTable 必须保留上面示例中的错误提示。API 使用静默请求，避免多个消费者重复弹全局错误；不能用 `catch(() => [])` 隐藏故障。

`useDictLabels().reload()` 返回组结果；`source.load()` 和 `useDictionary().reload()` 失败会拒绝，需要操作层捕获。默认缓存 5 分钟、失败冷却 5 秒、超时 15 秒；手动重试绕过缓存/冷却，但复用正在进行的请求。

**字典维护成功后刷新**：在 setup 期间取得实例，保存成功且会话仍有效时调用 `dictionaries.invalidate('user_status')`。活跃源重新加载，其他源继续惰性；无参调用失效全部远程源。不要在 await 后才调用依赖 inject 的 `useAppDictionaries()`。

**脚本/提示翻译**：取得源后 `await source.load()`，再同步 `source.label(value)`；失败交给该操作反馈。多码预热用 `preload([...])` 并检查每项结果，不能假定每项都成功。

## 五、身份与性能边界

- 应用插件已同步用户、租户、公司、语言和认证状态，页面不重复调用应用 `setScope`。切换清空旧快照、取消旧请求并阻止迟到回填；退出后不再发远程字典请求。
- 同码共享请求与缓存，一个消费者卸载不影响其他消费者。停用详情不创建新订阅，不为每个单元格创建请求或响应式绑定。
- 字典适合可整份读取的小数据；客户、物料、组织树的大量记录继续使用 DataPicker、分页或按码批量查询。
- 页面数据、字典原码和接口载荷保持原状；普通枚举与状态视觉分别配置，不建立跨应用全局 resolver。

## 六、去哪看实际效果

打开 **产销业务 → 销售订单协同 → 字典联动体验**：

1. 查看表单、搜索、详情、C_Table 和 MachTable 的同源翻译。
2. 模拟仓库字典失败、重试和合法空字典，查看提交原值仍保留。
3. 切换体验工厂，检查标签刷新；关闭重开检查实例清理。
4. 账户状态使用应用字典 API；默认演示环境按既有 Mock 开关运行。

仓库接口和体验工厂是隔离模拟，不修改真实登录公司或业务记录；该演示不代表真实后端 UAT。

更多协议与 API 见 [SDK 完整指南](https://github.com/ChenyCHENYU/robot-admin-packages/blob/main/packages/dictionary/docs/guide.md)。
