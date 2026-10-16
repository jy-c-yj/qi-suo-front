<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <header class="top-nav">
      <div class="nav-container">
        <div class="nav-left">
          <h1 class="logo" @click="goToHome">栖所</h1>
          <div class="user-info">
            <span class="username">{{ username }}</span>
            <el-button 
              link 
              class="logout-btn"
              @click="handleLogout"
            >
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
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 搜索栏 -->
      <section class="search-section">
        <div class="search-container">
          <div class="search-box">
            <el-icon class="search-icon"><Search /></el-icon>
            <input 
              v-model="searchKeyword"
              type="text" 
              placeholder="搜索商品..." 
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          </div>
        </div>
      </section>

      <!-- 轮播与分类区域 -->
      <section class="carousel-section">
        <div class="carousel-container">
          <!-- 分类区域包装器 - 包含一级、二级、三级分类 -->
          <div 
            class="category-wrapper"
            @mouseenter="handleCategoryListMouseEnter"
            @mouseleave="handleCategoryListMouseLeave"
          >
            <!-- 商品分类列表 -->
            <div class="category-list">
              <div v-if="loading" class="category-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <span>加载中...</span>
              </div>
              <div v-else-if="error" class="category-error">
                <el-icon class="error-icon"><Warning /></el-icon>
                <span>{{ error }}</span>
                <el-button size="small" @click="fetchCategories">重试</el-button>
              </div>
              <template v-else>
                <div 
                  v-for="category in visibleCategories" 
                  :key="category.id"
                  class="category-item"
                  @mouseenter="handleCategoryMouseEnter(category.id, $event)"
                >
                  <div class="category-header" @click="handleCategoryClick(category.id)">
                    <el-icon class="category-icon"><HomeFilled /></el-icon>
                    <span>{{ category.name }}</span>
                    <el-icon class="expand-icon">
                      <ArrowRight />
                    </el-icon>
                  </div>
                </div>
              </template>
            </div>
            
            <!-- 子分类容器 -->
            <div 
              v-if="hoveredCategory && getSubCategories(hoveredCategory).length > 0" 
              class="sub-category-container"
            >
              <div class="sub-category-list show">
                <div 
                  v-for="subCategory in getSubCategories(hoveredCategory)" 
                  :key="subCategory.id"
                  class="sub-category-item"
                  @mouseenter="handleSubCategoryMouseEnter(hoveredCategory, subCategory.id, $event)"
                >
                  <div class="sub-category-header" @click="handleCategoryClick(subCategory.id)">
                    <span>{{ subCategory.name }}</span>
                    <el-icon class="expand-icon">
                      <ArrowRight />
                    </el-icon>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 三级分类容器 -->
            <div 
              v-if="hoveredSubCategory.subCategoryId && getThirdCategories(hoveredSubCategory.categoryId, hoveredSubCategory.subCategoryId).length > 0" 
              class="third-category-container"
            >
              <div class="third-category-list show">
                <div 
                  v-for="thirdCategory in getThirdCategories(hoveredSubCategory.categoryId, hoveredSubCategory.subCategoryId)" 
                  :key="thirdCategory.id"
                  class="third-category-item"
                  @click.stop="handleCategoryClick(thirdCategory.id)"
                >
                  <span>{{ thirdCategory.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 轮播图 -->
          <div class="carousel-wrapper">
            <el-carousel 
              :interval="3000" 
              type="card" 
              height="400px"
              indicator-position="outside"
              arrow="always"
            >
              <el-carousel-item v-for="item in carouselItems" :key="item.id">
                <div class="carousel-item">
                  <img 
                    :src="item.imageUrl" 
                    :alt="`轮播图片${item.id}`"
                    class="carousel-image"
                  />
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>
      </section>

      <!-- 商品展示区域 -->
      <section class="products-section">
        <div class="products-container">
          <h2 class="section-title">热门商品</h2>
          
          <!-- 加载状态 -->
          <div v-if="hotProductsLoading" class="products-loading">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="hotProductsError" class="products-error">
            <el-icon class="error-icon"><Warning /></el-icon>
            <span>{{ hotProductsError }}</span>
            <el-button size="small" @click="loadHotProducts">重试</el-button>
          </div>
          
          <!-- 商品列表 -->
          <div v-else class="products-grid">
            <div 
              v-for="product in hotProducts" 
              :key="product.id"
              class="product-card"
              @click="handleProductClick(product.id)"
            >
              <div class="product-image">
                <img 
                  :src="product.productImageUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
                  :alt="product.productName"
                  class="product-img"
                />
              </div>
              <h3 class="product-title">{{ product.productName }}</h3>
              <div class="product-info">
                <span class="product-price">¥{{ product.price }}</span>
                <span class="product-sales">已售{{ product.salesCount }}件</span>
              </div>
            </div>
            
            <!-- 无商品时的提示 -->
            <div v-if="hotProducts.length === 0" class="products-empty">
              <el-icon class="empty-icon"><Document /></el-icon>
              <span>暂无热门商品</span>
            </div>
          </div>
          
          <!-- 加载更多提示 -->
          <div v-if="hotProducts.length > 0 && hotProductsLoading" class="load-more-container">
            <div class="load-more-loading">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>加载更多...</span>
            </div>
          </div>
          
          <!-- 没有更多商品提示 -->
          <div v-if="hotProducts.length > 0 && !hasMoreHotProducts && lastQueryCount === 0" class="no-more-container">
            <span>—— 没有更多了 ——</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  Search,
  HomeFilled,
  Loading,
  Warning,
  ArrowDown,
  ArrowRight,
  Document
} from '@element-plus/icons-vue'
import { getHomeCategories, getHomeCarouselImageList, queryHotProduct } from '@/api/user'
import { clearSession } from '@/utils/auth'
import type { Category, HotProductDVO } from '@/types'

const router = useRouter()

// 从localStorage获取用户名
const username = ref(localStorage.getItem('username') || '用户')

// 搜索关键词
const searchKeyword = ref('')

// 分类数据
const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref('')

// 悬停状态
const hoveredCategory = ref<number | null>(null)
const hoveredSubCategory = ref<{ categoryId: number | null, subCategoryId: number | null }>({ categoryId: null, subCategoryId: null })

// 分类列表悬停状态
const isCategoryListHovered = ref(false)
const showAllCategories = ref(false)
// 计算属性：过滤要显示的分类
const visibleCategories = computed(() => {
  if (showAllCategories.value) {
    return categories.value
  } else {
    // 这里可以根据实际情况调整显示的分类数量
    // 暂时保持显示所有顶层分类，因为我们将实现滚动效果
    return categories.value
  }
})

// 防抖动定时器
let hoverTimer: number | null = null
let leaveTimer: number | null = null

// 移动设备相关
const isMobile = ref(false)
const expandedMobileCategories = ref<number[]>([])
const expandedMobileSubCategories = ref<Map<number, number[]>>(new Map())

// 获取子分类
const getSubCategories = (categoryId: number | null) => {
  if (!categoryId) return []
  const category = categories.value.find(c => c.id === categoryId)
  return category?.children || []
}

// 获取三级分类
const getThirdCategories = (categoryId: number | null, subCategoryId: number | null) => {
  if (!categoryId || !subCategoryId) return []
  const category = categories.value.find(c => c.id === categoryId)
  const subCategory = category?.children.find(sc => sc.id === subCategoryId)
  return subCategory?.children || []
}

// 轮播图数据
const carouselItems = ref<Array<{ id: number; imageUrl: string }>>([])

// 获取轮播图片列表
const loadCarouselImages = async () => {
  try {
    const response = await getHomeCarouselImageList()
    // 将后端返回的图片URL数组转换为轮播图所需的格式
    carouselItems.value = response.data.map((url, index) => ({
      id: index + 1,
      imageUrl: url
    }))
  } catch (error) {
    console.error('获取轮播图片失败:', error)
    // 如果获取失败，使用默认轮播图片
    carouselItems.value = [
      {
        id: 1,
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20furniture%20home%20decor%20living%20room%20warm%20lighting&image_size=landscape_16_9'
      },
      {
        id: 2,
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20bedroom%20furniture%20warm%20colors&image_size=landscape_16_9'
      },
      {
        id: 3,
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20kitchen%20appliances%20warm%20lighting&image_size=landscape_16_9'
      }
    ]
  }
}

// 热门商品数据
const hotProducts = ref<HotProductDVO[]>([])
const hotProductsLoading = ref(false)
const hotProductsError = ref('')
const hotProductsPage = ref(1)
const hasMoreHotProducts = ref(true)
const lastQueryCount = ref(0)

// 获取热门商品
const loadHotProducts = async (isLoadMore = false) => {
  if (hotProductsLoading.value) return
  
  hotProductsLoading.value = true
  if (!isLoadMore) {
    hotProductsError.value = ''
    // 首次加载时重置页码
    hotProductsPage.value = 1
    hasMoreHotProducts.value = true
  }
  
  try {
    console.log(`正在加载热门商品，页码: ${hotProductsPage.value}, 每页数量: 8`)
    const response = await queryHotProduct(hotProductsPage.value, 8)
    console.log('API响应:', response)
    
    if (response.code === 1 && response.data) {
      const newProducts = response.data.rows || []
      lastQueryCount.value = newProducts.length
      console.log(`获取到 ${newProducts.length} 个商品`)
      
      if (isLoadMore) {
        // 追加新数据
        hotProducts.value.push(...newProducts)
      } else {
        // 替换数据
        hotProducts.value = newProducts
      }
      
      // 判断是否还有更多商品
      if (newProducts.length === 0) {
        hasMoreHotProducts.value = false
        console.log('没有更多商品了')
      }
    } else {
      console.error('API返回错误:', response)
      if (!isLoadMore) {
        hotProductsError.value = response.msg || '获取热门商品失败'
      }
    }
  } catch (error: any) {
    console.error('获取热门商品失败:', error)
    if (!isLoadMore) {
      hotProductsError.value = error.message || '获取热门商品失败'
    }
  } finally {
    hotProductsLoading.value = false
  }
}

// 加载更多热门商品
const loadMoreHotProducts = async () => {
  if (!hasMoreHotProducts.value || hotProductsLoading.value) return
  hotProductsPage.value++
  await loadHotProducts(true)
}

// 滚动监听处理
const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // 当滚动到底部附近时（距离底部100px）触发加载
  if (scrollTop + windowHeight >= documentHeight - 100) {
    loadMoreHotProducts()
  }
}

