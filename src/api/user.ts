import axios from 'axios'
import type { UserLoginDTO, AdminLoginDTO, MerchantLoginDTO, KaptchaDTO, KaptchaDVO, Result, AccessTokenDVO, UserRegisterDTO, CarouselImage, CarouselImageDetailsDTO, ImageQueryParams, ImageUploadResponse, PageResult, HomeBackgroundImageDVO, AdminDVO, AdminQueryParams, AdminDTO, NewAdminDTO, GetCategoryDVO, GetCategoryByConditionDTO, NewCategoryDTO, AdminGetProductByConditionDTO, AdminGetProductDVO, AdminGetProductDetailDVO, AdminGetUserByConditionDTO, AdminGetUserDVO, AdminGetUserDetailDVO, AdminGetMerchantByConditionDTO, AdminGetMerchantDVO, AdminGetMerchantDetailDVO, MerchantRegisterDTO, BackgroundGetProductByConditionDTO, BackgroundGetProductDVO, BackgroundGetProductDetailDVO, MerchantUpdateProductFormDTO, CategoryDVO, AttributeDVO, AttributeValueDVO, NewProductCategoryDTO, DeleteProductCategoryDTO, NewProductAttributeValueDTO, DeleteProductAttributeValueDTO, NewProductDTO, UpdateMerchantInformationFormDTO, MerchantInformationDVO, UserInformationDVO, UserInformationUpdateDTO, HotProductDVO, QueryProductByConditionDTO, QueryProductDVO, CartDVO, UserAddressDVO, UserAddressDTO, CreateOrderDTO, UserOrdersDetailDVO, UserOrdersDVO, MerchantOrdersDVO } from '@/types'
import { currentApp, getToken, getRefreshKey, saveAccessToken, clearSession, loginPathOf } from '@/utils/auth'
import type { AuthApp } from '@/utils/auth'

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:8080/api', // 接口基础路径
  timeout: 30000 // 请求超时时间
})

// 刷新令牌专用的裸客户端：刻意不挂任何拦截器，
// 这样刷新接口自己失败时不可能再进 handleTokenExpired 造成死循环。
// 超时给短一些，免得一个卡住的刷新请求拖住所有排队的 401。
const refreshClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000
})

/**
 * 生成验证码接口
 * @returns Promise<Result<KaptchaDVO>>
 */
export const generateCaptcha = (): Promise<Result<KaptchaDVO>> => {
  return request({
    url: '/auth/kaptcha/generate',
    method: 'GET'
  })
}

/**
 * 验证验证码接口
 * @param data 验证码验证参数
 * @returns Promise<Result<string>>
 */
export const verifyCaptcha = (data: KaptchaDTO): Promise<Result<string>> => {
  return request({
    url: '/auth/kaptcha/verify',
    method: 'POST',
    data
  })
}

/**
 * 用户登录接口
 * @param data 登录参数
 * @returns Promise<Result<AccessTokenDVO>>
 */
export const login = (data: UserLoginDTO): Promise<Result<AccessTokenDVO>> => {
  return request({
    url: '/auth/user/login',
    method: 'POST',
    data
  })
}

/**
 * 管理员登录接口
 * @param data 登录参数
 * @returns Promise<Result<AccessTokenDVO>>
 */
export const adminLogin = (data: AdminLoginDTO): Promise<Result<AccessTokenDVO>> => {
  return request({
    url: '/auth/admin/login',
    method: 'POST',
    data
  })
}

/**
 * 商家登录接口
 * @param data 登录参数
 * @returns Promise<Result<AccessTokenDVO>>
 */
export const merchantLogin = (data: MerchantLoginDTO): Promise<Result<AccessTokenDVO>> => {
  return request({
    url: '/auth/merchant/login',
    method: 'POST',
    data
  })
}

/**
 * 获取用户信息接口
 * @returns Promise<Result<UserInfo>>
 */
export const getUserInfo = (): Promise<Result<any>> => {
  return request({
    url: '/auth/user/info',
    method: 'GET'
  })
}

/**
 * 用户登出接口
 * @returns Promise<Result<string>>
 */
export const logout = (): Promise<Result<string>> => {
  return request({
    url: '/auth/user/logout',
    method: 'POST'
  })
}

/**
 * 文件上传接口
 * @param file 要上传的文件
 * @returns Promise<Result<string>>
 */
export const uploadFile = (file: File): Promise<Result<string>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/file/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 用户注册接口
 * @param data 注册参数
 * @returns Promise<Result<string>>
 */
export const register = (data: UserRegisterDTO): Promise<Result<string>> => {
  return request({
    url: '/auth/user/register',
    method: 'POST',
    data
  })
}

/**
 * 商家注册接口
 * @param data 注册参数
 * @returns Promise<Result<string>>
 */
export const merchantRegister = (data: MerchantRegisterDTO): Promise<Result<string>> => {
  return request({
    url: '/auth/merchant/register',
    method: 'POST',
    data
  })
}

