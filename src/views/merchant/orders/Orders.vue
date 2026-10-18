<template>
  <div class="merchant-orders">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>订单管理</h2>
      <div class="header-actions">
        <el-select
          v-model="statusFilter"
          placeholder="订单状态"
          clearable
          class="status-filter"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="未支付" value="未支付" />
          <el-option label="已支付" value="已支付" />
          <el-option label="已发货" value="已发货" />
          <el-option label="已完成" value="已完成" />
          <el-option label="已取消" value="已取消" />
        </el-select>
        <el-select v-model="sortOrder" class="sort-select" @change="handleFilterChange">
          <el-option label="最新优先" value="desc" />
          <el-option label="最早优先" value="asc" />
        </el-select>
        <el-button type="primary" @click="loadOrdersList" :loading="loading">
          <el-icon><Search /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <el-card class="list-card">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container">
          <el-icon class="error-icon"><Warning /></el-icon>
          <span>{{ error }}</span>
          <el-button @click="loadOrdersList">重试</el-button>
        </div>

        <!-- 订单列表 -->
        <div v-else class="order-table-wrapper">
          <el-table
            :data="ordersList"
            style="width: 100%"
            stripe
            :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
          >
            <el-table-column prop="orderNo" label="订单编号" min-width="280" show-overflow-tooltip />
            <el-table-column prop="totalAmount" label="总价" width="140" align="right">
              <template #default="scope">
                <span class="price-text">¥{{ scope.row.totalAmount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120" align="center">
              <template #default="scope">
                <el-tag :type="getOrderStatusType(scope.row.status)" size="small">
                  {{ normalizeOrderStatus(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="scope">
                <span class="date-text">{{ formatDate(scope.row.createdAt) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right" align="center">
              <template #default="scope">
                <el-button type="primary" size="small" link @click="showOrderDetail(scope.row.id)">
                  查看详情
                </el-button>
                <el-button
                  v-if="scope.row.status === '已支付'"
                  type="success"
                  size="small"
                  link
                  @click="handleSetStatus(scope.row.id)"
                  :loading="statusLoading"
                >
                  确认发货
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[5, 10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="700px"
      class="order-detail-dialog"
    >
      <!-- 加载状态 -->
      <div v-if="detailLoading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 订单详情内容 -->
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
            v-if="orderDetail?.status === '已支付' && orderDetail.id"
            type="success"
            @click="handleSetStatus(orderDetail.id)"
            :loading="statusLoading"
          >
            确认发货
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElTag, ElButton, ElIcon, ElCard, ElDialog, ElTable, ElTableColumn, ElPagination, ElSelect, ElOption } from 'element-plus'
import { Loading, Warning, Document, Search } from '@element-plus/icons-vue'
import { getMerchantOrdersList, getMerchantOrderDetail, setMerchantOrdersStatus } from '@/api/user'
import { getOrderStatusType, normalizeOrderStatus } from '@/utils/orderStatus'
import type { MerchantOrdersDVO, UserOrdersDetailDVO } from '@/types'

// 分页参数
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 订单列表
const loading = ref(false)
const error = ref('')
const ordersList = ref<MerchantOrdersDVO[]>([])
const statusFilter = ref('')
const sortOrder = ref<'asc' | 'desc'>('desc')

// 订单详情
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const orderDetail = ref<UserOrdersDetailDVO | null>(null)
const statusLoading = ref(false)

// 状态 / 排序交给后端处理，否则只会过滤当前这一页，切换到没有匹配订单的页就会显示空
const handleFilterChange = () => {
  currentPage.value = 1
  loadOrdersList()
}

// 加载订单列表
const loadOrdersList = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getMerchantOrdersList(
      currentPage.value,
      pageSize.value,
      statusFilter.value || undefined,
      sortOrder.value
    )
    if (response) {
      ordersList.value = response.rows || []
      total.value = response.total || 0
    }
  } catch (err: any) {
    console.error('获取订单列表失败:', err)
    error.value = err.message || '获取订单列表失败'
  } finally {
    loading.value = false
  }
}

// 查看订单详情
const showOrderDetail = async (orderId: number) => {
  detailDialogVisible.value = true
  detailLoading.value = true
  try {
    const response = await getMerchantOrderDetail(orderId)
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

// 设置订单状态（确认发货）
const handleSetStatus = async (orderId: number) => {
  statusLoading.value = true
  try {
    const response = await setMerchantOrdersStatus(orderId)
    if (response.code === 1) {
      ElMessage.success('确认发货成功')
      detailDialogVisible.value = false
      loadOrdersList()
    } else {
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (err: any) {
    console.error('操作失败:', err)
    ElMessage.error(err.message || '操作失败')
  } finally {
    statusLoading.value = false
  }
}

// 格式化日期
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

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadOrdersList()
}

// 页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadOrdersList()
}

onMounted(() => {
  loadOrdersList()
})
</script>

<style scoped>
.merchant-orders {
  padding: 24px;
  background-color: var(--bg-light);
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.status-filter,
.sort-select {
  width: 150px;
}

.price-text {
  font-weight: 600;
  color: #D32F2F;
}

.date-text {
  color: var(--text-light);
}

.list-card {
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  background-color: var(--white);
}

.list-card :deep(.el-card__body) {
  padding: 0;
}

.list-card :deep(.el-scrollbar__view) {
  padding: 0;
}

.list-card :deep(.el-table) {
  border-radius: var(--border-radius);
}

.order-table-wrapper {
  padding: 20px;
}

.order-table-wrapper :deep(.el-table) {
  margin: 0 -20px;
  width: calc(100% + 2 * 20px);
}

.order-table-wrapper :deep(.el-table th:first-child .cell),
.order-table-wrapper :deep(.el-table td:first-child .cell) {
  padding-left: 0;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 12px;
  color: var(--text-light);
}

.loading-icon,
.error-icon {
  font-size: 48px;
}

.error-icon {
  color: #f56c6c;
}

.pagination {
  display: flex;
  justify-content: center;
  margin: 24px -20px 0 -20px;
  padding: 24px 20px 0 20px;
  border-top: 1px solid var(--primary-hover);
}

.order-detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--primary-hover);
}

.order-no {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-no .label {
  font-size: 14px;
  color: var(--text-light);
}

.order-no .value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
}

.info-row .label {
  width: 100px;
  font-size: 14px;
  color: var(--text-light);
}

.info-row .value {
  flex: 1;
  font-size: 14px;
  color: var(--text-color);
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: var(--bg-light);
  border-radius: var(--border-radius);
}

.product-image {
  width: 80px;
  height: 80px;
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
  gap: 8px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.product-price {
  font-size: 14px;
  color: var(--text-light);
}

.product-total {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.detail-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--primary-hover);
  margin-top: 24px;
}

.detail-total .label {
  font-size: 16px;
  color: var(--text-light);
}

.detail-total .amount {
  font-size: 24px;
  font-weight: 700;
  color: #D32F2F;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
