<template>
  <div class="login-container" :style="{ backgroundImage: `url(${backgroundImageUrl})` }">
    <!-- 背景装饰 -->
    <div class="login-bg">
      <div class="bg-pattern"></div>
    </div>

    <!-- 登录卡片 -->
    <el-card class="login-card" shadow="hover">
      <!-- 品牌信息 -->
      <div class="login-header">
        <h1 class="login-title">栖所</h1>
        <p class="login-subtitle" :style="{ color: roleConfig.accent }">{{ roleConfig.subtitle }}</p>
      </div>

      <!-- 身份切换 -->
      <div class="role-tabs" role="tablist" aria-label="登录身份">
        <button
          v-for="role in roles"
          :key="role.app"
          type="button"
          class="role-tab"
          :class="{ active: role.app === app }"
          :style="role.app === app ? { color: role.accent, borderColor: role.accent } : undefined"
          :disabled="loading"
          role="tab"
          :aria-selected="role.app === app"
          @click="switchRole(role.app)"
        >
          <el-icon><component :is="role.icon" /></el-icon>
          <span>{{ role.label }}</span>
        </button>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="account">
          <el-input
            v-model="loginForm.account"
            :placeholder="roleConfig.accountPlaceholder"
            :prefix-icon="roleConfig.accountIcon"
            clearable
            :maxlength="roleConfig.accountMax"
            :show-word-limit="true"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="roleConfig.passwordPlaceholder"
            prefix-icon="Lock"
            clearable
            :maxlength="20"
            :show-word-limit="true"
          >
            <template #suffix>
              <el-icon @click="showPassword = !showPassword" class="password-toggle">
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 验证码 -->
        <el-form-item prop="inputCode" required>
          <div class="captcha-field">
            <el-input
              v-model="loginForm.inputCode"
              placeholder="请输入验证码"
              prefix-icon="DocumentCopy"
              clearable
              :maxlength="6"
              class="captcha-input"
            />
            <div class="captcha-container" :class="{ 'is-expired': captchaExpired }">
              <img
                v-if="captchaImage"
                :src="`data:image/png;base64,${captchaImage}`"
                alt="验证码"
                role="button"
                tabindex="0"
                @click="refreshCaptcha"
                @keydown.enter.prevent="refreshCaptcha"
              />
              <div v-else class="captcha-placeholder" @click="refreshCaptcha">
                {{ captchaLoading ? '加载中' : '点击刷新' }}
              </div>
              <span
                v-if="captchaExpired"
                class="captcha-expired-mask"
                @click="refreshCaptcha"
              >
                已过期
              </span>
            </div>
            <el-icon
              class="refresh-icon"
              :class="{ spinning: captchaLoading }"
              @click="refreshCaptcha"
            >
              <RefreshRight />
            </el-icon>
          </div>
          <div class="captcha-hint" :class="{ expired: captchaExpired }">
            {{ captchaHint }}
          </div>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item class="login-button-group">
          <el-button
            type="primary"
            size="default"
            :loading="loading"
            :disabled="loading || !captchaID"
            @click="handleLogin"
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <!-- 注册链接 -->
        <div v-if="roleConfig.registerTo" class="register-link">
          {{ roleConfig.registerText }}
          <router-link :to="roleConfig.registerTo">{{ roleConfig.registerLinkText }}</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  OfficeBuilding,
  Setting,
  View,
  Hide,
  RefreshRight
} from '@element-plus/icons-vue'
import {
  login,
  merchantLogin,
  adminLogin,
  generateCaptcha,
  verifyCaptcha,
  getLoginBackgroundImage
} from '@/api/user'
import { loginPathOf, saveSession } from '@/utils/auth'
import type { AuthApp } from '@/utils/auth'

interface RoleConfig {
  app: AuthApp
  label: string
  subtitle: string
  /** 该身份的主题色，沿用原登录页的副标题/悬停色 */
  accent: string
  accountIcon: string
  accountPlaceholder: string
  accountLabel: string
  accountMin: number
  accountMax: number
  passwordPlaceholder: string
  homePath: string
  /** 登录页默认填充的种子账号 */
  defaultAccount: string
  defaultPassword: string
  registerText?: string
  registerTo?: string
  registerLinkText?: string
}

