import type { LoginResponse } from '~/types'
import { COOKIE_CONFIG } from '~/server/config/constants'

const user = ref<{ username: string } | null>(null)

export const useAuth = () => {
  const token = useCookie(COOKIE_CONFIG.NAME, {
    maxAge: COOKIE_CONFIG.MAX_AGE,
    sameSite: COOKIE_CONFIG.SAME_SITE,
    httpOnly: false,
    secure: false,
  })

  const isLoggedIn = computed(() => !!token.value)

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

    if (data.value.user) {
      user.value = data.value.user
    }

    return data.value
  }

  const logout = () => {
    token.value = null
    user.value = null
  }

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