/**
 * 获取主页分类数据接口
 * @returns Promise<Result<Category[]>>
 */
export const getHomeCategories = (): Promise<Result<Category[]>> => {
  return request({
    url: '/user/home/category',
    method: 'GET'
  })
}

/**
 * 分类数据类型
 */
export interface Category {
  id: number
  parentId: number
  name: string
  children: Category[]
}

/**
 * 获取轮播图片列表接口
 * @param params 查询参数
 * @returns Promise<Result<PageResult<CarouselImage>>>
 */
export const getCarouselImageList = (params: ImageQueryParams): Promise<Result<PageResult<CarouselImage>>> => {
  return request({
    url: '/file/image/getCarouselImageList',
    method: 'GET',
    params
  })
}

/**
 * 启用轮播图片接口
 * @param uid 图片UUID
 * @returns Promise<Result<string>>
 */
export const setCarouselImageEnabled = (uid: string): Promise<Result<string>> => {
  return request({
    url: '/file/image/setCarouselImageEnabled',
    method: 'PUT',
    params: { uid }
  })
}

/**
 * 禁用轮播图片接口
 * @param uid 图片UUID
 * @returns Promise<Result<string>>
 */
export const setCarouselImageNotEnabled = (uid: string): Promise<Result<string>> => {
  return request({
    url: '/file/image/setCarouselImageNotEnabled',
    method: 'PUT',
    params: { uid }
  })
}

/**
 * 新增轮播图片接口
 * @param data 图片数据
 * @returns Promise<Result<ImageUploadResponse>>
 */
export const newCarouselImage = (data: FormData): Promise<Result<ImageUploadResponse>> => {
  return request({
    url: '/file/image/newCarouselImage',
    method: 'POST',
    data
    // 不手动设置Content-Type，让axios自动处理
  })
}

/**
 * 删除轮播图片接口
 * @param uid 图片UUID
 * @returns Promise<Result<string>>
 */
export const deleteCarouselImage = (uid: string): Promise<Result<string>> => {
  return request({
    url: `/file/image/deleteCarouselImage/${uid}`,
    method: 'DELETE'
  })
}

/**
 * 更新轮播图片接口
 * @param data 图片详情数据
 * @returns Promise<Result<string>>
 */
export const updateCarouselImage = (data: CarouselImageDetailsDTO): Promise<Result<string>> => {
  return request({
    url: '/file/image/updateCarouselImage',
    method: 'PUT',
    data
  })
}

/**
 * 获取主页背景图片列表接口
 * @param pageNum 页码
 * @param pageSize 每页大小
 * @returns Promise<Result<PageResult<HomeBackgroundImageDVO>>>
 */
export const getHomeBackGroundImageList = (pageNum: number, pageSize: number): Promise<Result<PageResult<HomeBackgroundImageDVO>>> => {
  return request({
    url: '/file/image/getHomeBackGroundImageList',
    method: 'GET',
    params: { pageNum, pageSize }
  })
}

/**
 * 启用主页背景图片接口
 * @param uid 图片UUID
 * @param pageNum 页码
 * @returns Promise<Result<string>>
 */
export const setHomeBackGroundImageEnabled = (uid: string, pageNum: number): Promise<Result<string>> => {
  return request({
    url: '/file/image/setHomeBackGroundImageEnabled',
    method: 'PUT',
    params: { uid, pageNum }
  })
}

/**
 * 禁用主页背景图片接口
 * @param uid 图片UUID
 * @param pageNum 页码
 * @returns Promise<Result<string>>
 */
export const setHomeBackGroundImageNotEnabled = (uid: string, pageNum: number): Promise<Result<string>> => {
  return request({
    url: '/file/image/setHomeBackGroundImageNotEnabled',
    method: 'PUT',
    params: { uid, pageNum }
  })
}

/**
 * 新增主页背景图片接口
 * @param data 图片数据
 * @returns Promise<Result<ImageUploadResponse>>
 */
export const newHomeBackGroundImage = (data: FormData): Promise<Result<ImageUploadResponse>> => {
  return request({
    url: '/file/image/newHomeBackGroundImage',
    method: 'POST',
    data
  })
}

/**
 * 删除主页背景图片接口
 * @param uid 图片UUID
 * @returns Promise<Result<string>>
 */
export const deleteHomeBackGroundImage = (uid: string): Promise<Result<string>> => {
  return request({
    url: `/file/image/deleteHomeBackGroundImage/${uid}`,
    method: 'DELETE'
  })
}

/**
 * 获取当前背景图片接口
 * @returns Promise<Result<HomeBackgroundImageDVO>>
 */
export const getNowHomeBackGroundImage = (): Promise<Result<HomeBackgroundImageDVO>> => {
  return request({
    url: '/file/image/getNowHomeBackGroundImage',
    method: 'GET'
  })
}

