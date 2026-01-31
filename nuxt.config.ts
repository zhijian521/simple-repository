// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  typescript: {
    strict: true,
    typeCheck: false, // 开发时可关闭，加快构建速度
  },

  runtimeConfig: {
    // 服务端环境变量（自动从 .env 读取）
    githubToken: '',
    githubOwner: '',
    githubRepo: '',
    githubBranch: 'main',
    authUsername: '',
    authPassword: '',
    jwtSecret: '',
    tokenExpiryDays: 7,
  },

  // Nitro 配置 - Vercel 部署
  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  css: ['~/assets/css/main.css'],

  components: true,

  vite: {
    optimizeDeps: {
      include: ['jsonwebtoken'],
    },
  },
})
