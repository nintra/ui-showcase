import { createApp } from 'vue'
import '@fontsource-variable/fredoka'
import '@fontsource-variable/nunito'
import './style.css'
import App from './App.vue'
import { router } from './router.js'

createApp(App).use(router).mount('#app')
