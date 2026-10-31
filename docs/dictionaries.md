# 字典、枚举与字段翻译

`@robot-admin/dictionary` 管理数据与加载生命周期；Naive UI Components 和 MachTable 只负责各自的呈现。根入口无框架和请求库依赖，Vue 能力从 `/vue` 按需导入。

| 场景                   | 归属                                                      |
| ---------------------- | --------------------------------------------------------- |
| 稳定业务枚举           | `defineEnum([{ value, label }])`，同步可用，不请求接口    |
| 可维护的小字典         | 注册 `load({ signal, scope })`，共享整份不可变选项        |
| 搜索、表单、C_Table    | 字段配置 `dictionary: 'name'`，消费已有 Provider          |
| 详情、提示、导出前准备 | `source.label(value)`、`source.load()`，不改原码          |
| MachTable              | 可选 `/business` 字典列 + Vue 合并刷新，保持默认原码输出  |
| 大型客户、物料、组织树 | 既有 DataPicker、分页查询或按码批量解析，不全量拉入小字典 |

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
