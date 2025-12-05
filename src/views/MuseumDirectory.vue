<template>
  <div class="museum-directory">
    <!-- Banner 区域 -->
    <div class="banner-wrapper">
      <img id="top-anchor" src="/00C.svg" alt="博物馆目录 Banner" class="banner" />
    </div>
    <!-- 博物馆卡片展示区域 -->
    <div class="museums-container">
      <h2 class="section-title">全国博物馆集锦</h2>
      
      <el-row :gutter="24" class="museum-grid">
        <el-col 
          v-for="museum in museums" 
          :key="museum.id"
          :xs="24" 
          :sm="12" 
          :md="12" 
          :lg="8"
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
                <el-button
                  class="visit-btn"
                  type="primary"
                  link
                  @click.stop="openWebsite(museum.website)"
                >
                  访问官网
                  <span class="plain-arrow">➔</span>
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
  /*background-color: #F6F1E7; */
}

/*Banner 区域*/
.banner-wrapper {
  width: 100%;
  max-width: 1200px;        
  margin: 16px auto 32px;   
  padding: 0 8px;         
  box-sizing: border-box;
}

.banner {
  width: 100%;
  height: auto;            
  display: block;
  border: none;
  border-radius: 0;         
}

/* 博物馆容器样式 */
.museums-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px 60px;
  box-sizing: border-box;
}

.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  color: #5b3a1a;          
  margin-bottom: 36px;
  position: relative;
  font-family: "Noto Serif SC", "Source Han Serif", serif;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #c79c5b, #e0d4c0);
  margin: 12px auto 0;
  border-radius: 2px;
}

/*卡片*/
.museum-grid {
  margin: 0 -4px 32px;     
}

.museum-col {
  padding: 4px;
  margin-bottom: 20px;      
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
  border: 1px solid #e0d4c0;
  background: #fffdf7;
}

.museum-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(143, 109, 54, 0.18);
}

.image-container {
  width: 100%;
  height: 240px;           
  overflow: hidden;
  background-color: #f5f1e6;
}

.museum-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.museum-card:hover .museum-image {
  transform: scale(1.05);
}

/* 卡片内容 */
.card-content {
  padding: 16px 18px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.museum-name {
  font-size: 18px;
  font-weight: bold;
  color: #3b2a16;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.museum-location {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #9b8c76;
  margin: 0 0 10px 0;
}

.museum-description {
  font-size: 13px;
  color: #5e4a32;
  line-height: 1.7;
  margin: 0 0 10px 0;
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
  padding: 6px 6px;
  border-top: 1px solid #eee2cf;
}

.card-footer :deep(.visit-btn) {
  font-size: 15px;
  height: 24px;
  line-height: 24px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
}

.plain-arrow {
  font-size: 18px;   
  margin-left: 4px;
}

.ml-5 {
  margin-left: 4px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .museums-container {
    padding: 32px 16px 40px;
  }

  .section-title {
    font-size: 26px;
    margin-bottom: 28px;
  }

  .image-container {
    height: 200px;
  }
}
</style>
