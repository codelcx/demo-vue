import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // 首页
  {
    path: '/',
    name: 'home',
    component: () => import('@/components/HelloWorld.vue'),
  },

  // 文件上传
  {
    path: '/upload',
    name: 'upload',
    component: () => import('@/fileUpload/index.vue'),
  },

  // 水印
  {
    path: '/watermark',
    name: 'watermark',
    component: () => import('@/waterMark/index.vue'),
  },
]

const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
})

export default router
