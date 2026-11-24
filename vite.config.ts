import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

function pwaWorker(): Plugin {
  return {
    name: 'pwa-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const precacheAssets = Object.keys(bundle).filter((fileName) =>
        /\.(?:css|js|png|jpe?g|svg|webp|woff2?)$/i.test(fileName),
      )
      const workerPath = fileURLToPath(new URL('./pwa/sw.js', import.meta.url))
      const workerSource = readFileSync(workerPath, 'utf8')
        .replace("'__PRECACHE_ASSETS__'", JSON.stringify(precacheAssets))

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: workerSource,
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'lord-icon'
        }
      }
    }),
    vueJsx(),
    vueDevTools(),
    pwaWorker(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: '/khms/',
})
