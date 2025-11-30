<template>
  <div class="vr-container">
    <VRBanner />

    <div class="vr-page">

      <h1>VR 展厅合集</h1>

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

// ====== 展馆数据（可后续独立为 JSON）======
const vrList = ref([
  {
    id: 1,
    name: "故宫博物院",
    cover: "https://example.com/img1.jpg",
    description: "第三方制作，可在线浏览展馆全景。",
    tags: ["艺术", "中国"],
    link: "https://www.dpm.org.cn/vr/index.html"
  },
  {
    id: 2,
    name: "上海博物馆（古犀献珍）",
    cover: "https://example.com/img1.jpg",
    description: "第三方制作，可在线浏览展馆全景。",
    tags: ["艺术", "中国"],
    link: "https://www.shanghaimuseum.net/yun/static/1937312374432075776/spg.html?m=1937312374432075776"
  },
  {
    id:3,
    name: "中国国家博物馆VR展厅集成",
    cover: "https://m.chnmuseum.cn/Portals/0/web/vr/",
    description: "第三方制作，可在线浏览展馆全景。",
    tags: ["艺术", "中国","现代艺术","国际","历史"],
    link: "https://m.chnmuseum.cn/Portals/0/web/vr/"
  },
  {
    id: 4,
    name: "上海博物馆（小藏品集成）",
    cover: "https://www.shanghaimuseum.net/mu/frontend/pg/infomation/ar",
    description: "藏品集成，必须下载APP",
    tags: ["艺术", "中国","历史"],
    link: "https://www.shanghaimuseum.net/mu/frontend/pg/infomation/ar"
  },
  {
    id: 5,
    name: "北京鲁迅博物馆-主馆",
    cover: "https://example.com/img3.jpg",
    description: "可在线浏览展馆全景。",
    tags: ["历史", "中国"],
    link: "https://vr.realsee.cn/cvr/vmldAgGRjjHLWEwt2m/0YJyOo0xSghrg2bdqp4b7FATdhDhrLae/?payload=eyJjbHVzdGVyX2lkIjozLCJyZWdpb25faWQiOjcsInBhY2thZ2VfaWQiOjcsImN1c3RvbV9pZCI6MjE3NzQ4NjI4MDF9&withGoBack=1&loading=1&ts=1764078330980"
  },
  {
    id: 6,
    name: "上海博物馆(全景集合)",
    cover: "https://m.chnmuseum.cn/Portals/0/web/vr/",
    description: "第三方制作，可在线浏览展馆全景。",
    tags: ["艺术", "中国","现代艺术","国际","历史"],
    link: "https://www.shanghaimuseum.net/mu/frontend/pg/infomation/three-dimensions?type=permanent"
  },
  {
    id: 7,
    name: "卢浮宫",
    cover: "https://example.com/img1.jpg",
    description: "第三方制作，可在线浏览展馆全景。",
    tags: ["艺术","历史"],
    link: "https://www.louvre.fr/visites-en-ligne/petitegalerie/saison6/"
  },
  {
    id: 8,
    name: "罗马梵蒂冈博物馆",
    cover: "https://example.com/img1.jpg",
    description: "第三方制作，可在线浏览展馆全景。",
    tags: ["艺术","历史"],
    link: "https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/tour-virtuali-elenco.1.html"
  },
  {
    id: 9,
    name: "美国国立自然历史博物馆",
    cover: "https://example.com/img1.jpg",
    description: "第三方制作，可在线浏览展馆全景。",
    tags: ["艺术","历史"],
    link: "https://naturalhistory2.si.edu/vt3/NMNH/?startscene=21&startactions=lookat(-32.02,2.68,120,0,0);"
  },
  {
    id: 10,
    name: "圣彼得堡冬宫博物馆",
    cover: "https://example.com/img1.jpg",
    description: "第三方制作，可在线浏览展馆全景。",
    tags: ["艺术","历史"],
    link: "https://pano.hermitagemuseum.org/newpano/ru/main/#node342"
  },
  {
    id: 11,
    name: "卢浮宫",
    cover: "https://example.com/img1.jpg",
    description: "第三方制作，可在线浏览展馆全景。",
    tags: ["艺术","历史"],
    link: "https://www.louvre.fr/visites-en-ligne/petitegalerie/saison6/"
  },
]);

// ====== 自动加载 assets/vr 中的图片 ======
const importImages = import.meta.glob("@/assets/vr/*.{png,jpg,jpeg}", {
  eager: true,
  import: "default"
});

// 转成排序数组（按文件名排序）
const sortedImages = Object.entries(importImages)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([_, src]) => src);

// 使用第 4、5、6 张图片覆盖 vrList 的前三个封面
for (let i = 0; i < 8; i++) {
  const imgIndex = i; // 从 sortedImages[3] 开始取
  if (sortedImages[imgIndex]) {
    vrList.value[i].cover = sortedImages[imgIndex];
  }
}


// ====== 搜索过滤 ======
const keyword = ref("");
const selectedTag = ref("");

const tags = computed(() => {
  const set = new Set();
  vrList.value.forEach(v => v.tags.forEach(t => set.add(t)));
  return [...set];
});

const toggleTag = tag => {
  selectedTag.value = selectedTag.value === tag ? "" : tag;
};

const filteredList = computed(() => {
  return vrList.value.filter(item =>
    item.name.includes(keyword.value) &&
    (selectedTag.value ? item.tags.includes(selectedTag.value) : true)
  );
});

// ====== 点击打开 VR（新窗口）======
const openVR = (item) => {
  window.open(item.link, "_blank");
};
</script>


<style scoped>
.vr-page {
  padding: 20px;
  max-width: 900px;
  margin: auto;
}

.search-box {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
}

.tag-list {
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-list button {
  padding: 6px 14px;
  border: 1px solid #aaa;
  background: white;
  cursor: pointer;
  border-radius: 6px;
}

.tag-list button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  width: 260px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #ddd;
  transition: 0.2s;
}

.card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.info {
  padding: 10px;
}
</style>
