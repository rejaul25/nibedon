import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const getJWTSecret = (): string => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET
  }
  
  const generatedSecret = crypto.randomBytes(64).toString('hex')
  console.log('⚠️  JWT_SECRET not found in environment. Generated temporary secret.')
  console.log('⚠️  For production, set JWT_SECRET in your .env file')
  return generatedSecret
}

const JWT_SECRET = getJWTSecret()

export interface JWTPayload {
  userId: string
  membershipId: string
  role: 'chairman' | 'member'
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}
