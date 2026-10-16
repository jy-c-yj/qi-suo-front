<template>
  <div class="user-profile-container">
    <!-- 顶部导航栏 - 与主页保持一致 -->
    <header class="top-nav">
      <div class="nav-container">
        <div class="nav-left">
          <h1 class="logo" @click="goToHome">栖所</h1>
          <div class="user-info">
            <span class="username">{{ userInfo?.username || username }}</span>
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
          <div class="nav-item" @click="goToOrders">
            <el-icon class="nav-icon"><Document /></el-icon>
            <span>我的订单</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="profile-container">
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" @click="handleEdit">
                {{ isEditing ? '取消' : '编辑' }}
              </el-button>
            </div>
          </template>

          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>

          <div v-else-if="error" class="error-container">
            <el-icon class="error-icon"><Warning /></el-icon>
            <span>{{ error }}</span>
            <el-button @click="fetchUserInfo">重试</el-button>
          </div>

          <div v-else class="profile-content">
            <!-- 头像区域 -->
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <el-avatar 
                  :size="100" 
                  :src="editForm.imageUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                />
                <el-upload
                  v-if="isEditing"
                  class="avatar-uploader"
                  action="http://localhost:8080/api/file/upload"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :on-error="handleAvatarError"
                  :before-upload="beforeAvatarUpload"
                >
                  <el-button type="primary" size="small">更换头像</el-button>
                </el-upload>
              </div>
            </div>

            <!-- 信息表单 -->
            <el-form 
              v-if="editForm"
              :model="editForm" 
              :rules="rules"
              ref="formRef"
              label-width="100px"
              class="profile-form"
              :disabled="!isEditing"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="editForm.username" placeholder="请输入用户名" />
              </el-form-item>

              <el-form-item label="密码" prop="password">
                <el-input 
                  v-model="editForm.password" 
                  type="password" 
                  placeholder="请输入密码"
                  show-password
                />
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input v-model="editForm.phone" placeholder="请输入手机号" />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email" placeholder="请输入邮箱" />
              </el-form-item>

              <el-form-item label="头像URL" prop="imageUrl">
                <el-input v-model="editForm.imageUrl" placeholder="头像URL" />
              </el-form-item>
            </el-form>

            <!-- 保存按钮 -->
            <div v-if="isEditing" class="form-actions">
              <el-button type="primary" @click="handleSave" :loading="saving">
                保存修改
              </el-button>
              <el-button @click="handleCancel">取消</el-button>
            </div>
          </div>
        </el-card>

        <!-- 地址管理卡片 -->
        <el-card class="address-card">
          <template #header>
            <div class="card-header">
              <span>地址管理</span>
              <el-button type="primary" @click="handleAddAddress">
                新增地址
              </el-button>
            </div>
          </template>

          <div v-if="addressLoading" class="loading-container">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>

          <div v-else-if="addressList.length === 0" class="empty-container">
            <span>暂无地址信息</span>
          </div>

          <div v-else class="address-list">
            <div 
              v-for="address in addressList" 
              :key="address.id" 
              class="address-item"
            >
              <div class="address-content">
                <el-icon class="address-icon"><Location /></el-icon>
                <span class="address-text">{{ address.detailAddress }}</span>
              </div>
              <div class="address-actions">
                <el-button type="primary" link @click="handleEditAddress(address)">
                  编辑
                </el-button>
                <el-button type="danger" link @click="handleDeleteAddress(address.id)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </main>

    <!-- 地址编辑弹窗 -->
    <el-dialog 
      v-model="addressDialogVisible" 
      :title="addressForm.id ? '编辑地址' : '新增地址'"
      width="500px"
    >
      <el-form 
        :model="addressForm" 
        :rules="addressRules"
        ref="addressFormRef"
        label-width="80px"
      >
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input 
            v-model="addressForm.detailAddress" 
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAddress" :loading="addressSaving">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 底部信息 -->
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 栖所 - 您的家居生活首选</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, 
  Loading, 
  Warning,
  Location
} from '@element-plus/icons-vue'
import { getUserInformation, updateUserInformation, getUserAddress, addUserAddress, updateUserAddress, deleteUserAddress } from '@/api/user'
import { clearSession } from '@/utils/auth'
import type { UserInformationDVO, UserInformationUpdateDTO, UserAddressDVO, UserAddressDTO } from '@/types'

const router = useRouter()

// 用户信息
const userInfo = ref<UserInformationDVO | null>(null)
const username = ref(localStorage.getItem('username') || '')
const loading = ref(false)
const error = ref('')
const isEditing = ref(false)
const saving = ref(false)
const formRef = ref()

// 编辑表单
const editForm = ref<UserInformationUpdateDTO>({
  username: '',
  password: '',
  imageUrl: '',
  phone: '',
  email: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
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

// 地址管理相关
const addressList = ref<UserAddressDVO[]>([])
const addressLoading = ref(false)
const addressDialogVisible = ref(false)
const addressSaving = ref(false)
const addressFormRef = ref()
const addressForm = ref<UserAddressDTO>({
  id: null,
  detailAddress: ''
})

// 地址表单验证规则
const addressRules = {
  detailAddress: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '地址长度在 5 到 100 个字符', trigger: 'blur' }
  ]
}

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getUserInformation()
    if (response.code === 1 && response.data) {
      userInfo.value = response.data
      // 初始化编辑表单
      editForm.value = {
        username: response.data.username,
        password: response.data.password ? response.data.password.replace('{noop}', '') : '',
        imageUrl: response.data.imageUrl,
        phone: response.data.phone,
        email: response.data.email
      }
    } else {
      error.value = response.msg || '获取用户信息失败'
    }
  } catch (err: any) {
    console.error('获取用户信息失败:', err)
    error.value = err.message || '获取用户信息失败'
  } finally {
    loading.value = false
  }
}

