<template>
  <div class="home-container">
    <!-- 主图区域-->
    <header id="top-anchor" class="hero">
      <div class="overlay"></div>

      <div class="hero-text">
        <h1 class="ink-effect-title">千年瑰宝 · 尽在指尖</h1>
        <p>打开数字文明的大门</p>
      </div>
    </header>

    <svg width="0" height="0">
      <filter id="goldCloudNoise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="4"
          seed="3"
          result="noise"
        >
          <animate
            attributeName="baseFrequency"
            values="0.01 0.01; 0.05 0.2; 0.01 0.01"
            dur="20s"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap
          in="noise"
          in2="noise"
          scale="40"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>

    <!-- 选择卡片区域 -->
    <section class="sections">
      <div class="sections-inner">
        <div class="section-card" @click="go('MuseumDirectory')">博物馆目录</div>
        <div class="section-card" @click="go('VRGallery')">VR 展厅</div>
        <div class="section-card" @click="go('ArtifactDetail', 1)">文物介绍</div>
        <div class="section-card" @click="go('Quiz')">文物问答</div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  methods: {
    go(name, id = null) {
      if (id) {
        this.$router.push({ name, params: { id } });
      } else {
        this.$router.push({ name });
      }
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700;900&display=swap");

/* 整体背景 */
.home-container {
  background: #f4ecd9;
  overflow: hidden;
  min-height: 100vh;
  font-family: "Noto Serif SC", "Source Han Serif", serif;
}

/* 主图区域 */
.hero {       
  height: calc(100vh - 70px);  
  width: 100%;
  background-image: url("https://cdn.pixabay.com/photo/2016/11/29/11/50/ancient-1869298_1280.jpg");
  background-size: cover;
  background-position: center;
  position: relative;
  animation: heroZoom 8s ease-out forwards;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.15),
    rgba(244, 236, 217, 0.35)
  );
  z-index: 2;
}

/* 文本淡入 */
.hero-text {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

/* 标题动画 */
.hero-text h1 {
  font-size: 80px;
  white-space: nowrap;
  margin: 0;
  font-weight: 900;
  color: #ffffff;
  text-shadow: none;
  opacity: 0;
  animation: textDrawIn 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards 0.8s;
  text-shadow:
    0 0 1px #ffd782,
    0 0 4px #b48a31,
    1px 1px 0 #5e471d,
    -1px -1px 0 #5e471d;
  clip-path: inset(0 100% 0 0);
}

@keyframes textDrawIn {
  0% {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    clip-path: inset(0 0% 0 0);
  }
}

.hero-text p {
  font-size: 30px;
  margin-top: 18px;
  opacity: 0;
  animation: fadeIn 2s ease forwards 1.8s;
}

/* 主图缩放动画 */
@keyframes heroZoom {
  0% {
    transform: scale(1.1);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 文本渐入 */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* 卡片区域 */
.sections {
  width: 100%;
  padding: 120px 0;
  background-image: url("/back1.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.sections-inner {
  width: 85%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 模块卡片 */
.section-card {
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  font-size: 26px;
  font-weight: 600;
  color: #8c6a20;
  border: 1px solid #dfc8a9;
  cursor: pointer;
  transition: 0.35s;
  position: relative;
  overflow: hidden;
}

.section-card:nth-child(1) {
  background-image: url("../assets/Home/he1.jpg");
  background-size: cover;
  background-position: center;
}

.section-card:nth-child(2) {
  background-image: url("../assets/Home/he2.jpg");
  background-size: cover;
  background-position: center;
}

.section-card:nth-child(3) {
  background-image: url("../assets/Home/he3.jpg");
  background-size: cover;
  background-position: center;
}

.section-card:nth-child(4) {
  background-image: url("../assets/Home/he4.jpg");
  background-size: cover;
  background-position: center;
}

/* 悬浮效果 */
.section-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
}

/* 金色云纹叠加 */
.section-card::before {
  content: "";
  position: absolute;
  inset: 0;
  filter: url(#goldCloudNoise);
  background: linear-gradient(
    135deg,
    rgba(255, 215, 130, 0.35),
    rgba(180, 138, 49, 0.45),
    rgba(255, 240, 200, 0.25)
  );
  mix-blend-mode: screen;
  opacity: 0.55;
  z-index: 0;
  pointer-events: none;
}

.section-card > * {
  position: relative;
  z-index: 3;
}

/* 左右交替布局 */
.section-card:nth-child(odd) {
  margin-right: auto;
  width: 70%;
}

.section-card:nth-child(even) {
  margin-left: auto;
  width: 70%;
}
</style>
