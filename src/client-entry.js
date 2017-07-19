import Vue from 'vue'
import 'es6-promise/auto'
import { createApp } from './app'

const { app, router } = createApp()

router.onReady(() => {
  app.$mount('#app')
})
