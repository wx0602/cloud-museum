import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

//import './assets/main.css' // 若无此文件可删除该行

const app = createApp(App)
app.use(router)
app.mount('#app')