// 处理分类列表鼠标进入
const handleCategoryListMouseEnter = () => {
  isCategoryListHovered.value = true
  // 显示全部分类
  showAllCategories.value = true
  // 清除离开定时器
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
}

// 处理分类列表鼠标离开
const handleCategoryListMouseLeave = () => {
  isCategoryListHovered.value = false
  // 300ms后恢复显示部分分类
  leaveTimer = window.setTimeout(() => {
    showAllCategories.value = false
    // 同时隐藏所有展开的子分类
    hoveredCategory.value = null
    hoveredSubCategory.value = { categoryId: null, subCategoryId: null }
  }, 300)
}

// 处理分类鼠标进入
const handleCategoryMouseEnter = (categoryId: number, event: MouseEvent) => {
  // 清除之前的定时器
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
  
  // 防抖动处理，减少延迟
  if (hoverTimer) {
    clearTimeout(hoverTimer)
  }
  
  hoverTimer = window.setTimeout(() => {
    hoveredCategory.value = categoryId
    hoveredSubCategory.value = { categoryId: null, subCategoryId: null }
    
    // 实现子分类列表的智能显示策略
    const target = event.currentTarget as HTMLElement
    const subCategoryContainer = document.querySelector('.sub-category-container') as HTMLElement
    if (subCategoryContainer) {
      // 获取父分类元素的位置和尺寸
      const rect = target.getBoundingClientRect()
      // 获取窗口的宽度
      const windowWidth = window.innerWidth
      
      // 计算右侧空间
      const rightSpace = windowWidth - rect.right
      // 计算左侧空间
      const leftSpace = rect.left
      
      // 检查右侧空间是否足够
      if (rightSpace >= 200) {
        // 右侧空间足够，正常向右显示
        subCategoryContainer.style.left = '200px'
        subCategoryContainer.style.right = 'auto'
      } else if (leftSpace >= 200) {
        // 右侧空间不足，左侧空间足够，向左显示
        subCategoryContainer.style.left = 'auto'
        subCategoryContainer.style.right = '100%'
      } else {
        // 左右空间均受限，实现可滚动的子分类列表
        subCategoryContainer.style.left = '200px'
        subCategoryContainer.style.right = 'auto'
        subCategoryContainer.style.maxHeight = '350px'
        subCategoryContainer.style.overflowY = 'auto'
      }
    }
  }, 50) // 减少延迟，提高响应速度
}

