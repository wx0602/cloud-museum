<template>
  <div class="gallery-root">
    <!-- 顶部 Banner -->
    <div class="banner-wrapper">
      <img id="top-anchor" class="banner" src="/00A.svg" alt="展览横幅" />
    </div>

    <div class="gallery-title-wrapper">
      <h2 class="section-title">文物介绍</h2>
    </div>

    <!-- 左侧导航 + 右侧文物列表 -->
    <div class="layout">
      <!-- 左侧朝代导航栏 -->
      <aside class="sidebar">
        <h2 class="nav-title">按朝代检索</h2>
        <button
          class="nav-item"
          :class="{ active: selectedDynasty === '全部' }"
          @click="selectDynasty('全部')"
        >
          全部文物
        </button>
        <button
          v-for="d in dynasties"
          :key="d"
          class="nav-item"
          :class="{ active: selectedDynasty === d }"
          @click="selectDynasty(d)"
        >
          {{ d }}
        </button>
      </aside>

      <!-- 右侧内容 -->
      <main class="main-content">
        <!-- 瀑布流布局 -->
        <section
          v-if="selectedDynasty === '全部'"
          class="masonry"
          aria-label="文物列表"
        >
          <article
            v-for="item in filteredArtifacts"
            :key="item.id"
            class="card"
            @click="open(item)"
            tabindex="0"
            @keyup.enter="open(item)"
          >
            <img
              :src="item.img"
              :alt="item.shortDesc"
              class="card-img"
            />
            <div class="card-content">
              <h3 class="card-title">{{ item.shortDesc }}</h3>
              <p class="card-desc">{{ item.desc }}</p>
            </div>
          </article>
        </section>

        <!-- 按朝代筛选-->
        <section
          v-else
          class="grid"
          aria-label="文物列表"
        >
          <article
            v-for="item in filteredArtifacts"
            :key="item.id"
            class="card"
            @click="open(item)"
            tabindex="0"
            @keyup.enter="open(item)"
          >
            <img
              :src="item.img"
              :alt="item.shortDesc"
              class="card-img"
            />
            <div class="card-content">
              <h3 class="card-title">{{ item.shortDesc }}</h3>
              <p class="card-desc">{{ item.desc }}</p>
            </div>
          </article>
        </section>
      </main>
    </div>

    <!-- 弹出大图 -->
    <div v-if="active" class="lightbox" @click.self="close">
      <div class="lightbox-inner">
        <button class="close-btn" @click="close">×</button>
        <img :src="active.img" :alt="active.shortDesc" />
        <h2>{{ active.shortDesc }}</h2>
        <p class="lightbox-full-desc">{{ active.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import artifactsData from '@/assets/ArtifactDetail/relics.json'

const artifacts = ref([])

// 动态导入图片
async function loadImages() {
  artifacts.value = await Promise.all(
    artifactsData.map(async (item) => {
      try {
        const imageModule = await import(`./assets/ArtifactDetail/${item.img.replace('./', '')}`)
        return {
          ...item,
          img: imageModule.default || imageModule
        }
      } catch (error) {
        console.error(`Failed to load image: ${item.img}`, error)
        // 返回默认图片或保持原路径
        return {
          ...item,
          img: item.img
        }
      }
    })
  )
}

onMounted(() => {
  loadImages()
})

const active = ref(null)
const selectedDynasty = ref('全部')

// 去重后的朝代表
const dynasties = computed(() => {
  const set = new Set(artifacts.value.map(a => a.dynasty))
  return Array.from(set)
})

// 按朝代过滤后的文物
const filteredArtifacts = computed(() => {
  if (selectedDynasty.value === '全部') return artifacts.value
  return artifacts.value.filter(a => a.dynasty === selectedDynasty.value)
})


function selectDynasty(d) {
  selectedDynasty.value = d
}

function open(item) {
  active.value = item
}
function close() {
  active.value = null
}
</script>

<style scoped>
.gallery-root {
  /*background: #F6F1E7;*/
  min-height: 100vh;
  width: 100%;
}

/* 标题容器*/
.gallery-title-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 16px 0;  
  box-sizing: border-box;
}

/* 标题样式*/
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

/* Banner */
/* 外层容器*/
.banner-wrapper {
  width: 100%;
  max-width: 1200px;       
  margin: 16px auto 32px;  
  padding: 0 8px;          
  box-sizing: border-box;
}

/* 图片 */
.banner {
  width: 100%;
  height: auto;          
  display: block;
  border: none;
  border-radius: 0;         
}

/* 左侧导航、右侧内容整体布局 */
.layout {
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 40px 40px;
  box-sizing: border-box;
  display: flex;
  gap: 24px;
}

/* 左侧导航栏 */
.sidebar {
  width: 220px;
  background: #f0e3cf;
  border-radius: 12px;
  padding: 16px 14px 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  position: sticky;
  top: 80px;
  align-self: flex-start;
}

.nav-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #5b3a1a;
}

