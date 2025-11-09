import { NextApiRequest, NextApiResponse } from 'next'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

const WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS = 5

export const rateLimit = (
  req: NextApiRequest,
  res: NextApiResponse
): boolean => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  const key = `${ip}-${req.url}`
  const now = Date.now()

  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    }
    return true
  }

  store[key].count++

  if (store[key].count > MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many requests, please try again later',
    })
    return false
  }

  return true
}

setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key]
    }
  })
}, WINDOW_MS)
