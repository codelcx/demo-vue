// @ts-ignore
import { debounce } from 'lodash-es'

type DefaultConfig = {
  /** 防御（默认开启，防水印删除隐藏） */
  defense: boolean
  /** 文本颜色 */
  color: string
  /** 文本透明度 */
  opacity: number
  /** 文本字体大小 */
  size: number
  /** 文本字体 */
  family: string
  /** 文本倾斜角度 */
  angle: number
  /** 一处水印所占宽度（数值越大水印密度越低） */
  width: number
  /** 一处水印所占高度（数值越大水印密度越低） */
  height: number
}

/** 默认配置 */
const defaultConfig = {
  defense: true,
  color: '#c0c4cc',
  opacity: 0.5,
  size: 16,
  family: 'serif',
  angle: -20,
  width: 300,
  height: 200,
}

/**
 * 创建水印
 * @param container 水印容器，默认为body
 * @param config 配置
 */
export function useWatermark(container?: HTMLElement) {
  // 默认容器
  const bodyEl = document.body
  // 合并配置
  let mergeConfig: DefaultConfig = defaultConfig
  // 水印元素
  let watermarkEl: HTMLElement | null = null
  // 水印文本
  let watermarkText = 'watermark'
  // 水印容器
  const containerEl = container || bodyEl

  // 监听器
  const observer = {
    watermarkMutationObserver: null as MutationObserver | null,
    containerMutationObserver: null as MutationObserver | null,
    containerResizeObserver: null as ResizeObserver | null,
  }

  /** 设置水印 */
  const setWatermark = (text?: string, config: Partial<DefaultConfig> = {}) => {
    if (!container && !bodyEl) {
      console.warn('No watermark container or body element found')
      return
    }

    text && (watermarkText = text)
    mergeConfig = Object.assign(defaultConfig, config)
    watermarkEl ? updateWatermarkEl() : createWatermarkEl()
    mergeConfig.defense && addListener()
  }

  /** 创建水印元素 */
  const createWatermarkEl = () => {
    const isBody = containerEl.tagName.toLowerCase() === 'body'
    const watermarkContainerEl = isBody ? '' : 'relative'
    const watermarkElPosition = isBody ? 'fixed' : 'absolute'

    watermarkEl = document.createElement('div')
    watermarkEl.style.pointerEvents = 'none'
    watermarkEl.style.top = '0'
    watermarkEl.style.left = '0'
    watermarkEl.style.position = watermarkElPosition
    watermarkEl.style.zIndex = '-1'
    watermarkEl.style.background = `url(${createBase64Image()}) left top repeat`

    updateWatermarkEl(containerEl.clientWidth, containerEl.clientHeight)
    containerEl.style.position = watermarkContainerEl
    containerEl.appendChild(watermarkEl)
  }

  /** 更新水印元素 */
  const updateWatermarkEl = (width?: number, height?: number) => {
    if (!watermarkEl) return
    width && (watermarkEl.style.width = `${width}px`)
    height && (watermarkEl.style.height = `${height}px`)
  }

  /** 创建base64 */
  const createBase64Image = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return
    const { width, height, size, family, angle, color, opacity } = mergeConfig

    canvas.width = width
    canvas.height = height

    ctx.fillStyle = color
    ctx.globalAlpha = opacity
    ctx.font = `${size}px ${family}`
    ctx.rotate((angle * Math.PI) / 180)
    ctx.fillText(watermarkText, 0, height / 2)

    return canvas.toDataURL()
  }

  /** 清除水印 */
  const clearWatermark = () => {
    if (!watermarkEl) return
    containerEl.removeChild(watermarkEl)
    watermarkEl = null
  }

  /** 更新水印 */
  const updateWatermark = () => {
    clearWatermark()
    createWatermarkEl()
  }

  /** 监听 DOM 变化 */
  const addMutationListener = () => {
    const mutationCallback = debounce((mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        // 如果水印元素的属性发生变化，则重新生成水印
        if (mutation.type === 'attributes') {
          mutation.target === watermarkEl && updateWatermark()
        }

        // 如果水印元素被移除，则重新添加到容器中
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((item) => {
            item === watermarkEl && containerEl.appendChild(watermarkEl)
          })
        }
      }
    }, 100)

    observer.watermarkMutationObserver = new MutationObserver(mutationCallback)
    observer.containerMutationObserver = new MutationObserver(mutationCallback)

    observer.watermarkMutationObserver.observe(watermarkEl!, {
      // 观察目标节点属性是否变动，默认为 true
      attributes: true,
      // 观察目标子节点是否有添加或者删除，默认为 false
      childList: false,
      // 观察所有后代节点，默认为 false
      subtree: false,
    })

    observer.containerMutationObserver.observe(containerEl, {
      attributes: true,
      childList: true,
      subtree: true,
    })
  }

  /** 监听 DOM 大小变化 */
  const addResizeListener = () => {
    const resizeCallback = debounce(() => {
      const { clientHeight, clientWidth } = containerEl
      watermarkEl && updateWatermarkEl(clientHeight, clientWidth)
    }, 100)

    observer.containerResizeObserver = new ResizeObserver(resizeCallback)
    observer.containerResizeObserver.observe(containerEl)
  }

  /** 添加监听器 */
  const addListener = () => {
    addMutationListener()
    addResizeListener()
  }

  /** 移除监听器 */
  const removeListener = () => {
    observer.watermarkMutationObserver && observer.watermarkMutationObserver.disconnect()
    observer.containerMutationObserver && observer.containerMutationObserver.disconnect()
    observer.containerResizeObserver && observer.containerResizeObserver.disconnect()
  }

  /** 销毁 */
  const destroy = () => {
    removeListener()
    clearWatermark()
  }

  return { setWatermark, destroy }
}