.nav-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  margin-bottom: 6px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #6b4b27;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(204, 162, 102, 0.2);
}

.nav-item.active {
  background: #c79c5b;
  color: #fff;
}

/* 右侧内容 */
.main-content {
  flex: 1;
  padding: 0;
  max-width: none;
  margin: 0;
}

/* 右侧内容 */
/* 右侧内容容器 */
.main-content {
  flex: 1;
  padding: 0;
  max-width: none;
  margin: 0;
}

/* 瀑布流 */
.masonry {
  column-count: 4;
  column-gap: 24px;
}

@media (max-width: 1400px) {
  .masonry { column-count: 3; }
}
@media (max-width: 1000px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    position: static;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .nav-item {
    width: auto;
    flex: 0 0 auto;
  }
  .masonry { column-count: 2; }
}
@media (max-width: 600px) {
  .masonry { column-count: 1; }
}

/* 横向 grid */
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  align-items: flex-start;
}

@media (max-width: 1400px) {
  .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 1000px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px) {
  .grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
}

/*卡片*/
.card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;  
  break-inside: avoid;
  display: inline-block; 
  width: 100%;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

/*文本不截断*/
.card-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  text-align: justify;
  font-weight: 400;
}


.card-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #2c3e50;
  text-align: left;
}


/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.9);
  z-index: 9999;
  padding: 20px;
}

.lightbox-inner {
  background: #fff;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
  padding: 40px;
  border-radius: 20px;
  position: relative;
  text-align: center;
}

.lightbox-inner img {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 12px;
  margin-bottom: 25px;
}

.lightbox-inner h2 {
  font-size: 28px;
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-weight: 700;
}

.lightbox-full-desc {
  font-size: 16px;
  color: #5d6d7e;
  line-height: 1.7;
  margin: 0;
  text-align: justify;
  font-weight: 500;
}

.close-btn {
  position: absolute;
  right: 20px;
  top: 15px;
  background: transparent;
  border: none;
  font-size: 36px;
  cursor: pointer;
  color: #7f8c8d;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

/* 小屏适配：banner 全宽铺满，标题变小，左右留少量边距，侧边栏挪到上面一行 */
@media (max-width: 768px) {
  /* 顶部 Banner 外层，不再居中收窄 */
  .banner-wrapper {
    max-width: 100%;
    margin: 8px 0 8px;
    padding: 0;
  }

  /* banner 按视口宽度铺满，两侧不留间距 */
  .banner {
    width: 100vw;
    max-width: none;
    margin-left: calc(50% - 50vw);  /* 向左拉齐到屏幕边 */
  }

  /* 标题整体往上收一点，左右加一点内边距 */
  .gallery-title-wrapper {
    padding: 8px 12px 0;
  }

  /* 标题变小一点，和下方间距缩小 */
  .section-title {
    font-size: 22px;
    margin: 0 0 12px;
  }

  /* 主体布局左右留少一点空白 */
  .layout {
    padding: 0 12px 32px;
    gap: 16px;
  }

  /* 侧边栏在小屏已经在 1000px 那个 media 里变成一行了，这里再压缩一下样式 */
  .sidebar {
    padding: 10px 10px 12px;
    border-radius: 10px;
  }

  .nav-title {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .nav-item {
    font-size: 13px;
    padding: 6px 8px;
  }

  /* 卡片里的文字也稍微变小一点 */
  .card-title {
    font-size: 16px;
  }

  .card-desc {
    font-size: 12px;
  }

  .card-content {
    padding: 12px;
  }
}

</style>
