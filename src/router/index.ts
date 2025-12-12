import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/museums',
    name: 'MuseumDirectory',
    component: () => import('@/views/MuseumDirectory.vue'),
  },
  {
    path: '/vr',
    name: 'VRGallery',
    component: () => import('@/views/VRGallery.vue'),
  },
  {
    path: '/artifact/:id',
    name: 'ArtifactDetail',
    component: () => import('@/views/ArtifactDetail.vue'),
    props: true,
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: () => import('@/views/Quiz.vue'),
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (to.hash) {
          resolve({ el: to.hash, behavior: 'smooth' })
        } else {
          // Default anchor
          const topAnchor = document.getElementById('top-anchor')
          if (topAnchor) {
            // top: 100 表示在锚点位置的基础上向下偏移 100px，避免被顶部导航栏遮挡
            resolve({ el: '#top-anchor', top: 100, behavior: 'smooth' })
          } else {
            resolve({ top: 0 })
          }
        }
      }, 100)
    })
  },
})

export default router
