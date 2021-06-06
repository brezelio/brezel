import 'ant-design-vue/dist/antd.less'
import Brezel from '@kibro/brezel-spa'
import App from './App'

const brezel = new Brezel(process.env.VUE_APP_API_URL, process.env.VUE_APP_SYSTEM)
const app = brezel.bootstrap(App)

window.app = app

export default app.$mount('#app')
