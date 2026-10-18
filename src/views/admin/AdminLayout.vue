<template>
  <el-container class="admin-container">
    <!-- 左侧导航栏 -->
    <el-aside width="220px" class="admin-sidebar">
      <!-- 顶部用户信息区域 -->
      <div class="user-info-section">
        <div class="user-avatar">
          <el-avatar size="36">
            {{ adminUsername.charAt(0).toUpperCase() }}
          </el-avatar>
        </div>
        <div class="user-details">
          <span class="username">{{ adminUsername }}</span>
        </div>
        <el-button 
          link 
          class="logout-button"
          @click="handleLogout"
          size="small"
        >
          退出登录
        </el-button>
      </div>
      
      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        class="admin-menu"
        router
        :unique-opened="true"
        :collapse-transition="true"
        @select="handleMenuSelect"
      >
        <!-- 图像管理 -->
        <el-sub-menu index="image">
          <template #title>
            <el-icon><Picture /></el-icon>
            <span>图像管理</span>
          </template>
          <el-menu-item index="/admin/image/background">
            <el-icon><Picture /></el-icon>
            <span>主页背景图片管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/image/carousel">
            <el-icon><Picture /></el-icon>ll
            <span>首页轮播图片管理</span>
          </el-menu-item>
        </el-sub-menu>
        
        <!-- 商家管理 -->
        <el-menu-item index="/admin/merchant">
          <el-icon><OfficeBuilding /></el-icon>
          <span>商家管理</span>
        </el-menu-item>
        
        <!-- 用户管理 -->
        <el-menu-item index="/admin/user">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <!-- 商品分类管理 -->
        <el-menu-item index="/admin/category">
          <el-icon><Grid /></el-icon>
          <span>商品分类管理</span>
        </el-menu-item>
        
        <!-- 商品管理 -->
        <el-menu-item index="/admin/product">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        
        <!-- 管理员管理 -->
        <el-menu-item index="/admin/admin">
          <el-icon><Setting /></el-icon>
          <span>管理员管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 右侧主内容区 -->
    <el-container class="admin-main-container">
      <!-- 顶部标题栏 -->
      <el-header class="admin-header">
        <div class="header-left">
          <h1 class="system-title">栖所管理系统</h1>
        </div>
        <div class="header-right">
          <h2 class="page-title">{{ currentPageTitle }}</h2>
        </div>
      </el-header>
      
      <!-- 内容区域 -->
      <el-main class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getToken } from '@/utils/auth'
import { logoutAndClear } from '@/utils/logout'
import { ElMessage } from 'element-plus'
import {
  Picture,
  OfficeBuilding,
  User,
  Grid,
  Goods,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 从localStorage获取管理员用户名
const adminUsername = ref(localStorage.getItem('adminUsername') || 'Admin')

// 当前激活的菜单
const activeMenu = ref('')

// 当前页面标题
const currentPageTitle = ref('仪表盘')

// 处理菜单选择
const handleMenuSelect = (key: string) => {
  activeMenu.value = key
  // 保存当前选中的菜单到localStorage
  localStorage.setItem('activeAdminMenu', key)
  
  // 根据路由更新页面标题
  updatePageTitle()
}

// 更新页面标题
const updatePageTitle = () => {
  const routePath = route.path
  switch (routePath) {
    case '/admin/image/background':
      currentPageTitle.value = '主页背景图片管理'
      break
    case '/admin/image/carousel':
      currentPageTitle.value = '首页轮播图片管理'
      break
    case '/admin/merchant':
      currentPageTitle.value = '商家管理'
      break
    case '/admin/user':
      currentPageTitle.value = '用户管理'
      break
    case '/admin/category':
      currentPageTitle.value = '商品分类管理'
      break
    case '/admin/product':
      currentPageTitle.value = '商品管理'
      break
    case '/admin/admin':
      currentPageTitle.value = '管理员管理'
      break
    default:
      currentPageTitle.value = '仪表盘'
  }
}

// 处理退出登录
const handleLogout = async () => {
  // activeAdminMenu 是界面残留，顺手清掉
  localStorage.removeItem('activeAdminMenu')
  // 注销后端刷新令牌，并在 finally 里清管理端会话、跳登录页
  await logoutAndClear('admin')
}

// 组件挂载时初始化
onMounted(() => {
  // 从localStorage恢复选中的菜单
  const savedMenu = localStorage.getItem('activeAdminMenu')
  if (savedMenu) {
    activeMenu.value = savedMenu
  } else {
    activeMenu.value = '/admin/image/background'
  }
  
  // 更新页面标题
  updatePageTitle()
  
  // 检查登录状态
  if (!getToken('admin')) {
    console.log('未授权访问，重定向到登录页面')
    router.push('/login/admin')
  }
})
</script>

<style scoped>
.admin-container {
  height: 100vh;
  overflow: hidden;
  background-color: #F5F7FA;
}

/* 左侧导航栏 */
.admin-sidebar {
  background-color: #FFFFFF;
  border-right: 1px solid #E4E7ED;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

/* 用户信息区域 */
.user-info-section {
  height: 80px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #E4E7ED;
  background-color: #FFFFFF;
}

.user-avatar {
  margin-right: 12px;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.logout-button {
  color: #909399;
  font-size: 12px;
}

.logout-button:hover {
  color: #1890FF;
}

/* 导航菜单 */
.admin-menu {
  flex: 1;
  border-right: none;
  margin-top: 0;
  background-color: #FFFFFF;
}

.admin-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  margin: 0;
  padding: 0 20px;
}

.admin-menu :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  margin: 0;
  padding: 0 20px;
}

.admin-menu :deep(.el-menu-item:hover),
.admin-menu :deep(.el-sub-menu__title:hover) {
  background-color: #F5F7FA;
}

.admin-menu :deep(.el-menu-item.is-active) {
  background-color: #ECF5FF;
  color: #1890FF;
  border-left: 2px solid #1890FF;
}

.admin-menu :deep(.el-icon) {
  font-size: 20px;
  margin-right: 8px;
}

/* 右侧主容器 */
.admin-main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部标题栏 */
.admin-header {
  height: 60px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E4E7ED;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  z-index: 10;
}

.system-title {
  font-size: 18px;
  font-weight: 600;
  color: #1890FF;
  margin: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

/* 内容区域 */
.admin-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #F5F7FA;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media screen and (max-width: 1366px) {
  .admin-content {
    padding: 16px;
  }
  
  .admin-header {
    padding: 0 20px;
  }
}
</style>