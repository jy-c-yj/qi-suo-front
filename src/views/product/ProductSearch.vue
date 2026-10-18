<template>
  <div class="product-search-container">
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

    <!-- 搜索内容 -->
    <main class="search-content">
      <!-- 搜索条件区域 -->
      <section class="search-filters">
        <div class="filter-section">
          <!-- 商品名搜索 -->
          <div class="filter-item">
            <label class="filter-label">商品名称</label>
            <el-input
              v-model="searchForm.productName"
              placeholder="请输入商品名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </div>

          <!-- 商家名搜索 -->
          <div class="filter-item">
            <label class="filter-label">商家名称</label>
            <el-input
              v-model="searchForm.merchantName"
              placeholder="请输入商家名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </div>

          <!-- 分类选择 -->
          <div class="filter-item category-item">
            <label class="filter-label">商品分类</label>
            <el-select
              v-model="searchForm.categoryId"
              placeholder="请选择分类"
              clearable
              filterable
              @change="handleCategoryChange"
            >
              <div
                class="category-dropdown"
                v-infinite-scroll="loadMoreCategories"
                :infinite-scroll-disabled="categoryLoading || noMoreCategories"
                :infinite-scroll-distance="100"
                :infinite-scroll-immediate="false"
              >
                <el-option label="全部" :value="null" />
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
                <div v-if="categoryLoading" class="category-loading">
                  <el-icon class="loading-icon"><Loading /></el-icon>
                  <span>加载中...</span>
                </div>
              </div>
            </el-select>
          </div>

          <!-- 筛选选项 -->
          <div class="filter-item filters-item">
            <label class="filter-label">筛选条件</label>
            <div class="filter-checkboxes">
              <el-checkbox v-model="filterConditions.isHot">是否热门</el-checkbox>
              <el-checkbox v-model="filterConditions.isNew">是否新品</el-checkbox>
            </div>
          </div>

          <!-- 排序选项 -->
          <div class="filter-item sort-item">
            <label class="filter-label">排序方式</label>
            <div class="sort-checkboxes">
              <el-checkbox v-model="sortConditions.salesCountSort">按销量排序</el-checkbox>
              <el-checkbox v-model="sortConditions.priceSort">按价格排序</el-checkbox>
              <el-checkbox v-model="sortConditions.viewCountSort">按浏览量排序</el-checkbox>
            </div>
          </div>

          <!-- 搜索按钮 -->
          <div class="filter-item button-item">
            <el-button type="primary" @click="handleSearch" :loading="loading">
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </section>

      <!-- 搜索结果标题 -->
      <div class="search-header">
        <h2 class="search-title">
          {{ searchForm.productName || searchForm.merchantName || searchForm.categoryId || filterConditions.isHot || filterConditions.isNew || sortConditions.salesCountSort || sortConditions.priceSort || sortConditions.viewCountSort ? '搜索结果' : '全部商品' }}
        </h2>
        <p class="search-count" v-if="total > 0">共找到 {{ total }} 件商品</p>
      </div>

      <!-- 商品列表 -->
      <div class="products-container">
        <div class="products-grid">
          <div
            v-for="product in products"
            :key="product.id"
            class="product-card"
            @click="handleProductClick(product.id)"
          >
            <!-- 商品图片 -->
            <div class="product-image-wrapper">
              <img
                :src="product.productImageUrl || defaultImage"
                :alt="product.productName"
                class="product-image"
              />
              <!-- 标签 -->
              <div class="product-badges">
                <span v-if="product.isHot" class="badge hot">热卖</span>
                <span v-if="product.isNew" class="badge new">新品</span>
              </div>
            </div>

            <!-- 商品信息 -->
            <div class="product-info">
              <h3 class="product-name">{{ product.productName }}</h3>
              <p class="product-merchant">{{ product.merchantName }}</p>
              <div class="product-price-rating">
                <span class="product-price">¥{{ product.price.toFixed(2) }}</span>
                <div class="product-rating" v-if="product.rating && product.rating > 0">
                  <el-icon class="rating-icon"><StarFilled /></el-icon>
                  <span>{{ product.rating.toFixed(1) }}</span>
                </div>
              </div>
              <div class="product-stats">
                <span class="sales-count">销量 {{ product.salesCount }}</span>
                <span class="stock-count">库存 {{ product.stock || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-more">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 没有更多数据 -->
        <div v-if="noMoreProducts && products.length > 0" class="no-more">
          <span>没有更多商品了</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && products.length === 0 && !error" class="empty-state">
        <el-icon class="empty-icon"><Search /></el-icon>
        <p>未找到相关商品</p>
        <el-button type="primary" @click="goToHome">返回首页</el-button>
      </div>

      <!-- 错误状态 -->
      <div v-if="error" class="error-state">
        <el-icon class="error-icon"><Warning /></el-icon>
        <p>{{ error }}</p>
        <el-button type="primary" @click="handleSearch">重新加载</el-button>
      </div>
    </main>

    <!-- 底部信息 -->
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 栖所 - 您的理想家居选择</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  Document,
  Loading,
  StarFilled,
  Search,
  Warning,
  ShoppingCart
} from '@element-plus/icons-vue'
import { queryProductByCondition, getCategory } from '@/api/user'
import { logoutAndClear } from '@/utils/logout'
import type { QueryProductDVO, QueryProductByConditionDTO, GetCategoryDVO } from '@/types'

const route = useRoute()
const router = useRouter()

// 用户名
const username = ref(localStorage.getItem('username') || '用户')

// 默认图片
const defaultImage = 'https://via.placeholder.com/280x280?text=暂无图片'

// 基础搜索表单（不包含勾选条件）
const searchForm = ref({
  productName: '',
  categoryId: null as number | null,
  merchantName: '',
  pageNum: 1,
  pageSize: 999 // 一次性查询所有数据
})

// 筛选条件（勾选框）
const filterConditions = ref({
  isHot: false,
  isNew: false
})

// 排序条件（勾选框）
const sortConditions = ref({
  salesCountSort: false,
  priceSort: false,
  viewCountSort: false
})

// 商品列表
const allProducts = ref<QueryProductDVO[]>([]) // 所有查询到的商品
const displayCount = ref(8) // 当前显示的商品数量
const loading = ref(false)
const error = ref('')
const total = ref(0)

// 当前显示的商品列表
const products = computed(() => {
  return allProducts.value.slice(0, displayCount.value)
})

// 分类列表
const categories = ref<GetCategoryDVO[]>([])
const categoryLoading = ref(false)
const categoryPageNum = ref(1)
const categoryPageSize = 10
const categoryTotal = ref(0)

// 是否没有更多数据
const noMoreProducts = computed(() => {
  return displayCount.value >= allProducts.value.length
})

const noMoreCategories = computed(() => {
  return categories.value.length >= categoryTotal.value && categoryTotal.value > 0
})

// 加载分类列表
const loadCategories = async (isLoadMore = false) => {
  if (!isLoadMore) {
    categoryPageNum.value = 1
    categories.value = []
  }

  categoryLoading.value = true
  try {
    const response = await getCategory(categoryPageNum.value, categoryPageSize)
    if (response.code === 1 && response.data) {
      const rows = response.data.rows || []
      if (isLoadMore) {
        categories.value.push(...rows)
      } else {
        categories.value = rows
      }
      categoryTotal.value = response.data.total
      categoryPageNum.value++
    }
  } catch (err: any) {
    console.error('加载分类失败:', err)
    ElMessage.error('加载分类失败')
  } finally {
    categoryLoading.value = false
  }
}

// 加载更多分类
const loadMoreCategories = () => {
  if (categoryLoading.value || noMoreCategories.value) return
  loadCategories(true)
}

// 分类变化处理
const handleCategoryChange = () => {
  // 分类变化时自动触发搜索
  handleSearch()
}

// 构建查询DTO
const buildQueryDTO = (): QueryProductByConditionDTO => {
  return {
    productName: searchForm.value.productName,
    categoryId: searchForm.value.categoryId,
    merchantName: searchForm.value.merchantName,
    isHot: filterConditions.value.isHot ? true : null,
    isNew: filterConditions.value.isNew ? true : null,
    salesCountSort: sortConditions.value.salesCountSort ? true : null,
    priceSort: sortConditions.value.priceSort ? true : null,
    viewCountSort: sortConditions.value.viewCountSort ? true : null,
    pageNum: searchForm.value.pageNum,
    pageSize: searchForm.value.pageSize
  }
}

// 搜索商品
const searchProducts = async () => {
  searchForm.value.pageNum = 1
  allProducts.value = []
  displayCount.value = 8

  loading.value = true
  error.value = ''

  try {
    const queryDTO = buildQueryDTO()
    const response = await queryProductByCondition(queryDTO)
    if (response.code === 1 && response.data) {
      allProducts.value = response.data.rows || []
      total.value = response.data.total
    } else {
      error.value = response.msg || '搜索商品失败'
    }
  } catch (err: any) {
    console.error('搜索商品失败:', err)
    error.value = err.message || '搜索商品失败'
  } finally {
    loading.value = false
  }
}

// 加载更多商品（增加显示数量）
const loadMoreProducts = () => {
  if (loading.value || noMoreProducts.value) return
  displayCount.value += 8
}

// 滚动监听处理
const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // 当滚动到底部附近时（距离底部100px）触发加载
  if (scrollTop + windowHeight >= documentHeight - 100) {
    loadMoreProducts()
  }
}

