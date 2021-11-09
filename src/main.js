import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueClipboard from 'vue-clipboard2'

createApp(App).use(ElementPlus).use(router).use(VueClipboard).mount('#app')
