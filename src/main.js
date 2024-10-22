import '@kibro/brezel-spa/dist-lib/style.css'
import App from './App.vue'

// Local Dist / Build
import { Brezel } from '@kibro/brezel-spa'
import CreateOrder from './components/CreateOrder.vue'
import ManuallyConfirmOffer from './components/ManuallyConfirmOffer.vue'

// Linked
// import Brezel from '@kibro/brezel-spa/src/brezel'

const brezel = new Brezel(import.meta.env.VITE_APP_API_URL, import.meta.env.VITE_APP_SYSTEM)
const app = brezel.bootstrap(App)

app.component('CreateOrder', CreateOrder);
app.component('ManuallyConfirmOffer',ManuallyConfirmOffer);
window.app = app

export default app.mount('#app')
