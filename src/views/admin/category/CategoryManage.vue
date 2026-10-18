<template>
  <div class="module-container">
    <div class="module-header">
      <h2 class="module-title">商品分类管理</h2>
      <p class="module-description">管理系统中的商品分类信息</p>
    </div>

    <div class="module-content">
      <!-- 操作栏：只有系统/超级管理员可以新增 -->
      <div class="action-bar">
        <el-button v-if="canManage" type="primary" @click="handleAddCategory">添加分类</el-button>
      </div>

      <!-- 查询条件 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="分类名称">
            <el-input v-model="searchForm.name" placeholder="请输入分类名称" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="分类类型">
            <el-select v-model="searchForm.categoryType" placeholder="全部类型" clearable style="width: 140px">
              <el-option label="空间分类" :value="1" />
              <el-option label="风格分类" :value="2" />
              <el-option label="材质分类" :value="3" />
              <el-option label="功能分类" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否启用">
            <el-select v-model="searchForm.isActive" placeholder="全部状态" clearable style="width: 120px">
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="分类层级">
            <el-select v-model="searchForm.level" placeholder="全部层级" clearable style="width: 120px">
              <el-option label="一级分类" :value="1" />
              <el-option label="二级分类" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 已选择的查询条件：固定高度，避免查询栏抖动 -->
        <div class="selected-conditions">
          <span v-if="hasSearchConditions" class="condition-label">已选条件：</span>
          <template v-if="hasSearchConditions">
            <el-tag v-if="searchForm.name" closable @close="handleRemoveCondition('name')" type="info">
              分类名称：{{ searchForm.name }}
            </el-tag>
            <el-tag v-if="searchForm.categoryType !== undefined && searchForm.categoryType !== null" closable @close="handleRemoveCondition('categoryType')" type="primary">
              分类类型：{{ getCategoryTypeName(searchForm.categoryType) }}
            </el-tag>
            <el-tag v-if="searchForm.isActive !== undefined && searchForm.isActive !== null" closable @close="handleRemoveCondition('isActive')" :type="searchForm.isActive ? 'success' : 'warning'">
              是否启用：{{ searchForm.isActive ? '启用' : '禁用' }}
            </el-tag>
            <el-tag v-if="searchForm.level !== undefined && searchForm.level !== null" closable @close="handleRemoveCondition('level')" type="info">
              分类层级：{{ searchForm.level === 1 ? '一级分类' : '二级分类' }}
            </el-tag>
          </template>
        </div>
      </div>

      <!-- 分类列表 -->
      <div class="category-list-section">
        <el-table v-loading="loading" :data="categoryList" style="width: 100%" border>
          <el-table-column prop="name" label="分类名称" min-width="160" />
          <el-table-column prop="id" label="分类ID" width="100" />
          <el-table-column prop="parentName" label="父分类" width="150">
            <template #default="scope">
              {{ scope.row.parentName || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="categoryType" label="分类类型" width="120">
            <template #default="scope">
              <el-tag :type="getCategoryTypeTagType(scope.row.categoryType)">
                {{ scope.row.categoryType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="层级" width="90">
            <template #default="scope">
              {{ scope.row.level === 1 ? '一级' : '二级' }}
            </template>
          </el-table-column>
          <el-table-column prop="path" label="路径" width="180" />
          <el-table-column prop="isActive" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.isActive ? 'success' : 'info'">
                {{ scope.row.isActive ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column prop="updatedAt" label="更新时间" width="180" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row.isActive"
                type="warning"
                size="small"
                @click="handleToggleStatus(scope.row, false)"
              >
                禁用
              </el-button>
              <el-button
                v-else
                type="success"
                size="small"
                @click="handleToggleStatus(scope.row, true)"
              >
                启用
              </el-button>
              <el-button
                v-if="canManage"
                type="danger"
                size="small"
                @click="handleDelete(scope.row.id)"
              >
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

    <!-- 新增分类窗口：层级 -> 类型 -> 父分类（二级）-> 名称 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增分类"
      width="520px"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="分类层级" prop="level">
          <el-select v-model="addForm.level" placeholder="请选择分类层级" style="width: 100%">
            <el-option label="一级分类（无父分类）" :value="1" />
            <el-option label="二级分类（需要父分类）" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类类型" prop="categoryType">
          <el-select v-model="addForm.categoryType" placeholder="请选择分类类型" style="width: 100%">
            <el-option label="空间分类" :value="1" />
            <el-option label="风格分类" :value="2" />
            <el-option label="材质分类" :value="3" />
            <el-option label="功能分类" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="addForm.level === 2" label="父分类" prop="parentId">
          <el-select
            v-model="addForm.parentId"
            placeholder="请选择同类型的父分类"
            filterable
            :loading="parentLoading"
            style="width: 100%"
          >
            <el-option
              v-for="parent in parentOptions"
              :key="parent.id"
              :label="parent.name"
              :value="parent.id"
            />
          </el-select>
          <div v-if="addForm.categoryType && parentOptions.length === 0 && !parentLoading" class="form-hint">
            该类型下暂无一级分类，请先新增一级分类
          </div>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入分类名称" :maxlength="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="addSubmitting" @click="handleAddCategorySubmit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategory, getCategoryByCondition, setCategoryEnabled, setCategoryNotEnabled, deleteCategory, newCategory } from '@/api/user'
import { getAdminType } from '@/utils/auth'
import type { GetCategoryDVO, GetCategoryByConditionDTO, NewCategoryDTO } from '@/types'

// 只有系统管理员、超级管理员可以新增/删除分类
const canManage = computed(() => getAdminType() >= 2)

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
  level: undefined
})

// 记录最近一次生效的查询条件，翻页/改每页条数时沿用
const activeQuery = ref<GetCategoryByConditionDTO | null>(null)

// 新增分类窗口相关
const addDialogVisible = ref(false)
const addSubmitting = ref(false)
const addFormRef = ref()
const addForm = ref<NewCategoryDTO>({
  parentId: 0,
  name: '',
  categoryType: 1,
  level: 1
})

const parentOptions = ref<GetCategoryDVO[]>([])
const parentLoading = ref(false)

// 新增表单校验
const addRules = {
  level: [{ required: true, message: '请选择分类层级', trigger: 'change' }],
  categoryType: [{ required: true, message: '请选择分类类型', trigger: 'change' }],
  parentId: [{
    validator: (_rule: any, value: any, callback: any) => {
      if (addForm.value.level === 2 && (!value || Number(value) <= 0)) {
        callback(new Error('请选择父分类'))
      } else {
        callback()
      }
    },
    trigger: 'change'
  }],
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 50, message: '分类名称不能超过 50 个字符', trigger: 'blur' }
  ]
}

// 获取分类类型标签类型
const getCategoryTypeTagType = (categoryType?: string) => {
  const typeMap: Record<string, any> = {
    '空间分类': 'primary',
    '风格分类': 'success',
    '材质分类': 'warning',
    '功能分类': 'info'
  }
  return categoryType ? typeMap[categoryType] || '' : ''
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
  return !!searchForm.value.name ||
         (searchForm.value.categoryType !== undefined && searchForm.value.categoryType !== null) ||
         (searchForm.value.isActive !== undefined && searchForm.value.isActive !== null) ||
         (searchForm.value.level !== undefined && searchForm.value.level !== null)
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

// 构建生效的查询条件（去掉空值）
const buildQuery = (): GetCategoryByConditionDTO => ({
  name: searchForm.value.name || undefined,
  categoryType: searchForm.value.categoryType ?? undefined,
  isActive: searchForm.value.isActive ?? undefined,
  level: searchForm.value.level ?? undefined
})

// 加载分类列表：有筛选条件时按条件查，翻页沿用最近一次条件
const fetchCategoryList = async () => {
  loading.value = true
  try {
    const query = activeQuery.value
    const response = query
      ? await getCategoryByCondition({
          ...query,
          pageNum: currentPage.value,
          pageSize: pageSize.value
        })
      : await getCategory(currentPage.value, pageSize.value)

    if ((response.code === 1 || response.code === 200) && response.data) {
      categoryList.value = response.data.rows || response.data.records || []
      total.value = response.data.total || 0
    } else {
      categoryList.value = []
      total.value = 0
      ElMessage.error(response.msg || '获取分类列表失败')
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
const handleSearch = () => {
  activeQuery.value = buildQuery()
  currentPage.value = 1
  fetchCategoryList()
}

// 重置查询条件
const handleReset = () => {
  searchForm.value = {
    name: '',
    categoryType: undefined,
    isActive: undefined,
    level: undefined
  }
  activeQuery.value = null
  currentPage.value = 1
  fetchCategoryList()
}

// 启用/禁用分类
const handleToggleStatus = async (row: GetCategoryDVO, enabled: boolean) => {
  try {
    const response = enabled
      ? await setCategoryEnabled(row.id, currentPage.value)
      : await setCategoryNotEnabled(row.id, currentPage.value)
    if (response.code === 1 || response.code === 200) {
      ElMessage.success(enabled ? '启用成功' : '禁用成功')
      fetchCategoryList()
    } else {
      ElMessage.error(response.msg || (enabled ? '启用失败' : '禁用失败'))
    }
  } catch (error: any) {
    ElMessage.error(error.message || (enabled ? '启用失败' : '禁用失败'))
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
        type: 'warning'
      }
    )

    const response = await deleteCategory(id)
    if (response.code === 1 || response.code === 200) {
      ElMessage.success('删除成功')
      fetchCategoryList()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error: any) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error?.message || '删除失败')
  }
}

// 加载指定类型的父分类（一级分类）
const loadParentOptions = async (categoryType?: number) => {
  parentOptions.value = []
  if (addForm.value.level !== 2 || !categoryType) return
  parentLoading.value = true
  try {
    const response = await getCategoryByCondition({
      level: 1,
      categoryType,
      pageNum: 1,
      pageSize: 200
    })
    if ((response.code === 1 || response.code === 200) && response.data) {
      parentOptions.value = response.data.rows || response.data.records || []
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取父分类失败')
  } finally {
    parentLoading.value = false
  }
}

// 修改层级或类型时，父分类需要重新拉取
watch(() => addForm.value.level, (level) => {
  addForm.value.parentId = 0
  if (level === 2) {
    loadParentOptions(addForm.value.categoryType)
  } else {
    parentOptions.value = []
  }
})

watch(() => addForm.value.categoryType, (categoryType) => {
  addForm.value.parentId = 0
  if (addForm.value.level === 2) {
    loadParentOptions(categoryType)
  }
})

// 打开新增分类
const handleAddCategory = () => {
  addForm.value = {
    parentId: 0,
    name: '',
    categoryType: 1,
    level: 1
  }
  parentOptions.value = []
  addDialogVisible.value = true
  addFormRef.value?.clearValidate()
}

// 提交新增分类
const handleAddCategorySubmit = async () => {
  if (!addFormRef.value) return
  try {
    await addFormRef.value.validate()
  } catch {
    return
  }

  addSubmitting.value = true
  try {
    const payload: NewCategoryDTO = {
      level: addForm.value.level,
      categoryType: addForm.value.categoryType,
      parentId: addForm.value.level === 1 ? 0 : Number(addForm.value.parentId),
      name: addForm.value.name.trim()
    }
    const response = await newCategory(payload)
    if (response.code === 1 || response.code === 200) {
      ElMessage.success('添加成功')
      addDialogVisible.value = false
      fetchCategoryList()
    } else {
      ElMessage.error(response.msg || '添加失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '添加失败')
  } finally {
    addSubmitting.value = false
  }
}

// 分页大小改变：重置到第 1 页并沿用查询条件
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchCategoryList()
}

// 当前页改变：沿用查询条件
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchCategoryList()
}

// 组件挂载时加载分类列表
onMounted(() => {
  fetchCategoryList()
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

.search-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.selected-conditions {
  margin-top: 4px;
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

.category-list-section {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #e6a23c;
  line-height: 1.4;
}
</style>
