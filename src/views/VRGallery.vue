<template>
  <div class="vr-container">

    <!-- 顶部 Banner -->
    <div class="banner-wrapper">
      <img id="top-anchor" src="/00D.svg" class="banner" />
    </div>

    <div class="vr-title-wrapper">
      <h2 class="section-title">VR 展厅合集</h2>
    </div>

    <!-- VRBanner-->
    <div class="vr-carousel-wrapper">
      <VRBanner />
    </div>

    <!--页面主体内容 -->
    <div class="vr-page">
      <!-- 搜索框 -->
      <input
        v-model="keyword"
        class="search-box"
        placeholder="搜索 VR 展厅..."
      />

      <!-- 标签过滤 -->
      <div class="tag-list">
        <button
          v-for="tag in tags"
          :key="tag"
          @click="toggleTag(tag)"
          :class="{ active: selectedTag === tag }"
        >
          {{ tag }}
        </button>
      </div>

      <!-- 展馆卡片 -->
      <div class="gallery">
        <div
          v-for="item in filteredList"
          :key="item.id"
          class="card"
          @click="openVR(item)"
        >
          <img :src="item.cover" class="cover" />
          <div class="info">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import VRBanner from "@/components/VRBanner.vue";

//  展馆数据
import vrListData from '@/assets/vr/vrList.json'

const vrList = ref(vrListData)


// 自动加载封面
const importImages = import.meta.glob("@/assets/vr/*.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
});

const sortedImages = Object.entries(importImages)
  .sort(([aPath], [bPath]) => aPath.localeCompare(bPath))
  .map(([_, src]) => src);

for (let i = 0; i < vrList.value.length; i++) {
  if (sortedImages[i]) vrList.value[i].cover = sortedImages[i];
}

// 搜索过滤
const keyword = ref("");
const selectedTag = ref("");

const tags = computed(() => {
  const set = new Set();
  vrList.value.forEach((v) => v.tags.forEach((t) => set.add(t)));
  return [...set];
});

const toggleTag = (tag) => {
  selectedTag.value = selectedTag.value === tag ? "" : tag;
};

const filteredList = computed(() => {
  return vrList.value.filter(
    (item) =>
      item.name.includes(keyword.value) &&
      (selectedTag.value ? item.tags.includes(selectedTag.value) : true)
  );
});

//点击打开 VR 
const openVR = (item) => {
  window.open(item.link, "_blank");
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700;900&display=swap");

/* 整体背景 */
.vr-container {
  min-height: 100vh;
  /*font-family: "Noto Serif SC", "Source Han Serif", serif;*/
}

/* 顶部静态 Banner */
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
}

.vr-title-wrapper {
  max-width: 1200px;           
  margin: 0 auto;             
  padding: 40px 16px 0;        
  box-sizing: border-box;
}

/* 标题样式 */
.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  color: #5b3a1a;         
  margin: 0 0 24px;
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

/* 小屏适配 */
@media (max-width: 768px) {
  .section-title {
    font-size: 26px;
    margin-bottom: 20px;
  }
}

/* VRBanner 容器 */
.vr-carousel-wrapper {
  max-width: 960px;
  margin: 12px auto 8px;
  padding: 0 8px;
  box-sizing: border-box;
}

/* 页面内容 */
.vr-page {
  padding: 16px 16px 40px;
  max-width: 960px;
  margin: 0 auto;
}

.page-title {
  font-size: 26px;
  margin: 4px 0 16px;
  color: #5b3a1a;
}

/* 搜索框 */
.search-box {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #d0c4b1;
  background: #fdfaf5;
}

/* 标签 */
.tag-list {
  margin: 10px 0 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-list button {
  padding: 6px 14px;
  border: 1px solid #c8b79d;
  background: #fff;
  cursor: pointer;
  border-radius: 999px;
  font-size: 14px;
  color: #6b4b27;
}

.tag-list button.active {
  background: #c79c5b;
  color: #fff;
  border-color: #c79c5b;
}

/* 展馆卡片 */
.gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.card {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e0d4c0;
  background: #fff;
  transition: 0.2s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.cover {
  width: 100%;
  height: 170px;
  object-fit: cover;
}

.info {
  padding: 10px 12px 14px;
}

.info h3 {
  font-size: 16px;
  margin: 0 0 6px;
  color: #2c3e50;
}

.info p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #6b6b6b;
}

/* 小屏适配 */
@media (max-width: 700px) {
  .vr-carousel-wrapper {
    margin-top: 12px;
  }

  .gallery {
    grid-template-columns: 1fr;
  }

  .banner-wrapper {
    max-width: 100%;
    margin: 8px 0 12px;   /* 顶部和底部间距都缩小 */
    padding: 0;
  }

  /* banner 按整个视口宽度铺满，两侧不留间距 */
  .banner {
    width: 100vw;
    max-width: none;
    margin-left: calc(50% - 50vw);  /* 往左拉齐到屏幕边 */
  }

  /* 标题区域整体往上收一点，文字缩小 */
  .vr-title-wrapper {
    padding: 8px 12px 0;
  }

  .section-title {
    font-size: 22px;      /* 比原来更小一点 */
    margin-bottom: 12px;  /* 标题与下方间距缩小 */
  }
}
</style>
