const path = require('path')

const projectRootDir = path.resolve(__dirname)

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        '@': path.resolve(projectRootDir, 'node_modules/@kibro/brezel-spa/src'),
      },
    },
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          // 'primary-color': '#6d0101',
          // 'link-color': '#6d0101',
          'border-radius-base': '0',
        },
        javascriptEnabled: true,
      },
    },
  },
  devServer: {
    disableHostCheck: true
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
  },
  transpileDependencies: [
    'ant-design-vue',
    '@kibro/brezel-spa',
    '@kibro/brezel-brotcast',
    '@kibro/brezel-recipes',
  ],
}