/**
 * 取消当前背景图片接口
 * @param uid 图片UUID
 * @returns Promise<Result<string>>
 */
export const deleteNowHomeBackGroundImage = (uid: string): Promise<Result<string>> => {
  return request({
    url: `/file/image/deleteNowHomeBackGroundImage/${uid}`,
    method: 'DELETE'
  })
}

/**
 * 设置已启用图片为当前背景图片接口
 * @param uid 图片UUID
 * @returns Promise<Result<string>>
 */
export const setNowHomeBackGroundImage = (uid: string): Promise<Result<string>> => {
  return request({
    url: `/file/image/setNowHomeBackGroundImage/${uid}`,
    method: 'PATCH'
  })
}

/**
 * 更新主页背景图片接口
 * @param data 图片详情数据
 * @param pageNum 页码
 * @returns Promise<Result<string>>
 */
export const updateHomeBackGroundImage = (data: HomeBackgroundImageDVO, pageNum: number): Promise<Result<string>> => {
  return request({
    url: '/file/image/updateHomeBackGroundImage',
    method: 'PUT',
    data,
    params: { pageNum }
  })
}

/**
 * 获取登录界面背景图片
 */
export const getLoginBackgroundImage = (): Promise<Result<HomeBackgroundImageDVO>> => {
  return request({
    url: '/file/image/getNowHomeBackGroundImage',
    method: 'GET'
  })
}

/**
 * 获取主页轮播图片
 */
export const getHomeCarouselImageList = (): Promise<Result<string[]>> => {
  return request({
    url: '/user/home/getCarouselImageList',
    method: 'GET'
  })
}

/**
 * 获取管理员列表接口
 * @param params 查询参数
 * @returns Promise<Result<PageResult<AdminDVO>>>
 */
export const getAdminList = (params: AdminQueryParams): Promise<Result<PageResult<AdminDVO>>> => {
  return request({
    url: '/admin/adminManagement/getAdminList',
    method: 'GET',
    params
  })
}

/**
 * 编辑管理员接口
 * @param data 管理员数据
 * @param pageNum 页码
 * @returns Promise<Result<boolean>>
 */
export const updateAdmin = (data: AdminDTO, pageNum: number): Promise<Result<boolean>> => {
  return request({
    url: '/admin/adminManagement/updateAdmin',
    method: 'PUT',
    data,
    params: { pageNum }
  })
}

/**
 * 启用管理员接口
 * @param adminId 管理员ID
 * @param pageNum 页码
 * @returns Promise<Result<boolean>>
 */
export const setAdminIsEnabled = (adminId: number, pageNum: number): Promise<Result<boolean>> => {
  return request({
    url: '/admin/adminManagement/setAdminIsEnabled',
    method: 'PUT',
    params: { adminId, pageNum }
  })
}

/**
 * 禁用管理员接口
 * @param adminId 管理员ID
 * @param pageNum 页码
 * @returns Promise<Result<boolean>>
 */
export const setAdminNotEnabled = (adminId: number, pageNum: number): Promise<Result<boolean>> => {
  return request({
    url: '/admin/adminManagement/setAdminNotEnabled',
    method: 'PUT',
    params: { adminId, pageNum }
  })
}

/**
 * 新增管理员接口
 * @param data 新增管理员参数
 * @returns Promise<Result<AdminDVO>>
 */
export const newAdmin = (data: NewAdminDTO): Promise<Result<AdminDVO>> => {
  return request({
    url: '/admin/adminManagement/newAdmin',
    method: 'POST',
    data
  })
}

/**
 * 删除管理员接口
 * @param adminId 管理员ID
 * @returns Promise<Result<boolean>>
 */
export const deleteAdmin = (adminId: number): Promise<Result<boolean>> => {
  return request({
    url: `/admin/adminManagement/deleteAdmin/${adminId}`,
    method: 'DELETE'
  })
}

/**
 * ==================== 商家端商品管理API ====================
 */

/**
 * 获取商品列表（分页查询）
 * @param data 查询条件
 * @returns Promise<Result<PageResult<BackgroundGetProductDVO>>>
 */
export const getMerchantProductList = (data: BackgroundGetProductByConditionDTO): Promise<Result<PageResult<BackgroundGetProductDVO>>> => {
  return request({
    url: '/merchant/product/getProduct',
    method: 'POST',
    data
  })
}

/**
 * 获取商品详情
 * @param id 商品ID
 * @returns Promise<Result<BackgroundGetProductDetailDVO>>
 */
export const getMerchantProductDetail = (id: number): Promise<Result<BackgroundGetProductDetailDVO>> => {
  return request({
    url: `/merchant/product/getProductDetail/${id}`,
    method: 'GET'
  })
}

/**
 * 商品上架|下架
 * @param productId 商品ID
 * @returns Promise<Result<string>>
 */
export const setProductStatus = (productId: number): Promise<Result<string>> => {
  return request({
    url: '/merchant/product/setStatus',
    method: 'PUT',
    params: { productId }
  })
}