const roles: Array<RoleConfig & { icon: Component }> = [
  {
    app: 'user',
    label: '用户',
    subtitle: '用户登录',
    accent: '#667eea',
    icon: User,
    accountIcon: 'User',
    accountPlaceholder: '请输入用户名',
    accountLabel: '用户名',
    accountMin: 3,
    accountMax: 20,
    passwordPlaceholder: '请输入密码',
    homePath: '/home',
    defaultAccount: 'cyj',
    defaultPassword: '123456',
    registerText: '还没有账户？',
    registerTo: '/register',
    registerLinkText: '前往注册'
  },
  {
    app: 'merchant',
    label: '商家',
    subtitle: '商家登录',
    accent: '#764ba2',
    icon: OfficeBuilding,
    accountIcon: 'OfficeBuilding',
    accountPlaceholder: '请输入商家名称',
    accountLabel: '商家名称',
    accountMin: 2,
    accountMax: 50,
    passwordPlaceholder: '请输入商家密码',
    homePath: '/merchant',
    defaultAccount: 'merchant001',
    defaultPassword: '123456',
    registerText: '还没有商家账户？',
    registerTo: '/merchant-register',
    registerLinkText: '商家注册'
  },
  {
    app: 'admin',
    label: '管理员',
    subtitle: '管理员登录',
    accent: '#f56565',
    icon: Setting,
    accountIcon: 'User',
    accountPlaceholder: '请输入管理员用户名',
    accountLabel: '管理员用户名',
    accountMin: 3,
    accountMax: 20,
    passwordPlaceholder: '请输入管理员密码',
    homePath: '/admin/image/background',
    defaultAccount: 'admin',
    defaultPassword: '123456'
  }
]

const CAPTCHA_TTL = 60

const route = useRoute()
const router = useRouter()

const loginFormRef = ref()

const loading = ref(false)
const showPassword = ref(false)

const loginForm = reactive({
  account: '',
  password: '',
  inputCode: ''
})

// 三条登录路由复用同一个组件，身份由 route.meta.loginApp 决定
const app = computed<AuthApp>(() => (route.meta.loginApp as AuthApp | undefined) ?? 'user')
const roleConfig = computed<RoleConfig>(
  () => roles.find((role) => role.app === app.value) ?? roles[0]!
)

const loginRules = computed(() => ({
  account: [
    {
      required: true,
      message: `请输入${roleConfig.value.accountLabel}`,
      trigger: 'blur'
    },
    {
      min: roleConfig.value.accountMin,
      max: roleConfig.value.accountMax,
      message: `${roleConfig.value.accountLabel}长度在 ${roleConfig.value.accountMin} 到 ${roleConfig.value.accountMax} 个字符`,
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  inputCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度在 4 到 6 个字符', trigger: 'blur' }
  ]
}))

// 验证码状态
const captchaImage = ref('')
const captchaID = ref('')
const captchaLoading = ref(false)
const secondsLeft = ref(0)
const captchaExpired = computed(() => !!captchaImage.value && secondsLeft.value <= 0)

let countdownTimer: number | null = null
let captchaSeq = 0

const stopCountdown = () => {
  if (countdownTimer !== null) {
    window.clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const startCountdown = () => {
  stopCountdown()
  secondsLeft.value = CAPTCHA_TTL
  countdownTimer = window.setInterval(() => {
    secondsLeft.value -= 1
    if (secondsLeft.value <= 0) {
      stopCountdown()
    }
  }, 1000)
}

const captchaHint = computed(() => {
  if (captchaLoading.value) return '验证码加载中...'
  if (!captchaImage.value) return '验证码加载失败，点击刷新重试'
  if (secondsLeft.value <= 0) return '验证码已过期，请点击图片刷新'
  return `验证码 ${secondsLeft.value} 秒后过期`
})

const getCaptcha = async () => {
  // 快速连点或切换身份时，只接受最后一次请求的结果
  const seq = ++captchaSeq
  captchaLoading.value = true
  try {
    const response = await generateCaptcha()
    if (seq !== captchaSeq) return
    if (response.code !== 1 || !response.data) {
      throw new Error(response.msg || '生成验证码失败')
    }
    captchaImage.value = response.data.base64Image
    captchaID.value = response.data.captchaID
    startCountdown()
  } catch (error: any) {
    if (seq !== captchaSeq) return
    captchaImage.value = ''
    captchaID.value = ''
    secondsLeft.value = 0
    stopCountdown()
    console.error('生成验证码失败:', error)
    ElMessage.error(error.response?.data?.msg || error.message || '生成验证码失败，请稍后重试')
  } finally {
    if (seq === captchaSeq) {
      captchaLoading.value = false
    }
  }
}

const refreshCaptcha = () => {
  if (captchaLoading.value) return
  loginForm.inputCode = ''
  getCaptcha()
}

// 登录背景图片
const backgroundImageUrl = ref('')

const loadLoginBackgroundImage = async () => {
  try {
    const response = await getLoginBackgroundImage()
    if (response.code === 1 && response.data && response.data.url) {
      backgroundImageUrl.value = response.data.url
    } else {
      backgroundImageUrl.value = `${import.meta.env.BASE_URL}images/login-bg.svg`
    }
  } catch (error) {
    backgroundImageUrl.value = `${import.meta.env.BASE_URL}images/login-bg.svg`
  }
}

// 切换身份只改 URL，三端登录态与路由守卫逻辑保持不变
const switchRole = (next: AuthApp) => {
  if (next === app.value || loading.value) return
  router.replace(loginPathOf(next))
}

// 路由复用组件时 onMounted 不会再次执行，身份重置与验证码生成放在这里
watch(
  () => route.path,
  (path) => {
    if (!path.startsWith('/login')) return
    // 切换身份时填入该身份的种子账号，便于直接登录
    loginForm.account = roleConfig.value.defaultAccount
    loginForm.password = roleConfig.value.defaultPassword
    loginForm.inputCode = ''
    showPassword.value = false
    nextTick(() => loginFormRef.value?.clearValidate())
    getCaptcha()
  },
  { immediate: true }
)

const handleLogin = async () => {
  if (!loginFormRef.value || loading.value) return

  // 校验失败时 Element Plus 会 reject，这里单独捕获，避免误报“登录失败”并刷新验证码
  try {
    await loginFormRef.value.validate()
  } catch {
    return
  }

  try {
    if (captchaExpired.value) {
      ElMessage.warning('验证码已过期，请刷新后重试')
      refreshCaptcha()
      return
    }
    if (!captchaID.value) {
      ElMessage.warning('请先获取验证码')
      refreshCaptcha()
      return
    }

    loading.value = true

    // 验证码先校验并立即作废，登录失败时统一换一张
    const verifyResult = await verifyCaptcha({
      inputCode: loginForm.inputCode,
      captchaID: captchaID.value
    })
    if (verifyResult.code !== 1) {
      throw new Error(verifyResult.msg || '验证码校验失败')
    }

    let response
    if (app.value === 'merchant') {
      response = await merchantLogin({
        merchantName: loginForm.account,
        merchantPassword: loginForm.password
      })
    } else if (app.value === 'admin') {
      response = await adminLogin({
        username: loginForm.account,
        password: loginForm.password
      })
    } else {
      response = await login({
        username: loginForm.account,
        password: loginForm.password
      })
    }

    if (response.code !== 1) {
      throw new Error(response.msg || '登录失败')
    }
    if (!response.data) {
      throw new Error('登录响应数据为空')
    }

    saveSession(
      app.value,
      response.data.access_token,
      response.data.refresh_token_key,
      loginForm.account,
      response.data.id,
      response.data.roles
    )
    ElMessage.success('登录成功')
    await router.push(roleConfig.value.homePath)
  } catch (error: any) {
    console.error('登录失败:', error)
    const errorMessage = error.response?.data?.msg || error.message || '登录失败，请检查输入信息'
    ElMessage.error(errorMessage)
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLoginBackgroundImage()
})

onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 24px 16px;
  box-sizing: border-box;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

/* 背景装饰 */
.login-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.bg-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.08) 0%, transparent 50%);
}

