/**
 * 登录类型枚举
 */
export enum LoginType {
  USER = 'user',
  ADMIN = 'admin',
  MERCHANT = 'merchant'
}

/**
 * 用户登录请求参数类型
 * 对应后端的UserLoginDTO类
 */
export interface UserLoginDTO {
  username: string
  password: string
}

/**
 * 管理员登录请求参数类型
 * 对应后端的AdminLoginDTO类
 */
export interface AdminLoginDTO {
  username: string
  password: string
}

/**
 * 商家登录请求参数类型
 * 对应后端的MerchantLoginDTO类
 */
export interface MerchantLoginDTO {
  merchantName: string
  merchantPassword: string
}

/**
 * 登录表单数据类型
 */
export interface LoginForm {
  username: string
  password: string
  merchantName: string
  merchantPassword: string
  inputCode: string
}

/**
 * 用户注册请求参数类型
 * 对应后端的UserRegisterDTO类
 */
export interface UserRegisterDTO {
  username: string
  password: string
  imageUrl: string
  phone: string
  email: string
}

/**
 * 验证码验证请求参数类型
 * 对应后端的KaptchaDTO类
 */
export interface KaptchaDTO {
  /**
   * 用户输入的验证码
   */
  inputCode: string
  /**
   * 验证码唯一标识
   */
  captchaID: string
}

/**
 * 验证码生成响应数据类型
 * 对应后端的KaptchaDVO类
 */
export interface KaptchaDVO {
  /**
   * 生成的验证码的图片的base64编码
   */
  base64Image: string
  /**
   * 验证码唯一标识
   */
  captchaID: string
}

/**
 * 访问令牌响应数据类型
 * 对应后端的AccessTokenDVO类
 */
export interface AccessTokenDVO {
  /**
   * 访问令牌
   */
  access_token: string
  /**
   * 刷新令牌键
   */
  refresh_token_key: string
  /**
   * 登录账号 id
   */
  id?: number
  /**
   * 角色列表，如 SystemADMIN / SuperAdmin / OrdinaryAdmin / Merchant / USER
   */
  roles?: string[]
}

/**
 * 修改密码参数
 */
export interface ChangePasswordDTO {
  oldPassword: string
  newPassword: string
}

/**
 * 后端响应结果类型
 * 对应后端的Result<T>类
 */
export interface Result<T = any> {
  code: number
  msg: string
  data: T
}

/**
 * 用户信息类型
 */
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  role: string
  createTime: string
  updateTime: string
}

/**
 * 分页响应类型
 */
