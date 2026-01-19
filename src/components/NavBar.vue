<template>
  <header class="nav-bar-root">
    <nav class="nav">
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/museums">博物馆目录</RouterLink>
      <RouterLink to="/vr">VR 展厅</RouterLink>
      <RouterLink to="/quiz">文物问答</RouterLink>
      <RouterLink to="/artifact/1">文物介绍</RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700;900&display=swap');

.nav-bar-root {
  font-family: 'Noto Serif SC', "Source Han Serif", serif;
}

/* 玻璃拟态导航栏*/
.nav {
  position: fixed;
  top: 0;
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  gap: 30px;
  padding-left: 40px;
  background: radial-gradient(circle at top left,
              rgba(255, 255, 255, 0.26),
              rgba(238, 226, 200, 0.12));
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  /* 高亮边框 */
  border-bottom: 1px solid rgba(210, 180, 120, 0.85);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
  z-index: 100;
}

/* 链接 */
.nav a {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 4px;           
  color: #8c6a20;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease, transform 0.15s ease;
}

/* hover样式*/
.nav a:hover {
  color: #c79532;
  transform: translateY(-1px);
}

/*金色分隔线*/
.nav a + a::before {
  content: "";
  position: absolute;
  left: -15px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 22px;
  background: linear-gradient(
    180deg,
    rgba(210, 180, 120, 0.15),
    rgba(210, 180, 120, 0.85),
    rgba(210, 180, 120, 0.15)
  );
  pointer-events: none; 
}

/* 小屏导航栏适配 */
@media (max-width: 768px) {
  .nav {
    height: 56px;         
    padding-left: 16px;   
    gap: 12px;            
  }

  .nav a {
    font-size: 14px;      /* 字体缩小一点 */
    padding: 0 2px;       /* 左右 padding 收窄 */
  }

  .nav a + a::before {
    left: -8px;           /* 分割线位置跟着缩进 */
    height: 18px;         
  }
}

</style>
