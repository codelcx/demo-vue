import { ElMessageBox } from 'element-plus'
import { useVersionChecker } from '@/utils/versionCheck'

// 版本检测
const versionChecker = useVersionChecker()
let wait = 0
window.addEventListener('AppHasUpdate', async () => {
  versionChecker.stopChecking()
  const res = await ElMessageBox.confirm('检测到新版本，为了您能正常使用页面功能，请刷新页面完成更新！', '提示', {
    cancelButtonText: '稍后再提醒',
    confirmButtonText: '刷新页面',
    closeOnClickModal: false,
    closeOnPressEscape: false,
    showClose: false,
  }).catch(() => {})
  if (res === 'confirm') {
    location.reload()
    return
  }
  // Check again after 5 minutes
  wait = 1000 * 60 * 5
  setTimeout(() => {
    wait = 0
    versionChecker.setupChecking()
  }, wait)
})

console.log('Bootstrap: App is ready')
