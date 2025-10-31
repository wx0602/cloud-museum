<template>
  <div class="quiz">
    <h1>文物问答</h1>
    <div v-if="!submitted">
      <p>{{ question }}</p>
      <ul>
        <li v-for="option in options" :key="option">
          <label>
            <input type="radio" v-model="answer" :value="option" />
            {{ option }}
          </label>
        </li>
      </ul>
      <button @click="submit">提交</button>
    </div>
    <p v-else>你的答案是：{{ answer }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const question = '兵马俑出土于哪里？'
const options = ['西安', '北京', '洛阳', '南京']
const answer = ref('')
const submitted = ref(false)

function submit() {
  submitted.value = true
}
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
button {
  margin-top: 1rem;
}
</style>
