import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import './bootstrap'

// build version
window.buildInfo = __APP_VERSION__

// mount app
const app = createApp(App)
app.use(router)
app.mount('#app')
