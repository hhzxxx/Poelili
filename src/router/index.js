import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/Proxy',
    name: 'Proxy',
    component: () => import('../views/Proxy.vue')
  },{
    path: '/Main',
    name: 'Main',
    component: () => import('../views/Main.vue')
  },{
    path: '/PoeSession',
    name: 'PoeSession',
    component: () => import('../views/PoeSession.vue')
  },{
    path: '/checkValue',
    name: 'checkValue',
    component: () => import('../views/checkValue.vue')
  },{
    path: '/CaiMoGu',
    name: 'CaiMoGu',
    component: () => import('../views/CaiMoGu.vue')
  },
  { path: '/', redirect: '/Main' },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: { render: () => null } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router