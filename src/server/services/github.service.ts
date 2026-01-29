import { ApiError } from '../middleware/errorHandler.js';

export class GitHubService {
  private readonly token: string;
  private readonly owner: string;
  private readonly repo: string;
  private readonly branch: string;
  private readonly baseUrl = 'https://api.github.com';

  constructor() {
    this.token = process.env.GITHUB_TOKEN!;
    this.owner = process.env.GITHUB_OWNER!;
    this.repo = process.env.GITHUB_REPO!;
    this.branch = process.env.GITHUB_BRANCH || 'main';

    this.validateConfig();
  }

  private validateConfig() {
    if (!this.token || !this.owner || !this.repo) {
      throw new ApiError(500, 'GitHub configuration missing');
    }
  }

  async uploadFile(path: string, content: Buffer, message: string) {
    const base64Content = content.toString('base64');
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;

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
    });

    if (!response.ok) {
      const error = await response.json() as { message: string };
      throw new ApiError(response.status, `GitHub upload failed: ${error.message}`);
    }

    return response.json();
  }

  async getDirectoryContents(path: string) {
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (response.status === 404) return [];
    if (!response.ok) {
      const error = await response.json() as { message: string };
      throw new ApiError(response.status, `GitHub API error: ${error.message}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result : [result];
  }

  generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${timestamp}_${randomStr}_${safeName}`;
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Image-Hub-App',
    };
  }
}

export const githubService = new GitHubService();
