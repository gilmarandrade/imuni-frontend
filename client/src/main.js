import Vue from 'vue'
import App from './App.vue'

import './config/msgs'
import './config/bootstrap'
import './config/axios'
import store from './config/store'
import router from './config/router'

import VueSocketIO from 'vue-socket.io';

// import '@fortawesome/fontawesome-free/css/all.css'
// import '@fortawesome/fontawesome-free/js/all.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCoffee, faChild, faCircle, faArchive, faExclamationCircle, faSync, faHeadset, faPlus, faSpinner, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { faComment, faCheckCircle, faTimesCircle, faClock } from '@fortawesome/free-regular-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome'

library.add(
  faCoffee,
  faChild,
  faCircle,
  faArchive,
  faComment,
  faTwitter,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faExclamationCircle,
  faSync,
  faHeadset,
  faPlus,
  faSpinner,
  faAngleDown,
)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('font-awesome-layers', FontAwesomeLayers)
Vue.component('font-awesome-layers-text', FontAwesomeLayersText)

Vue.config.productionTip = false

Vue.use(new VueSocketIO({
    debug: true,
    connection: process.env.VUE_APP_SOCKET_URL,
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    },
    // options: { path: '/api/socket.io' } //Optional options
}))


new Vue({
    store,
    router,
    render: h => h(App),
}).$mount('#app')