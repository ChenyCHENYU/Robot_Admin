/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-14
 * @FilePath: \Robot_Admin\src\composables\useLoginWorkspace.ts
 * @Description: 身份验证后的公司选择与一次性激活票据，仅保存在页面生命周期内
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  ActivateAuthContextRequest,
  LoginCompany,
  LoginResponse,
} from '@/api/auth.contract'

/** 公司清单只接收已证明密码的登录响应；页面不持有密码或预发现账号关系。 */
export const useLoginWorkspace = () => {
  const username = ref('')
  const companies = ref<LoginCompany[]>([])
  const selectedCompanyId = ref<string | null>(null)
  const companyLoading = ref(false)
  const companyError = ref('')
  const pendingTicket = ref('')
  let verifiedUsername = ''
  let sequence = 0

  /** 改账号、重新验证或离开页面立即使原票据与选择失效。 */
  const resetCompanySelection = () => {
    sequence++
    companies.value = []
    selectedCompanyId.value = null
    pendingTicket.value = ''
    verifiedUsername = ''
    companyError.value = ''
    companyLoading.value = false
  }
  watch(() => username.value.trim(), resetCompanySelection, { flush: 'sync' })
  onBeforeUnmount(resetCompanySelection)

  /** 记录本次登录代次；旧请求不能恢复已失效的账号或票据。 */
  const beginLogin = (account: string): number => {
    username.value = account.trim()
    resetCompanySelection()
    companyLoading.value = true
    return sequence
  }

  /** 登录和激活都只接受本页面当前账号、当前代次的结果。 */
  const isCurrentLogin = (requestId: number, account: string): boolean =>
    requestId === sequence && account.trim() === username.value.trim()

  /** 身份成功后保留唯一默认公司；元数据异常时拒绝猜测或发布票据。 */
  const acceptPendingLogin = (
    response: LoginResponse,
    account: string,
    requestId: number
  ): void => {
    if (!isCurrentLogin(requestId, account))
      throw new Error('账号已变化，请重新验证')
    const contexts = response.data.availableContexts ?? []
    const primary = contexts.filter(context => context.isPrimary)
    if (!contexts.length || primary.length !== 1)
      throw new Error('可用公司配置异常，请重新验证并联系管理员')
    if (
      !response.data.loginTicket ||
      response.data.token ||
      response.data.activeContext
    )
      throw new Error('登录验证凭据异常，请重新验证')
    companies.value = contexts.map(
      ({ id, isPrimary, tenantName, companyName }) => ({
        id,
        isPrimary,
        tenantName,
        companyName,
      })
    )
    selectedCompanyId.value = primary[0].id
    verifiedUsername = account.trim()
    pendingTicket.value = response.data.loginTicket
    companyLoading.value = false
  }

  /** 失败只给出受控提示，不保存原始请求错误或凭据。 */
  const failLogin = (requestId: number) => {
    if (requestId !== sequence) return
    resetCompanySelection()
    companyError.value = '账号或密码错误，请重新验证'
  }

  const companyOptions = computed(() =>
    companies.value.map(company => ({
      value: company.id,
      label: `${company.companyName}${company.isPrimary ? ' · 主公司' : ''}`,
    }))
  )
  const selectedCompany = computed(() =>
    companies.value.find(company => company.id === selectedCompanyId.value)
  )
  const hasPendingActivation = computed(() => Boolean(pendingTicket.value))
  const companyReady = computed(
    () =>
      hasPendingActivation.value &&
      !companyLoading.value &&
      Boolean(selectedCompany.value)
  )
  const companyHint = computed(() => {
    if (companyLoading.value) return '正在验证账号或激活工作公司…'
    if (companyError.value) return companyError.value
    if (!hasPendingActivation.value) return '账号验证成功后才能选择工作公司'
    return companies.value.length === 1
      ? '身份已验证，确认唯一关联公司后进入'
      : '身份已验证，默认选择主公司，也可选择其他已关联公司'
  })

  /** 激活只发送短时一次性票据和本次已验证的公司选择，不再次发送密码。 */
  const beginActivation = (): {
    requestId: number
    username: string
    request: ActivateAuthContextRequest
  } => {
    if (
      !companyReady.value ||
      verifiedUsername !== username.value.trim() ||
      !selectedCompanyId.value
    )
      throw new Error('请先验证账号并选择可用公司')
    companyLoading.value = true
    companyError.value = ''
    return {
      requestId: sequence,
      username: verifiedUsername,
      request: {
        loginTicket: pendingTicket.value,
        contextId: selectedCompanyId.value,
      },
    }
  }

  /** 供给失败允许用原票据重试；已变化的账号不恢复旧选择。 */
  const activationFailed = (requestId: number) => {
    if (requestId !== sequence) return
    companyLoading.value = false
    companyError.value = '工作公司激活失败，请重试或重新验证账号'
  }

  return {
    username,
    companies,
    selectedCompanyId,
    companyLoading,
    companyError,
    companyOptions,
    companyHint,
    companyReady,
    hasPendingActivation,
    beginLogin,
    isCurrentLogin,
    acceptPendingLogin,
    failLogin,
    beginActivation,
    activationFailed,
    resetCompanySelection,
  }
}
