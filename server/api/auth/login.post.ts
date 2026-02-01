import AuthService from '~/server/services/auth.service'
import type { LoginResponse } from '~/types'
import { COOKIE_CONFIG, ERROR_MESSAGES, RATE_LIMIT_CONFIG } from '~/server/config/constants'
import { rateLimiter, getClientIP } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  // 应用速率限制
  const clientIP = getClientIP(event)
  const rateLimit = rateLimiter.check(
    clientIP,
    RATE_LIMIT_CONFIG.LOGIN.limit,
    RATE_LIMIT_CONFIG.LOGIN.windowMs
  )

  // 设置速率限制响应头
  setResponseHeaders(event, {
    'X-RateLimit-Limit': RATE_LIMIT_CONFIG.LOGIN.limit.toString(),
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
  })

  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      message: '请求过于频繁，请稍后再试',
      data: {
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
    })
  }
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: ERROR_MESSAGES.MISSING_CREDENTIALS,
    })
  }

  const authService = new AuthService()

  if (username !== authService.getUsername() || !(await authService.verifyPassword(password))) {
    throw createError({
      statusCode: 401,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
    })
  }

  const token = authService.generateToken()

  setCookie(event, COOKIE_CONFIG.NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_CONFIG.MAX_AGE,
    path: COOKIE_CONFIG.PATH,
  })

  const response: LoginResponse = {
    success: true,
    token,
    user: { username },
  }

  return response
})
