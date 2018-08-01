import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Signup from './views/Signup.vue'
import Login from './views/Login.vue'
import Workspace from './views/Workspace.vue'
import Folder from './views/Folder.vue'
import FolderDetail from './views/FolderDetail.vue'
import Task from './views/Task.vue'
import Account from './views/Account.vue'
import Decline from './views/Decline.vue'

Vue.use(Router)

const login = {
  path: '/login',
  name: 'login',
  component: Login,
  meta: { title: 'Login - enamel' }
}

const workspace = {
  path: '/workspace',
  name: 'workspace',
  component: Workspace,
  meta: { title: 'Workspace - enamel', requiresAuth: true },
  children: [
    {
      path: 'folder/:id',
      component: Folder,
      props: true,
      children: [
        {
          path: '',
          name: 'folder',
          component: FolderDetail
        },
        {
          path: 'task/:taskId',
          name: 'task',
          component: Task,
          props: true
        }
      ]
    }
  ]
}

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'enamel', redirect: true }
    },
    {
      path: '/signup/:id',
      name: 'signup',
      component: Signup,
      meta: { title: 'Signup - enamel' }
    },
    login,
    {
      path: '/decline/:id',
      name: 'decline',
      component: Decline,
      meta: { title: 'enamel' }
    },
    workspace,
    {
      path: '/account',
      name: 'account',
      component: Account,
      meta: { title: 'Accounts - enamel', requiresAuth: true }
    },

  ]
})

router.beforeEach((to, from, next) => {
  const auth = localStorage.getItem('user-id')
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if(!auth) {
      next(login)
    }
  } else if (to.matched.some(record => record.meta.redirect)) {
    if(auth) {
      next(workspace)
    }
  }
  next()
})

router.afterEach((to, from) => {
  document.title = to.meta.title
})

export default router