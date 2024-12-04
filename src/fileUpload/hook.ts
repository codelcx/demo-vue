import { verifyFileApi, uploadChunkApi, mergeFileApi } from './api'

// 切片类型
export type UploadChunk = {
  /**  文件hash */
  fileHash: string
  /**  文件大小 kb */
  fileSize: number
  /**  文件名 */
  fileName: string
  /**  文件切片 */
  chunkFile: Blob
  /**  文件切片索引 */
  chunkIndex: number
  /**  文件切片hash：fileHash-chunkIndex */
  chunkHash: string
  /**  文件切片个数 */
  chunkNum: number
  /**  文件切片大小 */
  chunkSize: number
  /**  是否已上传 */
  finish: boolean
  /** 取消请求 */
  cancel: CancelFn | null
}

export type CancelFn = (...arg: any[]) => void

export enum UploadStatus {
  /** 未处理 */
  wait,
  /** 处理中 */
  processing,
  /** 上传中 */
  uploading,
  /** 暂停 */
  pause,
  /** 错误 */
  error,
  /** 成功 */
  success,
}

export type UploadStatusValue = `${UploadStatus}`
export type UploadStatusKey = keyof typeof UploadStatus

// 文件类型
export type UploadFile = {
  /**  文件hash */
  fileHash: string
  /**  文件大小 kb */
  fileSize: number
  /**  文件名 */
  fileName: string
  /**  所有切片 */
  chunks: UploadChunk[]
  /**  文件切片个数 */
  chunkNum: number
  /**  完成个数 */
  finishNum: number
  /**  错误个数，单个文件最多失败次数，默认3 */
  errorNum: number
  /**  进度 */
  progress: number
  /**  状态 */
  status: UploadStatus
  /** 正在请求的队列 */
  queue: UploadChunk[]
}

// webWork Hash
export type HashData = {
  hash: string
  chunks: Blob[]
}
export type HashFunction = (file: File) => Promise<HashData>

