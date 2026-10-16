<template>
  <div class="module-container">
    <div class="module-header">
      <h2 class="module-title">商品管理</h2>
      <p class="module-description">管理系统中的商品信息</p>
    </div>
    
    <div class="module-content">
      <!-- 查询条件 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="商品ID">
            <el-input v-model.number="searchForm.id" placeholder="请输入商品ID" clearable />
          </el-form-item>
          <el-form-item label="商家名称">
            <el-input v-model="searchForm.merchantName" placeholder="请输入商家名称" clearable />
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable />
          </el-form-item>
          <el-form-item label="商品SKU">
            <el-input v-model="searchForm.sku" placeholder="请输入商品SKU" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 已选择的查询条件 -->
        <div v-if="hasSearchConditions" class="selected-conditions">
          <span class="condition-label">已选条件：</span>
          <el-tag v-if="searchForm.id" closable @close="handleRemoveCondition('id')" type="info">
            商品ID：{{ searchForm.id }}
          </el-tag>
          <el-tag v-if="searchForm.merchantName" closable @close="handleRemoveCondition('merchantName')" type="info">
            商家名称：{{ searchForm.merchantName }}
          </el-tag>
          <el-tag v-if="searchForm.productName" closable @close="handleRemoveCondition('productName')" type="info">
            商品名称：{{ searchForm.productName }}
          </el-tag>
          <el-tag v-if="searchForm.sku" closable @close="handleRemoveCondition('sku')" type="info">
            商品SKU：{{ searchForm.sku }}
          </el-tag>
        </div>
      </div>
      
      <!-- 商品列表 -->
      <div class="product-list-section">
        <el-table v-loading="loading" :data="productList" style="width: 100%">
          <el-table-column prop="id" label="商品ID" width="80" />
          <el-table-column prop="merchantName" label="商家名称" width="150" />
          <el-table-column prop="productName" label="商品名称" min-width="200" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="originalPrice" label="原价" width="100">
            <template #default="scope">
              ¥{{ scope.row.originalPrice.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="80" />
          <el-table-column prop="sku" label="SKU" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="salesCount" label="销量" width="80" />
          <el-table-column prop="viewCount" label="浏览量" width="100" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column prop="updatedAt" label="更新时间" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleViewDetail(scope.row.id)">
                详情
              </el-button>
              <el-button v-if="scope.row.status === 1" type="warning" size="small" @click="handleDisableProduct(scope.row.id)">
                禁用
              </el-button>
              <el-button v-else type="success" size="small" @click="handleEnableProduct(scope.row.id)">
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
    
    <!-- 商品详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="'商品详情 - ' + (productDetail?.productName || '')"
      width="800px"
      destroy-on-close
    >
      <div v-loading="detailLoading" class="product-detail-content">
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="商品ID">{{ productDetail?.id }}</el-descriptions-item>
            <el-descriptions-item label="商家ID">{{ productDetail?.merchantId }}</el-descriptions-item>
            <el-descriptions-item label="商家名称">{{ productDetail?.merchantName }}</el-descriptions-item>
            <el-descriptions-item label="商品名称">{{ productDetail?.productName }}</el-descriptions-item>
            <el-descriptions-item label="价格">¥{{ productDetail?.price?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="原价">¥{{ productDetail?.originalPrice?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="库存">{{ productDetail?.stock }}</el-descriptions-item>
            <el-descriptions-item label="SKU">{{ productDetail?.sku }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="productDetail?.status === 1 ? 'success' : 'info'">
                {{ productDetail?.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="是否热门">
              <el-tag :type="productDetail?.isHot ? 'danger' : 'info'">
                {{ productDetail?.isHot ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="是否新品">
              <el-tag :type="productDetail?.isNew ? 'warning' : 'info'">
                {{ productDetail?.isNew ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="评分">{{ productDetail?.rating?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="销量">{{ productDetail?.salesCount }}</el-descriptions-item>
            <el-descriptions-item label="浏览量">{{ productDetail?.viewCount }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ productDetail?.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ productDetail?.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="detail-section">
          <h3>商品描述</h3>
          <div class="description-content">
            {{ productDetail?.description || '无' }}
          </div>
        </div>
        
        <div class="detail-section">
          <h3>分类</h3>
          <div class="category-tags">
            <el-tag v-for="(category, index) in productDetail?.categoryNames" :key="index" type="primary" style="margin-right: 8px; margin-bottom: 8px">
              {{ category }}
            </el-tag>
            <div v-if="!productDetail?.categoryNames || productDetail.categoryNames.length === 0" class="no-data">
              无分类信息
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>属性</h3>
          <el-table :data="productDetail?.attributeAndValues" style="width: 100%">
            <el-table-column prop="attributeName" label="属性名称" width="150" />
            <el-table-column prop="attributeValue" label="属性值" />
          </el-table>
          <div v-if="!productDetail?.attributeAndValues || productDetail.attributeAndValues.length === 0" class="no-data">
            无属性信息
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProduct, getProductDetail, setAdminProductStatus } from '@/api/user'
import type { AdminGetProductByConditionDTO, AdminGetProductDVO, AdminGetProductDetailDVO } from '@/types'

// 加载状态
const loading = ref(false)
const detailLoading = ref(false)

// 商品列表数据
const productList = ref<AdminGetProductDVO[]>([])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 查询表单
const searchForm = ref<AdminGetProductByConditionDTO>({
  id: undefined,
  merchantName: '',
  productName: '',
  sku: '',
  pageNum: 1,
  pageSize: 10
})

// 商品详情
const detailDialogVisible = ref(false)
const productDetail = ref<AdminGetProductDetailDVO | null>(null)

// 判断是否有查询条件
const hasSearchConditions = computed(() => {
  return searchForm.value.id !== undefined || 
         searchForm.value.merchantName !== '' || 
         searchForm.value.productName !== '' || 
         searchForm.value.sku !== ''
})

// 启用商品
const handleEnableProduct = async (id: number) => {
  try {
    const response = await setAdminProductStatus(id, currentPage.value)
    if (response.code === 1 || response.code === 200) {
      ElMessage.success(response.data || '启用商品成功')
      loadProductList()
    } else {
      ElMessage.error(response.data || response.msg || '启用商品失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '启用商品失败')
  }
}

// 禁用商品
const handleDisableProduct = async (id: number) => {
  try {
    const response = await setAdminProductStatus(id, currentPage.value)
    if (response.code === 1 || response.code === 200) {
      ElMessage.success(response.data || '禁用商品成功')
      loadProductList()
    } else {
      ElMessage.error(response.data || response.msg || '禁用商品失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '禁用商品失败')
  }
}

// 加载商品列表
const loadProductList = async () => {
  loading.value = true
  try {
    const response = await getProduct({
      ...searchForm.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    if ((response.code === 1 || response.code === 200) && response.data) {
      if (response.data.rows) {
        productList.value = response.data.rows
      } else if (response.data.records) {
        productList.value = response.data.records
      } else if (response.data.rows) {
        productList.value = response.data.rows
      } else {
        productList.value = []
      }
      total.value = response.data.total || 0
    } else {
      productList.value = []
      total.value = 0
      ElMessage.error(response.msg || '获取商品列表失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品列表失败')
    productList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 查询商品
const handleSearch = () => {
  currentPage.value = 1
  loadProductList()
}

// 重置查询条件
const handleReset = () => {
  searchForm.value = {
    id: undefined,
    merchantName: '',
    productName: '',
    sku: '',
    pageNum: 1,
    pageSize: 10
  }
  currentPage.value = 1
  loadProductList()
}

// 移除单个查询条件
const handleRemoveCondition = (field: string) => {
  if (field === 'id') {
    searchForm.value.id = undefined
  } else if (field === 'merchantName') {
    searchForm.value.merchantName = ''
  } else if (field === 'productName') {
    searchForm.value.productName = ''
  } else if (field === 'sku') {
    searchForm.value.sku = ''
  }
  handleSearch()
}

// 查看商品详情
const handleViewDetail = async (id: number) => {
  detailDialogVisible.value = true
  detailLoading.value = true
  try {
    const response = await getProductDetail(id)
    if (response.code === 1 && response.data) {
      productDetail.value = response.data
    } else {
      ElMessage.error(response.msg || '获取商品详情失败')
      detailDialogVisible.value = false
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品详情失败')
    detailDialogVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadProductList()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadProductList()
}

// 组件挂载时加载商品列表
onMounted(() => {
  loadProductList()
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

.product-list-section {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 商品详情弹窗样式 */
.product-detail-content {
  max-height: 600px;
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

.description-content {
  padding: 12px;
  background-color: #F9FAFB;
  border-radius: 4px;
  line-height: 1.5;
}

.category-tags {
  margin-top: 8px;
}

.no-data {
  padding: 12px;
  color: #909399;
  background-color: #F9FAFB;
  border-radius: 4px;
  text-align: center;
  margin-top: 8px;
}
</style>