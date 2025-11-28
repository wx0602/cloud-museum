<template>
  <div class="gallery-root">
    <!-- Banner -->
    <div class="banner-wrapper">
      <img class="banner" :src="bannerSrc" alt="展览横幅" />
    </div>

    <!-- Waterfall / Masonry gallery -->
    <section class="masonry" aria-label="文物瀑布流展示">
      <article
        v-for="item in artifacts"
        :key="item.id"
        class="card"
        :style="{ marginTop: randomMargin() }"
        @click="open(item)"
        tabindex="0"
        @keyup.enter="open(item)"
      >
        <img :src="item.img" :alt="item.shortDesc" class="card-img" />
        <div class="card-content">
          <h3 class="card-title">{{ item.shortDesc }}</h3>
          <p class="card-desc">{{ item.desc }}</p>
        </div>
      </article>
    </section>

    <!-- Lightbox / modal -->
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
import { ref } from 'vue'

// Banner image path
const bannerSrc = '/images/2.png'

// 修改数据，移除"文物 X"的标题
const artifacts = ref([
  { id: 1, img: '/images/图片 2.png', shortDesc: '四羊方尊', desc: '商朝晚期青铜礼器，是现存商代青铜方尊中最大的一件，现藏于中国国家博物馆。' },
  { id: 2, img: '/images/图片 3.png', shortDesc: '清明上河图', desc: '北宋风俗画，张择端存世精品，生动记录了北宋都城东京的城市面貌和社会生活状况，现藏于北京故宫博物院。' },
  { id: 3, img: '/images/图片 4.png', shortDesc: '后母戊鼎', desc: '商王祖庚或祖甲为祭祀其母戊所制，是迄今世界上出土最大、最重的青铜礼器，现藏于中国国家博物馆。' },
  { id: 4, img: '/images/图片 5.png', shortDesc: '大禹治水大玉山', desc: '清代玉雕作品，以新疆和田玉为原料，按宋人《大禹治水图》雕刻而成，现藏于北京故宫博物院。' },
  { id: 5, img: '/images/图片 6.png', shortDesc: '越王勾践剑', desc: '春秋晚期越国青铜器，因剑身上含铬金属而千年不锈，现藏于湖北省博物馆。' },
  { id: 6, img: '/images/图片 7.png', shortDesc: '曾侯乙编钟', desc: '战国早期文物，由六十五件青铜编钟组成，音域跨五个半八度，现藏于湖北省博物馆。' },
  { id: 7, img: '/images/图片 8.png', shortDesc: '明代凤冠', desc: '1957年出土于北京昌平定陵，冠上饰件以龙凤为主，工艺精湛，现藏于中国国家博物馆。' },
  { id: 8, img: '/images/图片 9.png', shortDesc: '金缕玉衣', desc: '汉代皇帝和高级贵族的殓服，以金线缕结玉片制成，现藏于徐州博物馆的金缕玉衣是年代最早、工艺最精的一件。' },
  { id: 9, img: '/images/图片 10.png', shortDesc: '镶金兽首玛瑙杯', desc: '唐代酒器，是唐代唯一一件俏色玉雕，现藏于陕西历史博物馆。' },
  { id: 10, img: '/images/图片 11.png', shortDesc: '马踏飞燕', desc: '东汉青铜器，造型独特，是中国古代高超铸造业的象征，现藏于甘肃省博物馆。' },
  { id: 11, img: '/images/图片 12.png', shortDesc: '太阳神鸟金饰', desc: '商周时期文物，2001年出土于成都金沙村，是古蜀国黄金工艺的代表，也是成都城市标志的核心图案。' },
  { id: 12, img: '/images/图片 13.png', shortDesc: '传国玉玺', desc: '秦代用和氏璧镌刻而成，是中国历代正统皇帝的证凭，虽已失传，但在中国历史上影响深远。' },
  { id: 13, img: '/images/图片 14.png', shortDesc: '五星出东方利中国', desc: '汉代蜀地织锦护臂，为国家一级文物，现藏于新疆博物馆。' },
  { id: 14, img: '/images/图片 15.png', shortDesc: '水晶杯', desc: '战国晚期水晶器皿，是中国出土的早期水晶制品中器形最大的一件，现藏于杭州博物馆。' },
  { id: 15, img: '/images/图片 16.png', shortDesc: '长信宫灯', desc: '西汉青铜器，1968年出土于河北满城中山靖王刘胜妻窦绾墓，现藏于河北博物院。' },
  { id: 16, img: '/images/图片 17.png', shortDesc: '兵马俑', desc: '即秦始皇陵兵马俑，是秦朝规模宏大的陶俑群，被誉为"世界第八大奇迹"，现藏于秦始皇帝陵博物院。' },
  { id: 17, img: '/images/图片 18.png', shortDesc: '铜冰鉴', desc: '战国时期青铜酒器，是最早的"冰箱"，现藏于中国国家博物馆。' },
  { id: 18, img: '/images/图片 19.png', shortDesc: '佛指舍利', desc: '佛教圣物，其中法门寺地宫出土的佛指舍利最为著名，现藏于法门寺博物馆。' },
  { id: 19, img: '/images/图片 20.png', shortDesc: '镂雕象牙云龙纹套球', desc: '清代工艺品，工艺复杂，层层嵌套，现藏于北京故宫博物院。' },
  { id: 20, img: '/images/图片 21.png', shortDesc: '汝窑天蓝釉刻花鹅颈瓶', desc: '宋代汝窑瓷器，造型优美，现藏于河南博物院' },
  { id: 21, img: '/images/图片 22.png', shortDesc: '妇好青铜鹗尊', desc: '商代晚期青铜器，为商王武丁配偶妇好的陪葬品，现藏于中国国家博物馆。' },
  { id: 22, img: '/images/图片 23.png', shortDesc: '鹰形陶鼎', desc: '新石器时代仰韶文化陶器，造型生动，现藏于中国国家博物馆。' },
  { id: 23, img: '/images/图片 24.png', shortDesc: '红山文化玉龙', desc: '新石器时代玉器，被称为"中华第一龙"，现藏于中国国家博物馆。' },
  { id: 24, img: '/images/图片 25.png', shortDesc: '西周青铜利簋', desc: '西周早期青铜器，是目前确知的最早的西周青铜器，现藏于中国国家博物馆。' },
  { id: 25, img: '/images/图片 26.png', shortDesc: '人面鱼纹彩陶盆', desc: '新石器时代仰韶文化彩陶，纹饰独特，现藏于中国国家博物馆。' },
  { id: 26, img: '/images/图片 27.png', shortDesc: '嵌珍珠宝石金项链', desc: '隋代金器，工艺精美，现藏于中国国家博物馆。' },
  { id: 27, img: '/images/图片 28.png', shortDesc: '孝端皇后九龙九凤冠', desc: '明代凤冠，1957年出土于北京昌平定陵，现藏于中国国家博物馆。' },
  { id: 28, img: '/images/图片 29.png', shortDesc: '粉彩兽耳百鹿尊', desc: '清代乾隆时期瓷器，是景德镇粉彩瓷中的代表作，现藏于中国陶瓷博物馆。' }
])