/**
 * 商品删除
 * @param productId 商品ID
 * @returns Promise<Result<string>>
 */
export const deleteProduct = (productId: number): Promise<Result<string>> => {
  return request({
    url: '/merchant/product/deleteProduct',
    method: 'DELETE',
    params: { productId }
  })
}

/**
 * 修改商品信息
 * @param data 商品信息
 * @returns Promise<Result<string>>
 */
export const updateProduct = (data: MerchantUpdateProductFormDTO): Promise<Result<string>> => {
  return request({
    url: '/merchant/product/updateProduct',
    method: 'POST',
    data
  })
}

/**
 * ==================== 商家端分类和属性API ====================
 */

/**
 * 查询所有分类
 * @returns Promise<Result<CategoryDVO[]>>
 */
export const getCategories = (): Promise<Result<CategoryDVO[]>> => {
  return request({
    url: '/admin/CategoryAndAttribute/getCategory',
    method: 'GET'
  })
}

/**
 * 查询所有属性
 * @returns Promise<Result<AttributeDVO[]>>
 */
export const getAttributes = (): Promise<Result<AttributeDVO[]>> => {
  return request({
    url: '/admin/CategoryAndAttribute/getAttribute',
    method: 'GET'
  })
}

/**
 * 查询对应属性的属性值
 * @param id 属性ID
 * @returns Promise<Result<AttributeValueDVO[]>>
 */
export const getAttributeValues = (id: number): Promise<Result<AttributeValueDVO[]>> => {
  return request({
    url: `/admin/CategoryAndAttribute/getAttribute/value/${id}`,
    method: 'GET'
  })
}

/**
 * 分类新增
 * @param data 分类数据
 * @returns Promise<Result<string>>
 */
export const addProductCategory = (data: NewProductCategoryDTO): Promise<Result<string>> => {
  return request({
    url: '/merchant/product/newProductCategory',
    method: 'POST',
    data
  })
}

/**
 * 分类删除
 * @param data 分类数据
 * @returns Promise<Result<string>>
 */
export const deleteProductCategory = (data: DeleteProductCategoryDTO): Promise<Result<string>> => {
  return request({
    url: '/merchant/product/deleteProductCategory',
    method: 'POST',
    data
  })
}

/**
 * 属性新增
 * @param data 属性数据
 * @returns Promise<Result<string>>
 */
export const addProductAttributeValue = (data: NewProductAttributeValueDTO): Promise<Result<string>> => {
  return request({
    url: '/merchant/product/newProductAttributeValue',
    method: 'POST',
    data
  })
}

/**
 * 属性删除
 * @param data 属性数据
 * @returns Promise<Result<string>>
 */
export const deleteProductAttributeValue = (data: DeleteProductAttributeValueDTO): Promise<Result<string>> => {
  return request({
    url: '/merchant/product/deleteProductAttributeValue',
    method: 'POST',
    data
  })
}

/**
 * 新增商品
 * @param data 商品数据
 * @returns Promise<Result<string>>
 */
export const newProduct = (data: NewProductDTO): Promise<Result<string>> => {
  return request({
    url: '/merchant/product/newProduct',
    method: 'POST',
    data
  })
}

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 定义不需要token的URL列表
    const noTokenUrls = [
      '/auth/kaptcha/generate',
      '/auth/kaptcha/verify',
      '/auth/user/login',
      '/auth/admin/login',
      '/auth/merchant/login',
      '/user/home/getBackGroundImage'
    ]
    
    // 检查当前请求是否需要token
    const needToken = !noTokenUrls.some(url => config.url?.includes(url))
    
    if (needToken) {
      // 用【当前页面】所属那一端的 token。
      // 三端登录态各自独立，谁最后登录不再影响这里该带哪一份（见 @/utils/auth）
      const token = getToken()
      // 添加Authorization-token请求头，只有当token不为空时才添加
      if (token) {
        config.headers['Authorization-token'] = token
      }
    }
    
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const { data } = response
    // 兜底：网关注销令牌时回的是 HTTP 401（走下面的错误分支），进不到这里。
    // 留着是为了将来万一某个服务把过期信息塞进 200 的 msg 里，不至于静默失败
    if (data.code !== 1 && data.msg === '访问令牌过期') {
      return handleTokenExpired(response.config)
    }
    // 同上：这个 msg 只有刷新接口会返回，而刷新接口走的是不带拦截器的 refreshClient
    if (data.code !== 1 && data.msg === '登陆已过期请重新登陆') {
      handleLoginExpired(currentApp())
      return Promise.reject(new Error(data.msg))
    }
    // 直接返回数据，由调用方处理code !== 1的情况
    return data
  },
  error => {
    // 先原样打一条，开发者仍能在控制台看到 axios 的原始报错
    console.error('响应错误:', error)

    // 把 HTTP 层的失败翻译成人话写回 error.message：
    // 全站 catch 里写的都是 ElMessage.error(error.message)，改这里等于全站生效，
    // 页面就不会再显示 "Request failed with status code 403" 了
    if (error.response) {
      const status: number = error.response.status
      const backendMsg = extractMsg(error.response.data)

      if (status === 401) {
        // 401 交给续期流程：它要么重放原请求，要么清当前端并跳登录页
        return handleTokenExpired(error.config, error)
      } else if (status === 403) {
        error.message = backendMsg || '权限不足'
      } else if (status >= 500) {
        // 5xx 的响应体里可能是异常堆栈之类的东西，不直接甩给用户
        error.message = '服务器开小差了，请稍后重试'
      } else {
        // 其余 4xx（400 参数错误、404 接口不存在……）优先用后端给的说明
        error.message = backendMsg || `请求失败（${status}）`
      }
    } else if (error.code === 'ECONNABORTED') {
      error.message = '请求超时，请稍后重试'
    } else {
      // 请求根本没发出去：后端没起、断网等
      error.message = '无法连接服务器，请确认后端服务已启动'
    }

    return Promise.reject(error)
  }
)

