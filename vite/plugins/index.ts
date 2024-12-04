import vue from '@vitejs/plugin-vue'
import scriptVersion from './script-version'
import createAutoImport from './auto-import'

// @ts-ignore
export default function createPlugins(env: Record<string, string>, isBuild = false) {
  const vitePlugins = [vue()]
  vitePlugins.push(...createAutoImport())
  vitePlugins.push(scriptVersion(isBuild))
  return vitePlugins
}
