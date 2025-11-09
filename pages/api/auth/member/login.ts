import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/jwt'
import { setAuthCookie } from '@/lib/auth'
import { memberLoginSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limiter'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!rateLimit(req, res)) {
    return
  }

  try {
    const validation = memberLoginSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message })
    }

    const { membershipId, password } = validation.data

    const user = await prisma.user.findFirst({
      where: {
        membershipId,
        role: 'member',
        isDeleted: false,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken({
      userId: user.id,
      membershipId: user.membershipId,
      role: user.role,
    })

    setAuthCookie(res, token)

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        membershipId: user.membershipId,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Member login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
