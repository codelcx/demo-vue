// @ts-ignore
importScripts('spark-md5.min.js')

/**
 * 文件切片
 * @param file 文件
 * @param size 分片大小，默认10M
 */
const createChunks = (file: File, size: number): Promise<Blob[]> => {
  return new Promise((resolve) => {
    const chunks: Blob[] = []
    for (let i = 0; i < file.size; i += size) {
      chunks.push(file.slice(i, i + size))
    }
    resolve(chunks)
  })
}

/**
 * 文件Hash
 * @param chunks 文件切片
 */
const calculateHash = (chunks: Blob[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const spark = new SparkMD5()

    function _read(i: number) {
      if (i >= chunks.length) {
        resolve(spark.end())
        return
      }

      const blob = chunks[i]
      const fileReader = new FileReader()
      fileReader.readAsArrayBuffer(blob)
      fileReader.onload = (e) => {
        const bytes = e.target!.result as ArrayBuffer
        spark.append(bytes)
        _read(i + 1)
      }

      fileReader.onerror = (err) => reject(err)
    }

    _read(0)
  })
}

const defaultChunkSize = 10 * 1024 * 1024

// 监听主线程的消息
self.addEventListener('message', async (e) => {
  try {
    const { file, chunkSize = defaultChunkSize } = e.data
    const chunks = await createChunks(file, chunkSize)
    const hash = await calculateHash(chunks)
    self.postMessage({ hash, chunks })
    self.close()
  } catch (err) {
    console.error('worker error:', e)
    self.postMessage({ err })
    self.close()
  }
})

// 监听主线程的错误
self.addEventListener('error', (e) => {
  console.error('master thread error:', e)
  self.close()
})
