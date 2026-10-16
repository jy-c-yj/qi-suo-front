<template>
  <div class="module-container">
    <div class="module-header">
      <h2 class="module-title">商品分类管理</h2>
      <p class="module-description">管理系统中的商品分类信息</p>
    </div>
    
    <div class="module-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAddCategory">添加分类</el-button>
      </div>
      
      <!-- 查询条件 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="分类名称">
            <el-input v-model="searchForm.name" placeholder="请输入分类名称" clearable />
          </el-form-item>
          <el-form-item label="分类类型">
            <el-select v-model="searchForm.categoryType" placeholder="请选择分类类型" clearable>
              <el-option label="空间分类" :value="1" />
              <el-option label="风格分类" :value="2" />
              <el-option label="材质分类" :value="3" />
              <el-option label="功能分类" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否启用">
            <el-select v-model="searchForm.isActive" placeholder="请选择状态" clearable>
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="分类层级">
            <el-select v-model="searchForm.level" placeholder="请选择分类层级" clearable>
              <el-option label="1" :value="1" />
              <el-option label="2" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 已选择的查询条件 -->
        <div v-if="hasSearchConditions" class="selected-conditions">
          <span class="condition-label">已选条件：</span>
          <el-tag v-if="searchForm.name" closable @close="handleRemoveCondition('name')" type="info">
            分类名称：{{ searchForm.name }}
          </el-tag>
          <el-tag v-if="searchForm.categoryType !== undefined" closable @close="handleRemoveCondition('categoryType')" type="primary">
            分类类型：{{ getCategoryTypeName(searchForm.categoryType) }}
          </el-tag>
          <el-tag v-if="searchForm.isActive !== undefined" closable @close="handleRemoveCondition('isActive')" :type="searchForm.isActive ? 'success' : 'warning'">
            是否启用：{{ searchForm.isActive ? '启用' : '禁用' }}
          </el-tag>
          <el-tag v-if="searchForm.level !== undefined" closable @close="handleRemoveCondition('level')" type="info">
            分类层级：{{ searchForm.level }}
          </el-tag>
        </div>
      </div>
      
      <!-- 分类列表 -->
      <div class="category-list-section">
        <el-table v-loading="loading" :data="categoryList" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="分类名称" width="150" />
          <el-table-column prop="parentName" label="父分类" width="150" />
          <el-table-column prop="categoryType" label="分类类型" width="120">
            <template #default="scope">
              <el-tag :type="getCategoryTypeTagType(scope.row.categoryType)">
                {{ scope.row.categoryType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="层级" width="80" />
          <el-table-column prop="path" label="路径" width="200" />
          <el-table-column prop="isActive" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.isActive ? 'success' : 'info'">
                {{ scope.row.isActive ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column prop="updatedAt" label="更新时间" width="180" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row.id)" style="margin-left: 8px">
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
      :title="'编辑分类 - ' + (editForm.name || '')"
      width="500px"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="分类ID">
          <el-input v-model="editForm.id" disabled />
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="editForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类">
          <el-input v-model="editForm.parentName" disabled />
        </el-form-item>
        <el-form-item label="分类类型">
          <el-tag>
            {{ editForm.categoryType }}
          </el-tag>
        </el-form-item>
        <el-form-item label="层级">
          <el-input v-model="editForm.level" disabled />
        </el-form-item>
        <el-form-item label="路径">
          <el-input v-model="editForm.path" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-tag :type="editForm.isActive ? 'success' : 'info'">
            {{ editForm.isActive ? '启用' : '禁用' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input v-model="editForm.createdAt" disabled />
        </el-form-item>
        <el-form-item label="更新时间">
          <el-input v-model="editForm.updatedAt" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateCategory">保存修改</el-button>
          <el-button v-if="!editForm.isActive" type="success" @click="handleEnableCategory">启用</el-button>
          <el-button v-else type="warning" @click="handleDisableCategory">禁用</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 新增分类窗口 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增分类"
      width="500px"
    >
      <el-form :model="addForm" label-width="120px">
        <el-form-item label="父分类ID">
          <el-input v-model="addForm.parentId" placeholder="0表示顶级分类" />
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="addForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类类型">
          <el-select v-model="addForm.categoryType" placeholder="请选择分类类型">
            <el-option label="空间分类" :value="1" />
            <el-option label="风格分类" :value="2" />
            <el-option label="材质分类" :value="3" />
            <el-option label="功能分类" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类层级">
          <el-select v-model="addForm.level" placeholder="请选择分类层级">
            <el-option label="1" :value="1" />
            <el-option label="2" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddCategorySubmit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategory, getCategoryByCondition, setCategoryEnabled, setCategoryNotEnabled, deleteCategory, newCategory } from '@/api/user'
import type { GetCategoryDVO, GetCategoryByConditionDTO, NewCategoryDTO } from '@/types'

// 加载状态
const loading = ref(false)

// 分类列表数据
const categoryList = ref<GetCategoryDVO[]>([])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 查询表单
const searchForm = ref<GetCategoryByConditionDTO>({
  name: '',
  categoryType: undefined,
  isActive: undefined,
  level: undefined,
  pageNum: 1,
  pageSize: 10
})

// 编辑窗口相关
const dialogVisible = ref(false)
const editForm = ref<GetCategoryDVO>({
  id: 0,
  parentId: 0,
  name: '',
  parentName: '',
  categoryType: 0,
  isActive: 0,
  level: 0,
  path: '',
  createdAt: '',
  updatedAt: '',
  children: []
})

// 新增分类窗口相关
const addDialogVisible = ref(false)
const addForm = ref<NewCategoryDTO>({
  parentId: 0,
  name: '',
  categoryType: 1,
  level: 1
})

// 获取分类类型标签类型
const getCategoryTypeTagType = (categoryType: string) => {
  const typeMap: Record<string, any> = {
    '空间分类': 'primary',
    '风格分类': 'success',
    '材质分类': 'warning',
    '功能分类': 'info'
  }
  return typeMap[categoryType] || ''
}

// 获取分类类型名称
const getCategoryTypeName = (categoryType: number) => {
  const typeMap: Record<number, string> = {
    1: '空间分类',
    2: '风格分类',
    3: '材质分类',
    4: '功能分类'
  }
  return typeMap[categoryType] || ''
}

// 判断是否有查询条件
const hasSearchConditions = computed(() => {
  return searchForm.value.name !== '' || 
         searchForm.value.categoryType !== undefined || 
         searchForm.value.isActive !== undefined || 
         searchForm.value.level !== undefined
})

// 移除单个查询条件
const handleRemoveCondition = (field: string) => {
  if (field === 'name') {
    searchForm.value.name = ''
  } else if (field === 'categoryType') {
    searchForm.value.categoryType = undefined
  } else if (field === 'isActive') {
    searchForm.value.isActive = undefined
  } else if (field === 'level') {
    searchForm.value.level = undefined
  }
  handleSearch()
}

// 加载分类列表
const loadCategoryList = async () => {
  loading.value = true
  try {
    const response = await getCategory(currentPage.value, pageSize.value)
    if (response.data) {
      if (response.data.rows) {
        categoryList.value = response.data.rows
      } else if (response.data.records) {
        categoryList.value = response.data.records
      } else {
        categoryList.value = []
      }
      total.value = response.data.total || 0
    } else {
      categoryList.value = []
      total.value = 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取分类列表失败')
    categoryList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 查询分类
const handleSearch = async () => {
  currentPage.value = 1
  searchForm.value.pageNum = currentPage.value
  searchForm.value.pageSize = pageSize.value
  loading.value = true
  try {
    const response = await getCategoryByCondition(searchForm.value)
    if (response.data) {
      if (response.data.rows) {
        categoryList.value = response.data.rows
      } else if (response.data.records) {
        categoryList.value = response.data.records
      } else {
        categoryList.value = []
      }
      total.value = response.data.total || 0
    } else {
      categoryList.value = []
      total.value = 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '查询分类失败')
    categoryList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 重置查询条件
const handleReset = () => {
  searchForm.value = {
    name: '',
    categoryType: undefined,
    isActive: undefined,
    level: undefined,
    pageNum: 1,
    pageSize: 10
  }
  currentPage.value = 1
  loadCategoryList()
}

// 编辑分类
const handleEdit = (row: GetCategoryDVO) => {
  editForm.value = { ...row }
  dialogVisible.value = true
}

// 更新分类
const handleUpdateCategory = async () => {
  try {
    ElMessage.info('更新分类功能待实现')
    dialogVisible.value = false
    loadCategoryList()
  } catch (error: any) {
    ElMessage.error(error.message || '更新分类失败')
  }
}

// 启用分类
const handleEnableCategory = async () => {
  try {
    const response = await setCategoryEnabled(editForm.value.id, currentPage.value)
    if (response.code === 1) {
      ElMessage.success('启用成功')
      dialogVisible.value = false
      loadCategoryList()
    } else {
      ElMessage.error(response.msg || '启用失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '启用失败')
  }
}

// 禁用分类
const handleDisableCategory = async () => {
  try {
    const response = await setCategoryNotEnabled(editForm.value.id, currentPage.value)
    if (response.code === 1) {
      ElMessage.success('禁用成功')
      dialogVisible.value = false
      loadCategoryList()
    } else {
      ElMessage.error(response.msg || '禁用失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '禁用失败')
  }
}

// 删除分类
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该分类吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    const response = await deleteCategory(id)
    if (response.code === 1) {
      ElMessage.success('删除成功')
      loadCategoryList()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 添加分类
const handleAddCategory = () => {
  addForm.value = {
    parentId: 0,
    name: '',
    categoryType: 1,
    level: 1
  }
  addDialogVisible.value = true
}

// 提交新增分类
const handleAddCategorySubmit = async () => {
  if (!addForm.value.name) {
    ElMessage.error('请输入分类名称')
    return
  }
  if (!addForm.value.categoryType) {
    ElMessage.error('请选择分类类型')
    return
  }
  if (!addForm.value.level) {
    ElMessage.error('请输入分类层级')
    return
  }
  
  try {
    const response = await newCategory(addForm.value)
    if (response.code === 1) {
      ElMessage.success('添加成功')
      addDialogVisible.value = false
      loadCategoryList()
    } else {
      ElMessage.error(response.msg || '添加失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '添加失败')
  }
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadCategoryList()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadCategoryList()
}

// 组件挂载时加载分类列表
onMounted(() => {
  loadCategoryList()
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

.action-bar {
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.selected-conditions {
  margin-top: 15px;
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

.category-list-section {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>