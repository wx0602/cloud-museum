<template>
  <div class="banner">
    <!-- 图片容器 -->
    <div 
      class="slides" 
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div 
        v-for="(item, index) in images" 
        :key="index" 
        class="slide"
        @click="goToVR(item.link)"
      >
        <img :src="item.url" :alt="item.name" />
        <div class="caption">
          <h2>{{ item.name }}</h2>
          <p>点击进入 VR 展厅</p>
        </div>
      </div>
    </div>

    <!-- 左右按钮 -->
    <button class="arrow left" @click="prev">‹</button>
    <button class="arrow right" @click="next">›</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// 批量导入 src/assets/vr/ 下的图片
const modules = import.meta.glob('@/assets/vr/*.png', { eager: true }) as Record<string, { default: string }>;

const sortedKeys = Object.keys(modules).sort(); // 按文件名升序排序

const names = ["故宫博物院", "上海博物馆（古犀献珍）", "中国国家博物馆"];
const links = [
  "https://www.dpm.org.cn/vr/index.html",
  "https://www.shanghaimuseum.net/yun/static/1937312374432075776/spg.html?m=1937312374432075776",
  "https://m.chnmuseum.cn/Portals/0/web/vr/"
];

const images = sortedKeys
  .slice(0, 3)  // 只取前三张图片
  .map((key, index) => ({
    name: names[index],
    url: modules[key].default,
    link: links[index]
  }));


const currentIndex = ref(0);

function next() {
  currentIndex.value = (currentIndex.value + 1) % images.length;
}

function prev() {
  currentIndex.value =
    (currentIndex.value - 1 + images.length) % images.length;
}

function goToVR(link: string) {
  window.open(link, "_blank");
}
</script>

<style scoped>
.banner {
  width: 80%;           /* 占屏幕宽度 80% */
  height: 70vh;         /* 保持高度 70% 屏幕 */
  margin: 0 auto;       /* 水平居中 */
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.slides {
  display: flex;
  width: 100%;       /* 改为 100% */
  height: 100%;
  transition: transform 0.6s ease;
}
.slide {
  flex: 0 0 100%;    /* 每张图片固定占 100% */
  height: 100%;
  position: relative;
  cursor: pointer;
}


.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 让图片覆盖整个容器，保持比例，裁剪溢出部分 */
}


/* 文字遮罩 */
.caption {
  position: absolute;
  bottom: 20%;
  left: 5%;
  color: white;
  text-shadow: 0 0 10px black;
}

.caption h2 {
  font-size: 3rem;
  margin: 0;
}

/* 左右切换按钮 */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  font-size: 3rem;
  padding: 0 0.5rem;
  cursor: pointer;
  z-index: 10;
  border-radius: 6px;
}

.arrow.left {
  left: 10px;
}
.arrow.right {
  right: 10px;
}

.arrow:hover {
  background: rgba(0, 0, 0, 0.6);
}
</style>
