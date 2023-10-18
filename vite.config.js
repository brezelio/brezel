import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import svgLoader from 'vite-svg-loader'

const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader({ svgo: false }),
    mkcert({
      hosts: ['brezel.test'],
    }),
    VitePWA({
      injectRegister: 'script',
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      srcDir: 'node_modules/@kibro/brezel-spa/src',
      filename: 'serviceworker.js',
      injectManifest: {
        injectionPoint: undefined,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  optimizeDeps: {
    include: [
      '@kibro/brezel-spa',
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
        {
          name: 'fix-node-globals-polyfill',
          setup (build) {
            build.onResolve(
              { filter: /_virtual-process-polyfill_\.js/ },
              ({ path }) => ({ path })
            )
          },
        },
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        rollupNodePolyFill(),
      ],
    },
  },
  define: {
    'process.env': {},
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './node_modules/@kibro/brezel-spa/src'),
      },
      {
        find: 'util',
        replacement: 'rollup-plugin-node-polyfills/polyfills/util',
      },
      {
        find: 'url',
        replacement: 'rollup-plugin-node-polyfills/polyfills/url',
      },
      {
        find: 'querystring',
        replacement: 'rollup-plugin-node-polyfills/polyfills/qs',
      },
      {
        find: 'http',
        replacement: 'rollup-plugin-node-polyfills/polyfills/http',
      },
      {
        find: /^~/,
        replacement: '',
      },
    ],
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: '@root-entry-name: default;',
      },
    },
  },
  server: {
    https: false,
    port: 8080,
  },
})
