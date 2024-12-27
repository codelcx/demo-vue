declare interface Window {
  buildInfo: BuildInfo
}

declare interface CommitInfo {
  version: string
  buildUserName: string
  buildUserEmail: string
  commitBranch: string
  commitUserName: string
  commitUserEmail: string
  commitMessage: string
  commitDate: string
}

declare interface BuildInfo {
  buildDate: string
  version: string
  versionInfo: CommitInfo
}

declare const __APP_VERSION__: BuildInfo
