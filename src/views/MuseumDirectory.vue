<template>
  <div class="directory">
    <h1>博物馆目录</h1>
    <ul>
      <li v-for="museum in museums" :key="museum.id">
        {{ museum.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Museum {
  id: number
  name: string
}

const museums = ref<Museum[]>([
  { id: 1, name: '国家博物馆' },
  { id: 2, name: '故宫博物院' },
  { id: 3, name: '陕西历史博物馆' },
])
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 0.5rem 0;
}
</style>
