import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import { router } from './plugins/router.js'
import { vuetify } from './plugins/vuetify.js'
import { VueQueryPlugin, vueQueryPluginOptions } from './plugins/query-client.js'
import './styles/tokens.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(VueQueryPlugin, vueQueryPluginOptions)

app.mount('#app')
