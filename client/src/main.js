import Vue from 'vue'
// import VeeValidate from 'vee-validate'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { persistCache } from 'apollo-cache-persist'
import { onError } from "apollo-link-error"
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { withClientState } from 'apollo-link-state'
import { enableExperimentalFragmentVariables } from 'graphql-tag'
import VueApollo from 'vue-apollo'
import ElementUI from 'element-ui'
import VueAnalytics from 'vue-analytics'

import App from './App.vue'
import router from './router'
import store from './store'
// import './registerServiceWorker'

import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/style.scss'

import Avatar from '@/components/icons/Avatar.vue'
import CloseButton from '@/components/icons/CloseButton.vue'
import RemoveButton from '@/components/icons/RemoveButton.vue'
import PlusButton from '@/components/icons/PlusButton.vue'
import Navigation from '@/components/Navigation'

Vue.component('navigation', Navigation)
Vue.component('avatar', Avatar)
Vue.component('close-button', CloseButton)
Vue.component('remove-button', RemoveButton)
Vue.component('plus-button', PlusButton)

Vue.use(VueAnalytics, {
  id: 'UA-62716182-7'
})

Vue.use(ElementUI)
// Vue.use(VeeValidate)
Vue.config.productionTip = false

const uri = `${process.env.VUE_APP_URI}/graphql`
const httpLink = new HttpLink({
  uri,
})

const cache = new InMemoryCache({
  cacheRedirects: {
    Query: {
      getFolder: (_, args, { getCacheKey }) => {
        return getCacheKey({ __typename: 'Folder', id: args.id })
      },
      getTask: (_, args, { getCacheKey }) => {
        return getCacheKey({ __typename: 'Task', id: args.id })
      }
    },
  },
})

// persistCache({
//   cache,
//   storage: window.localStorage,
// })

const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('user-token')
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : null
    }
  })
  return forward(operation)
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    )
  if (networkError) console.log(`[Network error]: ${networkError}`)
})

const client = new ApolloClient({
  link: ApolloLink.from([
    errorLink,
    authMiddleware,
    httpLink
  ]),
  cache,
  connectToDevTools: true,
})

const apolloProvider = new VueApollo({
  defaultClient: client,
  defaultOptions: {
    $loadingKey: 'loading'
  }
})

Vue.use(VueApollo)

new Vue({
  router,
  provide: apolloProvider.provide(),
  store,
  render: h => h(App)
}).$mount('#app')
