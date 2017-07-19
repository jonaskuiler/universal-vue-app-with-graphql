import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Welcome = () => import('../view/Welcome.vue')

export function createRouter () {
  return new Router({
    mode: 'history',
    scrollBehavior: () => ({ y: 0 }),
    routes: [
      {
        name: 'home',
        path: '/',
        component: Welcome
      }
    ]
  })
}
