# 消息中心接口契约

本页是未来消息后端的接入协议，当前 Robot_Cloud 未实现这些端点。公开演示使用同一类型协议的本地适配器，无需启动后端；应用部署使用真实 HTTP，错误不会回退到演示。

所有相对地址追加到项目 `VITE_API_BASE`。除二进制附件外，响应为 `{ code: 0 | 200 | '0' | '200', msg: string, data: T }`。请求经过统一 request-core，携带当前会话；服务端必须从会话确认用户、租户、公司和业务资源权限。

| 方法      | 路径                                                           | 作用与返回                                               |
| --------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| GET       | `/notifications/inbox`                                         | `NotificationQuery` 查询，返回 `NotificationSnapshot`    |
| GET       | `/notifications/inbox/:id`                                     | 按需详情 `NotificationRecord`                            |
| POST      | `/notifications/inbox/commands`                                | `{type, ids, operationId}` 状态命令                      |
| POST      | `/notifications/inbox/read-all`                                | `{category?, throughRevision, operationId}` 全部已读     |
| POST      | `/notifications/inbox/clear`                                   | 同上，清除截止版本内未归档收件                           |
| GET       | `/notifications/inbox/:id/attachments/:attachmentId`           | 授权后二进制附件，前端忽略元数据 URL                     |
| GET       | `/notifications/management`                                    | 授权范围内的模板、发送、投递与审计集合                   |
| PUT       | `/notifications/templates` 或 `/notifications/templates/:id`   | 创建/更新模板，返回完整模板                              |
| DELETE    | `/notifications/templates/:id`                                 | query `expectedRevision`，按版本删除                     |
| PUT       | `/notifications/dispatches` 或 `/notifications/dispatches/:id` | 保存草稿，返回完整发送实体                               |
| POST      | `/notifications/dispatches/:id/send`                           | `{expectedRevision, operationId}` 明确发送或进入定时计划 |
| POST      | `/notifications/dispatches/:id/withdraw`                       | `{expectedRevision}` 撤回                                |
| POST      | `/notifications/deliveries/:id/retry`                          | 重试单条失败/阻塞投递，禁止重复成功通道                  |
| GET / PUT | `/notifications/preferences`                                   | 获取/保存完整通知偏好                                    |

类型定义以 `src/api/notifications.contract.ts` 为准。快照包含当前查询 `items/total`、独立最新 `previewItems`、全局 `stats`、服务端收件 `revision` 和可选 `capabilities`。`stats.byCategory` 是分类未读数，其和等于全局 `unread`；不能用当前页数量计算角标。日期参数是精确 ISO 边界，查询支持状态、关键词、分类、来源、优先级和分页。

状态命令支持 `read/unread/archive/unarchive/star/unstar/delete/complete-task`。阅读与待办办理独立；后端必须针对 `complete-task` 校验真实业务办理权限和状态。全部已读与清空按 `throughRevision` 截止，后到消息保持未读。跨页、推送和统计需要使用同一服务端版本规则。

创建模板和草稿也携带 `operationId`；更新携带 `id/revision`。网络未确认时前端保留同一逻辑命令的幂等键；后端必须持久化去重，并对重复创建返回原实体。命令已经确认而刷新失败时，界面提示“操作已完成，刷新同步失败”，只需重试刷新。演示只缓存最近 32 条创建结果及有界命令记录，不能代替后端持久化幂等。

`capabilities.manage/preferences` 只有服务返回明确授权后开放，相同会话撤权会清理对应缓存并取消旧结果。当前未约定远端实时补偿协议，`realtime` 始终关闭，使用页面可见时轮询和联网恢复补刷。

演示通道和受众全部是本地模拟。定时任务仅在应用运行期间推进；真实邮件/短信/企业微信一旦送达不能由前端追回。生产环境仍需后端调度、通道工作进程、业务审计、访问控制、去重、版本冲突处理和事件补偿。