/** 取出后端统一响应体里的说明文字（Result.msg），取不到返回空串 */
function extractMsg(body: unknown): string {
  if (body && typeof body === 'object' && 'msg' in body) {
    const msg = (body as { msg?: unknown }).msg
    if (typeof msg === 'string') {
      return msg.trim()
    }
  }
  return ''
}

/**
 * 处理访问令牌过期（HTTP 401，或 200 里带"访问令牌过期"的兜底分支）。
 * 用当前端的 refresh key 续期一次并重放原请求；续期失败只清当前端、跳当前端登录页。
 *
 * @param config 原请求配置，用于重放
 * @param originalError 原始的 axios 错误，续期失败时原样抛回给调用方
 */
async function handleTokenExpired(config: any, originalError?: unknown): Promise<any> {
  const app = currentApp()

  // 续期失败：清掉当前端登录态并跳它自己的登录页。
  // 抛回的仍是原始错误对象（调用方的 catch 写法不用改），只把文案换成能看懂的
  const giveUp = (): Promise<never> => {
    handleLoginExpired(app)
    const error = originalError instanceof Error ? originalError : new Error('登录已过期，请重新登录')
    error.message = '登录已过期，请重新登录'
    return Promise.reject(error)
  }

  // 已经重放过一次的请求再次 401，说明新令牌也不好使，别再循环
  if (!config || !config.url || config.__retried) {
    return giveUp()
  }

  // 没登录过、或只有 token 没有 refresh key —— 没有可续期的东西
  const refreshKey = getRefreshKey(app)
  if (!refreshKey) {
    return giveUp()
  }

  try {
    const newToken = await refreshTokenOnce(app, refreshKey)
    // 后端刷新接口不轮换 refresh key，所以只覆盖访问令牌
    saveAccessToken(app, newToken)
    // 重放仍然走 request 实例：
    // 1) 调用方拿到的还是拦截器解包后的 data，写法不用变
    // 2) 请求拦截器会重新 getToken()，自动带上刚刷新的令牌
    return request({ ...config, __retried: true })
  } catch (error) {
    console.error('令牌刷新失败:', error)
    return giveUp()
  }
}

/** 同一端的并发 401 只发一次刷新请求，所有等待者复用同一个 Promise */
const refreshInFlight = new Map<AuthApp, Promise<string>>()

function refreshTokenOnce(app: AuthApp, refreshKey: string): Promise<string> {
  const existing = refreshInFlight.get(app)
  if (existing) {
    return existing
  }
  const pending = doRefresh(refreshKey).finally(() => {
    // 只清理自己：否则下一次过期时可能把新的在途刷新误删，之后就再也刷不了了
    if (refreshInFlight.get(app) === pending) {
      refreshInFlight.delete(app)
    }
  })
  refreshInFlight.set(app, pending)
  return pending
}

/** 调用刷新接口拿一个新的访问令牌 */
async function doRefresh(refreshKey: string): Promise<string> {
  // 接口是 GET + query 参数（JwtController.refresh），返回 Result.success(新token)，
  // 新令牌就在 data 里、是个字符串；刷新键由后端复用，不轮换
  const response = await refreshClient.get('/auth/jwt/refresh', {
    params: { refresh_token_key: refreshKey }
  })
  const body = response.data
  if (!body || body.code !== 1 || !body.data) {
    throw new Error(body?.msg || '刷新令牌失败')
  }
  return body.data as string
}

// 会话失效只处理一次：并发的多个 401 只清一次、只跳一次
let isHandlingExpired = false

/**
 * 处理登录已过期：只清【当前端】的凭证，另外两端的登录态与标签页不受影响。
 * 三端本来就是互相独立的会话，不该因为一端过期把另外两端也踢下线。
 */
