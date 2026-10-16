<template>
  <div class="merchant-dashboard">
    <!-- 欢迎信息 -->
    <div class="welcome-section">
      <h1>欢迎回来，{{ merchantName }}</h1>
      <p>这里是您的商家仪表盘，展示您的店铺概览</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
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
                <div class="stat-value">¥{{ totalSales }}</div>
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
        <el-table :data="recentOrders" style="width: 100%">
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
import { getMerchantOrdersList } from '@/api/user'

// 商家信息
const merchantName = ref(localStorage.getItem('merchantName') || '商家')

// 统计数据
const productCount = ref(128)
const orderCount = ref(56)
const totalSales = ref(12800)



// 最近订单数据
interface OrderItem {
  orderId: string
  customerName: string
  amount: number
  status: string
  createdAt: string
}

const recentOrders = ref<OrderItem[]>([])
const ordersLoading = ref(false)

// 获取订单状态类型
const getOrderStatusType = (status: string): string => {
  switch (status) {
    case '待处理':
      return 'info'
    case '处理中':
      return 'warning'
    case '已发货':
    case '已完成':
      return 'success'
    case '已取消':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取订单状态文本
const getOrderStatusText = (status: string): string => {
  return status || '未知'
}

// 组件挂载时初始化数据
onMounted(() => {
  // 从后端获取最近订单数据
  fetchRecentOrders()
})

// 获取最近订单数据
const fetchRecentOrders = async () => {
  try {
    ordersLoading.value = true
    const response = await getMerchantOrdersList(1, 5)
    if (response.rows && response.rows.length > 0) {
      // 转换数据格式以匹配表格结构
      recentOrders.value = response.rows.map((order: any) => ({
        orderId: order.orderNo,
        customerName: '客户', // 后端数据中没有客户名称，暂时使用默认值
        amount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }))
    } else {
      recentOrders.value = []
    }
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