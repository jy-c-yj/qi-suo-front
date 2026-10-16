<template>
  <div class="module-container">
  <div class="module-header">
    <h2 class="module-title">主页背景图片管理</h2>
    <p class="module-description">管理系统主页的背景图片设置</p>
  </div>
  
  <div class="module-content">
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAddImage">
        <el-icon><Plus /></el-icon>
        添加背景图片
      </el-button>
      <div class="info-section">
        <el-tag type="info">
          <el-icon><InfoFilled /></el-icon>
          <span>同一时间只能有一张背景图片处于启用状态</span>
        </el-tag>
      </div>
    </div>
    
    <!-- 当前背景图片 -->
    <div class="current-background-section">
      <h3 class="section-title">
        <el-icon><Star /></el-icon>
        当前背景图片
      </h3>
      <div class="current-background-content" v-loading="currentImageLoading">
        <template v-if="currentBackgroundImage">
          <div class="current-image-card">
            <el-image
              :src="currentBackgroundImage.url"
              fit="cover"
              style="width: 100%; height: 200px; border-radius: 8px;"
              :preview-src-list="[currentBackgroundImage.url]"
            />
            <div class="current-image-info">
              <h4>{{ currentBackgroundImage.description }}</h4>
              <p class="image-meta">ID: {{ currentBackgroundImage.id }} | UUID: {{ currentBackgroundImage.uid }}</p>
              <p class="image-time">创建时间: {{ currentBackgroundImage.createdTime }}</p>
              <p class="image-time">更新时间: {{ currentBackgroundImage.updatedTime }}</p>
              <el-button 
                type="danger" 
                @click="handleCancelCurrent"
                :loading="cancelCurrentImageLoading"
                style="margin-top: 16px"
              >
                取消当前背景图片
              </el-button>
            </div>
          </div>
        </template>
        <template v-else>
          <el-empty
            description="
              <span class='empty-description'>
                尚未设置当前背景图片
              </span>
            "
          />
        </template>
      </div>
    </div>
    
    <!-- 图片列表 -->
    <div class="image-list-section">
      <h3 class="section-title">背景图片列表</h3>
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
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column prop="updatedTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button 
              type="success" 
              size="small" 
              @click="handleSetAsCurrent(scope.row)"
              :loading="setCurrentImageLoading"
              :disabled="!scope.row.isEnabled || (currentBackgroundImage && currentBackgroundImage.uid === scope.row.uid)"
            >
              <el-icon><Check /></el-icon>
              设为当前
            </el-button>
            <el-button type="primary" size="small" @click="handleEdit(scope.row)" style="margin-left: 8px">
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(scope.row)"
              :disabled="currentBackgroundImage && currentBackgroundImage.uid === scope.row.uid"
              style="margin-left: 8px"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
        
        <!-- 分页 -->
        <div class="pagination-section">
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
    
    <!-- 上传图片对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="添加背景图片"
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
            accept=".jpg,.jpeg"
            :before-upload="beforeUpload"
            ref="uploadRef"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                仅支持 jpg、jpeg 格式，单个文件不超过 5MB
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
      title="编辑背景图片"
      width="500px"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef">
        <el-form-item label="图片预览">
          <el-image
            :src="editForm.url"
            fit="cover"
            style="width: 100%; height: 200px; border-radius: 4px;"
            :preview-src-list="[editForm.url]"
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
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-tag>{{ editForm.createdTime }}</el-tag>
        </el-form-item>
        <el-form-item label="更新时间">
          <el-tag>{{ editForm.updatedTime }}</el-tag>
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
      <p>您确定要删除这张背景图片吗？</p>
      <p class="delete-warning">
        <el-icon><Warning /></el-icon>
        <span>此操作将标记图片为已删除状态，不会物理删除文件。</span>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, InfoFilled, UploadFilled, Delete, Warning, Check, Star } from '@element-plus/icons-vue'
import { 
  getHomeBackGroundImageList, 
  setHomeBackGroundImageEnabled, 
  setHomeBackGroundImageNotEnabled, 
  newHomeBackGroundImage, 
  deleteHomeBackGroundImage, 
  updateHomeBackGroundImage,
  getNowHomeBackGroundImage,
  deleteNowHomeBackGroundImage,
  setNowHomeBackGroundImage
} from '@/api/user'
import type { HomeBackgroundImageDVO } from '@/types'
import type { UploadFile, FormInstance } from 'element-plus'

// 图片列表数据
const imageList = ref<HomeBackgroundImageDVO[]>([])
const total = ref(0)
const loading = ref(false)

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)

