# 资源仓库 (Resource Hub)

资源仓库 Web 应用 - 上传文件并自动同步到 GitHub。

使用 Nuxt 3 + TypeScript + Vercel Serverless Functions 构建。

当前版本支持图片管理，后续将扩展支持更多文件类型。

## 技术栈

- **框架**: Nuxt 3
- **语言**: TypeScript
- **UI**: Vue 3 Composition API
- **部署**: Vercel
- **存储**: GitHub API
- **认证**: JWT + HttpOnly Cookie

## 项目结构

```
resource-hub/
├── server/                 # 服务端
│   ├── api/               # API 路由
│   │   ├── auth/
│   │   │   └── login.post.ts
│   │   └── images/
│   │       ├── index.get.ts
│   │       └── upload.post.ts
│   ├── middleware/        # 服务端中间件
│   ├── services/          # 业务逻辑层
│   └── utils/             # 工具函数
├── composables/           # 组合式函数
│   ├── useAuth.ts
│   └── useImage.ts
├── components/            # Vue 组件
│   ├── LoginModal.vue
│   ├── UploadZone.vue
│   ├── ImageGrid.vue
│   └── ImageModal.vue
├── pages/                 # 页面路由
│   └── index.vue
├── assets/                # 静态资源
│   └── css/
│       └── main.css
├── types/                 # TypeScript 类型
│   └── index.ts
├── nuxt.config.ts         # Nuxt 配置
├── .env.example           # 环境变量示例
└── vercel.json            # Vercel 部署配置
```

## 功能特性

### 当前功能 ✅
- 用户认证（JWT + HttpOnly Cookie）
- 图片上传（拖拽 + 点击）
- 图片列表展示
- 图片预览弹窗
- 缓存机制（5 分钟）
- 响应式设计

### 计划功能 🔜
- [ ] 支持更多文件类型（PDF、文档、视频等）
- [ ] 文件分类管理
- [ ] 批量操作
- [ ] 搜索和筛选
- [ ] 文件分享功能
- [ ] Dark Mode

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

编辑 `.env` 文件，填写你的 GitHub 配置和认证信息。

### 3. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
```

### 5. 预览生产版本

```bash
npm run preview
```

## 部署到 Vercel

### 方法 1: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

### 方法 2: 通过 GitHub 集成（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 在 Vercel 控制台设置环境变量：
   - `NUXT_GITHUB_TOKEN`
   - `NUXT_GITHUB_OWNER`
   - `NUXT_GITHUB_REPO`
   - `NUXT_GITHUB_BRANCH`（可选）
   - `NUXT_AUTH_USERNAME`
   - `NUXT_AUTH_PASSWORD`
   - `NUXT_JWT_SECRET`
   - `NUXT_TOKEN_EXPIRY_DAYS`（可选）
4. 自动部署

### 环境变量配置

在 Vercel 控制台设置环境变量：

```
Settings → Environment Variables → Add New
```

添加以下变量（不要包含 `NUXT_` 前缀）：

```
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo
GITHUB_BRANCH=main
AUTH_USERNAME=admin
AUTH_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
TOKEN_EXPIRY_DAYS=7
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

### Nuxt 3 特性

- **服务端 API**: 使用 Nitro server routes
- **组合式函数**: useAuth、useImage 状态管理
- **自动导入**: 组件、composables 自动导入
- **类型安全**: 完整 TypeScript 支持
- **文件上传**: 内置 FormData 处理

### 组件化

- **LoginModal**: 登录弹窗
- **UploadZone**: 拖拽上传区域
- **ImageGrid**: 图片展示网格
- **ImageModal**: 图片预览弹窗

### 安全性

- HttpOnly Cookie 存储 JWT
- 服务端 Token 验证
- CORS 配置
- 文件类型验证

## 开发脚本

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本
npm run typecheck    # TypeScript 类型检查
```

## 注意事项

⚠️ **重要**:
- 不要将 `.env` 文件提交到 Git
- 在生产环境使用强密码和随机 JWT Secret
- GitHub Token 需要 `repo` 权限
- 建议使用密码哈希而非明文存储（待优化）

## 路线图

### v1.1 - 文件类型扩展
- [ ] 支持 PDF 文件
- [ ] 支持文档文件（Word、Excel、PPT）
- [ ] 支持视频文件
- [ ] 支持音频文件
- [ ] 文件类型图标

### v1.2 - 管理功能
- [ ] 文件重命名
- [ ] 批量删除
- [ ] 文件移动/复制
- [ ] 文件夹管理

### v1.3 - 用户体验
- [ ] Dark Mode
- [ ] 文件预览（PDF、视频等）
- [ ] 搜索功能
- [ ] 标签系统
- [ ] 分享链接

## 许可证

MIT
