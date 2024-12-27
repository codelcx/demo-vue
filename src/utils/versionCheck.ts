/**
 * 版本检测
 * setup a interval to check version.json, validate buildDate in window.buildInfo
 * notify user with window event 'AppHasUpdate'
 * @param version 当前版本信息
 * @param interval 轮询间隔(ms) 默认30s
 */
export const useVersionChecker = (version?: BuildInfo, interval?: number) => {
  const data = {
    interval: interval || 1000 * 30,
    buildDate: version?.buildDate || window.buildInfo?.buildDate || '',
  }

  // use xhr to fetch /version.json
  const checkHasUpdate = async () => {
    if (!data.buildDate) return false
    try {
      const response = await fetch('/version.json')
      const version = (await response.json()) as BuildInfo
      if (!version.buildDate) return false
      return version.buildDate !== data.buildDate
    } catch (err) {
      console.log(err)
      return false
    }
  }

  // use window event 'AppHasUpdate' to notify other components
  const notifyHasUpdate = () => {
    window.dispatchEvent(new CustomEvent('AppHasUpdate'))
  }

  // do check
  const doOneCheck = async () => {
    const hasUpdate = await checkHasUpdate()
    if (hasUpdate) notifyHasUpdate()
  }

  // setup interval to check update
  let timer: any = 0
  const setupChecking = () => {
    clearInterval(timer)
    doOneCheck()
    timer = setInterval(async () => await doOneCheck(), data.interval)
  }

  // stop checking
  const stopChecking = () => clearInterval(timer)

  return { setupChecking, stopChecking }
}
