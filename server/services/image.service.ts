import GitHubService from './github.service'
import cacheService from './cache.service'
import type { ImageInfo, UploadResult } from '~/types'
import { CACHE_CONFIG } from '~/server/config/constants'

class ImageService {
  private readonly cachePrefix = CACHE_CONFIG.CACHE_PREFIX
  private readonly imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']

  private isImageFile(filename: string): boolean {
    const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'))
    return this.imageExtensions.includes(ext)
  }

  private extractTimestamp(filename: string): number {
    const match = filename.match(/^(\d+)_/)
    return match ? parseInt(match[1] || '0', 10) : 0
  }

  async getImages(useCache = true): Promise<ImageInfo[]> {
    const cacheKey = `${this.cachePrefix}list`

    if (useCache) {
      const cached = await cacheService.get<ImageInfo[]>(cacheKey)
      if (cached) return cached
    }

    const github = new GitHubService()
    const contents = await github.getDirectoryContents('images')

    const images = contents
      .filter((item) => item.type === 'file' && this.isImageFile(item.name) && item.download_url)
      .map((item) => ({
        name: item.name,
        path: item.path,
        url: item.download_url!,
        size: item.size,
        sha: item.sha,
        uploadedAt: this.extractTimestamp(item.name),
      }))
      .sort((a, b) => b.uploadedAt - a.uploadedAt)

    await cacheService.set(cacheKey, images, CACHE_CONFIG.IMAGE_LIST_TTL)
    return images
  }

  async uploadFiles(files: File[]): Promise<UploadResult> {
    const github = new GitHubService()

    // 将 File 对象转换为 Buffer
    const fileData = await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        buffer: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
      }))
    )

    const results = await Promise.allSettled(
      fileData.map(async (file) => {
        const filename = github.generateUniqueFilename(file.filename)
        const path = `images/${filename}`

        const result = await github.uploadFile(
          path,
          file.buffer,
          `Upload: ${file.filename}`
        )

        if (!result.content) {
          throw new Error('Invalid upload response from GitHub')
        }

        return {
          name: filename,
          path,
          url: result.content.download_url,
          size: result.content.size,
          sha: result.content.sha,
          uploadedAt: Date.now(),
        } as ImageInfo
      })
    )

    const uploaded = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<ImageInfo>).value)

    const errors = results
      .filter((r) => r.status === 'rejected')
      .map((r, i) => {
        const filename = files[i]?.name
        const reason = (r as PromiseRejectedResult).reason
        const errorMessage = reason instanceof Error
          ? reason.message
          : typeof reason === 'string'
            ? reason
            : 'Unknown error'

        return {
          filename: filename || 'Unknown file',
          error: errorMessage,
        }
      })

    await this.invalidateCache()

    return { uploaded, errors }
  }

  async invalidateCache() {
    await cacheService.deletePattern(`${this.cachePrefix}*`)
  }
}

export default new ImageService()