// 处理搜索
const handleSearch = () => {
  searchProducts()
}

// 处理重置
const handleReset = () => {
  searchForm.value = {
    productName: '',
    categoryId: null,
    merchantName: '',
    pageNum: 1,
    pageSize: 999
  }
  filterConditions.value = {
    isHot: false,
    isNew: false
  }
  sortConditions.value = {
    salesCountSort: false,
    priceSort: false,
    viewCountSort: false
  }
  handleSearch()
}

// 处理商品点击
const handleProductClick = (productId: number) => {
  const url = `/product/detail?id=${productId}`
  window.open(url, '_blank')
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

// 初始化搜索条件（从URL参数获取）
const initSearchConditions = () => {
  const keyword = route.query.keyword as string
  const categoryId = route.query.categoryId as string
  
  if (keyword) {
    searchForm.value.productName = keyword
  }
  
  if (categoryId) {
    searchForm.value.categoryId = parseInt(categoryId)
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadCategories(false)
  initSearchConditions()
  searchProducts()
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll)
})

// 页面卸载时清理
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 全局CSS变量 - 与主页保持一致 */
.product-search-container {
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
  z-index: 1000;
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

/* 搜索内容 */
.search-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
  width: 100%;
}

/* 搜索条件区域 */
.search-filters {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 24px;
  box-shadow: var(--shadow);
  margin-bottom: 24px;
}

