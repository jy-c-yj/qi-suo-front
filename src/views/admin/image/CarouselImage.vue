<template>
  <div class="module-container">
    <div class="module-header">
      <h2 class="module-title">首页轮播图片管理</h2>
      <p class="module-description">管理系统首页的轮播图片设置</p>
    </div>
    
    <div class="module-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAddImage">
          <el-icon><Plus /></el-icon>
          添加轮播图片
        </el-button>
        <div class="filter-section">
          <el-select v-model="queryParams.isEnabled" placeholder="状态" clearable style="width: 120px; margin-left: 16px;">
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
          <el-select v-model="queryParams.isUsed" placeholder="使用状态" clearable style="width: 120px; margin-left: 16px;">
            <el-option label="已使用" :value="true" />
            <el-option label="未使用" :value="false" />
          </el-select>
          <el-button type="default" @click="handleQuery">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </div>
      </div>
      
      <!-- 图片列表 -->
      <div class="image-list-section">
        <el-table 
          v-loading="loading" 
          :data="imageList" 
          style="width: 100%"
          border
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="uid" label="UUID" width="200" />
          <el-table-column label="图片预览" width="120">
            <template #default="scope">
              <el-image
                :src="scope.row.url"
                fit="cover"
                style="width: 80px; height: 45px; border-radius: 4px;"
                :preview-src-list="[scope.row.url]"
              />
            </template>
          </el-table-column>
          <el-table-column prop="description" label="图片描述" min-width="200" />
          <el-table-column prop="isEnabled" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isEnabled ? 'success' : 'info'">
              {{ scope.row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdBy" label="创建人" width="120" />
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column prop="modifiedBy" label="修改人" width="120" />
        <el-table-column prop="modifiedTime" label="修改时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(scope.row)"
              style="margin-left: 8px"
              :disabled="scope.row.isEnabled"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.size"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      
      <!-- 上传图片对话框 -->
      <el-dialog
        v-model="uploadDialogVisible"
        title="添加轮播图片"
        width="500px"
      >
        <el-form :model="uploadForm" :rules="uploadRules" ref="uploadFormRef">
          <el-form-item label="图片文件" prop="file">
            <el-upload
              class="upload-demo"
              drag
              :auto-upload="false"
              :on-change="handleFileChange"
              :limit="1"
              accept=".jpg,.jpeg,.png"
              :before-upload="beforeUpload"
              ref="uploadRef"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  仅支持 jpg、jpeg、png 格式，单个文件不超过 5MB
                </div>
              </template>
              <template #file="{ file }">
                <div class="file-item">
                  <el-image
                    :src="file.url || createObjectURL(file.raw)"
                    fit="cover"
                    style="width: 100%; height: 200px; border-radius: 4px;"
                  />
                  <span class="file-name">{{ file.name }}</span>
                  <el-button type="text" @click="handleRemoveFile(file)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item label="图片描述" prop="description">
            <el-input
              v-model="uploadForm.description"
              type="textarea"
              rows="3"
              placeholder="请输入图片描述"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="uploadDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmitUpload" :loading="uploadLoading">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 编辑图片对话框 -->
      <el-dialog
        v-model="editDialogVisible"
        title="编辑轮播图片"
        width="500px"
      >
        <el-form :model="editForm" :rules="editRules" ref="editFormRef">
          <el-form-item label="图片预览">
            <el-image
              :src="editForm.imageUrl"
              fit="cover"
              style="width: 100%; height: 200px; border-radius: 4px;"
              :preview-src-list="[editForm.imageUrl]"
            />
          </el-form-item>
          <el-form-item label="图片描述" prop="description">
            <el-input
              v-model="editForm.description"
              type="textarea"
              rows="3"
              placeholder="请输入图片描述"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-switch
              v-model="editForm.isEnabled"
              active-text="启用"
              inactive-text="禁用"
              :disabled="!canToggleEditStatus()"
            />
          </el-form-item>
          <el-form-item label="创建信息">
            <div class="info-text">创建人: {{ editForm.createdBy }}</div>
            <div class="info-text">创建时间: {{ editForm.createdTime }}</div>
          </el-form-item>
          <el-form-item label="修改信息">
            <div class="info-text">修改人: {{ editForm.modifiedBy }}</div>
            <div class="info-text">修改时间: {{ editForm.modifiedTime }}</div>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmitEdit" :loading="editLoading">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 删除确认对话框 -->
      <el-dialog
        v-model="deleteDialogVisible"
        title="确认删除"
        width="400px"
        :close-on-click-modal="false"
      >
        <p>您确定要删除这张轮播图片吗？此操作不可恢复。</p>
        <p class="delete-warning">
          <el-icon><Warning /></el-icon>
          <span>删除后，图片文件将被永久移除。</span>
        </p>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="deleteDialogVisible = false">取消</el-button>
            <el-button type="danger" @click="handleConfirmDelete" :loading="deleteLoading">
              确认删除
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, UploadFilled, Delete, Warning } from '@element-plus/icons-vue'
import { 
  getCarouselImageList, 
  setCarouselImageEnabled, 
  setCarouselImageNotEnabled, 
  newCarouselImage, 
  deleteCarouselImage, 
  updateCarouselImage 
} from '@/api/user'
import type { CarouselImage, CarouselImageDetailsDTO, ImageQueryParams } from '@/types'
import type { UploadFile, FormInstance } from 'element-plus'

// 图片列表数据
const imageList = ref<CarouselImage[]>([])
const total = ref(0)
const loading = ref(false)

// 查询参数
const queryParams = reactive<ImageQueryParams>({
  pageNum: 1,
  pageSize: 10,
  page: 1,
  size: 10,
  isDeleted: false,
  sortBy: 'createdTime',
  sortOrder: 'desc'
})

// 上传相关
const uploadDialogVisible = ref(false)
const uploadForm = reactive({
  file: null as File | null,
  description: ''
})
const uploadRules = {
  file: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!uploadForm.file) {
          callback(new Error('请选择图片文件'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  description: [
    { required: true, message: '请输入图片描述', trigger: 'blur' },
    { min: 1, max: 200, message: '描述长度在 1 到 200 个字符', trigger: 'blur' }
  ]
}
const uploadFormRef = ref<FormInstance>()
const uploadRef = ref<any>()
const uploadLoading = ref(false)

// 编辑相关
const editDialogVisible = ref(false)
const editForm = reactive<Partial<CarouselImageDetailsDTO>>({
  id: undefined,
  uid: undefined,
  imageUrl: undefined,
  linkUrl: undefined,
  title: undefined,
  description: '',
  sort: undefined,
  status: undefined,
  isEnabled: undefined,
  createdBy: undefined,
  createdTime: undefined,
  modifiedBy: undefined,
  modifiedTime: undefined
})
const editRules = {
  description: [
    { required: true, message: '请输入图片描述', trigger: 'blur' },
    { min: 1, max: 200, message: '描述长度在 1 到 200 个字符', trigger: 'blur' }
  ]
}
const editFormRef = ref<FormInstance>()
const editLoading = ref(false)
const originalDescription = ref('')
const originalForm = ref<Partial<CarouselImageDetailsDTO>>({
  id: undefined,
  uid: undefined,
  imageUrl: undefined,
  linkUrl: undefined,
  title: undefined,
  description: '',
  sort: undefined,
  status: undefined,
  isEnabled: undefined,
  createdBy: undefined,
  createdTime: undefined,
  modifiedBy: undefined,
  modifiedTime: undefined
})

// 删除相关
const deleteDialogVisible = ref(false)
const deleteLoading = ref(false)
const currentDeleteUid = ref<string | null>(null)

// 启用状态的图片数量
const enabledImageCount = computed(() => {
  return imageList.value.filter(img => img.isEnabled && !img.isDeleted).length
})

// 最大启用图片数量（可配置）
const MAX_ENABLED_IMAGES = 5

// 检查是否可以切换状态
const canToggleStatus = (image: CarouselImage): boolean => {
  if (image.isEnabled) {
    // 禁用操作总是允许
    return true
  } else {
    // 启用操作需要检查是否超过限制
    return enabledImageCount.value < MAX_ENABLED_IMAGES
  }
}

// 检查编辑对话框中是否可以切换状态
const canToggleEditStatus = (): boolean => {
  if (editForm.isEnabled) {
    // 禁用操作总是允许
    return true
  } else {
    // 启用操作需要检查是否超过限制
    // 如果当前图片已经是启用状态，或者启用图片数量小于限制，则允许
    return enabledImageCount.value < MAX_ENABLED_IMAGES
  }
}

// 加载图片列表
const loadImageList = async () => {
  loading.value = true
  try {
    const response = await getCarouselImageList(queryParams)
    // Check if response.data is an array (direct response) or has records property (paginated)
    if (Array.isArray(response.data)) {
      imageList.value = response.data
      total.value = response.data.length
    } else if (response.data.records) {
      imageList.value = response.data.records
      total.value = response.data.total
    } else {
      imageList.value = []
      total.value = 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取图片列表失败')
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleQuery = () => {
  queryParams.page = 1
  queryParams.pageNum = 1
  loadImageList()
}

// 处理页码变化
const handleCurrentChange = (current: number) => {
  queryParams.page = current
  queryParams.pageNum = current
  loadImageList()
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.pageSize = size
  queryParams.page = 1
  queryParams.pageNum = 1
  loadImageList()
}

// 处理添加图片
const handleAddImage = () => {
  // 重置表单
  uploadForm.file = null
  uploadForm.description = ''
  uploadFormRef.value?.resetFields()
  uploadRef.value?.clearFiles()
  uploadDialogVisible.value = true
}

// 处理文件选择
const handleFileChange = (file: UploadFile) => {
  if (file.raw) {
    uploadForm.file = file.raw as File
  }
}

// 处理文件移除
const handleRemoveFile = (file: UploadFile) => {
  uploadForm.file = null
  uploadRef.value?.clearFiles()
}

// 创建对象URL的辅助函数
const createObjectURL = (file: File | undefined): string => {
  if (!file) return ''
  return URL.createObjectURL(file)
}

// 上传前验证
const beforeUpload = (file: File) => {
  // 验证文件类型
  const isImage = /\.(jpg|jpeg|png)$/i.test(file.name)
  if (!isImage) {
    ElMessage.error('仅支持 jpg、jpeg、png 格式的图片')
    return false
  }
  
  // 验证文件大小
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  
  return true
}

// 处理上传提交
const handleSubmitUpload = async () => {
  if (!uploadFormRef.value) return
  
  await uploadFormRef.value.validate(async (valid) => {
    if (valid) {
      uploadLoading.value = true
      try {
        const formData = new FormData()
        if (uploadForm.file) {
          formData.append('file', uploadForm.file)
        }
        formData.append('description', uploadForm.description)
        
        const response = await newCarouselImage(formData)
        ElMessage.success('图片上传成功')
        uploadDialogVisible.value = false
        loadImageList()
      } catch (error: any) {
        ElMessage.error(error.message || '图片上传失败')
      } finally {
        uploadLoading.value = false
      }
    }
  })
}

// 处理编辑
const handleEdit = (row: CarouselImage) => {
  // 复制数据到编辑表单
  Object.assign(editForm, row)
  // 保存原始表单数据
  Object.assign(originalForm.value, row)
  originalDescription.value = row.description
  editDialogVisible.value = true
}

// 处理编辑提交
const handleSubmitEdit = async () => {
  if (!editFormRef.value) return
  
  // 检查是否有变化
  const hasChanges = await editFormRef.value.validate(async (valid) => {
    if (valid) {
      editLoading.value = true
      try {
        // 处理状态变化
        if (editForm.isEnabled !== originalForm.value.isEnabled) {
          if (editForm.isEnabled) {
            // 启用图片
            await setCarouselImageEnabled(editForm.uid!)
            ElMessage.success('图片已启用')
          } else {
            // 禁用图片
            await setCarouselImageNotEnabled(editForm.uid!)
            ElMessage.success('图片已禁用')
          }
        }
        
        // 处理描述变化
        if (editForm.description !== undefined && editForm.description !== originalForm.value.description) {
          // 只发送必要的字段，不包含日期时间字段
          const updateData = {
            id: editForm.id!,
            uid: editForm.uid!,
            description: editForm.description,
            imageUrl: editForm.imageUrl!,
            linkUrl: editForm.linkUrl!,
            title: editForm.title!,
            sort: editForm.sort!,
            status: editForm.status!,
            isEnabled: editForm.isEnabled!
          }
          const response = await updateCarouselImage(updateData as CarouselImageDetailsDTO)
          ElMessage.success('图片描述更新成功')
        }
        
        editDialogVisible.value = false
        loadImageList()
      } catch (error: any) {
        // 恢复原状态
        if (originalForm.value.isEnabled !== undefined) {
          editForm.isEnabled = originalForm.value.isEnabled
        }
        ElMessage.error(error.message || '更新失败')
      } finally {
        editLoading.value = false
      }
    }
  })
  
  if (!hasChanges) {
    ElMessage.info('内容未发生变化')
    editDialogVisible.value = false
  }
}

// 处理删除
const handleDelete = (row: CarouselImage) => {
  if (row.isEnabled) {
    ElMessage.warning('不能删除已启用的图片，请先禁用')
    return
  }
  
  currentDeleteUid.value = row.uid
  deleteDialogVisible.value = true
}

// 处理确认删除
const handleConfirmDelete = async () => {
  if (!currentDeleteUid.value) return
  
  deleteLoading.value = true
  try {
    await deleteCarouselImage(currentDeleteUid.value)
    ElMessage.success('图片删除成功')
    deleteDialogVisible.value = false
    loadImageList()
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败')
  } finally {
    deleteLoading.value = false
    currentDeleteUid.value = null
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadImageList()
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

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #F9FAFB;
  border-radius: 8px;
}

.filter-section {
  display: flex;
  align-items: center;
}

/* 图片列表 */
.image-list-section {
  margin-bottom: 20px;
}

/* 分页 */
.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 文件上传 */
.file-item {
  position: relative;
  margin-top: 10px;
}

.file-name {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  color: #606266;
}

.file-item .el-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
}

/* 编辑表单 */
.info-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

/* 删除确认 */
.delete-warning {
  margin-top: 16px;
  padding: 12px;
  background-color: #FEF0F0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  color: #F56C6C;
}

.delete-warning span {
  margin-left: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .module-container {
    padding: 16px;
  }
  
  .action-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .filter-section {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .module-title {
    font-size: 18px;
  }
  
  .el-table {
    font-size: 12px;
  }
  
  .el-table th,
  .el-table td {
    padding: 8px;
  }
}
</style>