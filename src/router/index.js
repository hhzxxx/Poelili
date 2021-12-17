import { createRouter, createWebHistory } from 'vue-router'
import Proxy from '../views/Proxy.vue'
import Main from '../views/Main.vue'
import PoeSession from '../views/PoeSession.vue'
import checkValue from '../views/checkValue.vue'
import CaiMoGu from '../views/CaiMoGu.vue'

const routes = [
  {
    path: '/Proxy',
    name: 'Proxy',
    component: Proxy
  },{
    path: '/Main',
    name: 'Main',
    component: Main
  },{
    path: '/PoeSession',
    name: 'PoeSession',
    component: PoeSession
  },{
    path: '/checkValue',
    name: 'checkValue',
    component: checkValue
  },{
    path: '/CaiMoGu',
    name: 'CaiMoGu',
    component: CaiMoGu
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router