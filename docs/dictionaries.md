# 字典、枚举与字段翻译

`@robot-admin/dictionary` 管理数据与加载生命周期；Naive UI Components 和 MachTable 只负责各自的呈现。根入口无框架和请求库依赖，Vue 能力从 `/vue` 按需导入。

| 场景                   | 归属                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| 稳定业务枚举           | `defineEnum([{ value, label }])`，同步可用，不请求接口                     |
| 可维护的小字典         | 注册 `load({ signal, scope })`，共享整份不可变选项                         |
| 搜索、表单、C_Table    | 字段配置 `dictionary: 'name'`，消费已有 Provider                           |
| 详情记录               | `useDictLabels(record, fields)`，复用既有字段配置，直接读取 `labels.field` |
| 提示、导出前准备       | `source.label(value)`、`source.load()`，不改原码                           |
| MachTable              | 可选 `/business` 字典列 + Vue 合并刷新，保持默认原码输出                   |
| 大型客户、物料、组织树 | 既有 DataPicker、分页查询或按码批量解析，不全量拉入小字典                  |

## 应用只注册一次

入口的 `setupDictionaries()` 在 Pinia、请求客户端之后安装；每个应用实例独立创建 Store。`src/config/dictionaries.ts` 声明静态枚举和远程 loader。接口解包、类型转换只在 `src/api/dictionary-options.ts` 适配一次，不分散到页面 formatter。

```ts
const dictionaries = createDictionaryStore({
  planStatus: defineEnum([
    { value: 0, label: '待下达' },
    { value: 1, label: '执行中' },
  ]),
  warehouse: {
    load: ({ signal, scope }) => warehouseApi({ signal, scope, silent: true }),
  },
})
```

`warehouseApi` 是应用自己的接口适配函数，返回标准 `{value,label,disabled?}[]`。实际后端路径、响应解包和编码类型由应用确定，库不假定某套后端字段，也不创建隐式 HTTP 客户端。当前用户状态复用已有 `/sys/dictionaries` 树接口；未来增加多个类型时，优先接后端按类型或批量查询接口，不复制多份全目录缓存。

NUI 字段只声明：

```ts
{ prop: 'status', label: '计划状态', type: 'select', dictionary: 'planStatus' }
// C_Table 使用 key/title，dictionary 保持相同写法。
```

## 详情直接读取标签字段

```ts
// RobotAdmin 的 composable 自动导入，应用实例已全局注册。
const { labels, loading, error, reload } = useDictLabels(order, HEADER_FIELDS)
// 弹窗按可见状态启用：useDictLabels(order, HEADER_FIELDS, { enabled: visible })
```

```vue
<NDescriptionsItem label="计划状态">{{ labels.status }}</NDescriptionsItem>
```

直接复用表单/搜索的 `prop`、表格的 `key/field` 与 `dictionary` 元数据，非字典字段忽略，不重复维护映射；独立详情仍支持 `{ status: 'order-status' }`，也可直接指定选项源。配置在 setup 解析一次，字段的矛盾配置明确报告错误。只复用字典声明，不解释组件自己的 formatter、renderer、校验或显式下拉选项优先级。

`order` 使用原始记录的 ref、reactive 对象，或 `() => detailOrder.value?.header`。记录尚未到达时不解析、订阅、加载远程源；`enabled` 接受 boolean/ref/getter，关闭时归还当前订阅并取消等待，保留最后显示的快照供弹窗离场，重新打开读取当前作用域数据。字段原码、记录或字典变化后自动更新，提交仍读取原始 `order`。

同名字典只订阅一次；空记录显示 `—`，未知编码保留原码。远程错误通过 `error` 就地呈现，`reload()` 返回每个字典的重试结果，不额外弹全局错误。标签只跟随选项快照及绑定字段，loading/error 变化不重算整组文字。

