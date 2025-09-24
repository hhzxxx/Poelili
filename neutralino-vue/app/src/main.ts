import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';

const App = {
  template: `<router-view />`
};

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
