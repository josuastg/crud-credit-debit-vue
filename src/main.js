import Vue from 'vue'
import App from './App.vue'
import Vuesax from 'vuesax';
import 'vuesax/dist/vuesax.css' //Vuesax styles
import { vsButton, vsPopup, vsInput } from 'vuesax'

Vue.config.productionTip = false

Vue.use(Vuesax, {
  vsButton,
  vsPopup,
  vsInput,
})

new Vue({
  render: h => h(App),
}).$mount('#app')