function handleLoginExpired(app: AuthApp = currentApp()): void {
  if (isHandlingExpired) {
    return
  }
  isHandlingExpired = true

  clearSession(app)
  console.warn(`登录态已失效（${app}），跳转到 ${loginPathOf(app)}`)
  window.location.href = loginPathOf(app)
}

/**
 * 用户管理相关API
 */

/**
 * 获取用户列表
 * @param data 查询条件
 * @returns Promise<Result<PageResult<AdminGetUserDVO>>>
 */
export const getUserList = (data: AdminGetUserByConditionDTO): Promise<Result<PageResult<AdminGetUserDVO>>> => {
  return request({
    url: '/admin/userManagement/list',
    method: 'POST',
    data
  })
}

/**
 * 获取用户详情
 * @param id 用户ID
 * @returns Promise<Result<AdminGetUserDetailDVO>>
 */
export const getUserDetail = (id: number): Promise<Result<AdminGetUserDetailDVO>> => {
  return request({
    url: `/admin/userManagement/getUserDetail/${id}`,
    method: 'GET'
  })
}

/**
 * 启用用户
 * @param id 用户ID
 * @param pageNum 页码
 * @returns Promise<Result<string>>
 */
export const setUserEnabled = (id: number, pageNum: number): Promise<Result<string>> => {
  return request({
    url: '/admin/userManagement/status',
    method: 'PUT',
    params: { id, pageNum }
  })
}

/**
 * 禁用用户
 * @param id 用户ID
 * @param pageNum 页码
 * @returns Promise<Result<string>>
 */
export const setUserNotEnabled = (id: number, pageNum: number): Promise<Result<string>> => {
  return request({
    url: '/admin/userManagement/status',
    method: 'PUT',
    params: { id, pageNum }
  })
}

/**
 * 删除用户
 * @param id 用户ID
 * @returns Promise<Result<string>>
 */
export const deleteUser = (id: number): Promise<Result<string>> => {
  return request({
    url: `/admin/userManagement/deleteUser/${id}`,
    method: 'DELETE'
  })
}

/**
 * 商家管理相关API
 */

/**
 * 获取商家列表
 * @param data 查询条件
 * @returns Promise<Result<PageResult<AdminGetMerchantDVO>>>
 */
export const getMerchantList = (data: AdminGetMerchantByConditionDTO): Promise<Result<PageResult<AdminGetMerchantDVO>>> => {
  return request({
    url: '/admin/merchantManagement/list',
    method: 'POST',
    data
  })
}

/**
 * 获取商家详情
 * @param id 商家ID
 * @returns Promise<Result<AdminGetMerchantDetailDVO>>
 */
export const getMerchantDetail = (id: number): Promise<Result<AdminGetMerchantDetailDVO>> => {
  return request({
    url: `/admin/merchantManagement/getMerchantDetail/${id}`,
    method: 'GET'
  })
}

/**
 * 启用商家
 * @param id 商家ID
 * @param pageNum 页码
 * @returns Promise<Result<string>>
 */
export const setMerchantEnabled = (id: number, pageNum: number): Promise<Result<string>> => {
  return request({
    url: '/admin/merchantManagement/status',
    method: 'PUT',
    params: { id, pageNum }
  })
}

/**
 * 禁用商家
 * @param id 商家ID
 * @param pageNum 页码
 * @returns Promise<Result<string>>
 */
export const setMerchantNotEnabled = (id: number, pageNum: number): Promise<Result<string>> => {
  return request({
    url: '/admin/merchantManagement/status',
    method: 'PUT',
    params: { id, pageNum }
  })
}

/**
 * 删除商家
 * @param id 商家ID
 * @returns Promise<Result<string>>
 */
export const deleteMerchant = (id: number): Promise<Result<string>> => {
  return request({
    url: `/admin/merchantManagement/deleteMerchant/${id}`,
    method: 'DELETE'
  })
}

/**
 * 分页查询所有分类
 * @param pageNum 页码
 * @param pageSize 每页大小
 * @returns Promise<Result<PageResult<GetCategoryDVO>>>
 */
export const getCategory = (pageNum: number, pageSize: number): Promise<Result<PageResult<GetCategoryDVO>>> => {
  return request({
    url: '/admin/category/getCategory',
    method: 'GET',
    params: {
      pageNum,
      pageSize
    }
  })
}

/**
 * 分页条件查询分类
 * @param data 查询条件
 * @returns Promise<Result<PageResult<GetCategoryDVO>>>
 */
export const getCategoryByCondition = (data: GetCategoryByConditionDTO): Promise<Result<PageResult<GetCategoryDVO>>> => {
  return request({
    url: '/admin/category/getCategoryByCondition',
    method: 'POST',
    data
  })
}

/**
 * 启用分类
 * @param id 分类ID
 * @param pageNum 当前页码
 * @returns Promise<Result<string>>
 */
export const setCategoryEnabled = (id: number, pageNum: number): Promise<Result<string>> => {
  return request({
    url: '/admin/category/setCategoryEnabled',
    method: 'PUT',
    params: {
      id,
      pageNum
    }
  })
}

