<template>
  <div class="cart-container">
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
          <div class="nav-item active">
            <el-icon class="nav-icon"><ShoppingCart /></el-icon>
            <span>购物车</span>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="cart-wrapper">
        <el-card class="cart-card">
          <template #header>
            <div class="card-header">
              <span>购物车</span>
              <el-button type="primary" @click="loadCart" :loading="loading">
                刷新
              </el-button>
            </div>
          </template>

          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>

          <div v-else-if="error" class="error-container">
            <el-icon class="error-icon"><Warning /></el-icon>
            <span>{{ error }}</span>
            <el-button @click="loadCart">重试</el-button>
          </div>

          <div v-else-if="cartGroups.length === 0" class="empty-container">
            <el-icon class="empty-icon"><ShoppingCart /></el-icon>
            <span>购物车还是空的</span>
            <el-button type="primary" @click="goToHome">去逛逛</el-button>
          </div>

          <div v-else class="merchant-groups">
            <section
              v-for="group in cartGroups"
              :key="group.merchantId"
              class="merchant-group"
            >
              <div class="group-header">
                <div class="merchant-info">
                  <el-icon class="merchant-icon"><OfficeBuilding /></el-icon>
                  <span class="merchant-name">{{ group.merchantName }}</span>
                  <span class="item-count">共 {{ group.totalQuantity }} 件</span>
                </div>
                <el-button type="primary" size="small" @click="openCheckout(group)">
                  去结算
                </el-button>
              </div>

              <div class="cart-items">
                <div
                  v-for="item in group.items"
                  :key="item.productId"
                  class="cart-item"
                >
                  <div class="product-image" @click="showDetail(group, item)">
                    <img :src="item.productImageUrl" :alt="item.productName" />
                  </div>

                  <div class="product-info">
                    <span class="product-name" @click="showDetail(group, item)">
                      {{ item.productName }}
                    </span>
                    <span class="product-price">¥{{ formatMoney(item.price) }}</span>
                  </div>

                  <div class="quantity-control">
                    <el-input-number
                      :model-value="item.quantity"
                      :min="1"
                      :max="99"
                      size="small"
                      :disabled="
                        savingProductId === item.productId ||
                        removingProductId === item.productId
                      "
                      @change="(value: number | undefined) => handleQuantityChange(group, item, value)"
                    />
                  </div>

                  <div class="product-total">¥{{ formatMoney(item.totalPrice) }}</div>

                  <div class="item-actions">
                    <el-button link type="primary" @click="showDetail(group, item)">
                      详情
                    </el-button>
                    <el-button
                      link
                      type="danger"
                      :loading="removingProductId === item.productId"
                      @click="handleRemove(item)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </div>

              <div class="group-footer">
                <span class="group-total">
                  合计：
                  <span class="amount">¥{{ formatMoney(group.totalPrice) }}</span>
                </span>
              </div>
            </section>
          </div>
        </el-card>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <p>© 2026 栖所家居 版权所有</p>
      </div>
    </footer>

    <!-- 商品详情 -->
    <el-dialog v-model="detailVisible" title="商品详情" width="600px">
      <div v-if="detailItem" class="detail-content">
        <div class="detail-image">
          <img :src="detailItem.productImageUrl" :alt="detailItem.productName" />
        </div>
        <div class="detail-info">
          <div class="detail-row">
            <span class="label">商品名称：</span>
            <span class="value">{{ detailItem.productName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">所属商家：</span>
            <span class="value">{{ detailGroup?.merchantName || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">单价：</span>
            <span class="value">¥{{ formatMoney(detailItem.price) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">数量：</span>
            <span class="value">{{ detailItem.quantity }}</span>
          </div>
          <div class="detail-row">
            <span class="label">小计：</span>
            <span class="value amount">¥{{ formatMoney(detailItem.totalPrice) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="openProductDetail" :disabled="!detailItem">
          查看商品详情
        </el-button>
      </template>
    </el-dialog>

    <!-- 结算 -->
    <el-dialog v-model="checkoutVisible" title="确认订单" width="500px">
      <div class="checkout-content">
        <div class="checkout-merchant">
          <el-icon><OfficeBuilding /></el-icon>
          <span>{{ checkoutGroup?.merchantName }}</span>
          <span class="item-count">{{ checkoutGroup?.totalQuantity || 0 }} 件商品</span>
        </div>

        <div class="section-title">收货地址</div>
        <div v-loading="addressLoading" class="address-list">
          <div
            v-for="address in addressList"
            :key="address.id"
            class="address-item"
            :class="{ selected: selectedAddressId === address.id }"
            @click="selectedAddressId = address.id"
          >
            <el-icon class="address-icon"><Location /></el-icon>
            <span>{{ address.detailAddress }}</span>
          </div>
          <div v-if="!addressLoading && addressList.length === 0" class="address-empty">
            暂无收货地址，请先到
            <router-link to="/user/profile">个人信息</router-link>
            中添加
          </div>
        </div>

        <div class="checkout-summary">
          <span>订单总额：</span>
          <span class="amount">¥{{ formatMoney(checkoutGroup?.totalPrice) }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="checkoutVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="!selectedAddressId || submitting"
          @click="submitOrder"
        >
          确认下单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Document,
  ShoppingCart,
  Loading,
  Warning,
  OfficeBuilding,
  Location
} from '@element-plus/icons-vue'
import {
  getAllCartList,
  updateCartQuantity,
  removeCartItem,
  getUserAddress,
  createOrder
} from '@/api/user'
import { logoutAndClear } from '@/utils/logout'
import type { CartDVO, CartMerchantGroupDVO, UserAddressDVO } from '@/types'

const router = useRouter()

const username = ref(localStorage.getItem('username') || '用户')

const loading = ref(false)
const error = ref('')
const cartGroups = ref<CartMerchantGroupDVO[]>([])

const savingProductId = ref<number | null>(null)
const removingProductId = ref<number | null>(null)

const detailVisible = ref(false)
const detailItem = ref<CartDVO | null>(null)
const detailGroup = ref<CartMerchantGroupDVO | null>(null)

const checkoutVisible = ref(false)
const checkoutGroup = ref<CartMerchantGroupDVO | null>(null)
const addressList = ref<UserAddressDVO[]>([])
const selectedAddressId = ref<number | null>(null)
const addressLoading = ref(false)
const submitting = ref(false)

const formatMoney = (value: number | null | undefined) => {
  return (Number(value) || 0).toFixed(2)
}

const recalcGroup = (group: CartMerchantGroupDVO) => {
  group.totalQuantity = group.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  group.totalPrice = group.items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
}

const loadCart = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getAllCartList()
    if (response.code === 1 && response.data) {
      cartGroups.value = response.data
      cartGroups.value.forEach(recalcGroup)
    } else if (response.code === 1) {
      cartGroups.value = []
    } else {
      error.value = response.msg || '获取购物车失败'
    }
  } catch (err: any) {
    console.error('获取购物车失败:', err)
    error.value = err.message || '获取购物车失败'
  } finally {
    loading.value = false
  }
}

const handleQuantityChange = async (
  group: CartMerchantGroupDVO,
  item: CartDVO,
  value: number | undefined
) => {
  if (typeof value !== 'number' || value < 1) return
  if (value === item.quantity) return

  savingProductId.value = item.productId
  try {
    const response = await updateCartQuantity(item.productId, value)
    if (response.code === 1 && response.data) {
      Object.assign(item, response.data)
      recalcGroup(group)
    } else {
      ElMessage.error(response.msg || '修改数量失败')
      await loadCart()
    }
  } catch (err: any) {
    console.error('修改数量失败:', err)
    ElMessage.error(err.response?.data?.msg || err.message || '修改数量失败')
    await loadCart()
  } finally {
    savingProductId.value = null
  }
}

const handleRemove = async (item: CartDVO) => {
  try {
    await ElMessageBox.confirm('确定从购物车移除该商品？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
  } catch {
    // 用户取消，不做任何处理
    return
  }

  removingProductId.value = item.productId
  try {
    const response = await removeCartItem(item.productId)
    if (response.code === 1) {
      ElMessage.success('已移除')
      await loadCart()
    } else {
      ElMessage.error(response.msg || '移除失败')
    }
  } catch (err: any) {
    console.error('移除购物车商品失败:', err)
    ElMessage.error(err.response?.data?.msg || err.message || '移除失败')
  } finally {
    removingProductId.value = null
  }
}

const showDetail = (group: CartMerchantGroupDVO, item: CartDVO) => {
  detailGroup.value = group
  detailItem.value = item
  detailVisible.value = true
}

const openProductDetail = () => {
  if (!detailItem.value) return
  window.open(`/product/detail?id=${detailItem.value.productId}`, '_blank')
}

const loadAddressList = async () => {
  addressLoading.value = true
  selectedAddressId.value = null
  try {
    const response = await getUserAddress()
    if (response.code === 1 && response.data) {
      addressList.value = response.data
      const firstAddress = addressList.value[0]
      if (firstAddress) {
        selectedAddressId.value = firstAddress.id
      }
    } else {
      addressList.value = []
      ElMessage.error(response.msg || '获取收货地址失败')
    }
  } catch (err: any) {
    console.error('获取收货地址失败:', err)
    addressList.value = []
    ElMessage.error(err.response?.data?.msg || err.message || '获取收货地址失败')
  } finally {
    addressLoading.value = false
  }
}

const openCheckout = (group: CartMerchantGroupDVO) => {
  checkoutGroup.value = group
  checkoutVisible.value = true
  loadAddressList()
}

const submitOrder = async () => {
  if (!checkoutGroup.value || !selectedAddressId.value || submitting.value) return

  submitting.value = true
  try {
    const response = await createOrder({
      userAddressId: selectedAddressId.value,
      merchantId: checkoutGroup.value.merchantId
    })
    if (response.code !== 1) {
      throw new Error(response.msg || '下单失败')
    }

    ElMessage.success('下单成功')
    checkoutVisible.value = false
    await loadCart()
    router.push('/user/orders')
  } catch (err: any) {
    console.error('下单失败:', err)
    ElMessage.error(err.response?.data?.msg || err.message || '下单失败')
  } finally {
    submitting.value = false
  }
}

const goToHome = () => {
  router.push('/home')
}

const goToProfile = () => {
  router.push('/user/profile')
}

const goToOrders = () => {
  router.push('/user/orders')
}

const handleLogout = async () => {
  await logoutAndClear('user')
}

onMounted(() => {
  loadCart()
})
</script>

<style scoped>
.cart-container {
  --primary-color: #F8F4E9;
  --primary-hover: #E8DDCC;
  --secondary-color: #E8DDCC;
  --text-color: #5D4037;
  --text-light: #8D6E63;
  --bg-light: #FCFAF7;
  --white: #FCFAF7;
  --border-radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-light);
  text-align: left;
}

.top-nav {
  background-color: var(--white);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  margin: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo:hover {
  color: var(--primary-hover);
  transform: translateY(-1px);
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
  color: var(--text-color);
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
  padding: 10px 18px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  color: var(--text-color);
  font-weight: 500;
}

.nav-item:hover,
.nav-item.active {
  background-color: var(--primary-color);
  color: var(--text-color);
  transform: translateY(-1px);
}

.nav-icon {
  font-size: 24px;
  color: var(--text-color);
  transition: all 0.3s ease;
}

.main-content {
  flex: 1;
  padding: 40px 20px;
}

.cart-wrapper {
  max-width: 1100px;
  margin: 0 auto;
}

.cart-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;
  color: var(--text-light);
}

.loading-icon,
.error-icon,
.empty-icon {
  font-size: 48px;
}

.merchant-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.merchant-group {
  border: 1px solid #e4e7ed;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background-color: var(--bg-light);
  border-bottom: 1px solid #e4e7ed;
}

.merchant-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.merchant-icon {
  font-size: 20px;
  color: var(--text-color);
}

.merchant-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.item-count {
  font-size: 13px;
  color: var(--text-light);
}

.cart-items {
  display: flex;
  flex-direction: column;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: #f5f5f5;
  cursor: pointer;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-name {
  font-size: 15px;
  color: var(--text-color);
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-name:hover {
  color: var(--primary-hover);
}

.product-price {
  font-size: 13px;
  color: var(--text-light);
}

.quantity-control {
  flex-shrink: 0;
}

.product-total {
  width: 110px;
  text-align: right;
  font-size: 15px;
  font-weight: 600;
  color: #f56c6c;
  flex-shrink: 0;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.group-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 14px 20px;
  background-color: #fffdf9;
  border-top: 1px solid #e4e7ed;
}

.group-total {
  font-size: 15px;
  color: var(--text-color);
}

.group-total .amount {
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}

.footer {
  background-color: var(--white);
  padding: 20px 0;
  border-top: 1px solid #e4e7ed;
  margin-top: 40px;
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  color: var(--text-light);
  font-size: 14px;
}

/* 商品详情弹窗 */
.detail-content {
  display: flex;
  gap: 24px;
}

.detail-image {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: #f5f5f5;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.detail-row .label {
  color: var(--text-light);
  min-width: 76px;
}

.detail-row .value {
  color: var(--text-color);
}

.detail-row .value.amount {
  color: #f56c6c;
  font-weight: 600;
}

/* 结算弹窗 */
.checkout-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.checkout-merchant {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: var(--text-color);
  font-weight: 500;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: -8px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 60px;
}

.address-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid #e4e7ed;
  border-radius: var(--border-radius);
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.address-item:hover {
  border-color: #409eff;
}

.address-item.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.address-icon {
  color: #409eff;
}

.address-empty {
  padding: 16px;
  text-align: center;
  font-size: 14px;
  color: var(--text-light);
  background-color: var(--bg-light);
  border-radius: var(--border-radius);
}

.address-empty a {
  color: #409eff;
  text-decoration: none;
}

.checkout-summary {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid #e4e7ed;
  font-size: 15px;
  color: var(--text-color);
}

.checkout-summary .amount {
  font-size: 22px;
  font-weight: 600;
  color: #f56c6c;
}

@media (max-width: 768px) {
  .nav-right {
    gap: 8px;
  }

  .nav-item {
    padding: 8px;
  }

  .nav-item span {
    display: none;
  }

  .main-content {
    padding: 20px 12px;
  }

  .cart-item {
    flex-wrap: wrap;
    gap: 12px;
  }

  .product-info {
    flex-basis: calc(100% - 88px);
  }

  .quantity-control {
    margin-left: 88px;
  }

  .product-total {
    width: auto;
    margin-left: auto;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .group-header,
  .group-footer {
    padding: 12px 14px;
  }

  .detail-content {
    flex-direction: column;
  }

  .detail-image {
    width: 100%;
    height: 200px;
  }
}
</style>
