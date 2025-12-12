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
const vrList = ref([
  {
    id: 1,
    name: "故宫博物院",
    description: "推开紫禁城的朱门，你踩响的是六百年华夏文明的回音。",
    tags: ["艺术", "中国"],
    link: "https://www.dpm.org.cn/vr/index.html",
  },
  {
    id: 2,
    name: "上海博物馆",
    description: "当青铜器上的饕餮凝视着你，华夏先祖的智慧正穿透三千年迷雾。",
    tags: ["艺术", "中国"],
    link: "https://www.shanghaimuseum.net/yun/static/1937312374432075776/spg.html?m=1937312374432075776",
  },
  {
    id: 3,
    name: "中国国家博物馆VR展厅集成",
    description: "从商周甲骨到唐宋文书，这里收藏着汉字跳动的五千年心脏。",
    tags: ["艺术", "中国", "现代艺术", "国际", "历史"],
    link: "https://m.chnmuseum.cn/Portals/0/web/vr/",
  },
  {
    id: 4,
    name: "上海博物馆（小藏品集成）",
    description: "芥子纳须弥，掌上观乾坤。通过专属工具，细节性触摸大历史中的微小精华。",
    tags: ["艺术", "中国", "历史"],
    link: "https://www.shanghaimuseum.net/mu/frontend/pg/infomation/ar",
  },
  {
    id: 5,
    name: "北京鲁迅博物馆-主馆",
    description:"走进绍兴文人的静默院落，在墨香中追寻那个年代的呐喊与彷徨。",
    tags: ["历史", "中国"],
    link: "https://vr.realsee.cn/cvr/vmldAgGRjjHLWEwt2m/0YJyOo0xSghrg2bdqp4b7FATdhDhrLae/?payload=eyJjbHVzdGVyX2idjozLCJyZWdpb25faWQiOjcsInBhY2thZ2VfaWQiOjcsImN1c3RvbV9pZCI6MjE3NzQ4NjI4MDF9&withGoBack=1&loading=1&ts=1764078330980",
  },
  {
    id: 6,
    name: "上海博物馆(全景集合)",
    description: "海派文化的博大精深。在云端漫步，欣赏典雅精致的江南艺术收藏。",
    tags: ["艺术", "中国", "现代艺术", "国际", "历史"],
    link: "https://www.shanghaimuseum.net/mu/frontend/pg/infomation/three-dimensions?type=permanent",
  },
  {
    id: 7,
    name: "卢浮宫",
    description: "塞纳河畔的艺术王宫，米洛的维纳斯在此静默，达芬奇的微笑永恒。",
    tags: ["艺术", "历史"],
    link: "https://www.louvre.fr/visites-en-ligne/petitegalerie/saison6/",
  },
  {
    id: 8,
    name: "罗马梵蒂冈博物馆",
    description: "仰望西斯廷教堂穹顶，米开朗基罗笔下的人类创世在此定格。",
    tags: ["艺术", "历史"],
    link: "https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/tour-virtuali-elenco.1.html",
  },
  {
    id: 9,
    name: "美国国立自然历史博物馆",
    description:"从巨型恐龙的骸骨到宇宙星尘，探寻地球与生命亿万年的壮阔进化史。",
    tags: ["艺术", "历史"],
    link: "https://naturalhistory2.si.edu/vt3/NMNH/?startscene=21&startactions=lookat(-32.02,2.68,120,0,0);",
  },
  {
    id: 10,
    name: "圣彼得堡冬宫博物馆",
    description:"俄罗斯沙皇的冬日宫殿，用巴洛克的极致奢华承载欧洲艺术的万千珍藏。",
    tags: ["艺术", "历史"],
    link: "https://pano.hermitagemuseum.org/newpano/ru/main/#node342",
  },
  {
    id: 11,
    name: "河南博物馆",
    description:"荟萃中原八千年文明瑰宝。商周青铜、汉唐陶俑，见证华夏起源与兴衰，是触摸中华文脉的殿堂。",
    tags: ["历史", "中国"],
    link: "https://www.chnmus.net/ch/exhibitions/virtual/index.html",
  },
  {
    id: 12,
    name: "良渚博物馆",
    description:"玉琮神徽、古城水利，展现远古王国智慧，是中华文明探源的核心地标。",
    tags: ["古历史", "中国"],
    link: "https://www.lzmuseum.cn/vr/index.html?scene_id=23692226",
  },
  {
    id: 13,
    name: "海昏侯博物馆",
    description:"惊世黄金、万枚简牍，揭秘废帝刘贺的传奇生平，是解码西汉盛世的独特钥匙。",
    tags: ["历史", "中国"],
    link: "https://www.jxmuseum.cn/xnbz/html/xnbz.html",
  },
  {
    id: 14,
    name: "苏州博物馆",
    description:"现代建筑与古典园林的完美交融。吴门书画、玲珑珍玩，诠释江南美学的诗意与精致，是一座会呼吸的艺术殿堂。",
    tags: ["艺术", "历史"],
    link: "https://www.szmuseum.com/0pano/new/pano/index.html",
  },
  {
    id: 15,
    name: "南京博物馆",
    description:"六朝金粉、明清书画，南北文明在此交融，是纵览华夏万年历史的完整坐标。",
    tags: ["历史","中国"],
    link: "https://www.4dkankan.com/spg.html?m=KJ-MaJvGglMJVz&lang=zh",
  },
  {
    id: 16,
    name: "云南省博物馆",
    description:"滇国青铜、南诏大理，多元文明与自然生态交融，是领略彩云之南瑰丽神奇的文化窗口。",
    tags: ["艺术", "历史","中国"],
    link: "https://www.ynmuseum.org/wszl/",
  },
  {
    id: 17,
    name: "丝绸之路博物馆",
    description:"驼铃商队、珍宝荟萃，见证东西方商品、艺术与信仰的融合之路，一座跨越时空的世界之窗。",
    tags: ["历史","艺术", "国际","中国"],
    link: "https://www.chnmuseum.cn/portals/0/web/vr/sczl/mobile/",
  },
  {
    id: 18,
    name: "湖南省博物馆·战国春秋特展",
    description:"青铜剑戈、简牍思想，七雄并立与文化交融，铺就了华夏一统的深沉基底。",
    tags: ["古历史","中国"],
    link: "https://www.hnmuseum.com/sites/default/files/activity/3d/",
  },
]);

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
}
</style>
