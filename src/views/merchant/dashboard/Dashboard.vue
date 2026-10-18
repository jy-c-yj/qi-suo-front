<template>
  <div class="merchant-dashboard">
    <!-- 欢迎信息 -->
    <div class="welcome-section">
      <h1>欢迎回来，{{ merchantName }}</h1>
      <p>这里是您的商家仪表盘，展示您的店铺概览</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section" v-loading="statsLoading">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon blue">
                <Goods />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ productCount }}</div>
                <div class="stat-label">商品数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon green">
                <Ticket />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ orderCount }}</div>
                <div class="stat-label">订单数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon orange">
                <Money />
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ totalSales.toFixed(2) }}</div>
                <div class="stat-label">总销售额</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近订单 -->
    <div class="recent-orders-section">
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <h3>最近订单</h3>

          </div>
        </template>
        <el-table :data="recentOrders" style="width: 100%" v-loading="ordersLoading">
          <el-table-column prop="orderId" label="订单ID"  />
          <!-- <el-table-column prop="customerName" label="客户名称" /> -->
          <el-table-column prop="amount" label="订单金额" width="120">
            <template #default="scope">
              ¥{{ scope.row.amount }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" width="120">
            <template #default="scope">
              <el-tag :type="getOrderStatusType(scope.row.status)">
                {{ getOrderStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <!-- <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="primary" size="small">查看</el-button>
            </template>
          </el-table-column> -->
        </el-table>
      </el-card>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Goods, Ticket, Money } from '@element-plus/icons-vue'
import { getMerchantOrdersList, getMerchantProductList } from '@/api/user'
import { getOrderStatusType, normalizeOrderStatus } from '@/utils/orderStatus'

// 商家信息
const merchantName = ref(localStorage.getItem('merchantName') || '商家')

// 统计数据（全部来自后端，不再使用固定演示数字）
const productCount = ref(0)
const orderCount = ref(0)
const totalSales = ref(0)
const statsLoading = ref(false)

// 最近订单数据
interface OrderItem {
  orderId: string
  amount: number
  status: string
  createdAt: string
}

const recentOrders = ref<OrderItem[]>([])
const ordersLoading = ref(false)

// 计入销售额的状态：未支付、已取消不算
const SALES_STATUSES = new Set(['已支付', '已发货', '已完成'])

// 获取订单状态文本
const getOrderStatusText = (status: string): string => {
  return normalizeOrderStatus(status) || '未知'
}

// 组件挂载时初始化数据
onMounted(() => {
  loadDashboard()
})

const loadDashboard = async () => {
  statsLoading.value = true
  try {
    await Promise.all([fetchProductCount(), fetchOrderStats(), fetchRecentOrders()])
  } finally {
    statsLoading.value = false
  }
}

// 商品数量：复用商家商品分页接口，只取 total
const fetchProductCount = async () => {
  try {
    const response = await getMerchantProductList({ pageNum: 1, pageSize: 1 })
    if (response.code === 1 && response.data) {
      productCount.value = Number(response.data.total) || 0
    } else {
      productCount.value = 0
    }
  } catch (error: any) {
    console.error('获取商品数量失败:', error)
    productCount.value = 0
  }
}

// 订单数量与总销售额：分页拉取全部订单后统计，避免只统计第一页
const fetchOrderStats = async () => {
  try {
    const pageSize = 100
    let pageNum = 1
    let total = 0
    let sales = 0

    while (true) {
      const page = await getMerchantOrdersList(pageNum, pageSize, undefined, 'desc')
      total = Number(page.total) || 0
      const rows = page.rows || []
      for (const order of rows) {
        if (SALES_STATUSES.has(normalizeOrderStatus(order.status))) {
          sales += Number(order.totalAmount) || 0
        }
      }
      if (rows.length === 0 || pageNum * pageSize >= total) break
      pageNum++
    }

    orderCount.value = total
    totalSales.value = Math.round(sales * 100) / 100
  } catch (error: any) {
    console.error('获取订单统计失败:', error)
    orderCount.value = 0
    totalSales.value = 0
  }
}

// 获取最近订单数据（后端按创建时间倒序，取最新 5 条）
const fetchRecentOrders = async () => {
  try {
    ordersLoading.value = true
    const response = await getMerchantOrdersList(1, 5, undefined, 'desc')
    const rows = response.rows || []
    recentOrders.value = rows.map((order) => ({
      orderId: order.orderNo,
      amount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    }))
  } catch (error: any) {
    console.error('获取最近订单失败:', error)
    recentOrders.value = []
  } finally {
    ordersLoading.value = false
  }
}
</script>

<style scoped>
.merchant-dashboard {
  width: 100%;
}

/* 欢迎信息 */
.welcome-section {
  margin-bottom: 30px;
}

.welcome-section h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
}

.welcome-section p {
  margin: 0;
  font-size: 14px;
  color: #718096;
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
}

.stat-icon.blue {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-icon.green {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-icon.orange {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

/* 最近订单 */
.recent-orders-section {
  margin-bottom: 30px;
}

/* 通用卡片样式 */
.section-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .el-col {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .welcome-section h1 {
    font-size: 20px;
  }

  .stat-content {
    padding: 15px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 20px;
  }

  .chart-container {
    height: 200px;
  }
}
</style>