import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../components/Login.vue';
import Home from '../components/Home.vue';
import Welcome from '../components/Welcome.vue';
import User from '../components/user/User.vue';
import PowerItem from '../components/power/PowerItem.vue';
import Roles from '../components/power/Roles.vue';
import Cate from '../components/goods/Cate.vue';
import Params from '../components/goods/Params.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', name: 'Welcome', component: Welcome },
      { path: '/users', name: 'User', component: User },
      { path: '/rights', name: 'PowerItem', component: PowerItem },
      { path: '/roles', name: 'Roles', component: Roles },
      { path: '/categories', name: 'Cate', component: Cate },
      { path: '/params', name: 'Params', component: Params },
    ],
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = sessionStorage.getItem('token');
  if (!tokenStr) return next('/login');
  next();
  return true;
});

export default router;