/* 登录卡片 */
.login-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 1;
  overflow: hidden;
  border: none;
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 18px;
  padding: 20px 0 0;
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px;
  letter-spacing: 2px;
}

.login-subtitle {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  transition: color 0.25s ease;
}

/* 身份切换 */
.role-tabs {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 0 24px;
  margin-bottom: 18px;
}

.role-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 6px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #909399;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.role-tab:hover:not(:disabled) {
  color: #606266;
  background: rgba(0, 0, 0, 0.02);
}

.role-tab.active {
  font-weight: 600;
}

.role-tab:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* 登录表单 */
.login-form {
  padding: 0 32px;
}

/* 密码切换按钮 */
.password-toggle {
  cursor: pointer;
  color: #909399;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #667eea;
}

/* 验证码 */
.captcha-field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.captcha-input {
  flex: 1;
  min-width: 0;
}

.captcha-container {
  position: relative;
  width: 104px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f7fa;
}

.captcha-container img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.captcha-container:hover img {
  opacity: 0.9;
}

.captcha-container.is-expired img {
  opacity: 0.25;
}

.captcha-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
}

.captcha-expired-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #f56565;
  background: rgba(255, 255, 255, 0.55);
}

.refresh-icon {
  flex-shrink: 0;
  font-size: 18px;
  color: #909399;
  cursor: pointer;
  transition: color 0.3s ease;
}

.refresh-icon:hover {
  color: #667eea;
}

.refresh-icon.spinning {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.captcha-hint {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.2;
  color: #909399;
  transition: color 0.25s ease;
}

.captcha-hint.expired {
  color: #f56565;
}

/* 登录按钮 */
.login-button-group {
  margin-top: 22px;
  margin-bottom: 0;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-button:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-button:active:not(.is-disabled) {
  transform: translateY(0);
}

/* 注册链接 */
.register-link {
  text-align: center;
  margin-top: 16px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
}

.register-link a {
  color: #764ba2;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-card {
    max-width: calc(100% - 8px);
  }

  .login-form {
    padding: 0 24px;
  }

  .role-tabs {
    padding: 0 20px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 16px 10px;
  }

  .login-title {
    font-size: 28px;
  }

  .login-form {
    padding: 0 18px;
  }

  .role-tabs {
    padding: 0 14px;
  }

  .captcha-container {
    width: 92px;
  }

  .login-button {
    height: 42px;
  }
}
</style>
