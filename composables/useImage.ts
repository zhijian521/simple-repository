import type { ImageInfo } from '~/types'

const images = ref<ImageInfo[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export const useImage = () => {
  const fetchImages = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<{
        success: boolean
        count: number
        images: ImageInfo[]
      }>('/api/images')

      if (!data?.success) {
        throw new Error('获取图片列表失败')
      }

      images.value = data.images
    } catch (e: any) {
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

      images.value = [...data.uploaded, ...images.value]

      return data
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteImage = async (image: ImageInfo) => {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/images/${encodeURIComponent(image.path)}`, {
        method: 'DELETE',
        headers: {
          'x-file-sha': image.sha,
        },
      })

      images.value = images.value.filter(img => img.sha !== image.sha)
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
    deleteImage,
  }
}
