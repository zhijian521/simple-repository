/**
 * 应用常量配置
 */

/**
 * Cookie 配置
 */
export const COOKIE_CONFIG = {
  NAME: 'auth_token',
  MAX_AGE: 60 * 60 * 24 * 7, // 7 天（秒）
  SAME_SITE: 'strict' as const,
  PATH: '/',
} as const

/**
 * JWT 配置
 */
export const JWT_CONFIG = {
  DEFAULT_EXPIRY_DAYS: 7,
  ALGORITHM: 'HS256',
} as const

/**
 * 缓存配置
 */
export const CACHE_CONFIG = {
  IMAGE_LIST_TTL: 300, // 5 分钟（秒）
  CACHE_PREFIX: 'images:',
} as const

/**
 * 分页配置
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

/**
 * 文件上传配置
 */
export const UPLOAD_CONFIG = {
  CHUNK_SIZE: 1024 * 1024, // 1MB（用于大文件分块上传）
} as const

/**
 * 速率限制配置
 */
export const RATE_LIMIT_CONFIG = {
  // 登录接口：5次/15分钟
  LOGIN: {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  },
  // 文件上传：20次/小时
  UPLOAD: {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  },
  // 通用API：100次/分钟
  GENERAL: {
    limit: 100,
    windowMs: 60 * 1000,
  },
} as const

/**
 * 文件约束配置
 */
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_COUNT: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
} as const

/**
 * 响应消息模板
 */
export const ERROR_MESSAGES = {
  // 认证相关
  INVALID_CREDENTIALS: '用户名或密码错误',
  MISSING_CREDENTIALS: '用户名和密码不能为空',
  TOKEN_MISSING: '未提供认证令牌',
  TOKEN_INVALID: '令牌无效或已过期',

  // 文件上传相关
  NO_FILES: '请选择要上传的文件',
  TOO_MANY_FILES: '一次最多上传 10 个文件',
  INVALID_FILE_TYPE: '只能上传图片文件',
  FILE_TOO_LARGE: '文件大小超过限制',
  FILE_VALIDATION_FAILED: '文件验证失败',

  // 通用错误
  INTERNAL_ERROR: '服务器内部错误',
  NOT_FOUND: '资源不存在',
  FORBIDDEN: '无权访问',
} as const
