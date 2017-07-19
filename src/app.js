import Vue from 'vue'
import VueApollo from 'vue-apollo'
import App from './App.vue'
import { createRouter } from './router'
import { createApolloProvider } from './apollo'

export function createApp () {
  const router = createRouter()
  const apolloProvider = createApolloProvider()

  const app = new Vue({
    router,
    apolloProvider,
    render: h => h(App)
  })

  return { app, apolloProvider, router }
}
