import { serialize, parse } from 'cookie'
import { verifyToken, JWTPayload } from './jwt'
import { NextApiRequest, NextApiResponse } from 'next'

const COOKIE_NAME = 'auth_token'

export const setAuthCookie = (res: NextApiResponse, token: string) => {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
  res.setHeader('Set-Cookie', cookie)
}

export const clearAuthCookie = (res: NextApiResponse) => {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  res.setHeader('Set-Cookie', cookie)
}

export const getAuthToken = (req: NextApiRequest): string | null => {
  const cookies = parse(req.headers.cookie || '')
  return cookies[COOKIE_NAME] || null
}

export const verifyAuth = (req: NextApiRequest): JWTPayload | null => {
  const token = getAuthToken(req)
  if (!token) return null
  return verifyToken(token)
}

export const requireAuth = (
  req: NextApiRequest,
  res: NextApiResponse,
  allowedRoles?: ('chairman' | 'member')[]
): JWTPayload | null => {
  const payload = verifyAuth(req)
  
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  
  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    res.status(403).json({ error: 'Forbidden' })
    return null
  }
  
  return payload
}
