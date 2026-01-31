import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import type { JWTPayload } from '~/types'

const SALT_ROUNDS = 10

class AuthService {
  private secret: string
  private username: string
  private passwordHash: string
  private tokenExpiryDays: number

  constructor() {
    const config = useRuntimeConfig()
    this.secret = config.jwtSecret as string
    this.username = config.authUsername as string
    const password = config.authPassword as string
    this.tokenExpiryDays = config.tokenExpiryDays as number

    if (!this.secret || this.secret === 'change-this-secret') {
      throw new Error('JWT_SECRET environment variable is required and must be secure')
    }

    if (!password) {
      throw new Error('AUTH_PASSWORD environment variable is required')
    }

    // 检查密码是否已经是哈希（以 $2b$ 开头）
    if (password.startsWith('$2b$')) {
      this.passwordHash = password
    } else {
      // 开发环境：对明文密码进行哈希
      console.warn('⚠️  检测到明文密码，建议在环境变量中使用 bcrypt 哈希')
      this.passwordHash = bcrypt.hashSync(password, SALT_ROUNDS)
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash)
  }

  generateToken(): string {
    const token = jwt.sign(
      { username: this.username },
      this.secret,
      { expiresIn: `${this.tokenExpiryDays}d` }
    )
    return token
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JWTPayload
      return decoded
    } catch (error) {
      return null
    }
  }

  getUsername(): string {
    return this.username
  }
}

export default AuthService
