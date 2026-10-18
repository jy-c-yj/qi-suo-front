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
        <p class="login-subtitle">用户登录</p>
      </div>



      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
            :maxlength="20"
            :show-word-limit="true"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
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

        <!-- 验证码字段 -->
        <el-form-item prop="inputCode" required>
          <el-row :gutter="12">
            <el-col :span="14">
              <el-input
                v-model="loginForm.inputCode"
                placeholder="请输入验证码"
                prefix-icon="DocumentCopy"
                clearable
                :maxlength="6"
                :show-word-limit="true"
              />
            </el-col>
            <el-col :span="10">
              <div class="captcha-container">
                <img
                  :src="`data:image/png;base64,${captchaImage}`"
                  :alt="'验证码'"
                  class="captcha-image"
                  @click="refreshCaptcha"
                />
                <div class="captcha-refresh">
                  <el-icon @click="refreshCaptcha" class="refresh-icon">
                    <RefreshRight />
                  </el-icon>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item class="login-button-group">
          <el-button
            type="primary"
            size="default"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <!-- 注册链接 -->
        <div class="register-link">
          还没有账户？<router-link to="/register">前往注册</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { login, generateCaptcha, verifyCaptcha, getLoginBackgroundImage } from '@/api/user'
import { saveSession } from '@/utils/auth'
import { View, Hide, DocumentCopy, RefreshRight } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 表单引用
const loginFormRef = ref()

// 加载状态
const loading = ref(false)

// 密码可见性状态
const showPassword = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  inputCode: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  inputCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度在 4 到 6 个字符', trigger: 'blur' }
  ]
}

// 验证码图片的base64编码
const captchaImage = ref('')

// 验证码ID
const captchaID = ref('')

// 登录背景图片URL
const backgroundImageUrl = ref('')

// 生成验证码
const getCaptcha = async () => {
  try {
    const response = await generateCaptcha()
    captchaImage.value = response.data.base64Image
    captchaID.value = response.data.captchaID
  } catch (error) {
    console.error('生成验证码失败:', error)
    ElMessage.error('生成验证码失败，请稍后重试')
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha()
}

// 获取登录背景图片
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

// 登录处理函数
const handleLogin = async () => {
  if (!loginFormRef.value) return
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    if (loading.value) return
    loading.value = true

    const verifyResult = await verifyCaptcha({
      inputCode: loginForm.inputCode,
      captchaID: captchaID.value
    })
    if (verifyResult.code !== 1) {
      throw new Error(verifyResult.msg || '验证码校验失败')
    }

    const response = await login({
      username: loginForm.username,
      password: loginForm.password
    })

    if (response.code !== 1) {
      throw new Error(response.msg || '登录失败')
    }

    ElMessage.success('登录成功')

    if (!response.data) {
      throw new Error('登录响应数据为空')
    }

    saveSession('user', response.data.access_token, response.data.refresh_token_key, loginForm.username)

    await router.push('/home')
  } catch (error: any) {
    console.error('登录失败:', error)
    const errorMessage = error.response?.data?.msg || error.message || '登录失败，请检查输入信息'
    ElMessage.error(errorMessage)
    // 验证码校验通过后即作废；任何一次登录失败都换一张，
    // 避免重试时继续使用已经被消费的 captchaID
    refreshCaptcha()
    loginForm.inputCode = ''
  } finally {
    loading.value = false
  }
}

// 组件挂载时生成验证码和加载背景图片
onMounted(() => {
  getCaptcha()
  loadLoginBackgroundImage()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
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
  max-width: 420px;
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
  margin-bottom: 24px;
  padding: 20px 0 10px;
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.login-subtitle {
  font-size: 16px;
  color: #667eea;
  font-weight: 500;
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

/* 验证码样式 */
.captcha-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.captcha-image {
  width: 100px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.captcha-image:hover {
  opacity: 0.9;
}

.captcha-refresh {
  cursor: pointer;
  color: #909399;
  transition: color 0.3s ease;
}

.captcha-refresh:hover {
  color: #667eea;
}

.refresh-icon {
  font-size: 18px;
}

/* 登录按钮 */
.login-button-group {
  margin-top: 24px;
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

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-button:active {
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
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>