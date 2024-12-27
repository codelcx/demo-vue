import cp from 'child_process'

function execSearch(searchCommand) {
  try {
    return cp.execSync(searchCommand)
  } catch {
    return 'unknown'
  }
}
const { CI_COMMIT_BRANCH, CI_COMMIT_REF_NAME } = process.env || {}
const branchNameFromCIEnv = CI_COMMIT_BRANCH || CI_COMMIT_REF_NAME

/**
 * GIT信息
 * @returns CommitInfo
 */
export function getVersionInfo() {
  // 本地用户名
  const localUserName = execSearch('git config user.name').toString().trim()
  // 本地邮箱
  const localUserEmail = execSearch('git config user.email').toString().trim()
  // 用户名
  const commitUserName = execSearch('git show -s --format=%cn').toString().trim()
  // 邮箱
  const commitUserEmail = execSearch('git show -s --format=%ce').toString().trim()
  // 日期
  const commitDate = new Date(execSearch('git show -s --format=%cd').toString())
  // 说明
  const commitMessage = execSearch('git show -s --format=%s').toString().trim()
  // 版本
  const commitHash = execSearch('git show --pretty=format:%H -s').toString().trim()
  // 分支
  const commitBranch = execSearch('git symbolic-ref --short -q HEAD').toString().trim()

  return {
    buildUserName: localUserName,
    version: commitHash,
    buildUserEmail: localUserEmail,
    commitUserName,
    commitUserEmail,
    commitMessage,
    commitDate: commitDate.toLocaleString(),
    commitBranch: branchNameFromCIEnv || commitBranch,
  }
}

export const versionInfo = getVersionInfo()

export const buildInfo = {
  versionInfo,
  version: versionInfo.version,
  buildDate: new Date().toLocaleString(),
}
