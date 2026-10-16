<template>
  <div class="module-container">
    <div class="module-header">
      <h2 class="module-title">管理员管理</h2>
      <p class="module-description">管理系统中的管理员账号信息</p>
    </div>
    
    <div class="module-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAddAdmin">添加管理员</el-button>
      </div>
      
      <!-- 管理员列表 -->
      <div class="admin-list-section">
        <el-table v-loading="loading" :data="adminList" style="width: 100%">
          <el-table-column prop="adminName" label="用户名" />
          <el-table-column prop="phone" label="联系电话" width="150" />
          <el-table-column prop="adminType" label="管理员类型" width="120">
            <template #default="scope">
              <el-tag :type="getAdminTypeTagType(scope.row.adminType)">
                {{ getAdminTypeName(scope.row.adminType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column prop="updateTime" label="更新时间" width="180" />
          <el-table-column prop="createBy" label="创建人" width="120" />
          <el-table-column prop="updateBy" label="更新人" width="120" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row.adminId)" style="margin-left: 8px">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    
    <!-- 编辑窗口 -->
    <el-dialog
      v-model="dialogVisible"
      :title="'编辑管理员 - ' + (editForm.adminName || '')"
      width="500px"
    >
      <el-form :model="editForm" label-width="120px">
        <!-- 基本信息 -->
        <el-form-item label="管理员ID">
          <el-input v-model="editForm.adminId" disabled />
        </el-form-item>
        <el-form-item label="用户名" prop="adminName">
          <el-input v-model="editForm.adminName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="管理员类型" prop="adminType">
          <el-select v-model="editForm.adminType" placeholder="请选择管理员类型">
            <el-option label="普通管理员" :value="1" />
            <el-option label="超级管理员" :value="2" />
            <el-option label="系统管理员" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-tag :type="editForm.status === 1 ? 'success' : 'info'">
            {{ editForm.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input v-model="editForm.createTime" disabled />
        </el-form-item>
        <el-form-item label="更新时间">
          <el-input v-model="editForm.updateTime" disabled />
        </el-form-item>
        <el-form-item label="创建人">
          <el-input v-model="editForm.createBy" disabled />
        </el-form-item>
        <el-form-item label="更新人">
          <el-input v-model="editForm.updateBy" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateAdmin">保存修改</el-button>
          <el-button v-if="editForm.status === 0" type="success" @click="handleEnableAdmin">启用</el-button>
          <el-button v-else type="warning" @click="handleDisableAdmin">禁用</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 新增管理员窗口 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增管理员"
      width="500px"
    >
      <el-form :model="addForm" label-width="120px">
        <el-form-item label="管理员名" prop="adminName">
          <el-input v-model="addForm.adminName" placeholder="请输入管理员名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="管理员类型" prop="adminType">
          <el-select v-model="addForm.adminType" placeholder="请选择管理员类型">
            <el-option label="普通管理员" :value="1" />
            <el-option label="超级管理员" :value="2" />
            <el-option label="系统管理员" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddAdminSubmit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminList, updateAdmin, setAdminIsEnabled, setAdminNotEnabled, newAdmin, deleteAdmin } from '@/api/user'
import type { AdminDVO, AdminDTO, NewAdminDTO } from '@/types'

// 加载状态
const loading = ref(false)

// 管理员列表数据
const adminList = ref<AdminDVO[]>([])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 编辑窗口相关
const dialogVisible = ref(false)
const editForm = ref<AdminDTO>({
  id: 0,
  adminId: 0,
  username: '',
  adminName: '',
  password: '',
  phone: '',
  email: '',
  status: 1,
  adminType: 1,
  createTime: '',
  updateTime: '',
  createBy: '',
  updateBy: ''
})

// 新增管理员窗口相关
const addDialogVisible = ref(false)
const addForm = ref<NewAdminDTO>({
  username: '',
  adminName: '',
  password: '',
  phone: '',
  email: '',
  adminType: 1
})

// 保存原始数据，用于比较是否修改过
const originalData = ref<AdminDVO | null>(null)

// 加载管理员列表
const loadAdminList = async () => {
  loading.value = true
  try {
    const response = await getAdminList({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response.code === 1) {
      // 处理后端返回的数据，兼容 rows 字段
      adminList.value = response.data.rows || response.data.records || []
      total.value = response.data.total || 0
    } else {
      // 显示后端返回的错误信息
      ElMessage.error(response.msg || '获取管理员列表失败')
      adminList.value = []
      total.value = 0
    }
  } catch (error: any) {
    console.error('获取管理员列表失败:', error)
    ElMessage.error(error.message || '获取管理员列表失败')
    adminList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadAdminList()
}

// 处理当前页码变化
const handleCurrentChange = (current: number) => {
  currentPage.value = current
  loadAdminList()
}

// 处理编辑
const handleEdit = (row: AdminDVO) => {
  // 保存原始数据，用于比较是否修改过
  originalData.value = { ...row }
  
  // 将选中的管理员数据赋值给编辑表单
  editForm.value = {
    id: row.id,
    adminId: row.adminId,
    username: row.username,
    adminName: row.adminName,
    password: row.password,
    phone: row.phone,
    email: row.email,
    status: row.status,
    adminType: row.adminType,
    createTime: row.createTime,
    updateTime: row.updateTime,
    createBy: row.createBy,
    updateBy: row.updateBy
  }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (id: number) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm('确定要删除此管理员吗？', {
      title: '删除确认',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    // 调用删除管理员API
    const response = await deleteAdmin(id)
    
    if (response.code === 1) {
      ElMessage.success('删除管理员成功')
      loadAdminList()
    } else {
      ElMessage.error(response.msg || '删除管理员失败')
    }
  } catch (error: any) {
    // 如果用户取消删除，不显示错误信息
    if (error.message !== 'cancel') {
      console.error('删除管理员失败:', error)
      ElMessage.error('删除管理员失败')
    }
  }
}

// 处理打开新增管理员对话框
const handleAddAdmin = () => {
  // 重置表单
  addForm.value = {
    username: '',
    adminName: '',
    password: '',
    phone: '',
    email: '',
    adminType: 1
  }
  addDialogVisible.value = true
}

// 处理提交新增管理员表单
const handleAddAdminSubmit = async () => {
  try {
    const response = await newAdmin(addForm.value)
    
    if (response.code === 1) {
      ElMessage.success('新增管理员成功')
      addDialogVisible.value = false
      loadAdminList()
    } else {
      ElMessage.error(response.msg || '新增管理员失败')
    }
  } catch (error) {
    console.error('新增管理员失败:', error)
    ElMessage.error('新增管理员失败')
  }
}

// 处理保存修改
const handleUpdateAdmin = async () => {
  if (!originalData.value) return
  
  // 构建提交数据，包含所有必要的字段
  const submitData: AdminDTO = {
    id: editForm.value.id,
    adminId: editForm.value.adminId,
    username: editForm.value.username,
    adminName: editForm.value.adminName,
    password: editForm.value.password,
    phone: editForm.value.phone,
    email: editForm.value.email,
    status: editForm.value.status,
    adminType: editForm.value.adminType,
    createTime: editForm.value.createTime,
    updateTime: editForm.value.updateTime,
    createBy: editForm.value.createBy,
    updateBy: editForm.value.updateBy
  }
  
  try {
    const response = await updateAdmin(submitData, currentPage.value)
    
    if (response.code === 1) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      loadAdminList()
    } else {
      ElMessage.error(response.msg || '修改失败')
    }
  } catch (error) {
    console.error('修改管理员失败:', error)
    ElMessage.error('修改失败')
  }
}

// 处理启用管理员
const handleEnableAdmin = async () => {
  try {
    const response = await setAdminIsEnabled(editForm.value.adminId, currentPage.value)
    
    if (response.code === 1) {
      ElMessage.success('启用成功')
      dialogVisible.value = false
      loadAdminList()
    } else {
      ElMessage.error(response.msg || '启用失败')
    }
  } catch (error) {
    console.error('启用管理员失败:', error)
    ElMessage.error('启用失败')
  }
}

// 处理禁用管理员
const handleDisableAdmin = async () => {
  try {
    const response = await setAdminNotEnabled(editForm.value.adminId, currentPage.value)
    
    if (response.code === 1) {
      ElMessage.success('禁用成功')
      dialogVisible.value = false
      loadAdminList()
    } else {
      ElMessage.error(response.msg || '禁用失败')
    }
  } catch (error) {
    console.error('禁用管理员失败:', error)
    ElMessage.error('禁用失败')
  }
}

// 获取管理员类型的标签类型
const getAdminTypeTagType = (adminType: number): string => {
  switch (adminType) {
    case 3:
      return 'success'
    case 2:
      return 'warning'
    case 1:
    default:
      return 'info'
  }
}

// 获取管理员类型名称
const getAdminTypeName = (adminType: number): string => {
  switch (adminType) {
    case 3:
      return '系统管理员'
    case 2:
      return '超级管理员'
    case 1:
      return '普通管理员'
    default:
      return '未知类型'
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadAdminList()
})
</script>

<style scoped>
.module-container {
  width: 100%;
  height: 100%;
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  padding: 24px;
  overflow: hidden;
}

.module-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E4E7ED;
}

.module-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.module-description {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.module-content {
  height: calc(100% - 80px);
  overflow-y: auto;
}

.placeholder-card {
  text-align: center;
  padding: 48px 0;
  margin-bottom: 32px;
  background-color: #F9FAFB;
  border-radius: 8px;
}

.empty-description {
  font-size: 16px;
  color: #909399;
}

.action-bar {
  margin-bottom: 16px;
}

.admin-list-section {
  margin-top: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>