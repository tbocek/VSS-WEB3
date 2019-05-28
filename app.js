import Vue from 'vue/dist/vue.js'
import App from './src/App.vue'

Vue.component('app', App);

new Vue({
    el: '#app',
    component: { App }
})
