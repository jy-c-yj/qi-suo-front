<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="register-bg">
      <div class="bg-pattern"></div>
    </div>
    
    <!-- 注册卡片 -->
    <el-card class="register-card" shadow="hover">
      <!-- 品牌信息 -->
      <div class="register-header">
        <h1 class="register-title">栖所</h1>
        <p class="register-subtitle">创建您的账户</p>
      </div>

      <!-- 头像上传区域 -->
      <div class="avatar-upload-section">
        <h3 class="section-title">上传头像</h3>
        <div class="avatar-upload-container">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :on-error="handleAvatarError"
            :before-upload="beforeAvatarUpload"
            :http-request="uploadAvatar"
            accept=".jpg,.jpeg"
          >
            <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
          <p class="avatar-hint">点击上传头像，支持 JPG、JPEG 格式</p>
        </div>
      </div>

      <!-- 注册表单 -->
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
            :maxlength="20"
            :show-word-limit="true"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            clearable
            :maxlength="20"
            :show-word-limit="true"
          />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            prefix-icon="Phone"
            clearable
            :maxlength="11"
            :show-word-limit="true"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
            clearable
            :maxlength="50"
            :show-word-limit="true"
          />
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item class="register-button-group">
          <el-button
            type="primary"
            size="default"
            :loading="registerLoading"
            :disabled="!avatarUrl || registerLoading"
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
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus, User, Lock, Phone, Message } from '@element-plus/icons-vue'
import { uploadFile, register } from '@/api/user'
import type { UserRegisterDTO } from '@/types'

// 路由实例
const router = useRouter()

// 表单引用
const registerFormRef = ref()

// 加载状态
const registerLoading = ref(false)
const avatarUploadLoading = ref(false)

// 头像URL
const avatarUrl = ref('')

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  phone: '',
  email: '',
  imageUrl: ''
})

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 头像上传前的校验
const beforeAvatarUpload = (file: File) => {
  const isJpg = file.type === 'image/jpeg' || file.type === 'image/jpg'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJpg) {
    ElMessage.error('只能上传 JPG、JPEG 格式的图片！')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB！')
  }
  return isJpg && isLt2M
}

// 自定义头像上传
const uploadAvatar = async (options: any) => {
  const { file } = options
  avatarUploadLoading.value = true
  
  try {
    const response = await uploadFile(file)
    options.onSuccess(response)
  } catch (error: any) {
    options.onError(error)
  } finally {
    avatarUploadLoading.value = false
  }
}

// 头像上传成功处理
const handleAvatarSuccess = (response: any) => {
  avatarUrl.value = response.data
  registerForm.imageUrl = response.data
  ElMessage.success('头像上传成功')
}

// 头像上传失败处理
const handleAvatarError = (error: any) => {
  ElMessage.error('头像上传失败，请稍后重试')
  console.error('头像上传失败:', error)
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
    await register(registerForm as UserRegisterDTO)

    // 注册成功处理
    ElMessage.success('注册成功，正在跳转到登录页面...')

    // 跳转到登录页面
    setTimeout(() => {
      router.push('/login/user')
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
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: url('/images/login-bg.svg') no-repeat center center fixed;
  background-size: cover;
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
  max-width: 420px;
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
  font-size: 14px;
  color: #718096;
  font-weight: 400;
}

/* 头像上传区域 */
.avatar-upload-section {
  margin-bottom: 32px;
  padding: 0 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
  text-align: center;
}

.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.avatar-uploader:hover {
  border-color: #667eea;
}

.avatar-uploader-icon {
  font-size: 48px;
  color: #909399;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-hint {
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

/* 注册表单 */
.register-form {
  padding: 0 32px;
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
  .register-container {
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

  .avatar-upload-section {
    padding: 0 24px;
  }
}

@media (max-width: 480px) {
  .register-title {
    font-size: 24px;
  }

  .register-subtitle {
    font-size: 12px;
  }

  .register-form {
    padding: 0 20px;
  }

  .avatar-upload-section {
    padding: 0 20px;
  }

  .avatar-uploader {
    width: 100px;
    height: 100px;
  }
}
</style>