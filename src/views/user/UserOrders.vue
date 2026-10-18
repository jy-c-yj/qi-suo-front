<template>
  <div class="orders-container">
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
          <div class="nav-item active">
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

    <main class="main-content">
      <div class="orders-wrapper">
        <el-card class="orders-card">
          <template #header>
            <div class="card-header">
              <span>我的订单</span>
              <div class="header-actions">
                <el-select
                  v-model="statusFilter"
                  placeholder="全部状态"
                  clearable
                  class="status-filter"
                  @change="loadOrdersList"
                >
                  <el-option label="全部状态" value="" />
                  <el-option
                    v-for="status in orderStatusOptions"
                    :key="status"
                    :label="status"
                    :value="status"
                  />
                </el-select>
                <el-button type="primary" @click="loadOrdersList" :loading="loading">
                  刷新
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>

          <div v-else-if="error" class="error-container">
            <el-icon class="error-icon"><Warning /></el-icon>
            <span>{{ error }}</span>
            <el-button @click="loadOrdersList">重试</el-button>
          </div>

          <div v-else-if="ordersList.length === 0" class="empty-container">
            <el-icon class="empty-icon"><Document /></el-icon>
            <span>暂无订单</span>
          </div>

          <div v-else class="orders-list">
            <div
              v-for="order in ordersList"
              :key="order.id"
              class="order-item"
              @click="showOrderDetail(order.id)"
            >
              <div class="order-header">
                <div class="order-no">
                  <span class="label">订单编号:</span>
                  <span class="value">{{ order.orderNo }}</span>
                </div>
                <el-tag :type="getOrderStatusType(order.status)" size="small">
                  {{ normalizeOrderStatus(order.status) }}
                </el-tag>
              </div>
              <div class="order-info">
                <div class="info-item">
                  <span class="label">商家:</span>
                  <span class="value">{{ order.merchantName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">订单金额:</span>
                  <span class="value amount">¥{{ order.totalAmount.toFixed(2) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">下单时间:</span>
                  <span class="value">{{ formatDate(order.createdAt) }}</span>
                </div>
              </div>
              <div class="order-actions">
                <el-button type="primary" size="small" @click.stop="showOrderDetail(order.id)">
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <p>© 2026 栖所家居 版权所有</p>
      </div>
    </footer>

    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="700px"
      class="order-detail-dialog"
    >
      <div v-if="detailLoading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <div v-else-if="orderDetail" class="order-detail">
        <div class="detail-header">
          <div class="order-no">
            <span class="label">订单编号:</span>
            <span class="value">{{ orderDetail.orderNo }}</span>
          </div>
          <el-tag :type="getOrderStatusType(orderDetail.status)">
            {{ normalizeOrderStatus(orderDetail.status) }}
          </el-tag>
        </div>

        <div class="detail-section">
          <div class="section-title">订单信息</div>
          <div class="info-row">
            <span class="label">商家:</span>
            <span class="value">{{ orderDetail.merchantName }}</span>
          </div>
          <div class="info-row">
            <span class="label">收货地址:</span>
            <span class="value">{{ orderDetail.detailAddress }}</span>
          </div>
          <div class="info-row">
            <span class="label">下单时间:</span>
            <span class="value">{{ formatDate(orderDetail.createdAt) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">商品列表</div>
          <div class="product-list">
            <div
              v-for="(item, index) in orderDetail.productList"
              :key="index"
              class="product-item"
            >
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
        </div>

        <div class="detail-total">
          <span class="label">订单总额:</span>
          <span class="amount">¥{{ orderDetail.totalAmount.toFixed(2) }}</span>
        </div>

        <div class="detail-actions">
          <el-button
            v-if="isUnpaid(orderDetail.status)"
            type="primary"
            @click="handlePayOrder"
            :loading="payLoading"
          >
            确认支付
          </el-button>
          <el-button
            v-if="orderDetail.status === '已发货'"
            type="success"
            @click="handleConfirmOrder"
            :loading="confirmLoading"
          >
            确认收货
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElTag, ElButton, ElIcon, ElCard, ElDialog, ElUpload, ElAvatar } from 'element-plus'
import { User, Document, ShoppingCart, Loading, Warning } from '@element-plus/icons-vue'
import { getOrdersList, getOrderDetail, payOrder, confirmOrder } from '@/api/user'
import { logoutAndClear } from '@/utils/logout'
import { getOrderStatusType, isUnpaid, normalizeOrderStatus } from '@/utils/orderStatus'
import type { UserOrdersDVO, UserOrdersDetailDVO } from '@/types'

const router = useRouter()

const username = ref(localStorage.getItem('username') || '用户')

const loading = ref(false)
const error = ref('')
const ordersList = ref<UserOrdersDVO[]>([])
const statusFilter = ref('')
const orderStatusOptions = ['未支付', '已支付', '已发货', '已完成', '已取消']

const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const orderDetail = ref<UserOrdersDetailDVO | null>(null)
const payLoading = ref(false)
const confirmLoading = ref(false)

const loadOrdersList = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getOrdersList(statusFilter.value || undefined)
    if (response.code === 1 && response.data) {
      ordersList.value = response.data
    } else {
      error.value = response.msg || '获取订单列表失败'
    }
  } catch (err: any) {
    console.error('获取订单列表失败:', err)
    error.value = err.message || '获取订单列表失败'
  } finally {
    loading.value = false
  }
}

const showOrderDetail = async (orderId: number) => {
  detailDialogVisible.value = true
  detailLoading.value = true
  try {
    const response = await getOrderDetail(orderId)
    if (response.code === 1 && response.data) {
      orderDetail.value = response.data
    } else {
      ElMessage.error(response.msg || '获取订单详情失败')
    }
  } catch (err: any) {
    console.error('获取订单详情失败:', err)
    ElMessage.error(err.message || '获取订单详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handlePayOrder = async () => {
  if (!orderDetail.value?.id) return

  payLoading.value = true
  try {
    const response = await payOrder(orderDetail.value.id)
    if (response.code === 1) {
      ElMessage.success('支付成功')
      detailDialogVisible.value = false
      loadOrdersList()
    } else {
      ElMessage.error(response.msg || '支付失败')
    }
  } catch (err: any) {
    console.error('支付失败:', err)
    ElMessage.error(err.message || '支付失败')
  } finally {
    payLoading.value = false
  }
}

const handleConfirmOrder = async () => {
  if (!orderDetail.value?.id) return

  confirmLoading.value = true
  try {
    const response = await confirmOrder(orderDetail.value.id)
    if (response.code === 1) {
      ElMessage.success('确认收货成功')
      detailDialogVisible.value = false
      loadOrdersList()
    } else {
      ElMessage.error(response.msg || '确认收货失败')
    }
  } catch (err: any) {
    console.error('确认收货失败:', err)
    ElMessage.error(err.message || '确认收货失败')
  } finally {
    confirmLoading.value = false
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
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

const goToHome = () => {
  router.push('/home')
}

const goToProfile = () => {
  router.push('/user/profile')
}

const goToCart = () => {
  router.push('/user/cart')
}

const handleLogout = async () => {
  await logoutAndClear('user')
}

onMounted(() => {
  loadOrdersList()
})
</script>

<style scoped>
.orders-container {
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
  color: var(--primary-color);
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
  color: var(--primary-color);
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

.nav-item:hover .nav-icon,
.nav-item.active .nav-icon {
  color: var(--text-color);
}

.nav-icon {
  font-size: 24px;
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.main-content {
  flex: 1;
  padding: 40px 20px;
}

.orders-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.orders-card {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-filter {
  width: 140px;
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

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s;
}

.order-item:hover {
  border-color: var(--primary-hover);
  box-shadow: var(--shadow);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
}

.order-no .label {
  color: var(--text-light);
  font-size: 14px;
  margin-right: 8px;
}

.order-no .value {
  color: var(--text-color);
  font-weight: 500;
}

.order-info {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-item .label {
  color: var(--text-light);
  font-size: 14px;
}

.info-item .value {
  color: var(--text-color);
  font-size: 14px;
}

.info-item .amount {
  color: #f56c6c;
  font-weight: 600;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
}

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

.order-detail-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-section {
  padding: 16px;
  background-color: var(--bg-light);
  border-radius: var(--border-radius);
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  gap: 8px;
  padding: 8px 0;
}

.info-row .label {
  color: var(--text-light);
  font-size: 14px;
  min-width: 80px;
}

.info-row .value {
  color: var(--text-color);
  font-size: 14px;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--white);
  border-radius: var(--border-radius);
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius);
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-size: 14px;
  color: var(--text-color);
}

.product-price {
  font-size: 12px;
  color: var(--text-light);
}

.product-total {
  font-size: 14px;
  font-weight: 500;
  color: #f56c6c;
}

.detail-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 2px solid var(--primary-color);
}

.detail-total .label {
  font-size: 16px;
  color: var(--text-color);
}

.detail-total .amount {
  font-size: 24px;
  font-weight: 600;
  color: #f56c6c;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