其他 Vue 系统直接使用包的 `useDictionaryLabels(provider, order, fields)`；RobotAdmin 的 `useDictLabels` 只负责选择当前 Provider，包负责响应式、读取适配、加载和清理。既有轻量 `getOptions/load/subscribe/getState` 源继续支持，不另建缓存。字段绑定用于详情，表格仍使用各自列策略。

## 页面覆盖只组合一次

```ts
const provider = createDictionaryProvider(
  pageDictionaries,
  useAppDictionaries()
)
provide(DICTIONARY_PROVIDER_KEY, provider)
// Vue 的 inject 读取祖先；与 provide 同层的详情控制器显式复用这一个实例。
const { labels } = useDictLabels(order, HEADER_FIELDS, { provider })
// 子组件直接 useDictLabels(order, HEADER_FIELDS)，自动读取最近 Provider。
```

`createDictionaryProvider` 来自 `@robot-admin/dictionary`。所有表单、搜索、C_Table 与详情读取同一个组合器：页面名称缺失时兜底应用，已找到源的接口错误保持局部可见，不能用全局标签遮盖失败。不要在各个消费者中另写一条兜底链。组合器只有只读查找，不创建请求或缓存。

MachTable 沿用自己的公开入口：

```ts
const source = dictionaries.getDictionary('planStatus')
const state = useDictionary(source) // 独立网格使用时，同时获得加载、错误与重试状态。
const column = {
  field: 'status',
  headerName: '计划状态',
  ...createDictionaryColumn(source, { options: source.getOptions }),
}
useDictionaryRefresh([source], () => table.api.value?.view.refreshCells())
```

`useDictionary`、`useDictionaryRefresh` 从 `@robot-admin/dictionary/vue` 导入；`createDictionaryColumn` 从 `@agile-team/mach-table-vue/business` 导入。翻译是同步 Map 查询，异步完成后才合并刷新，不为每个单元格建立订阅或请求。普通枚举默认展示文字；需要状态标签时单独配置列的 `status`，不能把字典自动当成状态。

## 空、错、历史值分别处理

- 合法空数组进入 `empty`；失败必须抛错，不能 `catch(() => [])` 冒充空字典。
- 失败保留同作用域旧标签，Form/Search 提供局部重试，C_Table 汇总一条状态；独立文本或 Mach 页面用 `state.error` 明确反馈。
- `reload()` 或 `load({force:true})` 绕过缓存与失败冷却，正在执行的请求仍共享。默认成功 TTL 5 分钟、失败冷却 5 秒、单次超时 15 秒。
- `0`、`false`、`'0'`、`'001'` 严格区分，未知码保留原值。停用项仍可翻译历史数据，只限制新选择；提交是否合法由业务校验决定。
- 数组逐项翻译。逗号串只在明确声明 `source.label(value,{split:','})` 时拆分；模型的序列化继续由字段/接口约定，翻译不回写模型。

## 身份、覆盖与失效

应用 scope 包含用户、租户、公司、语言和认证状态，不包含令牌。作用域切换同步清空旧远程快照、取消旧请求并阻止迟到回填；静态枚举不重新加载。退出登录后不发新的远程字典请求。

页面可建立自己的 Store，并通过现有 `DICTIONARY_PROVIDER_KEY` 覆盖个别名称；未覆盖名称回退应用实例。页面卸载时销毁局部 Store，缓存路由失活时关闭临时体验弹窗。禁止写入跨应用全局 resolver、修改共享枚举或用本地标签覆盖远端加载失败。

字典维护在服务端成功且会话仍有效后调用 `invalidate()`；正在消费的远程源重新加载，未使用的源保持惰性。多个消费者共享一次请求，一个消费者取消只结束自己的等待，不影响其他使用位置。

销售订单页的「字典联动体验」使用真实 Form/Search/C_Table/MachTable。仓库接口与工厂切换为隔离的本地模拟，账户状态使用应用字典接口；模拟操作不修改登录公司或真实业务记录。
