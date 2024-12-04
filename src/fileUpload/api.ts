type RequestParam = {
  url: string
  data: any
  method?: RequestInit['method']
  headers?: RequestInit['headers']
  signal?: AbortSignal
}

// 封装请求
const request = async (param: RequestParam) => {
  const { url, data, method = 'GET', headers = {}, signal } = param

  return await fetch(`${url}`, {
    method,
    headers,
    signal,
    body: data,
  })
    .then((res) => res.json())
    .catch((err) => console.log('request error', err))
}

// 文件校验
export const verifyFileApi = async (fileHash: string, fileName: string) => {
  const res = await request({
    url: '/api/verify',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ fileHash, fileName }),
  })

  return [res, null] as const
}

// 文件上传
export const uploadChunkApi = async (data: FormData, callback: any) => {
  const controller = new AbortController()
  const { signal } = controller
  callback(() => controller.abort())

  const res = await request({
    url: '/api/upload',
    method: 'post',
    data,
    signal,
  })

  return [res, null] as const
}

// 文件合并
export const mergeFileApi = async (fileHash: string, fileName: string) => {
  const res = await request({
    url: '/api/merge',
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ fileHash, fileName }),
  })

  return [res, null] as const
}