// 当前背景图片
const currentBackgroundImage = ref<HomeBackgroundImageDVO | null>(null)
const currentImageLoading = ref(false)

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
const editForm = reactive<Partial<HomeBackgroundImageDVO>>({
  id: undefined,
  uid: undefined,
  description: '',
  url: undefined,
  isEnabled: undefined,
  createdTime: undefined,
  updatedTime: undefined
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
const originalForm = ref<Partial<HomeBackgroundImageDVO>>({})

// 删除相关
const deleteDialogVisible = ref(false)
const deleteLoading = ref(false)
const currentDeleteUid = ref<string | null>(null)

// 设置当前背景图片相关
const setCurrentImageLoading = ref(false)
const cancelCurrentImageLoading = ref(false)

// 创建对象URL的辅助函数
const createObjectURL = (file: File | undefined): string => {
  if (!file) return ''
  return URL.createObjectURL(file)
}

// 加载图片列表
const loadImageList = async () => {
  loading.value = true
  try {
    const response = await getHomeBackGroundImageList(currentPage.value, pageSize.value)
    // 检查响应数据结构
    if (response.data) {
      // 后端返回的分页数据结构
      if (response.data.rows) {
        imageList.value = response.data.rows
      } else if (response.data.records) {
        imageList.value = response.data.records
      } else {
        imageList.value = []
      }
      total.value = response.data.total || 0
    } else {
      imageList.value = []
      total.value = 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取图片列表失败')
    imageList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 加载当前背景图片
const loadCurrentBackgroundImage = async () => {
  currentImageLoading.value = true
  try {
    const response = await getNowHomeBackGroundImage()
    currentBackgroundImage.value = response.data
  } catch (error: any) {
    // 当未找到背景图片时，不显示错误信息
    if (error.message.includes('尚未找到') || error.message.includes('未设置')) {
      currentBackgroundImage.value = null
    } else {
      ElMessage.error(error.message || '获取当前背景图片失败')
    }
  } finally {
    currentImageLoading.value = false
  }
}

// 处理页码变化
const handleCurrentChange = (current: number) => {
  currentPage.value = current
  loadImageList()
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
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

// 上传前验证
const beforeUpload = (file: File) => {
  // 验证文件类型
  const isImage = /\.(jpg|jpeg)$/i.test(file.name)
  if (!isImage) {
    ElMessage.error('仅支持 jpg、jpeg 格式的图片')
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
        
        const response = await newHomeBackGroundImage(formData)
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
const handleEdit = (row: HomeBackgroundImageDVO) => {
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
        if (editForm.isEnabled !== undefined && editForm.isEnabled !== originalForm.value.isEnabled) {
          if (editForm.isEnabled) {
            // 启用图片
            await setHomeBackGroundImageEnabled(editForm.uid!, currentPage.value)
            ElMessage.success('图片已启用')
          } else {
            // 禁用图片
            await setHomeBackGroundImageNotEnabled(editForm.uid!, currentPage.value)
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
            url: editForm.url!,
            isEnabled: editForm.isEnabled!
          }
          const response = await updateHomeBackGroundImage(updateData as HomeBackgroundImageDVO, currentPage.value)
          ElMessage.success('图片描述更新成功')
        }
        
        editDialogVisible.value = false
        loadImageList()
        loadCurrentBackgroundImage() // 重新加载当前背景图片
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
const handleDelete = (row: HomeBackgroundImageDVO) => {
  // 检查是否是当前背景图片
  if (currentBackgroundImage.value && currentBackgroundImage.value.uid === row.uid) {
    ElMessage.warning('不能删除当前正在使用的背景图片，请先取消设置')
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
    await deleteHomeBackGroundImage(currentDeleteUid.value)
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

// 设置为当前背景图片
const handleSetAsCurrent = async (image: HomeBackgroundImageDVO) => {
  // 检查图片是否已启用
  if (!image.isEnabled) {
    ElMessage.warning('只有已启用的图片才能设置为当前背景图片')
    return
  }
  
  // 检查是否已经是当前背景图片
  if (currentBackgroundImage.value && currentBackgroundImage.value.uid === image.uid) {
    ElMessage.info('该图片已经是当前背景图片')
    return
  }
  
  setCurrentImageLoading.value = true
  try {
    const response = await setNowHomeBackGroundImage(image.uid)
    // 处理后端返回的消息，优先使用msg，如果msg为null但data是字符串，则使用data
    let message = response.msg
    if (!message && typeof response.data === 'string') {
      message = response.data
    }
    if (response.code === 1 && message) {
      // 当code为1时，表示有警告信息，使用info类型显示
      ElMessage.info(message)
    } else {
      // 其他情况使用success类型显示
      ElMessage.success(message || '设置成功')
    }
    loadCurrentBackgroundImage()
  } catch (error: any) {
    ElMessage.error(error.message || '设置失败')
  } finally {
    setCurrentImageLoading.value = false
  }
}

// 取消当前背景图片
const handleCancelCurrent = async () => {
  if (!currentBackgroundImage.value) return
  
  cancelCurrentImageLoading.value = true
  try {
    const response = await deleteNowHomeBackGroundImage(currentBackgroundImage.value.uid)
    ElMessage.success(response.msg || '取消成功')
    currentBackgroundImage.value = null
  } catch (error: any) {
    ElMessage.error(error.message || '取消失败')
  } finally {
    cancelCurrentImageLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadImageList()
  loadCurrentBackgroundImage()
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

.info-section {
  max-width: 400px;
}

/* 当前背景图片 */
.current-background-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #F9FAFB;
  border-radius: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 16px 0;
}

.section-title el-icon {
  margin-right: 8px;
}

.current-background-content {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.current-image-card {
  max-width: 600px;
}

.current-image-info {
  margin-top: 16px;
}

.current-image-info h4 {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 12px 0;
}

.image-meta {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px 0;
}

.image-time {
  font-size: 12px;
  color: #909399;
  margin: 0 0 8px 0;
}

/* 图片列表 */
.image-list-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #F9FAFB;
  border-radius: 8px;
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

/* 分页 */
.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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
  
  .info-section {
    width: 100%;
  }
  
  .current-background-section,
  .image-list-section {
    padding: 16px;
  }
  
  .pagination-section {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .module-title {
    font-size: 18px;
  }
  
  .section-title {
    font-size: 14px;
  }
  
  .el-table {
    font-size: 12px;
  }
  
  .el-table th,
  .el-table td {
    padding: 8px;
  }
  
  .el-table-column {
    width: auto !important;
  }
  
  .current-image-info h4 {
    font-size: 14px;
  }
  
  .image-meta {
    font-size: 12px;
  }
  
  .image-time {
    font-size: 11px;
  }
}
</style>