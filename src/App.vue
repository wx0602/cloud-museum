<template>
  <div id="app" class="app-root">
    <!-- 全局玻璃拟态导航栏 -->
    <NavBar />

    <!-- 每个页面的内容区域 -->
    <main class="main">
      <RouterView />
    </main>

    <!-- 你的 AI 助手 -->
    <AiAssistant />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import AiAssistant from '@/views/ai-assistant.vue'
</script>

<style scoped>
.app-root {
  min-height: 100vh;
}

.main {
  padding-top: 60px; 
}
</style>
