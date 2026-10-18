<template>
  <div class="merchant-layout">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="merchant-aside">
      <div class="merchant-logo">
        <h2>栖所</h2>
        <p>商家管理</p>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="merchant-menu"
        router
      >
        <el-menu-item index="/merchant/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/merchant/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/merchant/orders">
          <el-icon><Ticket /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/merchant/settings">
          <el-icon><Setting /></el-icon>
          <span>店铺设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="merchant-main">
      <!-- 顶部导航栏 -->
      <el-header height="60px" class="merchant-header">
        <div class="header-left">
          <el-button
            type="text"
            class="menu-toggle"
            @click="toggleMenu"
          >
            <el-icon><Menu /></el-icon>
          </el-button>
          <h3 class="page-title">{{ pageTitle }}</h3>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" :src="merchantLogo || defaultAvatar"></el-avatar>
              <span class="merchant-name">{{ merchantName }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="merchant-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Odometer, Goods, Ticket, Setting, Menu, ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import { getMerchantInformation } from '@/api/user'
import { logoutAndClear } from '@/utils/logout'

// 路由实例
const router = useRouter()
const route = useRoute()

// 侧边栏折叠状态
const isMenuCollapsed = ref(false)

// 商家信息
const merchantName = ref(localStorage.getItem('merchantName') || '商家')
const merchantLogo = ref('')
const defaultAvatar = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20business%20logo%20icon&image_size=square'

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 页面标题
const pageTitle = computed(() => {
  switch (route.path) {
    case '/merchant/dashboard':
      return '仪表盘'
    case '/merchant/products':
      return '商品管理'
    case '/merchant/orders':
      return '订单管理'
    case '/merchant/settings':
      return '店铺设置'
    default:
      return '仪表盘'
  }
})

// 切换菜单折叠状态
const toggleMenu = () => {
  isMenuCollapsed.value = !isMenuCollapsed.value
}

// 退出登录：注销后端刷新令牌 + 清本端会话
const handleLogout = async () => {
  await logoutAndClear('merchant')
}

// 右上角商家名与 logo：从店铺设置接口取最新值
const loadMerchantProfile = async () => {
  try {
    const response = await getMerchantInformation()
    if (response.code === 1 && response.data) {
      if (response.data.merchantName) {
        merchantName.value = response.data.merchantName
      }
      merchantLogo.value = response.data.shopLogoUrl || ''
    }
  } catch (error) {
    console.warn('获取商家信息失败:', error)
  }
}

// 店铺设置里上传 logo / 改名后通知这里刷新
const handleProfileUpdated = () => {
  loadMerchantProfile()
}

onMounted(() => {
  loadMerchantProfile()
  window.addEventListener('merchant-profile-updated', handleProfileUpdated)
})

onUnmounted(() => {
  window.removeEventListener('merchant-profile-updated', handleProfileUpdated)
})
</script>

<style scoped>
.merchant-layout {
  min-height: 100vh;
  display: flex;
  background-color: #f5f7fa;
}

/* 侧边栏 */
.merchant-aside {
  background-color: #2d3748;
  color: #fff;
  transition: all 0.3s ease;
  overflow: hidden;
}

.merchant-logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.merchant-logo h2 {
  margin: 0 0 5px 0;
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

.merchant-logo p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.merchant-menu {
  margin-top: 20px;
  background-color: transparent;
  border-right: none;
}

.merchant-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8);
  height: 50px;
  line-height: 50px;
  margin: 0 10px;
  border-radius: 8px;
  margin-bottom: 5px;
}

.merchant-menu :deep(.el-menu-item:hover) {
  background-color: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.merchant-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(102, 126, 234, 0.3);
  color: #667eea;
}

/* 主内容区 */
.merchant-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航栏 */
.merchant-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.menu-toggle {
  font-size: 20px;
  color: #4a5568;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: #f7fafc;
}

.merchant-name {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

/* 内容区域 */
.merchant-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .merchant-aside {
    width: 60px !important;
  }

  .merchant-logo h2,
  .merchant-logo p,
  .merchant-menu :deep(.el-menu-item span) {
    display: none;
  }

  .merchant-menu :deep(.el-menu-item) {
    justify-content: center;
  }

  .page-title {
    font-size: 16px;
  }

  .merchant-content {
    padding: 10px;
  }
}
</style>