export function useUpload() {
  // 上传列表
  let uploadFileList = reactive<UploadFile[]>([])
  // 错误次数
  const errorNum = 3
  // 请求并发数，浏览器同域名同一时间请求的最大并发数限制为6
  const maxRequest = 6

  /**
   * 文件处理
   * @param file 源文件
   * @param callback 计算文件Hash
   */
  const handleUploadFile = async (file: File, callback: HashFunction) => {
    // 初始化上传文件
    const initUploadFile: UploadFile = reactive({
      fileHash: '',
      fileSize: file.size,
      fileName: file.name,
      chunks: [],
      chunkNum: 0,
      finishNum: 0,
      errorNum: 0,
      progress: 0,
      status: UploadStatus.wait,
      queue: [],
    })

    // 添加到上传列表
    uploadFileList.push(initUploadFile)

    // 解析文件
    console.log('开始解析文件：', file.name)
    initUploadFile.status = UploadStatus.processing
    const { hash, chunks } = await callback(file)
    console.log('解析文件完成：', file.name)

    // 文件校验
    const lastIndex = file.name.lastIndexOf('.')
    const baseName = lastIndex === -1 ? file.name : file.name.slice(0, lastIndex)
    const fileHash = `${baseName}-${hash}`
    const [needUpload, uploadChunkList] = await verifyFile(fileHash, file.name)
    if (needUpload === false) {
      uploadComplete(initUploadFile)
      return
    }

    // 初始化切片
    initUploadFile.fileHash = fileHash
    initUploadFile.chunks = chunks.map((item, index) => {
      return {
        fileHash: fileHash,
        fileName: file.name,
        fileSize: file.size,
        chunkFile: item,
        chunkIndex: index,
        chunkHash: `${fileHash}-${index}`,
        chunkSize: item.size,
        chunkNum: chunks.length,
        finish: false,
        cancel: null,
      }
    })

    // 过滤已上传的切片,并更新需要上传的切片数量
    initUploadFile.chunkNum = initUploadFile.chunks.length
    initUploadFile.finishNum = uploadChunkList.length || 0
    initUploadFile.progress = Math.floor((initUploadFile.finishNum / initUploadFile.chunkNum) * 100)
    initUploadFile.chunks = initUploadFile.chunks.filter((item) => !uploadChunkList.includes(item.chunkHash))

    // 上传文件
    uploadFile(initUploadFile)
  }

  // 文件校验
  const verifyFile = async (fileHash: string, fileName: string) => {
    const data = new FormData()
    data.append('fileHash', fileHash)
    data.append('fileName', fileName)

    // 校验文件是否已上传
    const [res] = await verifyFileApi(fileHash, fileName)
    if (res && !res.data.needUpload) console.log('文件已上传')

    // 秒传标记
    const needUpload = res?.data?.needUpload

    // 已上传的切片hash列表
    const chunks = (res?.data?.uploadChunkList as string[]) || []
    return [needUpload, chunks] as const
  }

  // 上传文件
  const uploadFile = (task: UploadFile) => {
    // 切片全部上传或队列中的请求未完成则不处理
    if (task.chunks.length === 0 || task.queue.length > 0) return

    // 正在处理、上传的文件列表
    const taskArr = uploadFileList.filter(
      (item) => item.status === UploadStatus.processing || item.status === UploadStatus.uploading,
    )

    // 动态获取每个文件能够并发请求的个数
    const limit = Math.ceil(maxRequest / taskArr.length)

    // 请求队列，分片从后往前请求，优先上传最后一片
    const queue = task.chunks.slice(-limit)
    task.queue.push(...queue)
    if (task.chunks.length > limit) task.chunks.splice(-limit)
    else task.chunks = []

    // 上传切片
    task.status = UploadStatus.uploading
    task.queue.forEach((item) => uploadChunk(item, task))
  }

  // 上传切片
  const uploadChunk = async (chunk: UploadChunk, task: UploadFile) => {
    const data = new FormData()
    const { fileHash, fileName, fileSize, chunkFile, chunkIndex, chunkHash, chunkSize, chunkNum } = chunk
    data.append('fileHash', fileHash)
    data.append('fileName', fileName)
    data.append('fileSize', fileSize.toString())
    data.append('chunkFile', chunkFile)
    data.append('chunkHash', chunkHash)
    data.append('chunkIndex', chunkIndex.toString())
    data.append('chunkSize', chunkSize.toString())
    data.append('chunkNum', chunkNum.toString())

    const [res] = await uploadChunkApi(data, (fn: CancelFn) => (chunk.cancel = fn))
    if (task.status === UploadStatus.pause || task.status === UploadStatus.error) return

    // 上传失败
    if (!res || res.code !== 0) {
      task.errorNum++
      if (task.errorNum > errorNum) {
        task.status = UploadStatus.error
        pauseUpload(task, false)
        console.log('切片上传失败超过次数限制，暂停上传')
      } else {
        uploadChunk(chunk, task)
        console.log('切片上传失败且未超过次数限制，重新上传')
      }
    }
    // 上传成功
    else if (res.code == 0) {
      task.finishNum++
      chunk.finish = true
      task.errorNum > 0 ? task.errorNum-- : (task.errorNum = 0)
      task.progress = Math.floor((task.finishNum / chunkNum) * 100)
      task.queue = task.queue.filter((item) => item.finish === false)

      if (task.finishNum === chunkNum) {
        const [res] = await mergeFileApi(task.fileHash, task.fileName)
        if (!res || res.code !== 0) {
          task.status = UploadStatus.error
          console.log('合并文件失败')
        } else if (res.code == 0) {
          uploadComplete(task)
          console.log('合并文件成功，上传完成')
        }
      } else {
        uploadFile(task)
      }
    }
  }

  // 暂停上传
  const pauseUpload = (task: UploadFile, pause = true) => {
    // pause:true-> 手动暂定，false-> 请求中断
    task.status = pause ? UploadStatus.pause : UploadStatus.error
    task.errorNum = 0
    task.queue.forEach((item) => item.cancel && item.cancel())
  }

  // 继续上传
  const continueUpload = (task: UploadFile) => {
    task.status = UploadStatus.uploading
    task.chunks.push(...task.queue)
    task.queue = []
    uploadFile(task)
  }

  // 取消上传
  const cancelUpload = (task: UploadFile) => {
    pauseUpload(task)
    uploadFileList = uploadFileList.filter((item) => item.fileHash !== task.fileHash)
  }

  // 全部取消
  const cancelAllUpload = () => {
    uploadFileList.forEach((item) => cancelUpload(item))
    uploadFileList = []
  }

  // 上传完成
  const uploadComplete = (task: UploadFile) => {
    task.progress = 100
    task.status = UploadStatus.success
  }

  return {
    uploadFileList,
    handleUploadFile,
    pauseUpload,
    continueUpload,
    cancelUpload,
    cancelAllUpload,
  }
}
