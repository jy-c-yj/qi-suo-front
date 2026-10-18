<template>
  <div class="merchant-products">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>商品管理</h2>
      <el-button type="primary" size="default" @click="handleAddProduct">
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable />
          </el-form-item>
          <el-form-item label="商品状态">
            <el-select v-model="searchForm.status" placeholder="请选择商品状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="上架" value="1" />
              <el-option label="下架" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 商品列表 -->
    <div class="product-list">
      <el-card class="list-card">
        <el-table :data="productList" style="width: 100%" v-loading="loading">
          <el-table-column label="商品图片" width="100">
            <template #default="scope">
              <el-image
                v-if="scope.row.productImageUrl"
                :src="scope.row.productImageUrl"
                :preview-src-list="[scope.row.productImageUrl]"
                preview-teleported
                fit="cover"
                class="table-product-image"
              />
              <span v-else class="no-image">暂无</span>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="商品ID" width="90" />
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="scope">
              ¥{{ scope.row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="100" />
          <el-table-column prop="salesCount" label="销量" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                {{ scope.row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="240">
            <template #default="scope">
              <el-button type="info" size="small" @click="handleViewDetail(scope.row)">
                详情
              </el-button>
              <!-- 当前上架 -> 下架（警示色）；当前下架 -> 上架（成功色） -->
              <el-button
                :type="scope.row.status === 1 ? 'warning' : 'success'"
                size="small"
                @click="handleToggleStatus(scope.row)"
              >
                {{ scope.row.status === 1 ? '下架' : '上架' }}
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteProduct(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
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
      </el-card>
    </div>

    <!-- 商品详情对话框：详情卡片内直接编辑商品信息 -->
    <el-dialog v-model="detailDialogVisible" title="商品详情" width="820px">
      <div v-if="productDetail" class="product-detail">
        <el-form
          ref="detailFormRef"
          :model="productDetail"
          :rules="editRules"
          label-width="100px"
        >
          <el-form-item label="商品图片">
            <div class="image-upload">
              <el-upload
                class="avatar-uploader"
                :action="`${API_BASE_URL}/file/upload`"
                :show-file-list="false"
                :on-success="handleDetailImageSuccess"
                :on-error="handleImageUploadError"
                :before-upload="beforeImageUpload"
              >
                <img
                  v-if="productDetail.productImageUrl"
                  :src="productDetail.productImageUrl"
                  class="avatar"
                />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <el-input
                v-model="productDetail.productImageUrl"
                placeholder="图片URL"
                style="margin-top: 10px;"
              />
            </div>
          </el-form-item>

          <el-form-item label="商品名称" prop="productName">
            <el-input v-model="productDetail.productName" placeholder="请输入商品名称" />
          </el-form-item>

          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="productDetail.description"
              type="textarea"
              :rows="3"
              placeholder="请输入商品描述"
            />
          </el-form-item>

          <el-form-item label="价格" prop="price">
            <el-input-number
              v-model="productDetail.price"
              :min="0"
              :precision="2"
              :step="0.01"
            />
          </el-form-item>

          <el-form-item label="原价" prop="originalPrice">
            <el-input-number
              v-model="productDetail.originalPrice"
              :min="0"
              :precision="2"
              :step="0.01"
            />
          </el-form-item>

          <el-form-item label="库存" prop="stock">
            <el-input-number v-model="productDetail.stock" :min="0" />
          </el-form-item>

          <el-form-item label="是否热门">
            <el-switch v-model="productDetail.isHot" />
          </el-form-item>

          <el-form-item label="是否新品">
            <el-switch v-model="productDetail.isNew" />
          </el-form-item>
        </el-form>

        <el-descriptions :column="2" border class="detail-descriptions">
          <el-descriptions-item label="商品ID">{{ productDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="商家名称">{{ productDetail.merchantName }}</el-descriptions-item>
          <el-descriptions-item label="SKU">{{ productDetail.sku }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="productDetail.status === 1 ? 'success' : 'info'">
              {{ productDetail.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="评分">{{ productDetail.rating }}</el-descriptions-item>
          <el-descriptions-item label="销量">{{ productDetail.salesCount }}</el-descriptions-item>
          <el-descriptions-item label="浏览量">{{ productDetail.viewCount }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ productDetail.updatedAt }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4>商品分类</h4>
            <el-button type="primary" size="small" @click="handleEditCategories">编辑分类</el-button>
          </div>
          <div v-for="category in productDetail.categoryNames" :key="category" style="display: inline-flex; align-items: center; margin-right: 8px; margin-bottom: 8px;">
            <el-tag style="margin-right: 4px;">
              {{ category }}
            </el-tag>
            <el-button
              size="small"
              type="danger"
              circle
              @click="handleDeleteCategory(category)"
              style="margin-right: 8px;"
            >
              <el-icon><Minus /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="detail-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4>商品属性</h4>
            <el-button type="primary" size="small" @click="handleEditAttributes">编辑属性</el-button>
          </div>
          <el-table :data="productDetail.attributeAndValues" style="width: 100%" border>
            <el-table-column prop="attributeName" label="属性名称" width="200" />
            <el-table-column prop="attributeValue" label="属性值" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDeleteAttribute(scope.row)"
                >
                  <el-icon><Minus /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" :loading="detailSaving" @click="handleSaveDetail">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog v-model="categoryDialogVisible" title="编辑商品分类" width="600px">
      <div v-if="productDetail" class="category-edit">
        <el-select
          v-model="selectedCategories"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请选择分类"
          style="width: 100%"
        >
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
        <div style="margin-top: 20px;">
          <h5>已选择的分类：</h5>
          <el-tag
            v-for="category in categories.filter(c => selectedCategories.includes(c.id))"
            :key="category.id"
            closable
            @close="removeCategory(category.id)"
          >
            {{ category.name }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveCategories">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑属性对话框 -->
    <el-dialog v-model="attributeDialogVisible" title="编辑商品属性" width="600px">
      <div v-if="productDetail" class="attribute-edit">
        <el-form label-width="80px">
          <el-form-item label="选择属性">
            <el-select v-model="selectedAttributeId" placeholder="请选择属性" @change="handleAttributeChange">
              <el-option
                v-for="attribute in attributes"
                :key="attribute.id"
                :label="attribute.attributeName"
                :value="attribute.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="选择属性值">
            <el-select
              v-model="selectedAttributeValues"
              multiple
              placeholder="请选择属性值"
              style="width: 100%"
            >
              <el-option
                v-for="value in attributeValues"
                :key="value.id"
                :label="value.value"
                :value="value.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        
        <div style="margin-top: 20px;">
          <h5>已选择的属性值：</h5>
          <el-tag
            v-for="value in attributeValues.filter(v => selectedAttributeValues.includes(v.id))"
            :key="value.id"
            closable
            @close="removeAttributeValue(value.id)"
          >
            {{ value.value }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="attributeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAttributes">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增商品对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增商品" width="800px">
      <el-form v-if="addForm" :model="addForm" :rules="addRules" ref="addFormRef" label-width="120px">
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="addForm.productName" placeholder="请输入商品名称" />
        </el-form-item>
        
        <el-form-item label="商品图片" prop="productImageUrl">
          <div class="image-upload">
            <el-upload
              class="avatar-uploader"
              :action="`${API_BASE_URL}/file/upload`"
              :show-file-list="false"
              :on-success="handleImageUploadSuccess"
              :on-error="handleImageUploadError"
              :before-upload="beforeImageUpload"
            >
              <img v-if="addForm.productImageUrl" :src="addForm.productImageUrl" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <el-input v-model="addForm.productImageUrl" placeholder="图片URL" style="margin-top: 10px;" />
          </div>
        </el-form-item>
        
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="addForm.description" type="textarea" :rows="4" placeholder="请输入商品描述" />
        </el-form-item>
        
        <el-form-item label="销售价格" prop="price">
          <el-input-number v-model="addForm.price" :min="0" :precision="2" :step="0.01" />
        </el-form-item>
        
        <el-form-item label="库存数量" prop="stock">
          <el-input-number v-model="addForm.stock" :min="0" />
        </el-form-item>
        
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="addForm.originalPrice" :min="0" :precision="2" :step="0.01" />
        </el-form-item>

        <el-form-item label="是否热门">
          <el-switch v-model="addForm.isHot" />
        </el-form-item>

        <el-form-item label="是否新品">
          <el-switch v-model="addForm.isNew" />
        </el-form-item>

        <el-form-item label="商品分类" prop="categoryIds">
          <el-select
            v-model="addForm.categoryIds"
            multiple
            filterable
            placeholder="请选择商品分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品属性" prop="attributeAndValues">
          <el-select
            v-model="addSelectedAttributeId"
            placeholder="请选择属性"
            @change="handleAddAttributeChange"
          >
            <el-option
              v-for="attribute in attributes"
              :key="attribute.id"
              :label="attribute.attributeName"
              :value="attribute.id"
            />
          </el-select>

          <el-select
            v-model="addSelectedAttributeValues"
            multiple
            filterable
            placeholder="请选择属性值"
            style="width: 100%; margin-top: 10px;"
          >
            <el-option
              v-for="value in addAttributeValues"
              :key="value.id"
              :label="value.value"
              :value="value.id"
            />
          </el-select>
          
          <div style="margin-top: 15px;">
            <h5>已选择的属性值：</h5>
            <el-tag
              v-for="value in addAttributeValues.filter(v => addSelectedAttributeValues.includes(v.id))"
              :key="value.id"
              closable
              @close="removeAddAttributeValue(value.id)"
            >
              {{ value.value }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAdd">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Minus } from '@element-plus/icons-vue'
import { API_BASE_URL, getMerchantProductList, getMerchantProductDetail, setProductStatus, deleteProduct, updateProduct, getCategories, getAttributes, getAttributeValues, addProductCategory, deleteProductCategory, addProductAttributeValue, deleteProductAttributeValue, newProduct } from '@/api/user'
import type { BackgroundGetProductByConditionDTO, BackgroundGetProductDVO, BackgroundGetProductDetailDVO, MerchantUpdateProductFormDTO, CategoryDVO, AttributeDVO, AttributeValueDVO, NewProductCategoryDTO, DeleteProductCategoryDTO, NewProductAttributeValueDTO, DeleteProductAttributeValueDTO, NewProductDTO } from '@/types'

// 加载状态
const loading = ref(false)

// 搜索表单
const searchForm = ref({
  productName: '',
  status: ''
})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 商品列表
const productList = ref<BackgroundGetProductDVO[]>([])

// 商品详情对话框（卡片内直接编辑）
const detailDialogVisible = ref(false)
const detailSaving = ref(false)
const detailFormRef = ref()
const productDetail = ref<BackgroundGetProductDetailDVO | null>(null)

// 编辑表单验证规则
const editRules = {
  productName: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' }
  ]
}

// 分类和属性编辑
const categoryDialogVisible = ref(false)
const attributeDialogVisible = ref(false)
const categories = ref<CategoryDVO[]>([])
const attributes = ref<AttributeDVO[]>([])
const attributeValues = ref<AttributeValueDVO[]>([])
const selectedAttributeId = ref(0)
const selectedCategories = ref<number[]>([])
const selectedAttributeValues = ref<number[]>([])

// 新增商品时的属性选择
const addSelectedAttributeId = ref(0)
const addAttributeValues = ref<AttributeValueDVO[]>([])
const addSelectedAttributeValues = ref<number[]>([])

// 新增商品
const addDialogVisible = ref(false)
const addFormRef = ref()
const addForm = ref<NewProductDTO>({
  productName: '',
  productImageUrl: '',
  description: '',
  price: 0,
  stock: 0,
  originalPrice: 0,
  isNew: false,
  isHot: false,
  categoryIds: [],
  attributeAndValues: []
})

// 新增商品表单验证规则
const addRules = {
  productName: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  productImageUrl: [
    { required: true, message: '请上传商品图片', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入销售价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' }
  ],
  originalPrice: [
    { required: true, message: '请输入原价', trigger: 'blur' }
  ],
  categoryIds: [
    { required: true, message: '请选择商品分类', trigger: 'blur' }
  ],
  attributeAndValues: [
    { required: true, message: '请选择商品属性', trigger: 'blur' }
  ]
}

// 获取商品列表
const fetchProductList = async () => {
  loading.value = true
  try {
    const params: BackgroundGetProductByConditionDTO = {
      productName: searchForm.value.productName || undefined,
      // 下拉框存的是字符串，后端要 Integer；空值不传
      status: searchForm.value.status === '' ? undefined : Number(searchForm.value.status),
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const response = await getMerchantProductList(params)
    if (response.code === 1 && response.data) {
      // 处理后端返回的数据，兼容 records 或 rows 字段
      productList.value = response.data.records || response.data.rows || []
      total.value = response.data.total || 0
    } else {
      ElMessage.error(response.msg || '获取商品列表失败')
    }
  } catch (error: any) {
    console.error('获取商品列表失败:', error)
    ElMessage.error(error.message || '获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchProductList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    productName: '',
    status: ''
  }
  currentPage.value = 1
  fetchProductList()
}



// 详情卡片内保存商品信息
const handleSaveDetail = async () => {
  if (!detailFormRef.value || !productDetail.value) return

  try {
    await detailFormRef.value.validate()
  } catch {
    return
  }

  const form: MerchantUpdateProductFormDTO = {
    id: productDetail.value.id,
    productName: productDetail.value.productName,
    description: productDetail.value.description,
    price: productDetail.value.price,
    stock: productDetail.value.stock,
    originalPrice: productDetail.value.originalPrice,
    isNew: productDetail.value.isNew,
    isHot: productDetail.value.isHot,
    productImageUrl: productDetail.value.productImageUrl
  }

  detailSaving.value = true
  try {
    const response = await updateProduct(form)
    if (response.code === 1) {
      ElMessage.success('商品更新成功')
      fetchProductList()
      // 重新拉一次详情，显示后端计算后的更新时间
      const detailResponse = await getMerchantProductDetail(form.id)
      if (detailResponse.code === 1 && detailResponse.data) {
        productDetail.value = detailResponse.data
      }
    } else {
      ElMessage.error(response.msg || '商品更新失败')
    }
  } catch (error: any) {
    console.error('商品更新失败:', error)
    ElMessage.error(error.message || '商品更新失败')
  } finally {
    detailSaving.value = false
  }
}

// 编辑分类
const handleEditCategories = async () => {
  if (!productDetail.value) return
  
  try {
    // 加载所有分类
    const response = await getCategories()
    if (response.code === 1 && response.data) {
      categories.value = response.data
      // 回显商品当前已绑定的分类
      selectedCategories.value = [...(productDetail.value.categoryIds || [])]
      categoryDialogVisible.value = true
    } else {
      ElMessage.error(response.msg || '获取分类失败')
    }
  } catch (error: any) {
    console.error('获取分类失败:', error)
    ElMessage.error(error.message || '获取分类失败')
  }
}

// 编辑属性
const handleEditAttributes = async () => {
  if (!productDetail.value) return
  
  try {
    // 加载所有属性
    const response = await getAttributes()
    if (response.code === 1 && response.data) {
      attributes.value = response.data
      selectedAttributeId.value = 0
      attributeValues.value = []
      // 回显商品当前已绑定的属性值
      selectedAttributeValues.value = [...(productDetail.value.attributeValueIds || [])]
      attributeDialogVisible.value = true
    } else {
      ElMessage.error(response.msg || '获取属性失败')
    }
  } catch (error: any) {
    console.error('获取属性失败:', error)
    ElMessage.error(error.message || '获取属性失败')
  }
}

// 属性变更处理
const handleAttributeChange = async (attributeId: number) => {
  if (!attributeId) {
    attributeValues.value = []
    return
  }
  
  try {
    const response = await getAttributeValues(attributeId)
    if (response.code === 1 && response.data) {
      attributeValues.value = response.data
      selectedAttributeValues.value = []
    } else {
      ElMessage.error(response.msg || '获取属性值失败')
    }
  } catch (error: any) {
    console.error('获取属性值失败:', error)
    ElMessage.error(error.message || '获取属性值失败')
  }
}

// 新增商品属性变更处理
const handleAddAttributeChange = async (attributeId: number) => {
  if (!attributeId) {
    addAttributeValues.value = []
    return
  }
  
  try {
    const response = await getAttributeValues(attributeId)
    if (response.code === 1 && response.data) {
      addAttributeValues.value = response.data
      addSelectedAttributeValues.value = []
    } else {
      ElMessage.error(response.msg || '获取属性值失败')
    }
  } catch (error: any) {
    console.error('获取属性值失败:', error)
    ElMessage.error(error.message || '获取属性值失败')
  }
}

// 移除分类
const removeCategory = async (categoryId: number) => {
  if (!productDetail.value) return
  
  try {
    const data: DeleteProductCategoryDTO = {
      productId: productDetail.value.id,
      categoryId
    }
    const response = await deleteProductCategory(data)
    if (response.code === 1) {
      selectedCategories.value = selectedCategories.value.filter(id => id !== categoryId)
      ElMessage.success('分类删除成功')
      // 重新获取商品详情
      const detailResponse = await getMerchantProductDetail(productDetail.value.id)
      if (detailResponse.code === 1 && detailResponse.data) {
        productDetail.value = detailResponse.data
      }
    } else {
      ElMessage.error(response.msg || '分类删除失败')
    }
  } catch (error: any) {
    console.error('删除分类失败:', error)
    ElMessage.error(error.message || '分类删除失败')
  }
}

// 移除属性值
const removeAttributeValue = async (attributeValueId: number) => {
  if (!productDetail.value) return
  
  try {
    const attributeValue = attributeValues.value.find(v => v.id === attributeValueId)
    if (!attributeValue) {
      throw new Error('未找到属性值')
    }
    
    const data: DeleteProductAttributeValueDTO = {
      productId: productDetail.value.id,
      attributeId: attributeValue.attributeId,
      attributeValueId
    }
    const response = await deleteProductAttributeValue(data)
    if (response.code === 1) {
      selectedAttributeValues.value = selectedAttributeValues.value.filter(id => id !== attributeValueId)
      ElMessage.success('属性值删除成功')
      // 重新获取商品详情
      const detailResponse = await getMerchantProductDetail(productDetail.value.id)
      if (detailResponse.code === 1 && detailResponse.data) {
        productDetail.value = detailResponse.data
      }
    } else {
      ElMessage.error(response.msg || '属性值删除失败')
    }
  } catch (error: any) {
    console.error('删除属性值失败:', error)
    ElMessage.error(error.message || '属性值删除失败')
  }
}

// 移除新增商品属性值
const removeAddAttributeValue = (attributeValueId: number) => {
  addSelectedAttributeValues.value = addSelectedAttributeValues.value.filter(id => id !== attributeValueId)
}

// 直接删除分类（从详情页）
const handleDeleteCategory = async (categoryName: string) => {
  if (!productDetail.value) return
  
  try {
    // 确保分类列表已加载
    if (categories.value.length === 0) {
      const categoryResponse = await getCategories()
      if (categoryResponse.code === 1 && categoryResponse.data) {
        categories.value = categoryResponse.data
      } else {
        ElMessage.error('获取分类列表失败')
        return
      }
    }
    
    // 查找分类ID
    const category = categories.value.find(c => c.name === categoryName)
    if (!category) {
      ElMessage.error('未找到对应分类')
      return
    }
    
    // 调用删除接口
    const data: DeleteProductCategoryDTO = {
      productId: productDetail.value.id,
      categoryId: category.id
    }
    const response = await deleteProductCategory(data)
    if (response.code === 1) {
      ElMessage.success('分类删除成功')
      // 重新获取商品详情
      const detailResponse = await getMerchantProductDetail(productDetail.value.id)
      if (detailResponse.code === 1 && detailResponse.data) {
        productDetail.value = detailResponse.data
      }
    } else {
      ElMessage.error(response.msg || '分类删除失败')
    }
  } catch (error: any) {
    console.error('删除分类失败:', error)
    ElMessage.error(error.message || '分类删除失败')
  }
}

// 直接删除属性（从详情页）
const handleDeleteAttribute = async (attributeItem: any) => {
  if (!productDetail.value) return
  
  try {
    // 确保属性和属性值列表已加载
    if (attributes.value.length === 0) {
      const attributeResponse = await getAttributes()
      if (attributeResponse.code === 1 && attributeResponse.data) {
        attributes.value = attributeResponse.data
      } else {
        ElMessage.error('获取属性列表失败')
        return
      }
    }
    
    // 查找属性ID
    const attribute = attributes.value.find(a => a.attributeName === attributeItem.attributeName)
    if (!attribute) {
      ElMessage.error('未找到对应属性')
      return
    }
    
    // 查找属性值ID
    if (!attributeValues.value?.length || attributeValues.value[0]?.attributeId !== attribute.id) {
      const valueResponse = await getAttributeValues(attribute.id)
      if (valueResponse.code === 1 && valueResponse.data) {
        attributeValues.value = valueResponse.data
      } else {
        ElMessage.error('获取属性值列表失败')
        return
      }
    }
    
    if (!attributeValues.value) {
      ElMessage.error('属性值列表为空')
      return
    }
    const attributeValue = attributeValues.value.find(v => v.value === attributeItem.attributeValue)
    if (!attributeValue) {
      ElMessage.error('未找到对应属性值')
      return
    }
    
    // 调用删除接口
    const data: DeleteProductAttributeValueDTO = {
      productId: productDetail.value.id,
      attributeId: attribute.id,
      attributeValueId: attributeValue.id
    }
    const response = await deleteProductAttributeValue(data)
    if (response.code === 1) {
      ElMessage.success('属性值删除成功')
      // 重新获取商品详情
      const detailResponse = await getMerchantProductDetail(productDetail.value.id)
      if (detailResponse.code === 1 && detailResponse.data) {
        productDetail.value = detailResponse.data
      }
    } else {
      ElMessage.error(response.msg || '属性值删除失败')
    }
  } catch (error: any) {
    console.error('删除属性失败:', error)
    ElMessage.error(error.message || '属性删除失败')
  }
}

// 保存分类
const handleSaveCategories = async () => {
  if (!productDetail.value) return
  
  try {
    // 只新增尚未绑定的分类；取消绑定走详情里的删除按钮
    const currentIds = productDetail.value.categoryIds || []
    const newIds = selectedCategories.value.filter(id => !currentIds.includes(id))
    for (const categoryId of newIds) {
      const data: NewProductCategoryDTO = {
        productId: productDetail.value.id,
        categoryId
      }
      const response = await addProductCategory(data)
      if (response.code !== 1) {
        throw new Error(response.msg || '添加分类失败')
      }
    }
    ElMessage.success('分类更新成功')
    categoryDialogVisible.value = false
    // 重新获取商品详情
    const detailResponse = await getMerchantProductDetail(productDetail.value.id)
    if (detailResponse.code === 1 && detailResponse.data) {
      productDetail.value = detailResponse.data
    }
  } catch (error: any) {
    console.error('更新分类失败:', error)
    ElMessage.error(error.message || '更新分类失败')
  }
}

// 保存属性
const handleSaveAttributes = async () => {
  if (!productDetail.value) return
  
  try {
    // 只新增尚未绑定的属性值
    const currentIds = productDetail.value.attributeValueIds || []
    const newValueIds = selectedAttributeValues.value.filter(id => !currentIds.includes(id))
    for (const attributeValueId of newValueIds) {
      const attributeValue = attributeValues.value.find(v => v.id === attributeValueId)
      if (!attributeValue) {
        throw new Error('未找到属性值')
      }

      const data: NewProductAttributeValueDTO = {
        productId: productDetail.value.id,
        attributeValueId
      }
      const response = await addProductAttributeValue(data)
      if (response.code !== 1) {
        throw new Error(response.msg || '添加属性值失败')
      }
    }
    ElMessage.success('属性更新成功')
    attributeDialogVisible.value = false
    // 重新获取商品详情
    const detailResponse = await getMerchantProductDetail(productDetail.value.id)
    if (detailResponse.code === 1 && detailResponse.data) {
      productDetail.value = detailResponse.data
    }
  } catch (error: any) {
    console.error('更新属性失败:', error)
    ElMessage.error(error.message || '更新属性失败')
  }
}

// 查看商品详情
const handleViewDetail = async (product: any) => {
  console.log('查看商品详情:', product)
  try {
    const response = await getMerchantProductDetail(product.id)
    if (response.code === 1 && response.data) {
      productDetail.value = response.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(response.msg || '获取商品详情失败')
    }
  } catch (error: any) {
    console.error('获取商品详情失败:', error)
    ElMessage.error(error.message || '获取商品详情失败')
  }
}

// 切换商品状态
const handleToggleStatus = async (product: any) => {
  // 显式传目标状态，不依赖后端的 toggle
  const targetStatus = product.status === 1 ? 0 : 1
  try {
    const response = await setProductStatus(product.id, targetStatus)
    if (response.code === 1) {
      product.status = targetStatus
      ElMessage.success(`商品${targetStatus === 1 ? '上架' : '下架'}成功`)
    } else {
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (error: any) {
    console.error('切换商品状态失败:', error)
    ElMessage.error(error.message || '操作失败')
  }
}

// 删除商品
const handleDeleteProduct = (id: number) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    console.log('删除商品:', id)
    try {
      const response = await deleteProduct(id)
      if (response.code === 1) {
        ElMessage.success('商品删除成功')
        fetchProductList()
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } catch (error: any) {
      console.error('删除商品失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchProductList()
}

const handleCurrentChange = (current: number) => {
  currentPage.value = current
  fetchProductList()
}

// 处理新增商品
const handleAddProduct = async () => {
  // 加载分类和属性数据
  try {
    if (categories.value.length === 0) {
      const categoryResponse = await getCategories()
      if (categoryResponse.code === 1 && categoryResponse.data) {
        categories.value = categoryResponse.data
      }
    }
    if (attributes.value.length === 0) {
      const attributeResponse = await getAttributes()
      if (attributeResponse.code === 1 && attributeResponse.data) {
        attributes.value = attributeResponse.data
      }
    }
    // 重置表单
    addForm.value = {
      productName: '',
      productImageUrl: '',
      description: '',
      price: 0,
      stock: 0,
      originalPrice: 0,
      isNew: false,
      isHot: false,
      categoryIds: [],
      attributeAndValues: []
    }
    // 重置属性选择状态
    addSelectedAttributeId.value = 0
    addAttributeValues.value = []
    addSelectedAttributeValues.value = []
    addDialogVisible.value = true
  } catch (error: any) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 图片上传成功处理：文件服务把 URL 放在 data 里（Result.success(String) 的坑）
const handleImageUploadSuccess = (response: any) => {
  if (response.code === 1 && response.data) {
    addForm.value.productImageUrl = response.data
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.msg || '图片上传失败')
  }
}

// 详情卡片里替换商品图片
const handleDetailImageSuccess = (response: any) => {
  if (response.code === 1 && response.data) {
    if (productDetail.value) {
      productDetail.value.productImageUrl = response.data
    }
    ElMessage.success('图片上传成功，保存后生效')
  } else {
    ElMessage.error(response.msg || '图片上传失败')
  }
}

// 图片上传失败处理
const handleImageUploadError = () => {
  ElMessage.error('图片上传失败')
}

// 图片上传前验证
const beforeImageUpload = (file: any) => {
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

// 保存新增商品
const handleSaveAdd = async () => {
  if (!addFormRef.value) return
  
  try {
    // 设置表单的属性数据 - 直接使用属性值的id数组
    addForm.value.attributeAndValues = addSelectedAttributeValues.value
    
    await addFormRef.value.validate()
    const response = await newProduct(addForm.value)
    if (response.code === 1) {
      ElMessage.success('商品新增成功')
      addDialogVisible.value = false
      // 重置属性选择状态
      addSelectedAttributeId.value = 0
      addAttributeValues.value = []
      addSelectedAttributeValues.value = []
      fetchProductList()
    } else {
      ElMessage.error(response.msg || '商品新增失败')
    }
  } catch (error: any) {
    console.error('商品新增失败:', error)
    ElMessage.error(error.message || '商品新增失败')
  }
}

// 页面加载时获取商品列表
onMounted(() => {
  fetchProductList()
})
</script>

<style scoped>
.merchant-products {
  width: 100%;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

/* 搜索和筛选 */
.search-filter {
  margin-bottom: 20px;
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-form {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 商品列表 */
.product-list {
  margin-bottom: 20px;
}

.table-product-image {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  display: block;
}

.no-image {
  color: #909399;
  font-size: 12px;
}

.detail-descriptions {
  margin-top: 16px;
}

.list-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 分页 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination {
    justify-content: center;
  }
}

/* 商品详情对话框 */
.product-detail {
  padding: 10px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.detail-section p {
  margin: 0;
  color: #4a5568;
  line-height: 1.6;
}

/* 图片上传 */
.image-upload {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
</style>
