<template>
  <div class="merchant-settings">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>店铺设置</h2>
    </div>

    <!-- 店铺信息设置 -->
    <div class="settings-section">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <h3>店铺基本信息</h3>
          </div>
        </template>
        <el-form ref="settingsFormRef" :model="settingsForm" :rules="settingsRules" class="settings-form">
          <!-- 店铺Logo上传 -->
          <el-form-item prop="shopLogoUrl">
            <label class="form-label">店铺Logo</label>
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
                <img v-if="settingsForm.shopLogoUrl" :src="settingsForm.shopLogoUrl" class="logo" />
                <el-icon v-else class="logo-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
              <p class="logo-hint">点击上传店铺Logo，支持 JPG、JPEG、PNG 格式</p>
            </div>
          </el-form-item>

          <el-form-item prop="shopName">
            <label class="form-label">店铺名称</label>
            <el-input v-model="settingsForm.shopName" placeholder="请输入店铺名称" clearable :maxlength="50" :show-word-limit="true" />
          </el-form-item>

          <el-form-item prop="description">
            <label class="form-label">店铺描述</label>
            <el-input v-model="settingsForm.description" type="textarea" placeholder="请输入店铺描述" :rows="3" clearable :maxlength="200" :show-word-limit="true" />
          </el-form-item>

          <el-form-item prop="contactName">
            <label class="form-label">联系人姓名</label>
            <el-input v-model="settingsForm.contactName" placeholder="请输入联系人姓名" clearable :maxlength="20" :show-word-limit="true" />
          </el-form-item>

          <el-form-item prop="contactPhone">
            <label class="form-label">联系电话</label>
            <el-input v-model="settingsForm.contactPhone" placeholder="请输入联系电话" clearable :maxlength="11" :show-word-limit="true" />
          </el-form-item>

          <el-form-item prop="contactEmail">
            <label class="form-label">联系邮箱</label>
            <el-input v-model="settingsForm.contactEmail" placeholder="请输入联系邮箱" clearable :maxlength="50" :show-word-limit="true" />
          </el-form-item>

          <el-form-item class="form-buttons">
            <el-button type="primary" size="default" @click="handleSaveSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 密码设置 -->
    <div class="settings-section">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <h3>密码设置</h3>
          </div>
        </template>
        <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" class="settings-form">
          <el-form-item prop="oldPassword">
            <label class="form-label">旧密码</label>
            <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" clearable />
          </el-form-item>

          <el-form-item prop="newPassword">
            <label class="form-label">新密码</label>
            <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" clearable />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <label class="form-label">确认新密码</label>
            <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" clearable />
          </el-form-item>

          <el-form-item class="form-buttons">
            <el-button type="primary" size="default" @click="handleChangePassword">修改密码</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { uploadFile, updateMerchantInformation, getMerchantInformation } from '@/api/user'

// 表单引用
const settingsFormRef = ref()
const passwordFormRef = ref()

// 加载状态
const logoUploadLoading = ref(false)
const loading = ref(false)

// 当前商家信息
const currentMerchantInfo = ref<{
  merchantId: number
  merchantName: string
  merchantPassword: string
} | null>(null)

// 店铺设置表单
const settingsForm = reactive({
  shopLogoUrl: '',
  shopName: '',
  description: '',
  contactName: '',
  contactPhone: '',
  contactEmail: ''
})

// 密码设置表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const settingsRules = {
  shopLogoUrl: [
    { required: true, message: '请上传店铺Logo', trigger: 'change' }
  ],
  shopName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 50, message: '店铺名称长度在 2 到 50 个字符', trigger: 'blur' }
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

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '新密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
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
    if (response.code === 1 && response.msg) {
      settingsForm.shopLogoUrl = response.msg
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

// 保存店铺设置
const handleSaveSettings = async () => {
  if (!settingsFormRef.value) return
  try {
    const valid = await settingsFormRef.value.validate()
    if (!valid) return

    // 构建更新商家信息的数据
    const updateData = {
      merchantId: currentMerchantInfo.value?.merchantId || 0,
      merchantName: currentMerchantInfo.value?.merchantName || '',
      merchantPassword: currentMerchantInfo.value?.merchantPassword || '',
      shopName: settingsForm.shopName,
      shopLogoUrl: settingsForm.shopLogoUrl,
      description: settingsForm.description,
      contactName: settingsForm.contactName,
      contactPhone: settingsForm.contactPhone,
      contactEmail: settingsForm.contactEmail,
      updateTime: new Date().toISOString(),
      updateBy: currentMerchantInfo.value?.merchantId || 0
    }

    // 调用后端API保存设置
    const response = await updateMerchantInformation(updateData)
    if (response.code === 1) {
      ElMessage.success('店铺设置保存成功')
    } else {
      ElMessage.error(response.msg || '保存店铺设置失败')
    }
  } catch (error: any) {
    console.error('保存店铺设置失败:', error)
    ElMessage.error('保存店铺设置失败，请重试')
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return

    // 这里可以调用后端API修改密码
    console.log('修改密码:', passwordForm)
    ElMessage.success('密码修改成功')
    // 重置密码表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error: any) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败，请重试')
  }
}

// 组件挂载时初始化
onMounted(async () => {
  try {
    loading.value = true
    // 从后端获取店铺设置数据
    const response = await getMerchantInformation()
    if (response.code === 1 && response.data) {
      const merchantInfo = response.data
      // 保存商家基本信息，用于更新时使用
      currentMerchantInfo.value = {
        merchantId: merchantInfo.merchantId,
        merchantName: merchantInfo.merchantName,
        merchantPassword: merchantInfo.merchantPassword
      }
      // 更新表单数据
      settingsForm.shopName = merchantInfo.shopName || ''
      settingsForm.description = merchantInfo.description || ''
      settingsForm.contactName = merchantInfo.contactName || ''
      settingsForm.contactPhone = merchantInfo.contactPhone || ''
      settingsForm.contactEmail = merchantInfo.contactEmail || ''
      settingsForm.shopLogoUrl = merchantInfo.shopLogoUrl || ''
    } else {
      ElMessage.error(response.msg || '获取店铺信息失败')
      // 使用默认模拟数据
      settingsForm.shopName = '栖所家居'
      settingsForm.description = '专注于现代简约风格的家居用品，为您的生活增添美感'
      settingsForm.contactName = '张三'
      settingsForm.contactPhone = '13800138000'
      settingsForm.contactEmail = 'contact@qisuo.com'
      settingsForm.shopLogoUrl = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20home%20decor%20logo&image_size=square'
    }
  } catch (error: any) {
    console.error('获取店铺信息失败:', error)
    ElMessage.error('获取店铺信息失败，请重试')
    // 使用默认模拟数据
    settingsForm.shopName = '栖所家居'
    settingsForm.description = '专注于现代简约风格的家居用品，为您的生活增添美感'
    settingsForm.contactName = '张三'
    settingsForm.contactPhone = '13800138000'
    settingsForm.contactEmail = 'contact@qisuo.com'
    settingsForm.shopLogoUrl = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20home%20decor%20logo&image_size=square'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.merchant-settings {
  width: 100%;
}

/* 页面标题 */
.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

/* 设置区域 */
.settings-section {
  margin-bottom: 30px;
}

.settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

/* 设置表单 */
.settings-form {
  margin-top: 20px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 8px;
  display: block;
}

/* Logo上传区域 */
.logo-upload-container {
  margin-bottom: 20px;
}

.logo-uploader {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
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

/* 表单按钮 */
.form-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-buttons {
    justify-content: center;
  }

  .logo-uploader {
    width: 100px;
    height: 100px;
  }
}
</style>