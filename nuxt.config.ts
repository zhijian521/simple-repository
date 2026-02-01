// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // 改用 SPA 模式彻底避免 SSR 样式闪烁
  ssr: false,

  typescript: {
    strict: true,
    typeCheck: false,
  },

  runtimeConfig: {
    githubToken: '',
    githubOwner: '',
    githubRepo: '',
    githubBranch: 'main',
    authUsername: '',
    authPassword: '',
    jwtSecret: '',
    tokenExpiryDays: 7,
  },

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon.png' },
      ],
    },
  },

  components: true,

  modules: [
    '@ant-design-vue/nuxt',
  ],

  antd: {
    extractStyle: true,
  },

  vite: {
    optimizeDeps: {
      include: ['jsonwebtoken', 'ant-design-vue', '@ant-design/icons-vue'],
    },
    build: {
      cssCodeSplit: false,
    },
  },
})
