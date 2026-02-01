import type { GitHubFile } from '~/types'

interface GitHubUploadResponse {
  content: {
    download_url: string
    size: number
    sha: string
  }
}

class GitHubService {
  private token: string
  private owner: string
  private repo: string
  private branch: string
  private readonly baseUrl = 'https://api.github.com'

  constructor() {
    const config = useRuntimeConfig()
    this.token = config.githubToken as string
    this.owner = config.githubOwner as string
    this.repo = config.githubRepo as string
    this.branch = config.githubBranch as string || 'main'

    this.validateConfig()
  }

  private validateConfig() {
    if (!this.token || !this.owner || !this.repo) {
      throw new Error('GitHub configuration missing')
    }
  }

  async uploadFile(path: string, content: Buffer, message: string): Promise<GitHubUploadResponse> {
    const base64Content = content.toString('base64')
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        branch: this.branch,
      }),
    })

    if (!response.ok) {
      const error = await response.json() as { message: string }
      throw new Error(`GitHub upload failed: ${error.message}`)
    }

    return response.json()
  }

  async getDirectoryContents(path: string): Promise<GitHubFile[]> {
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`

    const response = await fetch(url, {
      headers: this.getHeaders(),
    })

    if (response.status === 404) return []
    if (!response.ok) {
      const error = await response.json() as { message: string }
      throw new Error(`GitHub API error: ${error.message}`)
    }

    const result = await response.json()
    return Array.isArray(result) ? result : [result]
  }

  async deleteFile(path: string, sha: string): Promise<void> {
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Delete: ${path}`,
        sha,
        branch: this.branch,
      }),
    })

    if (!response.ok) {
      const error = await response.json() as { message: string }
      throw new Error(`GitHub delete failed: ${error.message}`)
    }
  }

  generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
    return `${timestamp}_${randomStr}_${safeName}`
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Image-Hub-App',
    }
  }
}

export default GitHubService
