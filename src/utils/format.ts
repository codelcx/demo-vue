// format file size
export const formatFileSize = (size: number) => {
  if (size > 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  if (size > 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }

  if (size > 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }

  return `${size} B`
}