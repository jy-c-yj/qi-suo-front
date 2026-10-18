<template>
  <div class="product-detail-container">
    <!-- 顶部导航栏 -->
    <header class="top-nav">
      <div class="nav-container">
        <div class="nav-left">
          <h1 class="logo" @click="goToHome">栖所</h1>
          <div class="user-info">
            <span class="username">{{ username }}</span>
            <el-button link class="logout-btn" @click="handleLogout">
              退出登录
            </el-button>
          </div>
        </div>
        <div class="nav-right">
          <div class="nav-item" @click="goToProfile">
            <el-icon class="nav-icon"><User /></el-icon>
            <span>个人信息</span>
          </div>
          <div class="nav-item" @click="goToOrders">
            <el-icon class="nav-icon"><Document /></el-icon>
            <span>我的订单</span>
          </div>
          <div class="nav-item" @click="goToCart">
            <el-icon class="nav-icon"><ShoppingCart /></el-icon>
            <span>购物车</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 商品详情内容 -->
    <main class="product-detail-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-icon class="error-icon"><Warning /></el-icon>
        <span>{{ error }}</span>
        <el-button size="small" @click="loadProductDetail">重试</el-button>
      </div>

      <!-- 商品详情 -->
      <div v-else-if="product" class="product-detail-wrapper">
        <!-- 商品图片和信息 -->
        <div class="product-basic-info">
          <!-- 商品图片 -->
          <div class="product-image-section">
            <div class="main-image">
              <img :src="product.productImageUrl" :alt="product.productName" class="main-img" />
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="product-info-section">
            <h1 class="product-name">{{ product.productName }}</h1>
            
            <!-- 商品价格 -->
            <div class="product-price-section">
              <span class="current-price">¥{{ product.price }}</span>
              <span class="original-price">¥{{ product.originalPrice }}</span>
            </div>

            <!-- 商品状态标签 -->
            <div class="product-tags">
              <el-tag v-if="product.isHot" type="danger">热门</el-tag>
              <el-tag v-if="product.isNew" type="primary">新品</el-tag>
              <el-tag v-if="product.status === 1" type="success">在售</el-tag>
              <el-tag v-else type="info">下架</el-tag>
            </div>

            <!-- 商品销量和评分 -->
            <div class="product-stats">
              <span class="sales-count">销量: {{ product.salesCount }}</span>
              <span class="rating">评分: {{ product.rating }}</span>
              <span class="view-count">浏览: {{ product.viewCount }}</span>
            </div>

            <!-- 商品库存 -->
            <div class="product-stock">
              <span>库存: {{ product.stock }}件</span>
            </div>

            <!-- 商品SKU -->
            <div class="product-sku">
              <span>SKU: {{ product.sku }}</span>
            </div>

            <!-- 商家信息 -->
            <div class="merchant-info">
              <span>商家: {{ product.merchantName }}</span>
            </div>

            <!-- 商品操作按钮 -->
            <div class="product-actions">
              <el-button type="success" size="large" class="add-cart-btn" @click="handleAddToCart">
                <el-icon><ShoppingCart /></el-icon>
                加入购物车
              </el-button>
              <el-button type="primary" size="large" class="cart-btn" @click="showCartDialog">
                <el-icon><Document /></el-icon>
                查看购物车
              </el-button>
            </div>
          </div>
        </div>

        <!-- 商品详情和属性 -->
        <div class="product-details-section">
          <!-- 商品分类 -->
          <div class="product-category">
            <h3 class="section-title">商品分类</h3>
            <div class="category-tags">
              <el-tag v-for="(category, index) in product.categoryNames" :key="index" size="default">
                {{ category }}
              </el-tag>
            </div>
          </div>

          <!-- 商品属性 -->
          <div class="product-attributes">
            <h3 class="section-title">商品属性</h3>
            <div class="attributes-list">
              <div 
                v-for="(attr, index) in product.attributeAndValues" 
                :key="index"
                class="attribute-item"
              >
                <span class="attribute-name">{{ attr.attributeName }}:</span>
                <span class="attribute-value">{{ attr.attributeValue }}</span>
              </div>
            </div>
          </div>

          <!-- 商品描述 -->
          <div class="product-description">
            <h3 class="section-title">商品描述</h3>
            <div class="description-content">
              {{ product.description }}
            </div>
          </div>

          <!-- 商品时间信息 -->
          <div class="product-time-info">
            <div class="time-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatDate(product.createdAt) }}</span>
            </div>
            <div class="time-item">
              <span class="label">更新时间:</span>
              <span class="value">{{ formatDate(product.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 无数据状态 -->
      <div v-else class="empty-container">
        <el-icon class="empty-icon"><Document /></el-icon>
        <span>商品不存在</span>
      </div>
    </main>

    <!-- 底部信息 -->
    <footer class="footer">
      <div class="footer-content">
        <p>© 2026 栖所家居 版权所有</p>
      </div>
    </footer>

    <!-- 购物车弹窗 -->
    <el-dialog
      v-model="cartDialogVisible"
      title="购物车"
      width="700px"
      class="cart-dialog"
    >
      <!-- 加载状态 -->
      <div v-if="cartLoading" class="cart-loading">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 购物车列表 -->
      <div v-else-if="cartList.length > 0" class="cart-list">
        <div v-for="item in cartList" :key="item.id" class="cart-item">
          <div class="cart-item-image">
            <img :src="item.productImageUrl" :alt="item.productName" />
          </div>
          <div class="cart-item-info">
            <h4 class="cart-item-name">{{ item.productName }}</h4>
            <p class="cart-item-price">¥{{ item.price.toFixed(2) }}</p>
          </div>
          <div class="cart-item-quantity">
            <span>数量: {{ item.quantity }}</span>
          </div>
          <div class="cart-item-total">
            <span>¥{{ item.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="cart-item-actions">
            <el-button type="danger" size="small" @click="handleDeleteCartItem(item.productId)">
              删除
            </el-button>
          </div>
        </div>

        <!-- 购物车总计 -->
        <div class="cart-summary">
          <span class="cart-total-label">总计:</span>
          <span class="cart-total-price">¥{{ cartTotalPrice.toFixed(2) }}</span>
          <el-button type="primary" @click="showCheckoutDialog" :loading="checkoutLoading">
            结算
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="cart-empty">
        <el-icon class="empty-icon"><ShoppingCart /></el-icon>
        <p>购物车是空的</p>
      </div>

      <!-- 添加商品到购物车 -->
      <div class="add-to-cart-section">
        <h4>添加当前商品到购物车</h4>
        <div class="add-to-cart-form">
          <span class="product-name">{{ product?.productName }}</span>
          <el-input-number v-model="addQuantity" :min="1" :max="product?.stock || 1" size="small" />
          <el-button type="primary" @click="handleAddToCartFromDialog">添加</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 结算弹窗 -->
    <el-dialog
      v-model="checkoutDialogVisible"
      title="确认订单"
      width="500px"
      class="checkout-dialog"
    >
      <!-- 地址选择 -->
      <div class="checkout-section">
        <h4>选择收货地址</h4>
        <div v-if="addressLoading" class="address-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>加载地址中...</span>
        </div>
        <div v-else-if="addressList.length > 0" class="address-list">
          <div
            v-for="address in addressList"
            :key="address.id"
            class="address-item"
            :class="{ 'selected': selectedAddressId === address.id }"
            @click="selectedAddressId = address.id"
          >
            <el-icon v-if="selectedAddressId === address.id" class="check-icon"><Check /></el-icon>
            <span>{{ address.detailAddress }}</span>
          </div>
        </div>
        <div v-else class="no-address">
          <span>暂无收货地址，请先添加地址</span>
        </div>
      </div>

      <!-- 订单摘要 -->
      <div class="order-summary">
        <h4>订单摘要</h4>
        <div class="summary-item">
          <span>商家:</span>
          <span>{{ product?.merchantName }}</span>
        </div>
        <div class="summary-item">
          <span>商品数量:</span>
          <span>{{ cartList.length }} 件</span>
        </div>
        <div class="summary-item total">
          <span>订单总额:</span>
          <span class="total-amount">¥{{ cartTotalPrice.toFixed(2) }}</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="checkoutDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCheckout" :loading="checkoutLoading" :disabled="!selectedAddressId">
          确认下单
        </el-button>
      </template>
    </el-dialog>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="orderDetailDialogVisible"
      title="订单详情"
      width="600px"
      class="order-detail-dialog"
    >
      <div v-if="orderDetail" class="order-detail">
        <div class="order-header">
          <div class="order-no">
            <span class="label">订单编号:</span>
            <span class="value">{{ orderDetail.orderNo }}</span>
          </div>
          <div class="order-status">
            <el-tag :type="getOrderStatusType(orderDetail.status)">
              {{ normalizeOrderStatus(orderDetail.status) }}
            </el-tag>
          </div>
        </div>

        <div class="order-info">
          <div class="info-item">
            <span class="label">商家:</span>
            <span class="value">{{ orderDetail.merchantName }}</span>
          </div>
          <div class="info-item">
            <span class="label">收货地址:</span>
            <span class="value">{{ orderDetail.detailAddress }}</span>
          </div>
        </div>

        <div class="order-products">
          <h4>商品列表</h4>
          <div v-for="(item, index) in orderDetail.productList" :key="index" class="product-item">
            <div class="product-image">
              <img :src="item.productImageUrl" :alt="item.productName" />
            </div>
            <div class="product-info">
              <span class="product-name">{{ item.productName }}</span>
              <span class="product-price">¥{{ item.price.toFixed(2) }} x {{ item.quantity }}</span>
            </div>
            <div class="product-total">
              ¥{{ item.totalPrice.toFixed(2) }}
            </div>
          </div>
        </div>

        <div class="order-total">
          <span class="label">订单总额:</span>
          <span class="amount">¥{{ orderDetail.totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="orderDetailDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElTag, ElButton, ElIcon, ElDialog, ElInputNumber } from 'element-plus'
import { User, Document, Loading, Warning, HomeFilled, ShoppingCart, Check } from '@element-plus/icons-vue'
import { queryProductDetail, getCartList, addCartItem, deleteCartItem, getUserAddress, createOrder } from '@/api/user'
import { logoutAndClear } from '@/utils/logout'
import { getOrderStatusType, normalizeOrderStatus } from '@/utils/orderStatus'
import type { BackgroundGetProductDetailDVO, CartDVO, UserAddressDVO, UserOrdersDetailDVO } from '@/types'

const route = useRoute()
const router = useRouter()

// 用户名
const username = ref(localStorage.getItem('username') || '用户')

// 商品详情数据
const product = ref<BackgroundGetProductDetailDVO | null>(null)
const loading = ref(false)
const error = ref('')

// 购物车相关数据
const cartDialogVisible = ref(false)
const cartLoading = ref(false)
const cartList = ref<CartDVO[]>([])
const addQuantity = ref(1)

// 结算相关数据
const checkoutDialogVisible = ref(false)
const checkoutLoading = ref(false)
const addressLoading = ref(false)
const addressList = ref<UserAddressDVO[]>([])
const selectedAddressId = ref<number | null>(null)

// 订单详情数据
const orderDetailDialogVisible = ref(false)
const orderDetail = ref<UserOrdersDetailDVO | null>(null)

// 获取商品ID
const productId = computed(() => {
  const id = route.query.id
  if (typeof id === 'string') {
    return parseInt(id)
  } else if (Array.isArray(id) && id.length > 0 && typeof id[0] === 'string') {
    return parseInt(id[0])
  }
  return 0
})

// 加载商品详情
const loadProductDetail = async () => {
  if (!productId.value || productId.value === 0) {
    error.value = '商品ID不存在'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const response = await queryProductDetail(productId.value)
    if (response.code === 1 && response.data) {
      product.value = response.data
    } else {
      error.value = response.msg || '获取商品详情失败'
    }
  } catch (err: any) {
    console.error('获取商品详情失败:', err)
    error.value = err.message || '获取商品详情失败'
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 跳转到首页
const goToHome = () => {
  router.push('/home')
}

// 跳转到个人信息页面
const goToProfile = () => {
  router.push('/user/profile')
}

// 跳转到我的订单页面
const goToOrders = () => {
  router.push('/user/orders')
}

// 跳转到购物车页面
const goToCart = () => {
  router.push('/user/cart')
}

// 退出登录
const handleLogout = async () => {
  await logoutAndClear('user')
}

// 购物车总计价格
const cartTotalPrice = computed(() => {
  return cartList.value.reduce((total, item) => total + item.totalPrice, 0)
})

// 显示购物车弹窗
const showCartDialog = () => {
  cartDialogVisible.value = true
  loadCartList()
}

// 加载购物车列表
const loadCartList = async () => {
  if (!product.value?.merchantId) {
    ElMessage.warning('无法获取商家信息')
    return
  }

  cartLoading.value = true
  try {
    const response = await getCartList(product.value.merchantId)
    if (response.code === 1 && response.data) {
      cartList.value = response.data
    } else {
      ElMessage.error(response.msg || '获取购物车失败')
    }
  } catch (err: any) {
    console.error('获取购物车失败:', err)
    ElMessage.error(err.message || '获取购物车失败')
  } finally {
    cartLoading.value = false
  }
}

// 删除购物车商品
const handleDeleteCartItem = async (productId: number) => {
  try {
    const response = await deleteCartItem(productId)
    if (response.code === 1) {
      ElMessage.success('删除成功')
      loadCartList()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (err: any) {
    console.error('删除购物车商品失败:', err)
    ElMessage.error(err.message || '删除失败')
  }
}

// 添加商品到购物车（从商品详情页）
const handleAddToCart = async () => {
  if (!productId.value) {
    ElMessage.warning('商品信息不完整')
    return
  }

  try {
    const response = await addCartItem(productId.value, 1)
    if (response.code === 1) {
      ElMessage.success('已添加到购物车')
    } else {
      ElMessage.error(response.msg || '添加失败')
    }
  } catch (err: any) {
    console.error('添加购物车失败:', err)
    ElMessage.error(err.message || '添加失败')
  }
}

// 添加商品到购物车（从弹窗）
const handleAddToCartFromDialog = async () => {
  if (!productId.value) {
    ElMessage.warning('商品信息不完整')
    return
  }

  try {
    const response = await addCartItem(productId.value, addQuantity.value)
    if (response.code === 1) {
      ElMessage.success('已添加到购物车')
      addQuantity.value = 1
      loadCartList()
    } else {
      ElMessage.error(response.msg || '添加失败')
    }
  } catch (err: any) {
    console.error('添加购物车失败:', err)
    ElMessage.error(err.message || '添加失败')
  }
}

// 显示结算弹窗
const showCheckoutDialog = async () => {
  checkoutDialogVisible.value = true
  await loadAddressList()
}

// 加载用户地址列表
const loadAddressList = async () => {
  addressLoading.value = true
  try {
    const response = await getUserAddress()
    if (response.code === 1 && response.data) {
      addressList.value = response.data
      const firstAddress = addressList.value[0]
      if (firstAddress && !selectedAddressId.value) {
        selectedAddressId.value = firstAddress.id
      }
    } else {
      ElMessage.error(response.msg || '获取地址失败')
    }
  } catch (err: any) {
    console.error('获取地址失败:', err)
    ElMessage.error(err.message || '获取地址失败')
  } finally {
    addressLoading.value = false
  }
}

// 结算
const handleCheckout = async () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  if (!product.value?.merchantId) {
    ElMessage.warning('无法获取商家信息')
    return
  }

  checkoutLoading.value = true
  try {
    const response = await createOrder({
      userAddressId: selectedAddressId.value,
      merchantId: product.value.merchantId
    })
    if (response.code === 1 && response.data) {
      ElMessage.success('下单成功')
      checkoutDialogVisible.value = false
      cartDialogVisible.value = false
      orderDetail.value = response.data
      orderDetailDialogVisible.value = true
      loadCartList()
    } else {
      ElMessage.error(response.msg || '下单失败')
    }
  } catch (err: any) {
    console.error('下单失败:', err)
    ElMessage.error(err.message || '下单失败')
  } finally {
    checkoutLoading.value = false
  }
}

// 页面挂载时加载商品详情
onMounted(() => {
  loadProductDetail()
})
</script>

<style scoped>
/* 全局CSS变量 - 与主页保持一致 */
.product-detail-container {
  /* 温暖米色主题 */
  --primary-color: #F8F4E9;
  --primary-hover: #E8DDCC;
  --secondary-color: #E8DDCC;
  --text-color: #5D4037;
  --text-light: #8D6E63;
  --bg-light: #FCFAF7;
  --white: #FCFAF7;
  --border-radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.15);
  
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-light);
}

/* 顶部导航栏 */
.top-nav {
  background-color: var(--white);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 1000; /* 增加z-index确保不被覆盖 */
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 70px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0;
}

.logo:hover {
  color: var(--primary-color);
  transform: translateY(-1px);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 18px;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  font-size: 16px;
  color: var(--text-color);
  font-weight: 500;
}

.nav-item:hover {
  background-color: var(--primary-color);
  color: var(--text-color);
  transform: translateY(-1px);
}

.nav-item:hover .nav-icon {
  color: var(--text-color);
}

.nav-icon {
  font-size: 24px;
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  font-size: 16px;
  color: var(--text-color);
  font-weight: 500;
  padding: 10px 18px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
}

.username:hover {
  background-color: var(--primary-color);
  transform: translateY(-1px);
}

.logout-btn {
  color: var(--text-light);
  border-radius: var(--border-radius);
  padding: 4px 12px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(245, 239, 224, 0.3);
  color: var(--primary-color);
}

/* 商品详情内容 */
.product-detail-content {
  flex: 1;
  padding: 40px 0;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  flex-direction: column;
  gap: 16px;
}

.loading-icon {
  font-size: 48px;
  color: var(--primary-color);
  animation: rotate 1s linear infinite;
}

.error-icon,
.empty-icon {
  font-size: 48px;
  color: var(--primary-color);
}

/* 商品详情包装器 */
.product-detail-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 商品基本信息 */
.product-basic-info {
  display: flex;
  gap: 40px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
}

/* 商品图片部分 */
.product-image-section {
  flex: 0 0 400px;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 商品信息部分 */
.product-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-name {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.3;
}

/* 价格部分 */
.product-price-section {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.current-price {
  font-size: 32px;
  font-weight: 700;
  color: #D32F2F;
}

.original-price {
  font-size: 18px;
  color: #9E9E9E;
  text-decoration: line-through;
}

/* 标签部分 */
.product-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 统计信息 */
.product-stats {
  display: flex;
  gap: 24px;
  color: var(--text-light);
  font-size: 14px;
}

.product-stock,
.product-sku,
.merchant-info {
  color: var(--text-light);
  font-size: 14px;
}

/* 操作按钮 */
.product-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.add-cart-btn,
.cart-btn {
  flex: 1;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.add-cart-btn:hover,
.cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* 商品详情部分 */
.product-details-section {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 32px;
  box-shadow: var(--shadow);
  margin-top: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary-color);
}

/* 分类标签 */
.category-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

/* 属性列表 */
.attributes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.attribute-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background-color: var(--bg-light);
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
}

.attribute-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.attribute-name {
  font-weight: 500;
  color: var(--text-color);
}

.attribute-value {
  color: var(--text-light);
}

/* 描述内容 */
.description-content {
  line-height: 1.6;
  color: var(--text-light);
  margin-bottom: 32px;
  white-space: pre-wrap;
  padding: 16px;
  background-color: var(--bg-light);
  border-radius: var(--border-radius);
}

/* 时间信息 */
.product-time-info {
  display: flex;
  gap: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.time-item {
  display: flex;
  gap: 8px;
  color: var(--text-light);
  font-size: 14px;
}

/* 底部信息 */
.footer {
  background-color: var(--white);
  padding: 20px 0;
  border-top: 1px solid #e4e7ed;
  margin-top: 40px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  color: var(--text-light);
  font-size: 14px;
}

/* 旋转动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 购物车弹窗样式 */
.cart-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.cart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: var(--text-light);
}

.cart-list {
  max-height: 400px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  transition: background-color 0.3s;
}

.cart-item:hover {
  background-color: var(--bg-light);
}

.cart-item-image {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius);
  overflow: hidden;
  flex-shrink: 0;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-price {
  font-size: 14px;
  color: var(--text-light);
  margin: 0;
}

.cart-item-quantity {
  font-size: 14px;
  color: var(--text-light);
  min-width: 60px;
}

.cart-item-total {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
  min-width: 80px;
  text-align: right;
}

.cart-item-actions {
  flex-shrink: 0;
}

.cart-summary {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  border-top: 2px solid var(--primary-color);
  margin-top: 16px;
}

.cart-total-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
}

.cart-total-price {
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}

.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-light);
  gap: 16px;
}

.cart-empty .empty-icon {
  font-size: 48px;
}

.add-to-cart-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.add-to-cart-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: var(--text-color);
}

.add-to-cart-form {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.add-to-cart-form .product-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 150px;
}

/* 结算弹窗样式 */
.checkout-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.checkout-section {
  margin-bottom: 24px;
}

.checkout-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: var(--text-color);
}

.address-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;
  color: var(--text-light);
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s;
}

.address-item:hover {
  border-color: var(--primary-hover);
  background-color: var(--bg-light);
}

.address-item.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.address-item .check-icon {
  color: #409eff;
  font-size: 18px;
}

.no-address {
  padding: 20px;
  text-align: center;
  color: var(--text-light);
  background-color: var(--bg-light);
  border-radius: var(--border-radius);
}

.order-summary {
  padding: 20px;
  background-color: var(--bg-light);
  border-radius: var(--border-radius);
}

.order-summary h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: var(--text-color);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-light);
}

.summary-item.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
  font-weight: 500;
  color: var(--text-color);
}

