declare interface BuildInfo {
  version: string
  buildDate: string
  versionInfo: CommitInfo
}

export const buildInfo: BuildInfo
export const versionInfo: CommitInfo
export function getVersionInfo(): CommitInfo
