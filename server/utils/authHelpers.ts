import AuthService from '~/server/services/auth.service'
import type { JWTPayload } from '~/types'
import type { H3Event } from 'h3'

export function extractToken(event: H3Event): string | null {
  // 1. Authorization header
  const authHeader = getHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // 2. Cookie
  const cookies = parseCookies(event)
  if (cookies.auth_token) {
    return cookies.auth_token
  }

  // 3. Query parameter
  const query = getQuery(event)
  if (query.token) {
    return query.token as string
  }

  return null
}

export async function verifyToken(event: H3Event): Promise<JWTPayload> {
  const token = extractToken(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'No token provided',
    })
  }

  const authService = new AuthService()
  const decoded = authService.verifyToken(token)

  if (!decoded) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token',
    })
  }

  return decoded
}

function parseCookies(event: H3Event): Record<string, string> {
  const cookieHeader = getHeader(event, 'cookie')
  if (!cookieHeader) return {}

  const cookies: Record<string, string> = {}
  cookieHeader.split(';').forEach((cookie: string) => {
    const [name, value] = cookie.trim().split('=')
    if (name && value) {
      cookies[name] = value
    }
  })

  return cookies
}
