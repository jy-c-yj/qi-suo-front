<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="not-found-code">404</h1>
      <h2 class="not-found-title">页面不存在</h2>
      <p class="not-found-description">
        抱歉，您访问的页面不存在或已被移除。
      </p>
      <div class="not-found-actions">
        <el-button type="primary" @click="goHome">
          返回首页
        </el-button>
        <el-button @click="goBack">
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/home')
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
}

.not-found-code {
  font-size: 96px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16px;
  opacity: 0.8;
}

.not-found-title {
  font-size: 32px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
}

.not-found-description {
  font-size: 16px;
  color: #718096;
  margin-bottom: 32px;
  line-height: 1.5;
}

.not-found-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
