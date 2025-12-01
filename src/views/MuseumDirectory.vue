<template>
  <div class="museum-directory">
    <!-- Banner 区域 -->
    <div class="banner">
      <img :src="bannerImage" alt="博物馆目录 Banner" />
      <div class="banner-overlay">
        <h1 class="banner-title">中国数字博物馆导览</h1>
        <p class="banner-subtitle">探索中华文明宝库，开启数字文化之旅</p>
      </div>
    </div>

    <!-- 博物馆卡片展示区域 -->
    <div class="museums-container">
      <h2 class="section-title">全国博物馆集锦</h2>
      
      <el-row :gutter="30" class="museum-grid">
        <el-col 
          v-for="museum in museums" 
          :key="museum.id"
          :xs="24" 
          :sm="24" 
          :md="12" 
          :lg="12"
          class="museum-col"
        >
          <el-card 
            :body-style="{ padding: '0px' }"
            shadow="hover"
            class="museum-card"
            @click="openWebsite(museum.website)"
          >
            <div class="image-container">
              <img :src="getImageUrl(museum.image)" :alt="museum.name" class="museum-image" />
            </div>
            <div class="card-content">
              <h3 class="museum-name">{{ museum.name }}</h3>
              <p class="museum-location">
                <el-icon><LocationFilled /></el-icon>
                {{ museum.location }}
              </p>
              <p class="museum-description">{{ museum.description }}</p>
              <div class="card-footer">
                <el-button type="primary" link @click.stop="openWebsite(museum.website)">
                  访问官网
                  <el-icon class="ml-5"><Right /></el-icon>
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LocationFilled, Right } from '@element-plus/icons-vue'
import museumsData from '@/assets/MuseumDirectory/museums-data.json'

interface Museum {
  id: number
  name: string
  description: string
  image: string
  website: string
  location: string
}

// 导入 Banner 图片
const bannerImage = new URL('../assets/MuseumDirectory/1.png', import.meta.url).href

const museums = ref<Museum[]>([])

// 初始化博物馆数据
onMounted(() => {
  museums.value = museumsData as Museum[]
})

// 获取图片 URL
const getImageUrl = (imagePath: string) => {
  try {
    return new URL(`../assets/MuseumDirectory/${imagePath}`, import.meta.url).href
  } catch (error) {
    console.error('图片加载失败:', imagePath, error)
    return ''
  }
}

// 打开博物馆官网
const openWebsite = (url: string) => {
  window.open(url, '_blank')
}
</script>

<style scoped>
.museum-directory {
  min-height: 100vh;
  background-color: #F6F1E7;
}

/* Banner 样式 */
.banner {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}

.banner-title {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-subtitle {
  font-size: 24px;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 博物馆容器样式 */
.museums-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px;
}

.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 50px;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  margin: 15px auto 0;
  border-radius: 2px;
}

/* 卡片网格 */
.museum-grid {
  margin-bottom: 40px;
}

.museum-col {
  margin-bottom: 30px;
}

/* 博物馆卡片样式 */
.museum-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.museum-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.image-container {
  width: 100%;
  height: 350px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.museum-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.museum-card:hover .museum-image {
  transform: scale(1.1);
}

/* 卡片内容 */
.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.museum-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.museum-location {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #909399;
  margin: 0 0 12px 0;
}

.museum-description {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin: 0 0 15px 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.ml-5 {
  margin-left: 5px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .banner {
    height: 250px;
  }
  
  .banner-title {
    font-size: 32px;
  }
  
  .banner-subtitle {
    font-size: 16px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .museums-container {
    padding: 40px 15px;
  }
}
</style>
