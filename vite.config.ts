import { defineConfig, loadEnv } from 'vite'
import proxy from './vite/proxy'
import createPlugins from './vite/plugins'

// @ts-ignore
import { versionInfo } from './scripts/buildInfo.js'
console.log(versionInfo)

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_APP_PROXY_API_PORT } = env
  const port = Number(VITE_APP_PROXY_API_PORT) || 3000

  return {
    plugins: createPlugins(env, command === 'build'),
    server: { port, proxy },
    resolve: {
      alias: { '@': '/src' },
    },
    css: {
      preprocessorOptions: {
        //  warning： legacy JS API deprecated
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    build: {
      assetsDir: 'js',
      rollupOptions: {
        output: {
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames(chunkInfo) {
            let name = chunkInfo.name

            if (name === 'index') {
              const names = chunkInfo.facadeModuleId?.split('/') || []
              name = names?.length > 2 ? `${names[names.length - 2]}-${name}` : name
            }

            return `js/${name}-[hash].js`
          },
          assetFileNames(assetsInfo) {
            let name = assetsInfo.name || assetsInfo.names[0]
            const originalFileNames = assetsInfo.originalFileNames?.[0]

            if (!name) return ''

            if (name.includes('index') && originalFileNames) {
              const names = originalFileNames.split('/')
              name = names.length > 2 ? `${names[names.length - 2]}-${name}` : name
            }

            const imgExits = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp']
            if (imgExits.includes(name)) {
              return `images/[name]-[hash].[ext]`
            }

            if (name.endsWith('.css')) {
              return `css/${name}-[hash].[ext]`
            }

            return `assets/[name]-[hash].[ext]`
          },
          manualChunks: {
            vue: ['vue', 'vue-router'],
            elementPlus: ['element-plus'],
          },
        },
      },
    },
  }
})
