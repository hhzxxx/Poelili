import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';
import Settings from '../pages/Settings.vue';
import Accounts from '../pages/Accounts.vue';
import Trade from '../pages/Trade.vue';
import Proxy from '../pages/Proxy.vue';
import Automation from '../pages/Automation.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/settings', name: 'settings', component: Settings },
  { path: '/accounts', name: 'accounts', component: Accounts },
  { path: '/trade', name: 'trade', component: Trade },
  { path: '/proxy', name: 'proxy', component: Proxy },
  { path: '/automation', name: 'automation', component: Automation }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
