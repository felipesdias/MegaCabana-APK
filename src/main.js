// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
// require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
require(`quasar/dist/quasar.${__THEME}.css`)
// ==============================

// Uncomment the following lines if you need IE11/Edge support
// require(`quasar/dist/quasar.ie`)
// require(`quasar/dist/quasar.ie.${__THEME}.css`)

import Vue from 'vue'
import Quasar from 'quasar'
import router from './router'
import axios from 'axios'
import Vuex from 'vuex'

const ipAdress = (DEV) ? 'http://192.168.1.100/api' : 'http://192.168.1.100/api'
Vue.prototype.API = axios.create({
  baseURL: ipAdress,
  timeout: 10000,
  headers: {
    'Accept': 'application/json'
  },
  responseType: 'json'
})

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    ADM: false
  },
  mutations: {
    loga (state) {
      state.ADM = true
    },
    desloga (state) {
      state.ADM = false
    }
  }
})

Vue.config.productionTip = false
Vue.use(Quasar) // Install Quasar Framework

if (__THEME === 'mat') {
  require('quasar-extras/roboto-font')
}
import 'quasar-extras/animate'
import 'quasar-extras/material-icons'
// import 'quasar-extras/ionicons'
// import 'quasar-extras/fontawesome'
// import 'quasar-extras/animate'

Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    router,
    store,
    render: h => h(require('./App').default)
  })
})