export interface PageResult<T = any> {
  records: T[]
  rows?: T[]
  total: number
  size: number
  current: number
  pages: number
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
 * 轮播图类型
 */
export interface CarouselImage {
  id: number
  uid: string
  imageUrl: string
  linkUrl: string
  title: string
  description: string
  sort: number
  status: number
  isEnabled: boolean
  isDeleted: boolean
  createdBy: string
  createdTime: string
  modifiedBy: string
  modifiedTime: string
}

/**
 * 轮播图详情DTO
 */
export interface CarouselImageDetailsDTO {
  id: number
  uid: string
  imageUrl: string
  linkUrl: string
  title: string
  description: string
  sort: number
  status: number
  isEnabled: boolean
  createdBy: string
  createdTime: string
  modifiedBy: string
  modifiedTime: string
}

/**
 * 图片查询参数
 */
export interface ImageQueryParams {
  pageNum: number
  pageSize: number
  page?: number
  size?: number
  isEnabled?: boolean
  isUsed?: boolean
  isDeleted?: boolean
  sortBy?: string
  sortOrder?: string
}

/**
 * 图片上传响应
 */
export interface ImageUploadResponse {
  url: string
}

/**
 * 首页背景图DVO
 */
export interface HomeBackgroundImageDVO {
  id: number
  uid: string
  url: string
  description: string
  isEnabled: boolean
  createdTime: string
  updatedTime: string
}

/**
 * 管理员DVO
 */
export interface AdminDVO {
  adminId: number
  adminName: string
  phone: string
  status: number
  adminType: number
  createTime: string
  updateTime: string
  createBy: string
  updateBy: string
}

/**
 * 管理员查询参数
 */
export interface AdminQueryParams {
  pageNum: number
  pageSize: number
}

/**
 * 管理员DTO
 */
export interface AdminDTO {
  adminId: number
  adminName?: string
  phone?: string
  status?: number
  adminType?: number
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
}

/**
 * 新增管理员DTO
 */
export interface NewAdminDTO {
  adminName: string
  password: string
  phone: string
  adminType: number
}

/**
 * 分类DVO
 */
export interface GetCategoryDVO {
  id: number
  parentId: number
  name: string
  level: number
  children?: GetCategoryDVO[]
  parentName?: string
  /** 后端返回的是中文类型名 */
  categoryType?: string
  path?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * 分类条件查询DTO
 */
export interface GetCategoryByConditionDTO {
  parentId?: number
  name?: string
  level?: number
  categoryType?: number
  isActive?: boolean
  pageNum?: number
  pageSize?: number
}

/**
 * 新增分类DTO
 */
export interface NewCategoryDTO {
  parentId: number
  name: string
  level: number
  categoryType?: number
}

/**
 * 管理员商品条件查询DTO
 */
export interface AdminGetProductByConditionDTO {
  pageNum: number
  pageSize: number
  productName?: string
  merchantId?: number
  categoryId?: number
  status?: number
  isHot?: boolean
  isNew?: boolean
  id?: number
  merchantName?: string
  sku?: string
}

/**
 * 管理员商品DVO
 */
export interface AdminGetProductDVO {
  id: number
  productName: string
  productImageUrl: string
  price: number
  originalPrice: number
  stock: number
  salesCount: number
  viewCount?: number
  sku?: string
  status: number
  merchantName: string
  createdAt: string
  updatedAt: string
}

/**
 * 管理员商品详情DVO
 */
export interface AdminGetProductDetailDVO {
  id: number
  productName: string
  productImageUrl: string
  price: number
  originalPrice: number
  stock: number
  salesCount: number
  rating: number
  viewCount: number
  isHot: boolean
  isNew: boolean
  status: number
  sku: string
  description: string
  merchantId: number
  merchantName: string
  categoryNames: string[]
  categoryIds?: number[]
  attributeAndValues: {
    attributeValueId?: number
    attributeName: string
    attributeValue: string
  }[]
  attributeValueIds?: number[]
  createdAt: string
  updatedAt: string
}

/**
 * 管理员用户条件查询DTO
 */
export interface AdminGetUserByConditionDTO {
  pageNum: number
  pageSize: number
  id?: number
  username?: string
  email?: string
  status?: number
}

/**
 * 管理员用户DVO
 */
export interface AdminGetUserDVO {
  id: number
  username: string
  imageUrl: string
  phone: string
  email: string
  roleName: string
  status: number
  createTime: string
}

/**
 * 管理员用户详情DVO
 */
export interface AdminGetUserDetailDVO {
  id: number
  username: string
  imageUrl: string
  phone: string
  email: string
  status: number
  createTime: string
  updateTime: string
}

/**
 * 管理员商家条件查询DTO
 */
export interface AdminGetMerchantByConditionDTO {
  pageNum: number
  pageSize: number
  id?: number
  merchantName?: string
  status?: number
}

/**
 * 管理员商家DVO
 */
export interface AdminGetMerchantDVO {
  merchantId: number
  merchantName: string
  shopName: string
  shopLogoUrl: string
  description: string
  contactName: string
  contactPhone: string
  contactEmail: string
  status: number
  createTime: string
  updateTime: string
  createBy: string
  updateBy: string
}

/**
 * 管理员商家详情DVO
 */
export interface AdminGetMerchantDetailDVO {
  id: number
  merchantName: string
  imageUrl: string
  phone: string
  email: string
  status: number
  description: string
  createTime: string
  updateTime: string
}

/**
 * 商家注册DTO
 */
export interface MerchantRegisterDTO {
  merchantName: string
  merchantPassword: string
  imageUrl: string
  phone: string
  email: string
  description: string
  shopName?: string
  shopLogoUrl?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
}

/**
 * 商家商品条件查询DTO
 */
export interface BackgroundGetProductByConditionDTO {
  pageNum: number
  pageSize: number
  productName?: string
  categoryId?: number
  status?: number
  isHot?: boolean
  isNew?: boolean
}

/**
 * 商家商品DVO
 */
export interface BackgroundGetProductDVO {
  id: number
  productName: string
  productImageUrl: string
  price: number
  originalPrice: number
  stock: number
  salesCount: number
  viewCount?: number
  sku?: string
  status: number
  merchantName?: string
  createdAt: string
  updatedAt: string
}

/**
 * 商家修改商品表单DTO
 */
export interface MerchantUpdateProductFormDTO {
  id: number
  productName: string
  description: string
  price: number
  stock: number
  originalPrice: number
  isNew: boolean
  isHot: boolean
  productImageUrl: string
}

/**
 * 分类DVO（商品分类）
 */
export interface CategoryDVO {
  id: number
  name: string
  parentId: number
  level: number
}

/**
 * 属性DVO
 */
export interface AttributeDVO {
  id: number
  attributeName: string
  attributeType?: number
}

/**
 * 属性值DVO
 */
export interface AttributeValueDVO {
  id: number
  attributeId: number
  value: string
}

/**
 * 新增商品分类DTO
 */
export interface NewProductCategoryDTO {
  productId: number
  categoryId: number
}

/**
 * 删除商品分类DTO
 */
export interface DeleteProductCategoryDTO {
  productId: number
  categoryId: number
}

/**
 * 新增商品属性值DTO
 */
export interface NewProductAttributeValueDTO {
  productId: number
  attributeValueId: number
}

/**
 * 删除商品属性值DTO
 */
export interface DeleteProductAttributeValueDTO {
  productId: number
  attributeId: number
  attributeValueId: number
}

/**
 * 新增商品DTO
 */
export interface NewProductDTO {
  productName: string
  productImageUrl: string
  price: number
  originalPrice: number
  stock: number
  description: string
  isNew: boolean
  isHot: boolean
  categoryIds: number[]
  attributeAndValues: number[]
}

/**
 * 更新商家信息表单DTO
 */
export interface UpdateMerchantInformationFormDTO {
  merchantId: number
  merchantName: string
  merchantPassword: string
  shopName: string
  shopLogoUrl: string
  description: string
  contactName: string
  contactPhone: string
  contactEmail: string
  updateTime: string
  updateBy: number
}

/**
 * 商家信息DVO
 */
export interface MerchantInformationDVO {
  merchantId: number
  merchantName: string
  merchantPassword: string
  shopName: string
  shopLogoUrl: string
  description: string
  contactName: string
  contactPhone: string
  contactEmail: string
  status: number
  createTime: string
  updateTime: string
  updateBy: number
}

/**
 * 用户信息DVO
 */
export interface UserInformationDVO {
  id: number
  username: string
  imageUrl: string
  phone: string
  email: string
  password?: string
  createTime: string
  updateTime: string
}

/**
 * 用户信息更新DTO
 */
export interface UserInformationUpdateDTO {
  username: string
  imageUrl: string
  phone: string
  email: string
}

/**
 * 热门商品DVO
 */
export interface HotProductDVO {
  id: number
  productName: string
  productImageUrl: string
  price: number
  originalPrice: number
  salesCount: number
  merchantName: string
}

/**
 * 商品条件查询DTO
 */
export interface QueryProductByConditionDTO {
  pageNum: number
  pageSize: number
  productName?: string
  merchantName?: string
  categoryId?: number | null
  isHot?: boolean | null
  isNew?: boolean | null
  priceAsc?: boolean | null
  priceDesc?: boolean | null
  salesAsc?: boolean | null
  salesDesc?: boolean | null
  salesCountSort?: boolean | null
  priceSort?: boolean | null
  viewCountSort?: boolean | null
}

/**
 * 商品查询DVO
 */
export interface QueryProductDVO {
  id: number
  productName: string
  productImageUrl: string
  price: number
  originalPrice: number
  salesCount: number
  merchantId: number
  merchantName: string
  isHot?: boolean
  isNew?: boolean
  rating?: number
  stock?: number
}

/**
 * 购物车商品项DVO
 * 对应后端的CartDVO类
 */
export interface CartDVO {
  id: number
  productId: number
  productName: string
  productImageUrl: string
  price: number
  quantity: number
  totalPrice: number
}

/**
 * 购物车按商家分组后的展示对象
 * 对应后端的 CartMerchantGroupDVO
 */
export interface CartMerchantGroupDVO {
  merchantId: number
  merchantName: string
  items: CartDVO[]
  totalPrice: number
  totalQuantity: number
}

/**
 * 商品详情DVO
 * 对应后端的商品详情查询结果
 */
export interface BackgroundGetProductDetailDVO {
  id: number
  productName: string
  productImageUrl: string
  price: number
  originalPrice: number
  stock: number
  salesCount: number
  rating: number
  viewCount: number
  isHot: boolean
  isNew: boolean
  status: number
  sku: string
  description: string
  merchantId: number
  merchantName: string
  categoryNames: string[]
  categoryIds?: number[]
  attributeAndValues: {
    attributeValueId?: number
    attributeName: string
    attributeValue: string
  }[]
  attributeValueIds?: number[]
  createdAt: string
  updatedAt: string
}

/**
 * 用户地址DVO
 */
export interface UserAddressDVO {
  id: number
  detailAddress: string
}

/**
 * 用户地址DTO
 */
export interface UserAddressDTO {
  id?: number | null
  detailAddress: string
}

/**
 * 创建订单DTO
 */
export interface CreateOrderDTO {
  userAddressId: number
  merchantId: number
}

/**
 * 订单商品项DVO
 */
export interface OrderProductDVO {
  productId: number
  productName: string
  productImageUrl: string
  quantity: number
  price: number
  totalPrice: number
}

/**
 * 用户订单详情DVO
 */
export interface UserOrdersDetailDVO {
  id: number | null
  orderNo: string
  userAddressId: number
  detailAddress: string
  merchantId: number
  merchantName: string
  productList: OrderProductDVO[]
  totalAmount: number
  status: string
  createdAt: string | null
}

/**
 * 商家订单列表项DVO
 */
export interface MerchantOrdersDVO {
  id: number
  orderNo: string
  totalAmount: number
  status: string
  createdAt: string
}

/**
 * 用户订单列表DVO
 */
export interface UserOrdersDVO {
  id: number
  orderNo: string
  merchantName: string
  totalAmount: number
  status: string
  createdAt: string
}
