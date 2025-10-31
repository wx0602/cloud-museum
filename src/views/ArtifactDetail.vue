<template>
  <div class="artifact-detail">
    <h1>文物详情</h1>
    <p>当前文物 ID：{{ id }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id as string
</script>

<style scoped>
.artifact-detail {
  padding: 1rem;
}
</style>
