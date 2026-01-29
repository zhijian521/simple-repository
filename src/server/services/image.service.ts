import { githubService } from './github.service.js';
import { cacheService } from './cache.service.js';

interface ImageInfo {
  name: string;
  path: string;
  url: string;
  size: number;
  sha: string;
  uploadedAt: number;
}

class ImageService {
  private readonly cachePrefix = 'images:';
  private readonly imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];

  private isImageFile(filename: string): boolean {
    const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
    return this.imageExtensions.includes(ext);
  }

  private extractTimestamp(filename: string): number {
    const match = filename.match(/^(\d+)_/);
    return match ? parseInt(match[1]) : 0;
  }

  async getImages(useCache = true): Promise<ImageInfo[]> {
    const cacheKey = `${this.cachePrefix}list`;

    if (useCache) {
      const cached = await cacheService.get<ImageInfo[]>(cacheKey);
      if (cached) return cached;
    }

    const contents = await githubService.getDirectoryContents('images');

    const images = contents
      .filter((item: any) => item.type === 'file' && this.isImageFile(item.name))
      .map((item: any) => ({
        name: item.name,
        path: item.path,
        url: item.download_url,
        size: item.size,
        sha: item.sha,
        uploadedAt: this.extractTimestamp(item.name),
      }))
      .sort((a: ImageInfo, b: ImageInfo) => b.uploadedAt - a.uploadedAt);

    await cacheService.set(cacheKey, images, 300);
    return images;
  }

  async uploadFiles(files: Array<{
    filename: string;
    buffer: Buffer;
    mimetype: string;
  }>) {
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const filename = githubService.generateUniqueFilename(file.filename);
        const path = `images/${filename}`;

        const result = await githubService.uploadFile(
          path,
          file.buffer,
          `Upload: ${file.filename}`
        ) as { content: { download_url: string; size: number; sha: string } };

        return {
          originalName: file.filename,
          name: filename,
          path,
          url: result.content.download_url,
          size: result.content.size,
          sha: result.content.sha,
        };
      })
    );

    const uploaded = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    const errors = results
      .filter((r) => r.status === 'rejected')
      .map((r, i) => ({
        file: files[i]?.filename,
        error: (r as PromiseRejectedResult).reason.message,
      }));

    await this.invalidateCache();

    return { uploaded, errors };
  }

  async invalidateCache() {
    await cacheService.deletePattern(`${this.cachePrefix}*`);
  }
}

export const imageService = new ImageService();
