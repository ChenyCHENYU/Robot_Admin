import type {
  ListApiFn,
  UseTableDataOptions,
  UseTableDataReturn,
} from '@/types/modules/table'

/**
 * 参数过滤器 - 只传递有效参数
 * @param params 原始参数对象
 * @returns 过滤后的参数对象
 */
const filterValidParams = (
  params: Record<string, any>
): Record<string, any> => {
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(params).filter(([key, value]) => {
      // 过滤掉无效值
      if (value === null || value === undefined || value === '') {
        return false
      }
      // 过滤掉空数组
      if (Array.isArray(value) && value.length === 0) {
        return false
      }
      // 过滤掉空对象
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0
      ) {
        return false
      }
      return true
    })
  )
}

/**
 * 表格数据管理的组合式API
 * @param apiFn API函数
 * @param options 配置选项
 */
export function useTableData<T = any>(
  apiFn: ListApiFn<T>,
  options: UseTableDataOptions<T> = {}
): UseTableDataReturn<T> {
  const {
    immediate = true,
    defaultParams = {},
    transform,
    onSuccess,
    onError,
  } = options

  // ================= 在顶部调用组合式API =================
  // 🚀 修复：在 setup 阶段调用 useMessage，避免在异步回调中调用
  let message: any = null
  try {
    message = useMessage?.()
  } catch {
    // 如果 useMessage 不可用，保持 null
    console.log('useMessage 不可用，将使用控制台输出')
  }

  // ================= 状态管理 =================
  const loading = ref(false)
  const tableData = shallowRef<T[]>([]) // 使用 shallowRef 避免 UnwrapRefSimple 类型问题
  const total = ref(0)

  // 分页状态
  const pagination = reactive({
    page: 1,
    pageSize: 10,
  })

  // 搜索参数
  const searchParams = ref<Record<string, any>>({})

  // ================= 工具函数 =================

  /**
   * 构建请求参数
   * @param extraParams 额外参数
   * @returns 过滤后的请求参数
   */
  const buildRequestParams = (
    extraParams: Record<string, any> = {}
  ): Record<string, any> => {
    const baseParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...defaultParams,
      ...searchParams.value,
      ...extraParams,
    }

    return filterValidParams(baseParams)
  }

  // ================= 核心方法 =================

  /**
   * 处理API响应成功的情况
   */
  const handleSuccess = (response: any) => {
    const rawData = response.data.list || []
    tableData.value = transform ? transform(rawData) : rawData
    total.value = response.data.total || 0

    // 同步分页信息
    if (response.data.page) pagination.page = response.data.page
    if (response.data.pageSize) pagination.pageSize = response.data.pageSize

    // ✅ 修复：直接使用预先调用的 message 实例
    if (message) {
      message.success(`已加载 ${tableData.value.length} 条记录`)
    } else {
      console.log(`已加载 ${tableData.value.length} 条记录`)
    }

    onSuccess?.(tableData.value)
    console.log('✅ 数据加载成功:', tableData.value.length, '条记录')
  }

  /**
   * 处理API响应失败的情况
   */
  const handleError = (error: any) => {
    console.error('❌ 数据加载失败:', error)
    tableData.value = []
    total.value = 0

    // 如果是重新登录被取消，不显示错误提示
    if (error?.message === '重新登录已取消') {
      return
    }

    if (message) {
      message.error('加载数据失败，请重试')
    } else {
      console.error('加载数据失败，请重试')
    }

    onError?.(error)
  }

  /**
   * 加载数据
   * @param params 额外参数
   */
  const loadData = async (params: Record<string, any> = {}) => {
    try {
      loading.value = true
      const requestParams = buildRequestParams(params)
      console.log('🚀 API请求参数:', requestParams)

      const response = await apiFn(requestParams)

      if (response.code === '0') {
        handleSuccess(response)
      } else {
        throw new Error(response.message || '数据加载失败')
      }
    } catch (error) {
      handleError(error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索 - 重置到第一页并加载数据
   * @param params 搜索参数
   */
  const search = (params: Record<string, any>) => {
    searchParams.value = { ...params }
    pagination.page = 1 // 搜索时重置到第一页
    return loadData()
  }

  /**
   * 刷新当前页数据
   */
  const refresh = () => {
    return loadData()
  }

  /**
   * 重置搜索条件并重新加载
   */
  const resetSearch = () => {
    searchParams.value = {}
    pagination.page = 1
    return loadData()
  }

  /**
   * 分页变化处理
   * @param page 页码
   * @param pageSize 每页条数
   */
  const handlePageChange = (page: number, pageSize?: number) => {
    pagination.page = page
    if (pageSize && pageSize !== pagination.pageSize) {
      pagination.pageSize = pageSize
      pagination.page = 1 // 改变每页条数时重置到第一页
    }
    return loadData()
  }

  /**
   * 跳转到第一页
   */
  const resetToFirstPage = () => {
    pagination.page = 1
    return loadData()
  }

  // ================= 计算属性 =================
  const isEmpty = computed(() => tableData.value.length === 0)
  const hasData = computed(() => tableData.value.length > 0)
  const currentParams = computed(() => buildRequestParams())

  // ================= 初始化 =================
  if (immediate) {
    loadData()
  }

  // ================= 返回API =================
  return {
    // 状态
    loading,
    tableData,
    total,
    pagination,
    searchParams,

    // 方法
    loadData,
    search,
    refresh,
    resetSearch,
    handlePageChange,
    resetToFirstPage,

    // 计算属性
    isEmpty,
    hasData,
    currentParams, // 当前的请求参数，用于调试
  }
}
