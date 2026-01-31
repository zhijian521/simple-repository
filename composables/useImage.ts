import type { ImageInfo } from '~/types'

export const useImage = () => {
  const images = ref<ImageInfo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchImages = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<{
        success: boolean
        count: number
        images: ImageInfo[]
      }>('/api/images')

      console.log('获取图片数据:', data)

      if (!data?.success) {
        throw new Error('获取图片列表失败')
      }

      images.value = data.images
      console.log('设置 images:', images.value.length, '张')
    } catch (e: any) {
      console.error('获取图片失败:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const uploadImages = async (files: File[]) => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('images', file))

      const data = await $fetch<{
        success: boolean
        count: number
        uploaded: ImageInfo[]
        errors?: Array<{ filename: string; error: string }>
      }>('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      if (!data?.success) {
        throw new Error('上传失败')
      }

      // 上传成功后刷新列表
      await fetchImages()

      return data
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    images,
    loading,
    error,
    fetchImages,
    uploadImages,
  }
}
