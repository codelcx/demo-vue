import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default function createAutoImport() {
  return [
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        {
          from: 'vue-router',
          imports: ['RouteRecordRaw'],
          type: true,
        },
      ],
      dts: './vite/dts/auto-imports.d.ts',
      resolvers: [ElementPlusResolver()],
      eslintrc: {
        enabled: true,
        filepath: './eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: './vite/dts/components.d.ts',
    }),
  ]
}
