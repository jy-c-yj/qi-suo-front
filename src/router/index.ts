import { createRouter, createWebHistory } from 'vue-router'
import { getToken, loginPathOf } from '@/utils/auth'
import type { AuthApp } from '@/utils/auth'

// 路由配置
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home' // 默认重定向到用户端首页
    },
    {
      path: '/login',
      redirect: '/login/user' // 默认重定向到用户登录
    },
    {
      path: '/login/user',
      name: 'user-login',
      component: () => import('@/views/login/UserLogin.vue'),
      meta: {
        title: '用户登录 - 栖所',
        requiresAuth: false
      }
    },
    {
      path: '/login/merchant',
      name: 'merchant-login',
      component: () => import('@/views/login/MerchantLogin.vue'),
      meta: {
        title: '商家登录 - 栖所',
        requiresAuth: false
      }
    },
    {
      path: '/login/admin',
      name: 'admin-login',
      component: () => import('@/views/login/AdminLogin.vue'),
      meta: {
        title: '管理员登录 - 栖所',
        requiresAuth: false
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/register/Register.vue'),
      meta: {
        title: '注册 - 栖所',
        requiresAuth: false // 不需要登录
      }
    },
    {
      path: '/merchant-register',
      name: 'merchant-register',
      component: () => import('@/views/register/MerchantRegister.vue'),
      meta: {
        title: '商家注册 - 栖所',
        requiresAuth: false // 不需要登录
      }
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home.vue'), // 主页
      meta: {
        title: '首页 - 栖所',
        requiresAuth: true // 需要登录
      }
    },
    // 用户个人信息页面
    {
      path: '/user/profile',
      name: 'user-profile',
      component: () => import('@/views/user/UserProfile.vue'),
      meta: {
        title: '个人信息 - 栖所',
        requiresAuth: true // 需要登录
      }
    },
    // 用户订单页面
    {
      path: '/user/orders',
      name: 'user-orders',
      component: () => import('@/views/user/UserOrders.vue'),
      meta: {
        title: '我的订单 - 栖所',
        requiresAuth: true // 需要登录
      }
    },
    // 商品详情页面
    {
      path: '/product/detail',
      name: 'product-detail',
      component: () => import('@/views/product/ProductDetail.vue'),
      meta: {
        title: '商品详情 - 栖所',
        requiresAuth: true // 需要登录
      }
    },
    // 商品搜索页面
    {
      path: '/product/search',
      name: 'product-search',
      component: () => import('@/views/product/ProductSearch.vue'),
      meta: {
        title: '商品搜索 - 栖所',
        requiresAuth: true // 需要登录
      }
    },
    // 管理员路由
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: {
        title: '管理系统 - 栖所',
        requiresAuth: true,
        requiresAdmin: true // 需要管理员权限
      },
      children: [
        // 图像管理
        {
          path: 'image/background',
          name: 'admin-image-background',
          component: () => import('@/views/admin/image/BackgroundImage.vue'),
          meta: {
            title: '主页背景图片管理 - 栖所',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'image/carousel',
          name: 'admin-image-carousel',
          component: () => import('@/views/admin/image/CarouselImage.vue'),
          meta: {
            title: '首页轮播图片管理 - 栖所',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        // 商家管理
        {
          path: 'merchant',
          name: 'admin-merchant',
          component: () => import('@/views/admin/merchant/MerchantManage.vue'),
          meta: {
            title: '商家管理 - 栖所',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        // 用户管理
        {
          path: 'user',
          name: 'admin-user',
          component: () => import('@/views/admin/user/UserManage.vue'),
          meta: {
            title: '用户管理 - 栖所',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        // 商品分类管理
        {
          path: 'category',
          name: 'admin-category',
          component: () => import('@/views/admin/category/CategoryManage.vue'),
          meta: {
            title: '商品分类管理 - 栖所',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        // 商品管理
        {
          path: 'product',
          name: 'admin-product',
          component: () => import('@/views/admin/product/ProductManage.vue'),
          meta: {
            title: '商品管理 - 栖所',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        // 管理员管理
        {
          path: 'admin',
          name: 'admin-admin',
          component: () => import('@/views/admin/admin/AdminManage.vue'),
          meta: {
            title: '管理员管理 - 栖所',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        // 默认重定向到背景图片管理
        {
          path: '',
          redirect: '/admin/image/background'
        }
      ]
    },
    // 商家路由
    {
      path: '/merchant',
      component: () => import('@/views/merchant/MerchantLayout.vue'),
      meta: {
        title: '商家管理 - 栖所',
        requiresAuth: true,
        requiresMerchant: true // 需要商家权限
      },
      children: [
        // 仪表盘
        {
          path: 'dashboard',
          name: 'merchant-dashboard',
          component: () => import('@/views/merchant/dashboard/Dashboard.vue'),
          meta: {
            title: '仪表盘 - 栖所',
            requiresAuth: true,
            requiresMerchant: true
          }
        },
        // 商品管理
        {
          path: 'products',
          name: 'merchant-products',
          component: () => import('@/views/merchant/products/Products.vue'),
          meta: {
            title: '商品管理 - 栖所',
            requiresAuth: true,
            requiresMerchant: true
          }
        },
        // 订单管理
        {
          path: 'orders',
          name: 'merchant-orders',
          component: () => import('@/views/merchant/orders/Orders.vue'),
          meta: {
            title: '订单管理 - 栖所',
            requiresAuth: true,
            requiresMerchant: true
          }
        },
        // 店铺设置
        {
          path: 'settings',
          name: 'merchant-settings',
          component: () => import('@/views/merchant/settings/Settings.vue'),
          meta: {
            title: '店铺设置 - 栖所',
            requiresAuth: true,
            requiresMerchant: true
          }
        },
        // 默认重定向到仪表盘
        {
          path: '',
          redirect: '/merchant/dashboard'
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'), // 404页面（待开发）
      meta: {
        title: '页面不存在 - 栖所',
        requiresAuth: false
      }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    // 三端登录态互相独立：管理端看 adminToken、商家端看 merchantToken、其余看 userToken。
    // 不能再看全局的 loginType（谁最后登录谁说了算），否则管理员/商家登录态过期
    // 会被扔到【用户】登录页（见 @/utils/auth）
    const app: AuthApp = to.meta.requiresAdmin
      ? 'admin'
      : to.meta.requiresMerchant
        ? 'merchant'
        : 'user'

    if (getToken(app)) {
      next()
    } else {
      console.log(`未授权访问${app}页面，重定向到对应登录页`)
      next(loginPathOf(app))
    }
  } else {
    next()
  }
})

export default router
