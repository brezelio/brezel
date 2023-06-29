import '@kibro/brezel-spa/dist-lib/style.css'
import { Brezel } from '@kibro/brezel-spa'
import App from './App.vue'

const brezel = new Brezel(import.meta.env.VITE_APP_API_URL, import.meta.env.VITE_APP_SYSTEM, {
  systemPath: '',
})
const app = brezel.bootstrap(App)

window.app = app
window.app.$t = app.__VUE_I18N__.global.t

export default app.mount('#app')
