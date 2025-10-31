<template>
  <div id="app">
    <header>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/museums">博物馆目录</RouterLink>
        <RouterLink to="/vr">VR 展厅</RouterLink>
        <RouterLink to="/quiz">文物问答</RouterLink>
        <RouterLink to="/artifact/1">文物介绍</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
nav {
  display: flex;
  gap: 1rem;
  background: #eee;
  padding: 1rem;
}
a {
  text-decoration: none;
  color: #333;
}
a.router-link-exact-active {
  color: #42b983;
  font-weight: bold;
}
</style>

