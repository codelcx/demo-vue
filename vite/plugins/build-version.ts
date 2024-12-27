import { resolve } from 'path'
import { type Plugin } from 'vite'
import { writeFileSync } from 'fs'

export default function buildVersion(options: CommitInfo): Plugin {
  const data = {
    outputPath: '',
    buildInfo: options || {},
  }

  return {
    name: 'build-version',
    apply: 'build',
    configResolved(config) {
      data.outputPath = resolve(process.cwd(), config.build.outDir, 'version.json')
    },
    generateBundle() {
      const versionInfo = data.buildInfo
      writeFileSync(data.outputPath, JSON.stringify(versionInfo, null, 2))
      console.log('Version info has been written to version.json')
    },
  }
}