/**
 * 禁用分类
 * @param id 分类ID
 * @param pageNum 当前页码
 * @returns Promise<Result<string>>
 */
export const setCategoryNotEnabled = (id: number, pageNum: number): Promise<Result<string>> => {
  return request({
    url: '/admin/category/setCategoryNotEnabled',
    method: 'PUT',
    params: {
      id,
      pageNum
    }
  })
}

/**
 * 删除分类
 * @param id 分类ID
 * @returns Promise<Result<string>>
 */
export const deleteCategory = (id: number): Promise<Result<string>> => {
  return request({
    url: `/admin/category/deleteCategory/${id}`,
    method: 'DELETE'
  })
}

/**
 * 新增分类
 * @param data 新增分类数据
 * @returns Promise<Result<string>>
 */
export const newCategory = (data: NewCategoryDTO): Promise<Result<string>> => {
  return request({
    url: '/admin/category/newCategory',
    method: 'POST',
    data
  })
}

/**
 * 获取商品列表
 * @param data 查询条件
 * @returns Promise<Result<PageResult<AdminGetProductDVO>>>
 */
export const getProduct = (data: AdminGetProductByConditionDTO): Promise<Result<PageResult<AdminGetProductDVO>>> => {
  return request({
    url: '/admin/productManagement/getProduct',
    method: 'POST',
    data
  })
}

/**
 * 获取商品详情
 * @param id 商品ID
 * @returns Promise<Result<AdminGetProductDetailDVO>>
 */
export const getProductDetail = (id: number): Promise<Result<AdminGetProductDetailDVO>> => {
  return request({
    url: `/admin/productManagement/getProductDetail/${id}`,
    method: 'GET'
  })
}

/**
 * 设置商品状态（管理员端）
 * @param id 商品ID
 * @param pageNum 页码
 * @returns Promise<Result<string>>
 */
export const setAdminProductStatus = (id: number, pageNum: number): Promise<Result<string>> => {
  return request({
    url: '/admin/productManagement/status',
    method: 'PUT',
    params: { id, pageNum }
  })
}

/**
 * 用户信息管理相关API
 */

/**
 * 获取用户信息
 * @returns Promise<Result<UserInformationDVO>>
 */
export const getUserInformation = (): Promise<Result<UserInformationDVO>> => {
  return request({
    url: '/user/userInformationManagement/getUserInformation',
    method: 'GET'
  })
}

/**
 * 修改用户信息
 * @param data 用户信息更新参数
 * @returns Promise<Result<boolean>>
 */
export const updateUserInformation = (data: UserInformationUpdateDTO): Promise<Result<boolean>> => {
  return request({
    url: '/user/userInformationManagement/updateUserInformation',
    method: 'PUT',
    data
  })
}

/**
 * 查询热门商品
 * @param pageNum 页码
 * @param pageSize 每页大小
 * @returns Promise<Result<PageResult<HotProductDVO>>>
 */
export const queryHotProduct = (pageNum: number, pageSize: number): Promise<Result<PageResult<HotProductDVO>>> => {
  return request({
    url: '/user/userProduct/queryHotProduct',
    method: 'GET',
    params: { pageNum, pageSize }
  })
}

/**
 * 查询商品详情
 * @param id 商品ID
 * @returns Promise<Result<BackgroundGetProductDetailDVO>>
 */
export const queryProductDetail = (id: number): Promise<Result<BackgroundGetProductDetailDVO>> => {
  return request({
    url: '/user/userProduct/queryProductDetail',
    method: 'GET',
    params: { id }
  })
}

/**
 * 条件查询商品
 * @param queryDTO 查询条件DTO
 * @returns Promise<Result<PageResult<QueryProductDVO>>>
 */
export const queryProductByCondition = (queryDTO: QueryProductByConditionDTO): Promise<Result<PageResult<QueryProductDVO>>> => {
  return request({
    url: '/user/userProduct/queryProductByCondition',
    method: 'POST',
    data: queryDTO
  })
}

/**
 * 查看购物车列表
 * @param merchantId 商家ID
 * @returns Promise<Result<CartDVO[]>>
 */
export const getCartList = (merchantId: number): Promise<Result<CartDVO[]>> => {
  return request({
    url: '/user/cart/list',
    method: 'GET',
    params: { merchantId }
  })
}

/**
 * 添加商品到购物车
 * @param productId 商品ID
 * @param quantity 数量
 * @returns Promise<Result<string>>
 */
export const addCartItem = (productId: number, quantity: number): Promise<Result<string>> => {
  return request({
    url: '/user/cart/add',
    method: 'POST',
    params: { productId, quantity }
  })
}

/**
 * 删除购物车商品
 * @param productId 商品ID
 * @returns Promise<Result<string>>
 */
