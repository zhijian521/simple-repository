# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 提供在此仓库中工作的指导。

## 开发命令

```bash
npm run dev          # 启动开发服务器 (http://localhost:3000)
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run typecheck    # TypeScript 类型检查
```

## 架构

这是一个使用 GitHub 作为文件存储后端的 Nuxt 3 应用。采用 **服务层模式**，关注点分离：

```
server/
├── api/              # API 路由处理器（轻量，委托给服务层）
│   ├── auth/         # 认证端点
│   └── images/       # 图片管理端点
├── services/         # 业务逻辑层
│   ├── github.service.ts    # GitHub API 交互
│   ├── cache.service.ts     # 内存缓存（Map-based, TTL）
│   ├── auth.service.ts      # JWT + bcrypt 认证
│   └── image.service.ts     # 图片操作
├── config/
│   └── constants.ts  # 所有配置常量
└── utils/            # 工具函数
```

### 核心架构决策

1. **GitHub 作为存储后端**：文件通过 GitHub Contents API 直接上传到 GitHub 仓库。应用不本地存储文件 - 它是 GitHub 的纯代理。

2. **服务层模式**：API 路由保持轻量。所有业务逻辑位于 `/server/services/`。添加功能时：
   - 先创建/更新服务方法
   - API 路由只调用服务并返回响应

3. **单例服务**：`cache.service.ts` 导出单例实例。`github.service.ts` 是按请求实例化的类（读取运行时配置）。

4. **认证流程**：
   - JWT 存储在 HttpOnly cookies 中（非 localStorage）
   - Token 验证在服务端通过 `verifyAuth()` 工具函数进行
   - 登录端点有速率限制（见 `server/utils/rateLimit.ts`）

5. **缓存策略**：图片列表缓存 5 分钟（`CACHE_CONFIG.IMAGE_LIST_TTL`）以减少 GitHub API 调用。缓存键使用 `CACHE_CONFIG.CACHE_PREFIX` 前缀。

### 环境变量

需要在 `.env`（或 Vercel 环境变量）中配置：
- `GITHUB_TOKEN` - GitHub 个人访问令牌（需要 `repo` 权限）
- `GITHUB_OWNER` - 仓库所有者用户名
- `GITHUB_REPO` - 仓库名称
- `GITHUB_BRANCH` - 分支名称（默认：`main`）
- `AUTH_USERNAME` / `AUTH_PASSWORD` - 登录凭据
- `JWT_SECRET` - JWT 签名密钥

### 文件上传流程

1. 客户端发送 `multipart/form-data` 到 `/api/images/upload`
2. `upload.post.ts` 使用 `busboy` 解析表单数据
3. 文件在 `utils/fileValidation.ts` 中验证（类型、大小）
4. `GitHubService.uploadFile()` 转换为 base64 并发送到 GitHub API
5. `GitHubService.generateUniqueFilename()` 创建唯一名称：`{timestamp}_{random}_{name}`

### 添加新功能

- **新文件类型**：更新 `utils/fileValidation.ts` 允许的类型，添加对应图标
- **新 API 端点**：在 `/server/api/` 中创建，使用服务层处理业务逻辑
- **新常量**：添加到 `/server/config/constants.ts` - 这是单一数据源
- **状态管理**：使用 `/composables/` 中的组合式函数（Vue 3 Composition API 模式）

### 重要限制

- GitHub API 有速率限制 - 缓存有助于缓解
- 文件直接上传到 GitHub - 大文件可能较慢
- 缓存仅在内存中（无服务器函数重启时重置）
- 所有 API 响应遵循统一结构：`{ success: boolean, ...data }` 或 `{ success: false, message: string }`

## 代码规范

### Nuxt 最佳实践

- 使用 **自动导入** - 组件、组合式函数和 Vue API 自动导入
- 使用 **`<script setup>`** 语法编写 Vue 组件（Composition API）
- 服务端路由使用 **async/await** 配合 Nitro 的 `eventHandler` 模式
- 使用 **`useRuntimeConfig()`** 访问环境变量（而非 `process.env`）
- 使用 **`useCookie()`** 操作 cookie，而非原生 `document.cookie`

### 代码原则

1. **保持简单** - 避免过度工程化、过早抽象和"以防万一"的代码
2. **轻量控制器** - API 路由只负责解析请求、调用服务、返回响应
3. **服务层** - 所有业务逻辑属于 `/server/services/`
4. **单一数据源** - 常量放在 `/server/config/constants.ts`
5. **类型安全** - 使用 `/types/index.ts` 中的 TypeScript 类型
6. **尽早返回** - 提前验证输入，立即返回错误

### 组件指南

- 优先使用 **Composition API** 而非 Options API
- 基本类型使用 **`ref()`**，对象使用 **`reactive()`**
- 保持组件专注，尽可能控制在 200 行以内
- 将可复用逻辑提取到组合式函数（`/composables/`）

### 应避免

- 不要为显而易见的代码添加注释
- 不要为一次性操作创建工具函数
- 不要添加不需要的"灵活"或"可扩展"功能
- 不要使用 Vuex/Pinia 管理状态 - Nuxt 3 优先使用组合式函数

## Git 提交规范

### 重要原则

**不要自动提交代码** - 只有用户明确要求提交时才执行 git commit。

### 提交信息格式

使用简洁的 `type: description` 格式：

```
<type>: <description>
```

**类型 (type)**：
- `feat` - 新功能
- `fix` - 修复 bug
- `refactor` - 重构（不改变功能）
- `style` - 代码格式（不影响功能）
- `docs` - 文档更新
- `build` - 构建系统或依赖
- `perf` - 性能优化
- `test` - 测试相关
- `chore` - 其他杂项

**描述 (description)**：
- 简短明确，不超过 50 字符
- 使用中文
- 不要以句号结尾
- 使用祈使句（"添加"而非"添加了"）

### 示例

```bash
git commit -m "feat: add site icon"
git commit -m "fix: resolve auth token expiration"
git commit -m "refactor: simplify image upload logic"
git commit -m "docs: update deployment guide"
```

### 提交前检查

- 运行 `git status` 和 `git diff` 确认变更
- 不要提交 `.env` 等敏感文件
- 确保构建通过（如需要）
- 不要添加 AI 相关信息（如 Co-Authored-By）
