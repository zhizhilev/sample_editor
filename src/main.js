import Vue from 'vue'
import App from './App.vue'
import JsPlumb from 'jsplumb'

Vue.config.productionTip = false

Vue.use(JsPlumb)

new Vue({
  render: h => h(App),
}).$mount('#app')
