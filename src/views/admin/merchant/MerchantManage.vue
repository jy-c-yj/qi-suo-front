<template>
  <div class="module-container">
    <div class="module-header">
      <h2 class="module-title">商家管理</h2>
      <p class="module-description">管理系统中的商家信息</p>
    </div>
    
    <div class="module-content">
      <!-- 查询条件 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="商家名称">
            <el-input v-model="searchForm.merchantName" placeholder="请输入商家名称" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 140px">
              <el-option label="待审核" :value="0" />
              <el-option label="正常" :value="1" />
              <el-option label="关闭" :value="2" />
              <el-option label="禁用" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 已选择的查询条件 -->
        <div v-if="hasSearchConditions" class="selected-conditions">
          <span class="condition-label">已选条件：</span>
          <el-tag v-if="searchForm.merchantName" closable @close="handleRemoveCondition('merchantName')" type="info">
            商家名称：{{ searchForm.merchantName }}
          </el-tag>
          <el-tag v-if="searchForm.status !== undefined && searchForm.status !== null" closable @close="handleRemoveCondition('status')" type="info">
            状态：{{ getStatusText(searchForm.status) }}
          </el-tag>
        </div>
      </div>
      
      <!-- 商家列表 -->
      <div class="merchant-list-section">
        <el-table v-loading="loading" :data="merchantList" style="width: 100%" border>
          <el-table-column prop="shopLogoUrl" label="店铺Logo" width="100">
            <template #default="scope">
              <el-image 
                v-if="scope.row.shopLogoUrl" 
                :src="scope.row.shopLogoUrl" 
                fit="cover" 
                style="width: 50px; height: 50px; border-radius: 4px"
              />
              <div v-else class="no-logo-small">
                无
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="merchantName" label="商家名称" min-width="200" sortable />
          <el-table-column prop="shopName" label="店铺名称" min-width="180" />
          <el-table-column prop="contactName" label="联系人" width="120" />
          <el-table-column prop="contactPhone" label="联系电话" width="150" />
          <el-table-column prop="contactEmail" label="联系邮箱" min-width="200" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" sortable />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button 
                v-if="scope.row.status === 1" 
                type="warning" 
                size="small" 
                @click.stop="handleDisableMerchant(scope.row.merchantId)"
              >
                禁用
              </el-button>
              <el-button 
                v-else 
                type="success" 
                size="small" 
                @click.stop="handleEnableMerchant(scope.row.merchantId)"
              >
                启用
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMerchantList, setMerchantEnabled, setMerchantNotEnabled } from '@/api/user'
import type { AdminGetMerchantByConditionDTO, AdminGetMerchantDVO } from '@/types'

// 加载状态
const loading = ref(false)

// 商家列表数据
const merchantList = ref<AdminGetMerchantDVO[]>([])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 查询表单
const searchForm = ref<AdminGetMerchantByConditionDTO>({
  merchantName: '',
  status: undefined,
  pageNum: 1,
  pageSize: 10
})

// 判断是否有查询条件
const hasSearchConditions = computed(() => {
  return searchForm.value.merchantName !== '' ||
         (searchForm.value.status !== undefined && searchForm.value.status !== null)
})

// 获取状态类型
const getStatusType = (status: number): string => {
  switch (status) {
    case 1:
      return 'success'
    case 0:
      return 'info'
    case 2:
      return 'warning'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return '待审核'
    case 1:
      return '正常'
    case 2:
      return '关闭'
    case 3:
      return '禁用'
    default:
      return '未知'
  }
}

// 加载商家列表
const loadMerchantList = async () => {
  loading.value = true
  try {
    const response = await getMerchantList({
      ...searchForm.value,
      merchantName: searchForm.value.merchantName || undefined,
      status: searchForm.value.status ?? undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    if ((response.code === 1 || response.code === 200) && response.data) {
      if (response.data.rows) {
        merchantList.value = response.data.rows
      } else if (response.data.records) {
        merchantList.value = response.data.records
      } else if (response.data.rows) {
        merchantList.value = response.data.rows
      } else {
        merchantList.value = []
      }
      total.value = response.data.total || 0
    } else {
      merchantList.value = []
      total.value = 0
      ElMessage.error(response.msg || '获取商家列表失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取商家列表失败')
    merchantList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 查询商家
const handleSearch = () => {
  currentPage.value = 1
  loadMerchantList()
}

// 重置查询条件
const handleReset = () => {
  searchForm.value = {
    merchantName: '',
    status: undefined,
    pageNum: 1,
    pageSize: 10
  }
  currentPage.value = 1
  loadMerchantList()
}

// 移除单个查询条件
const handleRemoveCondition = (field: string) => {
  if (field === 'merchantName') {
    searchForm.value.merchantName = ''
  } else if (field === 'status') {
    searchForm.value.status = undefined
  }
  handleSearch()
}

// 启用商家
const handleEnableMerchant = async (id: number) => {
  try {
    const response = await setMerchantEnabled(id, currentPage.value)
    if (response.code === 1 || response.code === 200) {
      ElMessage.success(response.data || '启用商家成功')
      loadMerchantList()
    } else {
      ElMessage.error( response.msg || '启用商家失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '启用商家失败')
  }
}

// 禁用商家
const handleDisableMerchant = async (id: number) => {
  try {
    const response = await setMerchantNotEnabled(id, currentPage.value)
    if (response.code === 1 || response.code === 200) {
      ElMessage.success(response.data || '禁用商家成功')
      loadMerchantList()
    } else {
      ElMessage.error(response.msg || '禁用商家失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '禁用商家失败')
  }
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadMerchantList()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadMerchantList()
}

// 组件挂载时加载商家列表
onMounted(() => {
  loadMerchantList()
})
</script>

<style scoped>
.module-container {
  padding: 20px;
}

.module-header {
  margin-bottom: 20px;
}

.module-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.module-description {
  color: #666;
  margin: 0;
}

.module-content {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.selected-conditions {
  margin-top: 15px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.condition-label {
  font-weight: bold;
  color: #333;
  margin-right: 5px;
}

.merchant-list-section {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.no-logo-small {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  color: #999;
  font-size: 12px;
}

/* 商家详情弹窗样式 */
.merchant-detail-content {
  max-height: 500px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #E4E7ED;
}

.license-container {
  margin-top: 8px;
  display: flex;
  align-items: center;
}

.no-license {
  padding: 20px;
  background-color: #F9FAFB;
  border-radius: 4px;
  color: #909399;
  border: 1px solid #E4E7ED;
}
</style>