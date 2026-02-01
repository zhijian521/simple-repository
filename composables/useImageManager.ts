import type { ImageInfo } from '~/types'

export const useImageManager = () => {
  const { images, loading, fetchImages, deleteImage, uploadImages } = useImage()
  const { error: showError } = useToast()

  const uploading = ref(false)
  const previewVisible = ref(false)
  const previewImage = ref<ImageInfo | null>(null)

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getThumbnailUrl = (url: string): string => {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=cover&q=80`
  }

  const handleUpload = async (files: File[]) => {
    if (files.length > 10) {
      showError('一次最多上传 10 张图片')
      return
    }

    uploading.value = true
    try {
      await uploadImages(files)
      await fetchImages()
    } catch (e: any) {
      showError('上传失败: ' + e.message)
    } finally {
      uploading.value = false
    }
  }

  const handleDelete = async (image: ImageInfo) => {
    try {
      await deleteImage(image)
    } catch (e: any) {
      showError('删除失败: ' + e.message)
    }
  }

  const openPreview = (image: ImageInfo) => {
    previewImage.value = image
    previewVisible.value = true
  }

  const closePreview = () => {
    previewVisible.value = false
    previewImage.value = null
  }

  return {
    images,
    loading,
    uploading,
    previewVisible,
    previewImage,
    formatSize,
    getThumbnailUrl,
    fetchImages,
    handleUpload,
    handleDelete,
    openPreview,
    closePreview,
  }
}
