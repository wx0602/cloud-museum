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
})

export default router
