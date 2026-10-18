<template>
  <div class="module-container">
    <div class="module-header">
      <h2 class="module-title">管理员管理</h2>
      <p class="module-description">管理系统中的管理员账号信息</p>
    </div>

    <div class="module-content">
      <!-- 操作栏：普通管理员不能新增 -->
      <div class="action-bar">
        <el-button v-if="canAddAdmin" type="primary" @click="handleAddAdmin">添加管理员</el-button>
      </div>

      <!-- 管理员列表：禁用的管理员也保留显示 -->
      <div class="admin-list-section">
        <el-table v-loading="loading" :data="adminList" style="width: 100%" border>
          <el-table-column prop="adminName" label="用户名" min-width="140" />
          <el-table-column prop="phone" label="联系电话" width="150" />
          <el-table-column prop="adminType" label="管理员类型" width="130">
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
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button
                v-if="canOperateRow(scope.row)"
                type="primary"
                size="small"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="canToggleStatus(scope.row)"
                :type="scope.row.status === 1 ? 'warning' : 'success'"
                size="small"
                @click="handleToggleStatus(scope.row)"
              >
                {{ scope.row.status === 1 ? '禁用' : '启用' }}
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
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="110px">
        <el-form-item label="管理员ID">
          <el-input :model-value="String(editForm.adminId)" disabled />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input :model-value="editForm.adminName" disabled />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="管理员类型" prop="adminType">
          <el-select
            v-model="editForm.adminType"
            placeholder="请选择管理员类型"
            :disabled="isEditingSelf"
            style="width: 100%"
          >
            <el-option
              v-for="option in editableTypeOptions"
              :key="option"
              :label="getAdminTypeName(option)"
              :value="option"
            />
          </el-select>
          <div v-if="isEditingSelf" class="form-hint">不能修改自己的级别</div>
        </el-form-item>
        <el-form-item label="状态">
          <el-tag :type="editForm.status === 1 ? 'success' : 'info'">
            {{ editForm.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input :model-value="editForm.createTime || ''" disabled />
        </el-form-item>
        <el-form-item label="更新时间">
          <el-input :model-value="editForm.updateTime || ''" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="editSubmitting" @click="handleUpdateAdmin">保存修改</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增管理员窗口 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增管理员"
      width="500px"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="110px">
        <el-form-item label="管理员名" prop="adminName">
          <el-input v-model="addForm.adminName" placeholder="请输入管理员名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="管理员类型" prop="adminType">
          <el-select v-model="addForm.adminType" placeholder="请选择管理员类型" style="width: 100%">
            <el-option
              v-for="option in editableTypeOptions"
              :key="option"
              :label="getAdminTypeName(option)"
              :value="option"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="addSubmitting" @click="handleAddAdminSubmit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminList, updateAdmin, setAdminIsEnabled, setAdminNotEnabled, newAdmin } from '@/api/user'
import { getAdminType, getUserId } from '@/utils/auth'
import type { AdminDVO, AdminDTO, NewAdminDTO } from '@/types'

// 当前操作人的级别与 id：3=系统、2=超级、1=普通
const myAdminType = getAdminType('admin')
const myAdminId = getUserId('admin')

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
const editSubmitting = ref(false)
const editFormRef = ref()
const editForm = ref<AdminDTO>({
  adminId: 0,
  adminName: '',
  phone: '',
  status: 1,
  adminType: 1,
  createTime: '',
  updateTime: ''
})

// 新增管理员窗口相关
const addDialogVisible = ref(false)
const addSubmitting = ref(false)
const addFormRef = ref()
const addForm = ref<NewAdminDTO>({
  adminName: '',
  password: '',
  phone: '',
  adminType: 1
})

// 普通管理员不能新增；新增/编辑的级别上限为自己级别
const canAddAdmin = computed(() => myAdminType >= 2)
const editableTypeOptions = computed(() =>
  [1, 2, 3].filter(type => type <= myAdminType)
)
const isEditingSelf = computed(() => !!myAdminId && editForm.value.adminId === myAdminId)

// 是否可管理目标管理员：系统管理员可管所有，其余只能管平级与下一级
const canOperateRow = (row: AdminDVO): boolean => {
  if (myAdminType >= 3) return true
  return row.adminType <= myAdminType
}

// 不能修改自己的启用/禁用状态
const canToggleStatus = (row: AdminDVO): boolean => {
  if (myAdminId && row.adminId === myAdminId) return false
  return canOperateRow(row)
}

// 表单校验
const editRules = {
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const addRules = {
  adminName: [{ required: true, message: '请输入管理员名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  adminType: [{ required: true, message: '请选择管理员类型', trigger: 'change' }]
}

// 加载管理员列表
const loadAdminList = async () => {
  loading.value = true
  try {
    const response = await getAdminList({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    if (response.code === 1 || response.code === 200) {
      adminList.value = response.data?.rows || response.data?.records || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.error(response.msg || '获取管理员列表失败')
      adminList.value = []
      total.value = 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取管理员列表失败')
    adminList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 分页
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadAdminList()
}

const handleCurrentChange = (current: number) => {
  currentPage.value = current
  loadAdminList()
}

// 打开编辑窗口
const handleEdit = (row: AdminDVO) => {
  editForm.value = {
    adminId: row.adminId,
    adminName: row.adminName,
    phone: row.phone,
    status: row.status,
    adminType: row.adminType,
    createTime: row.createTime,
    updateTime: row.updateTime,
    createBy: row.createBy,
    updateBy: row.updateBy
  }
  dialogVisible.value = true
  editFormRef.value?.clearValidate()
}

// 保存修改
const handleUpdateAdmin = async () => {
  if (!editFormRef.value) return
  try {
    await editFormRef.value.validate()
  } catch {
    return
  }

  editSubmitting.value = true
  try {
    const submitData: AdminDTO = {
      adminId: editForm.value.adminId,
      phone: editForm.value.phone,
      // 不能修改自己的级别：不提交 adminType，后端也不会更新
      adminType: isEditingSelf.value ? undefined : editForm.value.adminType
    }
    const response = await updateAdmin(submitData, currentPage.value)

    if (response.code === 1 || response.code === 200) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      loadAdminList()
    } else {
      ElMessage.error(response.msg || '修改失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '修改失败')
  } finally {
    editSubmitting.value = false
  }
}

// 启用/禁用管理员（不再删除）
const handleToggleStatus = async (row: AdminDVO) => {
  const enabling = row.status !== 1
  try {
    const response = enabling
      ? await setAdminIsEnabled(row.adminId, currentPage.value)
      : await setAdminNotEnabled(row.adminId, currentPage.value)

    if (response.code === 1 || response.code === 200) {
      ElMessage.success(enabling ? '启用成功' : '禁用成功')
      loadAdminList()
    } else {
      ElMessage.error(response.msg || (enabling ? '启用失败' : '禁用失败'))
    }
  } catch (error: any) {
    ElMessage.error(error.message || (enabling ? '启用失败' : '禁用失败'))
  }
}

// 打开新增管理员窗口
const handleAddAdmin = () => {
  addForm.value = {
    adminName: '',
    password: '',
    phone: '',
    adminType: 1
  }
  addDialogVisible.value = true
  addFormRef.value?.clearValidate()
}

// 提交新增管理员
const handleAddAdminSubmit = async () => {
  if (!addFormRef.value) return
  try {
    await addFormRef.value.validate()
  } catch {
    return
  }

  addSubmitting.value = true
  try {
    const response = await newAdmin({
      adminName: addForm.value.adminName,
      password: addForm.value.password,
      phone: addForm.value.phone,
      adminType: addForm.value.adminType
    })

    if (response.code === 1 || response.code === 200) {
      ElMessage.success('新增管理员成功')
      addDialogVisible.value = false
      loadAdminList()
    } else {
      ElMessage.error(response.msg || '新增管理员失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '新增管理员失败')
  } finally {
    addSubmitting.value = false
  }
}

// 获取管理员类型的标签类型
const getAdminTypeTagType = (adminType: number): string => {
  switch (adminType) {
    case 3:
      return 'danger'
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

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
</style>
