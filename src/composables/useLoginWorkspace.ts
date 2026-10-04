/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\composables\useLoginWorkspace.ts
 * @Description: 登录前按账号查询公司，隔离旧请求与旧账号的选择状态
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { getLoginCompaniesApi } from '@/api/auth'
import type { LoginCompany } from '@/api/auth.contract'

/** 将账号输入与公司查询、默认选择和提交前校验连接起来。 */
export const useLoginWorkspace = () => {
  const username = ref('')
  const companies = ref<LoginCompany[]>([])
  const selectedCompanyId = ref<string | null>(null)
  const companyLoading = ref(false)
  const companyError = ref('')
  let sequence = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let resolvedUsername = ''

  /** 收敛请求失败文案。 */
  const getCompanyError = (error: unknown) =>
    error instanceof Error ? error.message : '公司查询失败，请重试'

  /** 未绑定公司不构造默认项；多主公司拒绝猜测选择。 */
  const getDefaultCompany = (
    list: LoginCompany[]
  ): LoginCompany | undefined => {
    if (!list.length) return undefined
    const primary = list.filter(company => company.isPrimary)
    if (primary.length !== 1)
      throw new Error('主公司配置异常，请联系企业管理员')
    return primary[0]
  }

  /** 忽略已经换账号或卸载页面的查询结果。 */
  const loadCompanies = async (account: string, requestId: number) => {
    try {
      const response = await getLoginCompaniesApi(account)
      if (requestId !== sequence) return
      if (String(response.code) !== '0')
        throw new Error(response.msg || '公司查询失败')
      const list = response.data.companies
      const primary = getDefaultCompany(list)
      companies.value = list
      selectedCompanyId.value = primary?.id ?? null
      resolvedUsername = account
    } catch (error) {
      if (requestId === sequence) companyError.value = getCompanyError(error)
    } finally {
      if (requestId === sequence) companyLoading.value = false
    }
  }

  /** 输入立即使旧选择失效，短暂防抖后查询新账号。 */
  const queryCompanies = () => {
    const requestId = ++sequence
    if (timer) clearTimeout(timer)
    companies.value = []
    selectedCompanyId.value = null
    companyError.value = ''
    resolvedUsername = ''
    const account = username.value.trim()
    companyLoading.value = Boolean(account)
    if (!account) return
    timer = setTimeout(() => void loadCompanies(account, requestId), 300)
  }
  watch(() => username.value.trim(), queryCompanies, { flush: 'sync' })
  onBeforeUnmount(() => {
    sequence++
    if (timer) clearTimeout(timer)
  })

  const companyOptions = computed(() =>
    companies.value.map(company => ({
      value: company.id,
      label: `${company.companyName}${company.isPrimary ? ' · 主公司' : ''}`,
    }))
  )
  const selectedCompany = computed(() =>
    companies.value.find(company => company.id === selectedCompanyId.value)
  )
  const companyHint = computed(() => {
    if (!username.value.trim()) return '输入账号后显示已关联公司'
    if (companyLoading.value) return '正在查询账号关联的公司…'
    if (companyError.value) return companyError.value
    if (!companies.value.length) return '当前账号未关联公司，请联系企业管理员'
    return companies.value.length === 1
      ? '已自动选择唯一关联公司'
      : '默认选择主公司，也可选择其他已关联公司'
  })
  const companyReady = computed(
    () =>
      !companyLoading.value &&
      !companyError.value &&
      Boolean(selectedCompany.value)
  )

  /** 防止回车、快速改账号或失效选择绕过表单的就绪状态。 */
  const requireSelectedCompany = (account: string): string => {
    if (
      resolvedUsername !== account.trim() ||
      !companyReady.value ||
      !selectedCompanyId.value
    )
      throw new Error(companyHint.value)
    return selectedCompanyId.value
  }

  return {
    username,
    companies,
    selectedCompanyId,
    selectedCompany,
    companyLoading,
    companyError,
    companyOptions,
    companyHint,
    companyReady,
    queryCompanies,
    requireSelectedCompany,
  }
}
