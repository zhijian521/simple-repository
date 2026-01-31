import type { LoginResponse } from '~/types'

export const useAuth = () => {
  const token = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 天
    sameSite: 'strict',
    httpOnly: false, // 客户端需要访问
    secure: false, // 开发环境设为 false
  })

  const user = ref<{ username: string } | null>(null)

  // 基于 token 判断登录状态
  const isLoggedIn = computed(() => !!token.value)

  // 检查登录状态
  const checkAuth = async () => {
    try {
      const { data } = await useFetch<{ success: boolean; user?: { username: string } }>('/api/auth/verify')

      if (data.value?.success && data.value.user) {
        user.value = data.value.user
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const login = async (username: string, password: string) => {
    const { data, error } = await useFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })

    if (error.value || !data.value?.success) {
      throw new Error(error.value?.message || '登录失败')
    }

    // 登录成功，保存用户信息
    if (data.value.user) {
      user.value = data.value.user
    }

    return data.value
  }

  const logout = () => {
    token.value = null
    user.value = null
  }

  // 在客户端挂载后检查登录状态
  onMounted(() => {
    if (import.meta.client && token.value) {
      checkAuth()
    }
  })

  return {
    token,
    user,
    isLoggedIn,
    login,
    logout,
    checkAuth,
  }
}
