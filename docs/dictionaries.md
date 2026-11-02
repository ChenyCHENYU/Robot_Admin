# 字典插件与项目组合

RobotAdmin 安装独立的 `@robot-admin/dictionary`。字典包负责数据、缓存、翻译与生命周期；组件包只接普通选项、格式化函数和受控状态。两边不交换注入 key，不识别对方的字段或实例。

| 要做什么                 | 位置                            |
| ------------------------ | ------------------------------- |
| 接口、静态枚举、默认策略 | [应用配置](#一安装与配置)       |
| 表单、搜索、列表、详情   | [页面组合](#二页面怎么用)       |
| 独立 Vue 或其他 UI 项目  | [独立用法](#三其他项目直接使用) |
| 错误、身份切换与维护     | [运行边界](#四错误与生命周期)   |

## 一、安装与配置

[src/config/dictionary.ts](../src/config/dictionary.ts) 集中声明通用接口与确有差异的静态枚举：

```ts
import { getDictionaryOptionsApi } from '@/api/dictionary-options'
import { ORDER_STATUS_OPTIONS } from './enums'

export default {
  load: getDictionaryOptionsApi,
  dictionaries: { 'order-status': ORDER_STATUS_OPTIONS },
}
```

普通远程码不逐项登记。`load(code, { signal, scope })` 返回 `{ value, label, disabled? }[]`，业务响应解包只在 [API 适配](../src/api/dictionary-options.ts) 做一次。

[项目插件](../src/plugins/dictionary.ts) 安装 SDK，并以闭包捕获本应用的用户、公司和语言。普通项目的启动代码只需：

```ts
import { createDictionaryPlugin } from '@robot-admin/dictionary/vue'
import dictionaryConfig from '@/config/dictionary'

app.use(createDictionaryPlugin(dictionaryConfig))
```

安装不会修改组件、注册全局混入或触发未使用字典的请求。默认缓存5分钟、失败冷却5秒、超时15秒，只覆盖需要调整的配置。应用仍使用 Vue 3.5，SDK兼容版本验证不改变应用依赖。

## 二、页面怎么用

字段与字典码的业务关系由项目声明一次，组件字段只写展示配置：

```ts
const FIELD_DICTIONARIES = { status: 'order-status' } as const

const FORM_FIELDS: FormOption<Order>[] = [
  { prop: 'status', label: '计划状态', type: 'select' },
]
```

这里的 `Order` 是页面自己的业务模型，`FormOption` 来自当前组件库；SDK不导入这个类型，也不解析 `prop/key/field`。

### 表单和搜索

项目的 [useFieldDictionaries](../src/composables/useFieldDictionaries.ts) 只在项目中组合两包的公开能力。页面调用一次，输出普通组件配置：

```ts
const dictionaries = useFieldDictionaries(FIELD_DICTIONARIES)
const formFields = dictionaries.form(FORM_FIELDS)
const searchFields = dictionaries.search(SEARCH_FIELDS)
```

```vue
<C_Form v-model="model" :options="formFields" />
<C_FormSearch v-model="query" :form-item-list="searchFields" />
```

`FORM_FIELDS/SEARCH_FIELDS` 分别是页面表单与搜索配置；`model/query` 保存业务原码。组合函数把数据投影成 `children/list` 与通用 `optionsState`，组件只渲染这些值，不认识字典名称、Source或Provider。已有显式选项及表单 `asyncOptions` 优先，不会被覆盖。

### C_Table

```ts
const columns = dictionaries.table(TABLE_COLUMNS)
```

```vue
<C_Table :data="rows" :columns="columns" :config="tableConfig" />
```

`TABLE_COLUMNS` 是普通表格列。项目提供普通 formatter，显示文本统一调用SDK翻译；原始记录不改写。一个字典一个消费者，单元格只同步查表，不创建订阅或请求。

### MachTable

直接组合表格原有的通用列API：

```ts
const columns = [
  {
    field: 'status',
    headerName: '计划状态',
    valueFormatter: ({ value }) => dictionaries.label('status', value),
    valueSerializer: ({ value, target }) =>
      target === 'clipboard' ? dictionaries.label('status', value) : value,
  },
]
```

异步选项变化后由项目调用 `api.view.refreshCells()`。需要导出标签时先完成字典加载，再明确配置输出通道。MachTable不创建缓存、翻译服务或字典列策略。

### 详情与弹窗

详情使用SDK自己的普通字段映射，不传组件fields：

```ts
const { labels, loading, error, reload } = useDictLabels(
  () => selectedOrder.value,
  FIELD_DICTIONARIES,
  { enabled: detailVisible }
)
```

```vue
<span>{{ labels.status }}</span>
```

RobotAdmin自动导入 `useDictLabels`；[入口文件](../src/composables/useDictLabels.ts)只是SDK的re-export。独立项目从 `@robot-admin/dictionary/vue` 导入同名hook。记录未到达或弹窗关闭时不请求；翻译不回写记录。

### 页面局部来源

确需局部模拟或覆盖时，项目显式组合来源并交给项目hook，不向组件provide任何协议：

```ts
const provider = createDictionaryProvider(localStore, useDictionaries())
const dictionaries = useFieldDictionaries(FIELD_DICTIONARIES, { provider })
const details = useDictLabels(record, FIELD_DICTIONARIES, { provider })
```

`localStore` 由页面创建并在卸载时销毁；具体实现见[字典联动体验](../src/views/production-sales/components/c_dictionaryExperience/data.ts)。常规页面不需要局部Store或Provider。

## 三、其他项目直接使用

SDK本身不需要RobotAdmin的组合函数，也不要求安装任何组件库：

```ts
import { useDictionary } from '@robot-admin/dictionary/vue'

const status = useDictionary('order_status')
```

将 `status.options.value` 绑定到项目任意控件的普通选项属性，`status.loading.value` 绑定加载状态；列表调用 `status.label(value)`。原生Vue、其他组件库或自定义控件均由项目选择，SDK不内建这些UI的适配。

无Vue场景使用根入口 `createDictionaryStore`；完整接入、接口响应、静态枚举及独立示例见[SDK指南](https://github.com/ChenyCHENYU/robot-admin-packages/blob/main/packages/dictionary/docs/guide.md)。

## 四、错误与生命周期

- 成功空数据与加载失败分别处理。失败保留同作用域旧标签，未知值保留原码；项目就地展示错误与重试，不把异常转换成空数组。
- 普通控件使用项目投影出的 `optionsState`；共享列表错误由页面提示，组件自身不汇总字典状态或弹消息。
- 维护成功后用 `useDictionaries().invalidate(code)` 失效对应源；活跃消费者按需重载，不重复加载未使用的字典。
- 用户、公司、租户或语言切换由项目插件的 `scope/enabled` 配置同步隔离。未认证时暂停远程消费，不伪装成成功空字典。
- `0/false/"0"/"001"` 保留类型，多选逐项翻译。普通枚举文字与显式状态配色分别配置。
- 插件自动清理客户端应用。SSR每请求创建独立插件，并在渲染后的finally中 `plugin.dispose(app)`；不跨请求共享可订阅源。
- 大型客户、物料和组织数据使用分页检索或按码批量查询，避免把实体目录当作整份小字典缓存。

## 从0.5接入迁移

移除组件字段里的 `dictionary`，把字段与码的关系放到项目映射。移除旧公开注入key与provide桥接；表单/搜索用普通选项和状态，表格用普通formatter，详情传普通字段映射。项目已完成迁移，未保留双轨识别或隐藏兼容桥接。
