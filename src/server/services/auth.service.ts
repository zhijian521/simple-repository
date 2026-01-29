import jwt from 'jsonwebtoken';

export interface JWTPayload {
  username: string;
  iat: number;
  exp: number;
}

class AuthService {
  private readonly secret: string;
  private readonly username: string;
  private readonly password: string;
  private readonly tokenExpiryDays: number;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'change-this-secret';
    this.username = process.env.AUTH_USERNAME || 'admin';
    this.password = process.env.AUTH_PASSWORD!;
    this.tokenExpiryDays = parseInt(process.env.TOKEN_EXPIRY_DAYS || '7');

    if (!this.password) {
      throw new Error('AUTH_PASSWORD environment variable is required');
    }
  }

  verifyPassword(password: string): boolean {
    return password === this.password;
  }

  generateToken(): string {
    const token = jwt.sign(
      { username: this.username },
      this.secret,
      { expiresIn: `${this.tokenExpiryDays}d` }
    );
    return token;
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  getUsername(): string {
    return this.username;
  }
}

export const authService = new AuthService();
export const verifyToken = (token: string) => authService.verifyToken(token);