.filter-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.category-item {
  grid-column: span 1;
}

.filters-item,
.sort-item {
  grid-column: span 1;
}

.filter-checkboxes,
.sort-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.button-item {
  grid-column: span 3;
  flex-direction: row;
  justify-content: center;
  gap: 16px;
}

.category-dropdown {
  max-height: 300px;
  overflow-y: auto;
}

.category-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--text-light);
}

/* 搜索标题 */
.search-header {
  margin-bottom: 24px;
  text-align: center;
}

.search-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.search-count {
  font-size: 14px;
  color: var(--text-light);
}

/* 商品容器 */
.products-container {
  min-height: 400px;
  overflow-y: auto;
}

/* 商品网格 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

/* 商品卡片 */
.product-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

/* 商品图片包装器 */
.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

/* 商品标签 */
.product-badges {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
}

.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.badge.hot {
  background-color: #ff6b6b;
  color: white;
}

.badge.new {
  background-color: #4ecdc4;
  color: white;
}

/* 商品信息 */
.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-merchant {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price-rating {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-light);
}

.rating-icon {
  color: #ffc107;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-light);
}

/* 加载更多 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 0;
  color: var(--text-light);
}

.loading-icon {
  font-size: 24px;
  color: var(--primary-color);
  animation: rotate 1s linear infinite;
}

/* 没有更多 */
.no-more {
  text-align: center;
  padding: 32px 0;
  color: var(--text-light);
  font-size: 14px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  gap: 16px;
  color: var(--text-light);
}

.empty-icon {
  font-size: 64px;
  color: var(--primary-color);
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  gap: 16px;
  color: var(--text-light);
}

.error-icon {
  font-size: 64px;
  color: var(--primary-color);
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

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .filter-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .button-item {
    grid-column: span 2;
  }

  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .filter-section {
    grid-template-columns: 1fr;
  }

  .category-item,
  .filters-item,
  .sort-item,
  .button-item {
    grid-column: span 1;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .search-title {
    font-size: 20px;
  }
}

@media screen and (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .nav-container {
    padding: 0 16px;
  }

  .nav-item span {
    display: none;
  }
}
</style>
