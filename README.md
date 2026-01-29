# Image Hub

图片仓库 Web 应用 - 上传图片并自动同步到 GitHub。

## 技术栈

- **前端**: HTML + CSS + TypeScript
- **后端**: Node.js + TypeScript + Vercel Serverless Functions
- **存储**: GitHub API
- **认证**: JWT

## 项目结构

```
simple-repository/
├── api/                    # API 路由（TypeScript）
│   ├── auth/
│   │   └── login.ts       # 登录 API
│   └── images/
│       ├── index.ts       # 图片列表
│       └── upload.ts      # 图片上传
│
├── src/                    # 源代码
│   └── server/
│       ├── middleware/    # 中间件层
│       │   ├── compose.ts       # 中间件组合器
│       │   ├── errorHandler.ts  # 错误处理
│       │   ├── logger.ts        # 结构化日志
│       │   ├── cors.ts          # CORS 处理
│       │   └── auth.ts          # 认证中间件
│       │
│       ├── services/       # 业务逻辑层
│       │   ├── auth.service.ts   # 认证服务
│       │   ├── cache.service.ts  # 缓存服务
│       │   ├── github.service.ts # GitHub API
│       │   └── image.service.ts  # 图片业务逻辑
│       │
│       └── utils/          # 工具函数
│           └── multipart.ts # Multipart 解析
│
├── public/                 # 静态资源
│   └── index.html         # 前端页面
│
├── .env.example           # 环境变量示例
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
└── vercel.json            # Vercel 部署配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# GitHub API 配置
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your_github_username_here
GITHUB_REPO=your_repository_name_here
GITHUB_BRANCH=main

# 身份验证配置
AUTH_USERNAME=admin
AUTH_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_key_here
TOKEN_EXPIRY_DAYS=7
```

### 3. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建

```bash
npm run build
```

### 5. 部署到 Vercel

```bash
npm run deploy
```

## API 端点

### POST /api/auth/login
用户登录

**请求体**:
```json
{
  "username": "admin",
  "password": "password"
}
```

**响应**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "username": "admin"
  }
}
```

### GET /api/images
获取图片列表（需要认证）

**响应**:
```json
{
  "success": true,
  "count": 10,
  "images": [
    {
      "name": "image.jpg",
      "path": "images/image.jpg",
      "url": "https://...",
      "size": 12345,
      "sha": "abc123",
      "uploadedAt": 1234567890
    }
  ]
}
```

### POST /api/images/upload
上传图片（需要认证）

**请求**: `multipart/form-data`

**响应**:
```json
{
  "success": true,
  "count": 2,
  "uploaded": [...],
  "errors": [...]
}
```

## 核心特性

### 中间件架构

- **错误处理**: 统一的错误处理和响应格式
- **日志记录**: 结构化日志，包含请求追踪 ID
- **CORS**: 自动处理跨域请求
- **认证**: JWT Token 验证，支持多种传递方式

### 服务层

- **GitHub 服务**: 封装 GitHub API 操作
- **缓存服务**: 内存缓存，提升性能
- **图片服务**: 图片业务逻辑
- **认证服务**: JWT Token 生成和验证

### 性能优化

- 图片列表缓存（5 分钟）
- 请求日志追踪
- 错误分类处理

## 开发脚本

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建项目
npm run type-check   # TypeScript 类型检查
npm run clean        # 清理构建产物
npm run deploy       # 部署到 Vercel
```

## 安全注意事项

⚠️ **重要**:
- 不要将 `.env` 文件提交到 Git
- 在生产环境使用强密码和随机 JWT Secret
- 建议使用密码哈希而非明文存储
- GitHub Token 需要 `repo` 权限

## 许可证

MIT