// 编辑模式切换
const handleEdit = () => {
  if (isEditing.value) {
    // 取消编辑，重置表单
    handleCancel()
  } else {
    isEditing.value = true
  }
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  // 重置表单数据
  if (userInfo.value) {
    editForm.value = {
      username: userInfo.value.username,
      password: userInfo.value.password ? userInfo.value.password.replace('{noop}', '') : '',
      imageUrl: userInfo.value.imageUrl,
      phone: userInfo.value.phone,
      email: userInfo.value.email
    }
  }
}

// 保存修改
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    const response = await updateUserInformation(editForm.value)
    if (response.code === 1) {
      ElMessage.success('个人信息更新成功')
      isEditing.value = false
      // 重新获取用户信息
      await fetchUserInfo()
    } else {
      ElMessage.error(response.msg || '更新失败')
    }
  } catch (err: any) {
    console.error('更新用户信息失败:', err)
    ElMessage.error(err.message || '更新失败')
  } finally {
    saving.value = false
  }
}

// 头像上传成功
const handleAvatarSuccess = (response: any) => {
  if (response.code === 1 && response.data) {
    editForm.value.imageUrl = response.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.msg || '头像上传失败')
  }
}

// 头像上传失败
const handleAvatarError = () => {
  ElMessage.error('头像上传失败')
}

// 头像上传前验证
const beforeAvatarUpload = (file: any) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isJPG) {
    ElMessage.error('只支持 JPG/PNG 格式的图片')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
  }
  
  return isJPG && isLt2M
}

// 获取地址列表
const fetchAddressList = async () => {
  addressLoading.value = true
  try {
    const response = await getUserAddress()
    if (response.code === 1 && response.data) {
      addressList.value = response.data
    }
  } catch (err: any) {
    console.error('获取地址列表失败:', err)
    ElMessage.error(err.message || '获取地址列表失败')
  } finally {
    addressLoading.value = false
  }
}

// 新增地址
const handleAddAddress = () => {
  addressForm.value = {
    id: null,
    detailAddress: ''
  }
  addressDialogVisible.value = true
}

// 编辑地址
const handleEditAddress = (address: UserAddressDVO) => {
  addressForm.value = {
    id: address.id,
    detailAddress: address.detailAddress
  }
  addressDialogVisible.value = true
}

// 保存地址
const handleSaveAddress = async () => {
  if (!addressFormRef.value) return
  
  try {
    await addressFormRef.value.validate()
    addressSaving.value = true
    
    let response
    if (addressForm.value.id) {
      response = await updateUserAddress(addressForm.value)
    } else {
      response = await addUserAddress(addressForm.value)
    }
    
    if (response.code === 1) {
      ElMessage.success(addressForm.value.id ? '地址修改成功' : '地址添加成功')
      addressDialogVisible.value = false
      fetchAddressList()
    } else {
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (err: any) {
    console.error('保存地址失败:', err)
    ElMessage.error(err.message || '保存地址失败')
  } finally {
    addressSaving.value = false
  }
}

// 删除地址
const handleDeleteAddress = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await deleteUserAddress(id)
    if (response.code === 1) {
      ElMessage.success('地址删除成功')
      fetchAddressList()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (err: any) {
    if (err !== 'cancel') {
      console.error('删除地址失败:', err)
      ElMessage.error(err.message || '删除地址失败')
    }
  }
}

// 返回首页
const goToHome = () => {
  router.push('/')
}

// 跳转到我的订单
const goToOrders = () => {
  router.push('/user/orders')
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 清除登录信息（只清用户端，商家端/管理端的登录态不受影响）
    clearSession('user')
    
    ElMessage.success('退出登录成功')
    router.push('/login/user')
  }).catch(() => {
    // 取消退出
  })
}

// 页面加载时获取用户信息和地址列表
onMounted(() => {
  fetchUserInfo()
  fetchAddressList()
})
</script>

<style scoped>
/* 全局样式变量 - 浅棕色主题 */
.user-profile-container {
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
  
  min-height: 100vh;
  background-color: var(--bg-light);
}

/* 顶部导航栏 - 与主页保持一致 */
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo:hover {
  color: var(--primary-color);
  transform: translateY(-1px);
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 200px);
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  background-color: var(--white);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 15px;
}

.loading-icon,
.error-icon {
  font-size: 48px;
  color: var(--text-light);
}

.error-icon {
  color: #f56c6c;
}

.profile-content {
  padding: 20px;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar-uploader {
  text-align: center;
}

.profile-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--primary-hover);
}

/* 地址管理卡片 */
.address-card {
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  background-color: var(--white);
  margin-top: 24px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--bg-light);
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
}

.address-item:hover {
  box-shadow: var(--shadow);
}

.address-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.address-icon {
  font-size: 20px;
  color: var(--text-light);
}

.address-text {
  font-size: 15px;
  color: var(--text-color);
}

.address-actions {
  display: flex;
  gap: 8px;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-light);
  font-size: 14px;
}

/* 底部信息 */
.footer {
  background: var(--primary-color);
  color: var(--text-color);
  padding: 30px 20px;
  text-align: center;
  border-top: 1px solid var(--primary-hover);
}

.footer-content p {
  margin: 0;
  font-size: 14px;
  color: var(--text-light);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
  }

  .nav-right {
    gap: 15px;
    margin-top: 10px;
  }

  .main-content {
    padding: 20px 10px;
  }

  .profile-form {
    max-width: 100%;
  }
}
</style>