.total-amount {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

/* 订单详情弹窗样式 */
.order-detail-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.order-no {
  display: flex;
  gap: 8px;
}

.order-no .label {
  color: var(--text-light);
  font-size: 14px;
}

.order-no .value {
  font-weight: 500;
  color: var(--text-color);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-item .label {
  color: var(--text-light);
  font-size: 14px;
  min-width: 80px;
}

.info-item .value {
  color: var(--text-color);
  font-size: 14px;
}

.order-products {
  padding: 16px;
  background-color: var(--bg-light);
  border-radius: var(--border-radius);
}

.order-products h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--text-color);
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;
}

.product-item:last-child {
  border-bottom: none;
}

.product-item .product-image {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius);
  overflow: hidden;
  flex-shrink: 0;
}

.product-item .product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-item .product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-item .product-name {
  font-size: 14px;
  color: var(--text-color);
}

.product-item .product-price {
  font-size: 12px;
  color: var(--text-light);
}

.product-item .product-total {
  font-size: 14px;
  font-weight: 500;
  color: #f56c6c;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 2px solid var(--primary-color);
}

.order-total .label {
  font-size: 16px;
  color: var(--text-color);
}

.order-total .amount {
  font-size: 24px;
  font-weight: 600;
  color: #f56c6c;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .product-basic-info {
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  .product-image-section {
    flex: 0 0 300px;
  }

  .main-image {
    height: 300px;
  }

  .product-price-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .product-actions {
    flex-direction: column;
  }

  .product-stats {
    flex-wrap: wrap;
  }

  .attributes-list {
    grid-template-columns: 1fr;
  }

  .product-time-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>