// 处理分类鼠标离开
const handleCategoryMouseLeave = () => {
  // 清除之前的定时器
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
  
  // 300ms后隐藏所有展开的分类
  leaveTimer = window.setTimeout(() => {
    hoveredCategory.value = null
    hoveredSubCategory.value = { categoryId: null, subCategoryId: null }
  }, 300)
}

// 处理子分类列表鼠标进入
const handleSubCategoryListMouseEnter = () => {
  // 清除离开定时器
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
}

// 处理子分类鼠标进入
const handleSubCategoryMouseEnter = (categoryId: number, subCategoryId: number, event: MouseEvent) => {
  // 清除之前的定时器
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
  
  // 防抖动处理
  if (hoverTimer) {
    clearTimeout(hoverTimer)
  }
  
  hoverTimer = window.setTimeout(() => {
    hoveredSubCategory.value = { categoryId, subCategoryId }
    
    // 实现三级分类列表的智能显示策略
    const target = event.currentTarget as HTMLElement
    const thirdCategoryContainer = document.querySelector('.third-category-container') as HTMLElement
    if (thirdCategoryContainer) {
      // 获取子分类元素的位置和尺寸
      const rect = target.getBoundingClientRect()
      // 获取窗口的宽度
      const windowWidth = window.innerWidth
      
      // 计算右侧空间
      const rightSpace = windowWidth - rect.right
      // 计算左侧空间
      const leftSpace = rect.left
      
      // 检查右侧空间是否足够
      if (rightSpace >= 200) {
        // 右侧空间足够，正常向右显示
        thirdCategoryContainer.style.left = '400px'
        thirdCategoryContainer.style.right = 'auto'
      } else if (leftSpace >= 200) {
        // 右侧空间不足，左侧空间足够，向左显示
        thirdCategoryContainer.style.left = 'auto'
        thirdCategoryContainer.style.right = '100%'
      } else {
        // 左右空间均受限，实现可滚动的三级分类列表
        thirdCategoryContainer.style.left = '400px'
        thirdCategoryContainer.style.right = 'auto'
        thirdCategoryContainer.style.maxHeight = '350px'
        thirdCategoryContainer.style.overflowY = 'auto'
      }
    }
  }, 50) // 减少延迟，提高响应速度
}

