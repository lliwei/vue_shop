const CompressionPlugin = require('compression-webpack-plugin');

const productionGzipExtensions = /\.(js|css|json|txt|html|ico)(\?.*)?$/i;

module.exports = {
  chainWebpack: (config) => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', () => {
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js');

      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor',
      });

      config.plugin('html').tap((args) => {
        args[0].isProd = true;
        return args;
      });

      config.plugin('compressionPlugin')
        .use(new CompressionPlugin({
          filename: '[file].gz[query]',
          algorithm: 'gzip',
          test: productionGzipExtensions,
          threshold: 10240,
          minRatio: 0.8,
          deleteOriginalAssets: true,
        }));
    });

    // 开发模式
    config.when(process.env.NODE_ENV === 'development', () => {
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js');

      config.plugin('html').tap((args) => {
        args[0].isProd = false;
        return args;
      });
    });
  },
};
