import '@kibro/brezel-spa/dist-lib/style.css'
import App from './App.vue'

import { Brezel } from '@kibro/brezel-spa'
import { defineAsyncComponent } from 'vue'

const brezel = new Brezel(import.meta.env.VITE_APP_API_URL, import.meta.env.VITE_APP_SYSTEM)
const app = brezel.bootstrap(App)

app.component('QuotationWizard', defineAsyncComponent(() => import('./components/QuotationWizard.vue')))

// Ensure recipe helper t() and legacy callers always have a callable $t on window.app
if (typeof app.$t !== 'function') {
  app.$t = app.config.globalProperties.$t
}
window.app = app

export default app.mount('#app')