// 处理三级分类列表鼠标进入
const handleThirdCategoryListMouseEnter = () => {
  // 清除离开定时器
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
}

// 移动设备分类切换
const toggleCategoryMobile = (categoryId: number) => {
  // 只在移动设备上执行
  if (!isMobile.value) return
  
  const index = expandedMobileCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedMobileCategories.value.splice(index, 1)
    // 同时关闭该分类下的所有子分类
    expandedMobileSubCategories.value.delete(categoryId)
  } else {
    expandedMobileCategories.value.push(categoryId)
  }
}

// 移动设备子分类切换
const toggleSubCategoryMobile = (categoryId: number, subCategoryId: number) => {
  // 只在移动设备上执行
  if (!isMobile.value) return
  
  if (!expandedMobileSubCategories.value.has(categoryId)) {
    expandedMobileSubCategories.value.set(categoryId, [])
  }
  const subCategories = expandedMobileSubCategories.value.get(categoryId)!
  const index = subCategories.indexOf(subCategoryId)
  if (index > -1) {
    subCategories.splice(index, 1)
  } else {
    subCategories.push(subCategoryId)
  }
}

// 检查移动设备子分类是否展开
const getMobileSubCategoryExpanded = (categoryId: number, subCategoryId: number): boolean => {
  const subCategories = expandedMobileSubCategories.value.get(categoryId)
  return subCategories ? subCategories.includes(subCategoryId) : false
}

// 检测设备类型
const checkDeviceType = () => {
  isMobile.value = window.innerWidth < 768
}

