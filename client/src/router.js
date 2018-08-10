import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Signup from './views/Signup.vue'
import Login from './views/Login.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'enamel' }
    },
    {
      path: '/signup/:id',
      name: 'signup',
      component: Signup,
      meta: { title: 'Signup - enamel' }
    },
    {
    	path: '/login',
    	name: 'login',
    	component: Login,
    	meta: { title: 'Login - enamel' }
    }
  ]
})

router.afterEach((to, from) => {
  document.title = to.meta.title
})

export default router