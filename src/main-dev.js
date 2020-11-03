import Vue from 'vue';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import ZkTable from 'vue-table-with-tree-grid';
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor';
import NProgress from 'nprogress';
import App from './App.vue';
import router from './router';
import store from './store';

import 'quill/dist/quill.core.css'; // import styles
import 'quill/dist/quill.snow.css'; // for snow theme
import 'quill/dist/quill.bubble.css'; // for bubble theme

// 导入字体图标
import './assets/fonts/iconfont.css';
// 导入全局样式表
import './assets/css/global.css';
// 导入nprogress进度条
import 'nprogress/nprogress.css';
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
axios.interceptors.request.use((config) => {
  NProgress.start();
  config.headers.Authorization = sessionStorage.getItem('token');
  return config;
});
axios.interceptors.response.use((config) => {
  NProgress.done();
  return config;
});
Vue.prototype.$http = axios;
Vue.component('tree-table', ZkTable);

Vue.config.productionTip = false;

// 将时间戳转化为yyyy-mm-dd
Vue.filter('dateFormat', (value) => {
  const dt = new Date(value);
  const y = dt.getFullYear();
  const m = (`${dt.getMonth() + 1}`).padStart(2, '0');
  const d = (`${dt.getDate()}`).padStart(2, '0');

  const h = (`${dt.getHours()}`).padStart(2, '0');
  const mm = (`${dt.getMinutes()}`).padStart(2, '0');
  const ss = (`${dt.getSeconds()}`).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${mm}:${ss}`;
});

Vue.use(ElementUI);
Vue.use(VueQuillEditor);
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