// 获取分类数据
const fetchCategories = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 检查缓存
    const cachedCategories = localStorage.getItem('homeCategories')
    const cachedTimestamp = localStorage.getItem('homeCategoriesTimestamp')
    
    // 如果缓存存在且未过期（5分钟）
    if (cachedCategories && cachedTimestamp) {
      const now = Date.now()
      const cacheTime = parseInt(cachedTimestamp)
      if (now - cacheTime < 5 * 60 * 1000) {
        categories.value = JSON.parse(cachedCategories)
        loading.value = false
        return
      }
    }
    
    const response = await getHomeCategories()
    
    // 检查响应数据结构
    if (!response || typeof response !== 'object') {
      throw new Error('无效的响应数据')
    }
    
    // 检查状态码
    if (response.code !== 1) {
      throw new Error(response.msg || '获取分类数据失败')
    }
    
    // 检查数据字段
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('无效的分类数据')
    }
    
    // 处理分类数据，确保children字段存在且为数组
    const processCategories = (categoryList: any[]): Category[] => {
      return categoryList.map(category => {
        return {
          id: category.id,
          parentId: category.parentId,
          name: category.name,
          children: category.children && Array.isArray(category.children) ? processCategories(category.children) : []
        }
      })
    }
    
    categories.value = processCategories(response.data)
    
    // 缓存数据
    localStorage.setItem('homeCategories', JSON.stringify(categories.value))
    localStorage.setItem('homeCategoriesTimestamp', Date.now().toString())
  } catch (err: any) {
    console.error('获取分类数据失败:', err)
    error.value = err.message || '获取分类数据失败'
    // 显示错误提示
    ElMessage.error(err.message || '获取分类数据失败')
  } finally {
    loading.value = false
  }
}

// 处理分类点击
const handleCategoryClick = (categoryId: number) => {
  // 在新标签页中打开搜索结果，带上分类ID
  const url = `/product/search?categoryId=${categoryId}`
  window.open(url, '_blank')
}

// 处理商品点击
const handleProductClick = (productId: number) => {
  // 在新标签页中打开商品详情
  const url = `/product/detail?id=${productId}`
  window.open(url, '_blank')
}

// 跳转到个人信息页面
const goToProfile = () => {
  router.push('/user/profile')
}

// 跳转到我的订单页面
const goToOrders = () => {
  router.push('/user/orders')
}

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  // 在新标签页中打开搜索结果
  const url = `/product/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`
  window.open(url, '_blank')
}

// 跳转到首页
const goToHome = () => {
  router.push('/')
}

// 退出登录
const handleLogout = () => {
  // 原来漏了 userRefreshTokenKey（一个还有 7 天有效期的凭证），一并清掉
  clearSession('user')
  router.push('/login/user')
}

// 页面挂载时获取分类数据、轮播图片和热门商品
onMounted(() => {
  fetchCategories()
  loadCarouselImages()
  loadHotProducts()
  
  // 检测设备类型
  checkDeviceType()
  
  // 监听窗口大小变化
  window.addEventListener('resize', checkDeviceType)
  
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll)
})

// 页面卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', checkDeviceType)
  window.removeEventListener('scroll', handleScroll)
  
  // 清理定时器
  if (hoverTimer) {
    clearTimeout(hoverTimer)
  }
  if (leaveTimer) {
    clearTimeout(leaveTimer)
  }
})
</script>

<style scoped>
/* 全局样式变量 - 浅棕色主题 */
/* 使用局部变量替代:root，确保在scoped样式中生效 */
.home-container {
  --primary-color: #F5EFE0;
  --primary-hover: #E6DDC4;
  --secondary-color: #E6DDC4;
  --text-color: #5D4037;
  --text-light: #8D6E63;
  --bg-light: #FCFAF7;
  --white: #FCFAF7;
  --border-radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 浅棕色主题 - 可通过修改.home-container变量启用 */
/*
.home-container {
  --primary-color: #F5EFE0;
  --primary-hover: #E6DDC4;
  --secondary-color: #E6DDC4;
  --text-color: #5D4037;
  --text-light: #8D6E63;
  --bg-light: #FCFAF7;
  --white: #FCFAF7;
  --border-radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.15);
}
*/

/* 温暖米色主题 - 可通过修改.home-container变量启用 */
/*
.home-container {
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
}
*/

/* 顶部导航栏 */
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

/* 主要内容区域 */
.main-content {
  background-color: var(--bg-light);
  min-height: calc(100vh - 70px);
}

/* 搜索栏 */
.search-section {
  padding: 40px 0;
  background-color: var(--white);
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.search-box {
  width: 90%;
  max-width: 1200px;
  height: 44px;
  display: flex;
  align-items: center;
  background-color: var(--bg-light);
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  box-shadow: 0 0 0 2px rgba(230, 221, 196, 0.4);
}

.search-icon {
  margin: 0 16px;
  color: var(--text-light);
  font-size: 20px;
}

.search-input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 16px;
  color: var(--text-color);
}

.search-input::placeholder {
  color: var(--text-light);
}

.search-btn {
  height: 100%;
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  background-color: var(--primary-color);
  border: none;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 轮播与分类区域 */
.carousel-section {
  padding: 40px 0;
}

.carousel-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  padding: 0 20px;
  /* 确保容器能够容纳所有子元素，包括展开的子分类列表 */
  position: relative;
}

/* 分类区域包装器 */
.category-wrapper {
  position: relative;
  display: flex;
  height: 400px;
  z-index: 10;
}

/* 商品分类列表 */
.category-list {
  width: 200px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  height: 400px;
  overflow-y: auto;
  /* 移除 position: relative;，避免影响子分类列表的定位 */
  /* 确保子分类列表能够正确显示，不受分类区域大小的限制 */
  z-index: 10;
  transition: all 0.3s ease;
  /* 确保分类列表在布局中占据固定位置 */
  flex-shrink: 0;
}

/* 滚动条样式 */
.category-list::-webkit-scrollbar {
  width: 4px;
}

.category-list::-webkit-scrollbar-track {
  background: var(--bg-light);
  border-radius: 2px;
}

.category-list::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  border-radius: 2px;
}

