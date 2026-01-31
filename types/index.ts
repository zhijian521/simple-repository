// GitHub 图片接口类型
export interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: string
  _links: {
    self: string
    git: string
    html: string
  }
}

export interface GitHubAPIResponse {
  items?: GitHubFile[]
}

// 图片信息类型
export interface ImageInfo {
  name: string
  path: string
  url: string
  size: number
  sha: string
  uploadedAt: number
}

// 认证相关类型
export interface JWTPayload {
  username: string
  iat: number
  exp: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: {
    username: string
  }
  message?: string
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 上传结果类型
export interface UploadResult {
  uploaded: ImageInfo[]
  errors: Array<{
    filename: string
    error: string
  }>
}
