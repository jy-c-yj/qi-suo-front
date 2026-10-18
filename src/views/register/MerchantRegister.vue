<template>
  <div class="merchant-register-container" :style="{ backgroundImage: `url(${backgroundImageUrl})` }">
    <!-- 背景装饰 -->
    <div class="register-bg">
      <div class="bg-pattern"></div>
    </div>
    
    <!-- 注册卡片 -->
    <el-card class="register-card" shadow="hover">
      <!-- 品牌信息 -->
      <div class="register-header">
        <h1 class="register-title">栖所</h1>
        <p class="register-subtitle">商家注册</p>
      </div>

      <!-- 店铺Logo上传区域 -->
      <div class="logo-upload-section">
        <h3 class="section-title">上传店铺Logo</h3>
        <div class="logo-upload-container">
          <el-upload
            class="logo-uploader"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :on-error="handleLogoError"
            :before-upload="beforeLogoUpload"
            :http-request="uploadLogo"
            accept=".jpg,.jpeg,.png"
          >
            <img v-if="shopLogoUrl" :src="shopLogoUrl" class="logo" />
            <el-icon v-else class="logo-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
          <p class="logo-hint">点击上传店铺Logo，支持 JPG、JPEG、PNG 格式</p>
        </div>
      </div>

      <!-- 注册表单 -->
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
      >
        <el-form-item prop="merchantName">
          <el-input
            v-model="registerForm.merchantName"
            placeholder="请输入商家名称"
            prefix-icon="OfficeBuilding"
            clearable
            :maxlength="50"
            :show-word-limit="true"
          />
        </el-form-item>

        <el-form-item prop="merchantPassword">
          <el-input
            v-model="registerForm.merchantPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入商家密码"
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

        <el-form-item prop="shopName">
          <el-input
            v-model="registerForm.shopName"
            placeholder="请输入店铺名称"
            prefix-icon="Shop"
            clearable
            :maxlength="50"
            :show-word-limit="true"
          />
        </el-form-item>

        <el-form-item prop="description">
          <el-input
            v-model="registerForm.description"
            type="textarea"
            placeholder="请输入店铺描述"
            :rows="3"
            prefix-icon="Document"
            clearable
            :maxlength="200"
            :show-word-limit="true"
          />
        </el-form-item>

        <el-form-item prop="contactName">
          <el-input
            v-model="registerForm.contactName"
            placeholder="请输入联系人姓名"
            prefix-icon="User"
            clearable
            :maxlength="20"
            :show-word-limit="true"
          />
        </el-form-item>

        <el-form-item prop="contactPhone">
          <el-input
            v-model="registerForm.contactPhone"
            placeholder="请输入联系电话"
            prefix-icon="Phone"
            clearable
            :maxlength="11"
            :show-word-limit="true"
          />
        </el-form-item>

        <el-form-item prop="contactEmail">
          <el-input
            v-model="registerForm.contactEmail"
            placeholder="请输入联系邮箱"
            prefix-icon="Message"
            clearable
            :maxlength="50"
            :show-word-limit="true"
          />
        </el-form-item>

        <el-form-item class="register-button-group">
          <el-button
            type="primary"
            size="default"
            :loading="registerLoading"
            @click="handleRegister"
            class="register-button"
          >
            {{ registerLoading ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>

        <!-- 登录链接 -->
        <div class="login-link">
          已有账户？<router-link to="/login">立即登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus, View, Hide, OfficeBuilding, Shop, Document, User, Phone, Message } from '@element-plus/icons-vue'
import { uploadFile, merchantRegister, getLoginBackgroundImage } from '@/api/user'
import type { MerchantRegisterDTO } from '@/types'

// 路由实例
const router = useRouter()

// 注册背景图片URL
const backgroundImageUrl = ref('')

// 表单引用
const registerFormRef = ref()

// 加载状态
const registerLoading = ref(false)
const logoUploadLoading = ref(false)

// 密码可见性状态
const showPassword = ref(false)

// 店铺Logo URL
const shopLogoUrl = ref('')

// 注册表单数据
const registerForm = reactive({
  merchantName: '',
  merchantPassword: '',
  shopName: '',
  shopLogoUrl: '',
  description: '',
  contactName: '',
  contactPhone: '',
  contactEmail: ''
})

// 表单验证规则
const registerRules = {
  merchantName: [
    { required: true, message: '请输入商家名称', trigger: 'blur' },
    { min: 2, max: 50, message: '商家名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  merchantPassword: [
    { required: true, message: '请输入商家密码', trigger: 'blur' },
    { min: 6, max: 20, message: '商家密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  shopName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 50, message: '店铺名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  shopLogoUrl: [
    { required: true, message: '请上传店铺Logo', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入店铺描述', trigger: 'blur' },
    { min: 10, max: 200, message: '店铺描述长度在 10 到 200 个字符', trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '联系人姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  contactEmail: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 上传Logo前的校验
const beforeLogoUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJpgOrPng) {
    ElMessage.error('上传Logo图片只能是 JPG、PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传Logo图片大小不能超过 2MB!')
    return false
  }
  logoUploadLoading.value = true
  return true
}

// 上传Logo
const uploadLogo = async (options: any) => {
  const file = options.file
  try {
    const response = await uploadFile(file)
    if (response.code === 1 && response.data) {
      shopLogoUrl.value = response.data
      registerForm.shopLogoUrl = response.data
      options.onSuccess(response)
    } else {
      throw new Error(response.msg || '上传Logo失败')
    }
  } catch (error: any) {
    options.onError(error)
    ElMessage.error(error.message || '上传Logo失败')
  } finally {
    logoUploadLoading.value = false
  }
}

// Logo上传成功处理
const handleLogoSuccess = () => {
  ElMessage.success('Logo上传成功')
}

// Logo上传失败处理
const handleLogoError = () => {
  ElMessage.error('Logo上传失败，请重试')
}

// 获取注册背景图片
const loadRegisterBackgroundImage = async () => {
  try {
    const response = await getLoginBackgroundImage()
    if (response.code === 1 && response.data && response.data.url) {
      backgroundImageUrl.value = response.data.url
    } else {
      console.error('获取注册背景图片失败:', response.msg)
      // 如果获取失败，使用默认背景图片
      backgroundImageUrl.value = `${import.meta.env.BASE_URL}images/login-bg.svg`
    }
  } catch (error) {
    console.error('获取注册背景图片失败:', error)
    // 如果获取失败，使用默认背景图片
    backgroundImageUrl.value = `${import.meta.env.BASE_URL}images/login-bg.svg`
  }
}

// 注册处理函数
const handleRegister = async () => {
  // 表单验证
  if (!registerFormRef.value) return
  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    // 防止重复提交
    if (registerLoading.value) return
    registerLoading.value = true

    // 调用注册API
    await merchantRegister(registerForm as MerchantRegisterDTO)

    // 注册成功处理
    ElMessage.success('注册成功，正在跳转到登录页面...')

    // 跳转到登录页面
    setTimeout(() => {
      router.push('/login/merchant')
    }, 1500)
  } catch (error: any) {
    // 注册失败处理
    console.error('注册失败:', error)
    const errorMessage = error.message || '注册失败，请检查输入信息'
    ElMessage.error(errorMessage)
  } finally {
    registerLoading.value = false
  }
}

// 组件挂载时加载背景图片
onMounted(() => {
  loadRegisterBackgroundImage()
})
</script>

<style scoped>
.merchant-register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 背景装饰 */
.register-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.03) 0%, transparent 50%);
}

/* 注册卡片 */
.register-card {
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 1;
  overflow: hidden;
  border: none;
}

/* 注册头部 */
.register-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 20px 0;
}

.register-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.register-subtitle {
  font-size: 16px;
  color: #718096;
  font-weight: 400;
}

/* Logo上传区域 */
.logo-upload-section {
  margin-bottom: 24px;
  padding: 0 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 12px;
}

.logo-upload-container {
  text-align: center;
}

.logo-uploader {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto 8px;
  border: 2px dashed #d1d5db;
  transition: all 0.3s ease;
}

.logo-uploader:hover {
  border-color: #667eea;
}

.logo-uploader-icon {
  font-size: 48px;
  color: #9ca3af;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-hint {
  font-size: 12px;
  color: #718096;
  margin: 0;
}

/* 注册表单 */
.register-form {
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

/* 注册按钮 */
.register-button-group {
  margin-top: 24px;
  margin-bottom: 16px;
}

.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
}

/* 登录链接 */
.login-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #718096;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .merchant-register-container {
    padding: 20px;
  }

  .register-card {
    max-width: 100%;
    border-radius: 12px;
  }

  .register-title {
    font-size: 28px;
  }

  .register-form {
    padding: 0 24px;
  }

  .logo-upload-section {
    padding: 0 24px;
  }
}

@media (max-width: 480px) {
  .register-title {
    font-size: 24px;
  }

  .register-subtitle {
    font-size: 14px;
  }

  .register-form {
    padding: 0 20px;
  }

  .logo-upload-section {
    padding: 0 20px;
  }

  .logo-uploader {
    width: 100px;
    height: 100px;
  }
}
</style>