.category-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--primary-hover);
}

/* 分类加载状态 */
.category-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--text-light);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 分类错误状态 */
.category-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  padding: 20px;
  color: #F56C6C;
  text-align: center;
}

.error-icon {
  font-size: 24px;
}

/* 子分类容器 */
.sub-category-container {
  width: 200px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  height: 400px;
  overflow-y: auto;
  /* 确保子分类容器能够覆盖轮播区域 */
  z-index: 100;
  /* 添加边框，增强视觉区分 */
  border: 1px solid var(--primary-hover);
  /* 添加内边距，增强视觉效果 */
  padding: 8px 0;
  /* 确保子分类容器始终完全可见，不被容器边缘截断 */
  box-sizing: border-box;
  flex-shrink: 0;
}

/* 三级分类容器 */
.third-category-container {
  width: 200px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  height: 400px;
  overflow-y: auto;
  /* 确保三级分类容器能够覆盖轮播区域 */
  z-index: 110;
  /* 添加边框，增强视觉区分 */
  border: 1px solid var(--primary-hover);
  /* 添加内边距，增强视觉效果 */
  padding: 8px 0;
  /* 确保三级分类容器始终完全可见，不被容器边缘截断 */
  box-sizing: border-box;
}

/* 分类项 */
.category-item {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
}

.category-header {
  height: 50px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.category-header:hover {
  background-color: rgba(245, 239, 224, 0.4);
  border-left-color: var(--primary-color);
}

.category-icon {
  font-size: 20px;
  color: var(--primary-color);
}

.expand-icon {
  font-size: 16px;
  color: var(--text-light);
  margin-left: auto;
  transition: transform 0.3s ease;
}

/* 子分类列表 */
.sub-category-list {
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
  /* 移除绝对定位和隐藏状态，确保子分类列表在容器中正确显示 */
}

/* 子分类项 */
.sub-category-item {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
}

.sub-category-header {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: var(--text-color);
  border-left: 3px solid transparent;
  /* 添加层级指示器 */
  position: relative;
}

.sub-category-header::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--primary-color);
}

.sub-category-header:hover {
  background-color: rgba(245, 239, 224, 0.3);
  border-left-color: var(--primary-hover);
}

/* 三级分类列表 */
.third-category-list {
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
  /* 移除绝对定位和隐藏状态，确保三级分类列表在容器中正确显示 */
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  /* 移动设备下的分类列表 */
  .category-list {
    width: 100%;
    height: auto;
    max-height: 300px;
  }
  
  /* 移动设备下的子分类列表 */
  .sub-category-list {
    position: static;
    width: 100%;
    max-height: 200px;
    transform: none;
    margin-top: 8px;
    border-radius: var(--border-radius);
  }
  
  /* 移动设备下的子分类显示状态 */
  .sub-category-list.show {
    transform: none;
  }
  
  /* 移动设备下的三级分类列表 */
  .third-category-list {
    position: static;
    width: 100%;
    max-height: 200px;
    transform: none;
    margin-top: 8px;
    border-radius: var(--border-radius);
  }
  
  /* 移动设备下的三级分类显示状态 */
  .third-category-list.show {
    transform: none;
  }
  
  /* 移动设备下的分类项 */
  .category-item {
    margin-bottom: 8px;
  }
  
  /* 移动设备下的子分类项 */
  .sub-category-item {
    margin-bottom: 4px;
  }
}

