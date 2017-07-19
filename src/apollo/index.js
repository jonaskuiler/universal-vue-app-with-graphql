import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { createApolloFetch } from 'apollo-fetch'
import { print } from 'graphql/language/printer'

Vue.use(VueApollo)

const isBrowser = (typeof window !== 'undefined')

// create apollo config since there's a difference
// between the one on the server and client
const createApolloConfig = () => {
  const uri = 'http://localhost:47274/'
  const apolloFetch = createApolloFetch({ uri })

  const networkInterface = {
    // use apollo-fetch as network interface
    // it uses isomorphic-fetch to do requests
    query: req => {
      return apolloFetch({
        ...req,
        query: print(req.query)
      })
    }
  }

  // Only use ssrMode in server context
  let apolloConfig = {
    ssrMode: true,
    networkInterface
  }

  // hydrate the application in browser context
  // this is to make sure that the state of the client
  // is in sync with the state generated on the server
  if (isBrowser) {
    const state = window.__APOLLO_STATE__

    if (state) {
      apolloConfig = {
        ...apolloConfig,
        ssrMode: false,
        initialState: state.defaultClient
      }
    }
  }

  return apolloConfig
}

// return a new VueApollo instance
export function createApolloProvider () {
  const apolloConfig = createApolloConfig()
  const defaultClient = new ApolloClient(apolloConfig)

  return new VueApollo({ defaultClient })
}
