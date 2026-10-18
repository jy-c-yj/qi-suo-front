<template>
  <div class="module-container">
    <div class="module-header">
      <h2 class="module-title">用户管理</h2>
      <p class="module-description">管理系统中的用户信息</p>
    </div>
    
    <div class="module-content">
      <!-- 查询条件 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 已选择的查询条件：固定高度，避免出现/消失时查询栏抖动 -->
        <div class="selected-conditions">
          <span v-if="hasSearchConditions" class="condition-label">已选条件：</span>
          <template v-if="hasSearchConditions">
            <el-tag v-if="searchForm.username" closable @close="handleRemoveCondition('username')" type="info">
              用户名：{{ searchForm.username }}
            </el-tag>
            <el-tag v-if="searchForm.email" closable @close="handleRemoveCondition('email')" type="info">
              邮箱：{{ searchForm.email }}
            </el-tag>
          </template>
        </div>
      </div>
      
      <!-- 用户列表 -->
      <div class="user-list-section">
        <el-table v-loading="loading" :data="userList" style="width: 100%" border>
          <el-table-column prop="username" label="用户名" min-width="150" sortable />
          <el-table-column prop="phone" label="手机号" width="150" />
          <el-table-column prop="email" label="邮箱" min-width="200" />
          <el-table-column prop="roleName" label="角色" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" sortable />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row.status === 0"
                type="warning"
                size="small"
                @click.stop="handleDisableUser(scope.row.id)"
              >
                禁用
              </el-button>
              <el-button 
                v-else 
                type="success" 
                size="small" 
                @click.stop="handleEnableUser(scope.row.id)"
              >
                启用
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserList, setUserEnabled, setUserNotEnabled } from '@/api/user'
import type { AdminGetUserByConditionDTO, AdminGetUserDVO } from '@/types'

// 加载状态
const loading = ref(false)

// 用户列表数据
const userList = ref<AdminGetUserDVO[]>([])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 查询表单
const searchForm = ref<AdminGetUserByConditionDTO>({
  username: '',
  email: '',
  pageNum: 1,
  pageSize: 10
})

// 判断是否有查询条件
const hasSearchConditions = computed(() => {
  return searchForm.value.username !== '' || searchForm.value.email !== ''
})

// 获取状态类型（用户：0=正常，1=禁用）
const getStatusType = (status: number): string => {
  return status === 1 ? 'danger' : 'success'
}

// 获取状态文本
const getStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return '正常'
    case 1:
      return '禁用'
    default:
      return '未知'
  }
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const response = await getUserList({
      ...searchForm.value,
      username: searchForm.value.username || undefined,
      email: searchForm.value.email || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    if ((response.code === 1 || response.code === 200) && response.data) {
      if (response.data.rows) {
        userList.value = response.data.rows
      } else if (response.data.records) {
        userList.value = response.data.records
      } else if (response.data.rows) {
        userList.value = response.data.rows
      } else {
        userList.value = []
      }
      total.value = response.data.total || 0
    } else {
      userList.value = []
      total.value = 0
      ElMessage.error(response.msg || '获取用户列表失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败')
    userList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 查询用户
const handleSearch = () => {
  currentPage.value = 1
  loadUserList()
}

// 重置查询条件
const handleReset = () => {
  searchForm.value = {
    username: '',
    email: '',
    pageNum: 1,
    pageSize: 10
  }
  currentPage.value = 1
  loadUserList()
}

// 移除单个查询条件
const handleRemoveCondition = (field: string) => {
  if (field === 'username') {
    searchForm.value.username = ''
  } else if (field === 'email') {
    searchForm.value.email = ''
  }
  handleSearch()
}

// 启用用户
const handleEnableUser = async (id: number) => {
  try {
    const response = await setUserEnabled(id, currentPage.value)
    if (response.code === 1 || response.code === 200) {
      ElMessage.success(response.data || '启用用户成功')
      loadUserList()
    } else {
      ElMessage.error(response.msg || '启用用户失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '启用用户失败')
  }
}

// 禁用用户
const handleDisableUser = async (id: number) => {
  try {
    const response = await setUserNotEnabled(id, currentPage.value)
    if (response.code === 1 || response.code === 200) {
      ElMessage.success(response.data || '禁用用户成功')
      loadUserList()
    } else {
      ElMessage.error( response.msg || '禁用用户失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '禁用用户失败')
  }
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadUserList()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadUserList()
}

// 组件挂载时加载用户列表
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.module-container {
  padding: 20px;
}

.module-header {
  margin-bottom: 20px;
}

.module-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.module-description {
  color: #666;
  margin: 0;
}

.module-content {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.selected-conditions {
  margin-top: 15px;
  min-height: 32px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.condition-label {
  font-weight: bold;
  color: #333;
  margin-right: 5px;
}

.user-list-section {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 用户详情弹窗样式 */
.user-detail-content {
  max-height: 500px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #E4E7ED;
}

.avatar-container {
  margin-top: 8px;
  display: flex;
  align-items: center;
}

.no-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #F9FAFB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  border: 1px solid #E4E7ED;
}
</style>