@media screen and (max-width: 480px) {
  /* 小屏幕移动设备下的分类列表 */
  .category-list {
    width: 100%;
    height: auto;
    max-height: 250px;
  }
  
  /* 小屏幕移动设备下的分类头部 */
  .category-header {
    padding: 0 16px;
  }
  
  /* 小屏幕移动设备下的子分类头部 */
  .sub-category-header {
    padding: 0 24px;
  }
  
  /* 小屏幕移动设备下的三级分类项 */
  .third-category-item {
    padding: 0 32px;
  }
}

.third-category-item {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  color: var(--text-light);
  border-left: 3px solid transparent;
  /* 添加层级指示器 */
  position: relative;
}

.third-category-item::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background-color: var(--primary-hover);
}

.third-category-item::after {
  content: '';
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 1px;
  background-color: var(--primary-hover);
}

.third-category-item:hover {
  background-color: rgba(245, 239, 224, 0.2);
  border-left-color: var(--secondary-color);
  color: var(--text-color);
}

/* 轮播图 */
.carousel-wrapper {
  flex: 1;
  height: 400px;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.carousel-item {
  position: relative;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  color: var(--white);
  padding: 40px;
}

.carousel-overlay h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.carousel-overlay p {
  font-size: 16px;
  opacity: 0.9;
}

/* 商品展示区域 */
.products-section {
  padding: 40px 0;
  background-color: var(--bg-light);
}

.products-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 32px;
  text-align: left;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* 商品卡片 */
.product-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-hover);
}

.product-image {
  width: 100%;
  padding-top: 100%; /* 1:1 比例 */
  position: relative;
  margin-bottom: 12px;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.product-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 12px;
  height: 48px;
  line-height: 24px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.product-sales {
  font-size: 14px;
  color: var(--text-light);
}

/* 响应式设计 */
@media screen and (max-width: 1199px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .carousel-container {
    flex-direction: column;
  }

  .category-list {
    width: 100%;
    height: auto;
    max-height: 300px;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .category-header {
    min-width: 120px;
    height: 50px;
    border-left: 3px solid transparent;
    border-bottom: none;
  }

  .category-header:hover {
    border-left-color: var(--primary-color);
    border-bottom: none;
  }

  .sub-category-header {
    padding: 0 20px;
  }

  .third-category-item {
    padding: 0 30px;
  }

  .carousel-wrapper {
    max-width: 100%;
    height: 300px;
  }

  .nav-right {
    gap: 12px;
  }

  .nav-item span {
    display: none;
  }

  .user-info {
    gap: 8px;
  }

  .username {
    font-size: 14px;
  }
}

@media screen and (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .nav-left {
    gap: 16px;
  }

  .logo {
    font-size: 20px;
  }

  .search-box {
    width: 95%;
  }

  .carousel-wrapper {
    height: 200px;
  }
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 商品加载状态 */
.products-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #606266;
}

.products-loading .loading-icon {
  font-size: 24px;
  margin-right: 12px;
  color: #409eff;
  animation: rotate 1s linear infinite;
}

/* 商品错误状态 */
.products-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #f56c6c;
}

.products-error .error-icon {
  font-size: 24px;
  margin-right: 12px;
}

/* 商品空状态 */
.products-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
  grid-column: 1 / -1;
}

.products-empty .empty-icon {
  font-size: 24px;
  margin-right: 12px;
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

/* 加载更多容器 */
.load-more-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  margin-top: 16px;
}

.load-more-loading {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.load-more-loading .loading-icon {
  font-size: 20px;
  margin-right: 8px;
  color: #409eff;
  animation: rotate 1s linear infinite;
}

.load-more-hint {
  color: #909399;
  font-size: 14px;
  padding: 8px 16px;
  background-color: #f5f7fa;
  border-radius: 20px;
}

/* 没有更多商品提示 */
.no-more-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}
</style>
