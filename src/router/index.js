import Vue from 'vue';
import VueRouter from 'vue-router';

// import Login from './components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/Login.vue');
// import Home from './components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/Home.vue');
// import Welcome from './components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/Welcome.vue');

// import Users from './components/user/Users.vue'
const User = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/user/User.vue');
// import Rights from './components/power/Rights.vue'
const PowerItem = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/power/PowerItem.vue');
// import Roles from './components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '@/components/power/Roles.vue');

// import Cate from './components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '@/components/goods/Cate.vue');
// import Params from './components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '@/components/goods/Params.vue');

// import GoodsList from './components/goods/List.vue'
const List = () => import(/* webpackChunkName: "GoodsList_Add" */ '@/components/goods/List.vue');
// import Add from './components/goods/Add.vue'
const AddGoods = () => import(/* webpackChunkName: "GoodsList_Add" */ '@/components/goods/AddGoods.vue');

// import Order from './components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '@/components/order/Order.vue');
// import Report from './components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Order_Report" */ '@/components/report/Report.vue');

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
      { path: '/goods', name: 'List', component: List },
      { path: '/goods/add', name: 'AddGoods', component: AddGoods },
      { path: '/orders', name: 'Order', component: Order },
      { path: '/reports', name: 'Report', component: Report },
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