export const deleteCartItem = (productId: number): Promise<Result<string>> => {
  return request({
    url: `/user/cart/delete/${productId}`,
    method: 'DELETE'
  })
}

/**
 * 获取用户地址列表
 * @returns Promise<Result<UserAddressDVO[]>>
 */
export const getUserAddress = (): Promise<Result<UserAddressDVO[]>> => {
  return request({
    url: '/user/userInformationManagement/getUserAddress',
    method: 'GET'
  })
}

/**
 * 新增用户地址
 * @param addressDTO 地址信息
 * @returns Promise<Result<boolean>>
 */
export const addUserAddress = (addressDTO: UserAddressDTO): Promise<Result<boolean>> => {
  return request({
    url: '/user/userInformationManagement/addUserAddress',
    method: 'POST',
    data: addressDTO
  })
}

/**
 * 修改用户地址
 * @param addressDTO 地址信息
 * @returns Promise<Result<boolean>>
 */
export const updateUserAddress = (addressDTO: UserAddressDTO): Promise<Result<boolean>> => {
  return request({
    url: '/user/userInformationManagement/updateUserAddress',
    method: 'POST',
    data: addressDTO
  })
}

/**
 * 删除用户地址
 * @param id 地址ID
 * @returns Promise<Result<boolean>>
 */
export const deleteUserAddress = (id: number): Promise<Result<boolean>> => {
  return request({
    url: `/user/userInformationManagement/deleteUserAddress/${id}`,
    method: 'DELETE'
  })
}

/**
 * 创建订单（购物车结算）
 * @param createOrderDTO 创建订单参数
 * @returns Promise<Result<UserOrdersDetailDVO>>
 */
export const createOrder = (createOrderDTO: CreateOrderDTO): Promise<Result<UserOrdersDetailDVO>> => {
  return request({
    url: '/user/cart/createOrder',
    method: 'POST',
    data: createOrderDTO
  })
}

/**
 * 获取用户订单列表
 * @returns Promise<Result<UserOrdersDVO[]>>
 */
export const getOrdersList = (): Promise<Result<UserOrdersDVO[]>> => {
  return request({
    url: '/user/orders/list',
    method: 'GET'
  })
}

/**
 * 获取订单详情
 * @param orderId 订单ID
 * @returns Promise<Result<UserOrdersDetailDVO>>
 */
export const getOrderDetail = (orderId: number): Promise<Result<UserOrdersDetailDVO>> => {
  return request({
    url: '/user/orders/detail',
    method: 'GET',
    params: { orderId }
  })
}

/**
 * 支付订单
 * @param orderId 订单ID
 * @returns Promise<Result<string>>
 */
export const payOrder = (orderId: number): Promise<Result<string>> => {
  return request({
    url: '/user/orders/pay',
    method: 'GET',
    params: { orderId }
  })
}

/**
 * 确认订单完成
 * @param orderId 订单ID
 * @returns Promise<Result<string>>
 */
export const confirmOrder = (orderId: number): Promise<Result<string>> => {
  return request({
    url: '/user/orders/confirm',
    method: 'GET',
    params: { orderId }
  })
}

/**
 * ==================== 商家端订单管理API ====================
 */

/**
 * 获取订单列表（分页查询）
 * @param pageNum 页码
 * @param pageSize 每页数量
 * @returns Promise<PageResult<MerchantOrdersDVO>>
 */
export const getMerchantOrdersList = (pageNum: number, pageSize: number): Promise<PageResult<MerchantOrdersDVO>> => {
  return request({
    url: '/merchant/orders/list',
    method: 'GET',
    params: { pageNum, pageSize }
  })
}

/**
 * 获取订单详情
 * @param orderId 订单ID
 * @returns Promise<Result<UserOrdersDetailDVO>>
 */
export const getMerchantOrderDetail = (orderId: number): Promise<Result<UserOrdersDetailDVO>> => {
  return request({
    url: '/merchant/orders/detail',
    method: 'GET',
    params: { orderId }
  })
}

/**
 * 设置订单状态（确认发货）
 * @param orderId 订单ID
 * @returns Promise<Result<string>>
 */
export const setMerchantOrdersStatus = (orderId: number): Promise<Result<string>> => {
  return request({
    url: '/merchant/orders/status',
    method: 'GET',
    params: { orderId }
  })
}

/**
 * ==================== 商家端店铺设置API ====================
 */

/**
 * 获取商家信息
 * @returns Promise<Result<MerchantInformationDVO>>
 */
export const getMerchantInformation = (): Promise<Result<MerchantInformationDVO>> => {
  return request({
    url: '/merchant/Information/get',
    method: 'GET'
  })
}

/**
 * 更新商家信息
 * @param data 更新商家信息参数
 * @returns Promise<Result<string>>
 */
export const updateMerchantInformation = (data: UpdateMerchantInformationFormDTO): Promise<Result<string>> => {
  return request({
    url: '/merchant/Information/update',
    method: 'POST',
    data
  })
}

export default request
