import { createApp } from 'vue';
import App from './App.vue';
import RedeemIOEN from './components/RedeemIOEN.vue';
const app = createApp(App)

app.component('redeem-ioen', RedeemIOEN);

app.mount('#app');