const active = ref(null)

// 随机上边距函数，创造错落效果
function randomMargin() {
  const margins = ['0px', '10px', '20px', '30px', '40px']
  return margins[Math.floor(Math.random() * margins.length)]
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
  background: #F6F1E7;
  min-height: 100vh;
  padding: 40px;
  box-sizing: border-box;
  width: 100%;
}

.banner-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 50px;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
}

.banner {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 12px 36px rgba(0,0,0,0.15);
}

/* 瀑布流布局 */
.masonry {
  column-count: 5;
  column-gap: 25px;
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
}

@media (max-width: 1400px) { .masonry { column-count: 4; } }
@media (max-width: 1100px) { .masonry { column-count: 3; } }
@media (max-width: 800px) { .masonry { column-count: 2; } }
@media (max-width: 500px) { .masonry { column-count: 1; } }

.card {
  break-inside: avoid;
  background: white;
  margin-bottom: 25px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  cursor: pointer;
  transition: all 0.4s ease;
  width: 100%;
}

.card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0,0,0,0.18);
}

.card-img {
  width: 100%;
  height: auto;
  min-height: 200px;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.card-content {
  padding: 20px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #2c3e50; /* 深色文字 */
  line-height: 1.3;
  text-align: center;
}

.card-desc {
  font-size: 14px;
  color: #5d6d7e; /* 加深描述文字颜色 */
  margin: 0;
  line-height: 1.6;
  text-align: justify;
  font-weight: 500;
}

/* 弹窗样式 */
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
  color: #5d6d7e; /* 加深弹窗文字颜色 */
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
</style>
