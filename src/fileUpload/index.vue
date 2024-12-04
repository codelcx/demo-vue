<template>
  <div class="upload-file">
    <h2>文件上传</h2>

    <div class="show-upload-file">
      <div v-for="item in uploadFileList" :key="item.fileHash" class="file-item">
        <div class="info">
          <span class="name">{{ item.fileName }}</span>
          <span class="size">{{ formatFileSize(item.fileSize) }}</span>
          <el-progress :percentage="item.progress" />
        </div>

        <div class="op">
          <span v-if="item.status === UploadStatus.wait">等待</span>
          <span v-if="item.status === UploadStatus.processing">正在处理</span>
          <span v-if="item.status === UploadStatus.uploading" @click="pauseUpload(item)">暂停</span>
          <span v-if="item.status === UploadStatus.pause" @click="continueUpload(item)">恢复</span>
          <span v-if="item.status === UploadStatus.uploading" @click="cancelUpload(item)">删除</span>
          <span v-if="item.status === UploadStatus.success">完成</span>
          <span v-if="item.status === UploadStatus.error" @click="continueUpload(item)">重试</span>
        </div>
      </div>
    </div>

    <div class="select-upload-file" @click="$refs.upload.click()">
      <span>选择文件</span>
      <input ref="upload" type="file" multiple style="display: none" @change="onChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatFileSize } from '@/utils/format'
import { useUpload, UploadStatus } from '@/fileUpload/hook'

// use hook
const { uploadFileList, handleUploadFile, cancelUpload, pauseUpload, continueUpload } = useUpload()

// web-worker
const useWorker = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./hash-worker.ts', import.meta.url))
    worker.postMessage({ file })
    worker.onmessage = (e) => {
      const { err } = e.data
      err ? reject(err) : resolve(e.data as any)
    }

    worker.onerror = (err) => reject(err)
  })
}

// upload file
const onChange = async (e: any) => {
  const files = (e.target?.files as File[]) || []
  if (!files.length) return
  Array.from(files).forEach((file) => handleUploadFile(file, useWorker))
}
</script>

<style scoped lang="scss">
.upload-file {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  width: 600px;
  height: 800px;
  padding: 20px;
  margin: 0 auto;
  box-sizing: border-box;

  .show-upload-file {
    flex: 1;
    width: 100%;
    overflow-y: auto;

    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .info {
        flex: 1;

        .name {
          font-weight: bold;
        }

        .size {
          color: #ccc;
          font-size: 14px;
          margin-left: 10px;
        }
      }

      .op {
        display: flex;
        gap: 10px;
        align-self: flex-end;
        width: 100px;
        color: #4096ef;
        font-size: 14px;
        cursor: pointer;
      }
    }
  }

  .select-upload-file {
    width: 100%;
    padding: 10px;
    text-align: center;
    color: #fff;
    background-color: #4096ef;
    border-radius: 10px;
    cursor: pointer;
  }
}
</style>
