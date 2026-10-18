/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.remote.ts
 * @Description: 未来企业消息服务的 HTTP 协议适配；服务缺失保持错误，绝不回退演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  deleteData,
  getData,
  postData,
  putData,
  type EnhancedAxiosRequestConfig,
} from '@robot-admin/request-core/axios'
import type { ApiResponse } from './management.contract'
import type {
  NotificationCapabilities,
  NotificationScope,
  NotificationService,
  NotificationSnapshot,
} from './notifications.contract'
import { validateNotificationWorkflowCommand } from './notifications.workflow'
import {
  requireNotificationRecord,
  requireNotificationSnapshot,
} from './notifications.validation'
import {
  requireNotificationDispatch,
  requireNotificationGovernance,
  requireNotificationPreferences,
  requireNotificationTemplate,
} from './notifications.governance-validation'

export interface NotificationTransport {
  get<T>(
    url: string,
    config?: EnhancedAxiosRequestConfig
  ): Promise<ApiResponse<T>>
  post<T>(
    url: string,
    data?: unknown,
    config?: EnhancedAxiosRequestConfig
  ): Promise<ApiResponse<T>>
  put<T>(
    url: string,
    data?: unknown,
    config?: EnhancedAxiosRequestConfig
  ): Promise<ApiResponse<T>>
  delete<T>(
    url: string,
    config?: EnhancedAxiosRequestConfig
  ): Promise<ApiResponse<T>>
}
const defaultTransport: NotificationTransport = {
  get: getData,
  post: postData,
  put: putData,
  delete: deleteData,
}
const requireData = <T>(response: ApiResponse<T>): T => {
  if (!response || !['0', '200'].includes(String(response.code)))
    throw new Error(response?.msg || '消息服务返回无效响应')
  return response.data
}

/** 创建远端协议适配器；scope仅参与客户端生命周期，身份与公司授权必须由服务端会话确认。 */
export const createNotificationRemoteService = (
  _scope: NotificationScope,
  transport: NotificationTransport = defaultTransport
): NotificationService => {
  const base = '/notifications'
  const capabilities: NotificationCapabilities = {
    manage: false,
    realtime: false,
    preferences: false,
    workflow: false,
  }
  let queryVersion = 0
  const config = (signal?: AbortSignal): EnhancedAxiosRequestConfig => ({
    signal,
    silent: true,
    cache: false,
    dedupe: false,
  })
  const path = (resource: string, id: string) =>
    `${base}/${resource}/${encodeURIComponent(id)}`
  return {
    mode: 'remote',
    capabilities,
    /** 查询远端列表和全量统计，并同步服务端声明的能力。 */
    async query(query, signal) {
      const version = ++queryVersion
      const snapshot = requireNotificationSnapshot(
        requireData(
          await transport.get<NotificationSnapshot>(`${base}/inbox`, {
            ...config(signal),
            params: query,
          })
        )
      )
      if (version === queryVersion) {
        capabilities.manage = snapshot.capabilities?.manage === true
        capabilities.preferences = snapshot.capabilities?.preferences === true
        capabilities.workflow = snapshot.capabilities?.workflow === true
      }
      // 尚未约定可鉴权的事件补偿传输；远端目前采用可见时轮询，不能宣称已连接实时流。
      capabilities.realtime = false
      return snapshot
    },
    /** 请求单条消息详情，权限由服务端核验。 */
    async detail(id, signal) {
      return requireNotificationRecord(
        requireData(await transport.get(path('inbox', id), config(signal)))
      )
    },
    /** 发送带幂等标识的消息状态命令。 */
    async mutate(command, signal) {
      requireData(
        await transport.post(`${base}/inbox/commands`, command, config(signal))
      )
    },
    /** 审批端点固定且使用已认证会话，关系、业务授权与幂等由服务端再次核验。 */
    async workflowAction(command, signal) {
      if (!capabilities.workflow)
        throw new Error('当前消息服务未授权审批办理能力')
      validateNotificationWorkflowCommand(command)
      const result = requireNotificationRecord(
        requireData(
          await transport.post(
            `${path('inbox', command.recordId)}/workflow-actions`,
            {
              action: command.action,
              comment: command.comment,
              expectedRevision: command.revision,
              operationId: command.operationId,
            },
            config(signal)
          )
        )
      )
      if (
        result.id !== command.recordId ||
        !result.workflow ||
        result.revision <= command.revision
      )
        throw new Error('审批服务返回了不匹配的记录或版本，请刷新核对状态')
      return result
    },
    /** 发送明确截止版本的全部已读命令。 */
    async markAllRead(command, signal) {
      requireData(
        await transport.post(`${base}/inbox/read-all`, command, config(signal))
      )
    },
    /** 清空服务端截止版本内的消息。 */
    async clearMessages(command, signal) {
      requireData(
        await transport.post(`${base}/inbox/clear`, command, config(signal))
      )
    },
    /** 请求已授权范围内的发送治理信息。 */
    async governance(signal) {
      return requireNotificationGovernance(
        requireData(await transport.get(`${base}/management`, config(signal)))
      )
    },
    /** 创建或按版本更新消息模板。 */
    async saveTemplate(draft, signal) {
      return requireNotificationTemplate(
        requireData(
          await transport.put(
            draft.id ? path('templates', draft.id) : `${base}/templates`,
            draft,
            config(signal)
          )
        )
      )
    },
    /** 按预期版本删除消息模板。 */
    async deleteTemplate(id, revision, signal) {
      requireData(
        await transport.delete(path('templates', id), {
          ...config(signal),
          params: { expectedRevision: revision },
        })
      )
    },
    /** 创建或修改发送草稿。 */
    async saveDispatch(draft, signal) {
      return requireNotificationDispatch(
        requireData(
          await transport.put(
            draft.id ? path('dispatches', draft.id) : `${base}/dispatches`,
            draft,
            config(signal)
          )
        )
      )
    },
    /** 使用幂等键提交发送指令。 */
    async sendDispatch(id, revision, operationId, signal) {
      requireData(
        await transport.post(
          `${path('dispatches', id)}/send`,
          { expectedRevision: revision, operationId },
          config(signal)
        )
      )
    },
    /** 按版本提交发送撤回指令。 */
    async withdrawDispatch(id, revision, signal) {
      requireData(
        await transport.post(
          `${path('dispatches', id)}/withdraw`,
          { expectedRevision: revision },
          config(signal)
        )
      )
    },
    /** 请求服务端重试失败通道。 */
    async retryDelivery(id, signal) {
      requireData(
        await transport.post(
          `${path('deliveries', id)}/retry`,
          {},
          config(signal)
        )
      )
    },
    /** 查询当前账户的通知偏好。 */
    async getPreferences(signal) {
      return requireNotificationPreferences(
        requireData(await transport.get(`${base}/preferences`, config(signal)))
      )
    },
    /** 更新当前账户的通知偏好。 */
    async savePreferences(preferences, signal) {
      requireData(
        await transport.put(`${base}/preferences`, preferences, config(signal))
      )
    },
    /** 远端事件流尚未接入，保持显式空订阅。 */
    subscribe() {
      return () => undefined
    },
    /** 生命周期由外层 AbortSignal 控制。 */
    dispose() {
      queryVersion++
    },
  }
}
