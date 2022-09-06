const path = require('path')
const webpack = require('webpack')

const projectRootDir = path.resolve(__dirname)

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        '@': path.resolve(projectRootDir, 'node_modules/@kibro/brezel-spa/src'),
      },
      fallback: {
        os: false,
        assert: false,
        https: false,
        http: false,
        url: false,
        path: false,
        fs: false,
        crypto: false,
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\.php$/,
      }),
    ],
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            // 'primary-color': '#00ff00',
            // 'link-color': '#6d0101',
            'border-radius-base': '0',
            'font-size-lg': '1rem',
            'font-size-base': '0.875rem',
            'font-size-sm': '0.75rem',
          },
          javascriptEnabled: true,
        },
      },
    },
  },
  devServer: {
    allowedHosts: 'all',
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
