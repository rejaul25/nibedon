import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { generateResetToken } from '@/lib/jwt'
import { sendPasswordResetEmail } from '@/lib/email'
import { forgotPasswordSchema } from '@/lib/validation'
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
    const validation = forgotPasswordSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message })
    }

    const { username } = validation.data

    const user = await prisma.user.findFirst({
      where: {
        membershipId: username,
        role: 'chairman',
        isDeleted: false,
      },
    })

    if (!user) {
      return res.status(200).json({ message: 'If the account exists, a reset email has been sent' })
    }

    const token = generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    const email = process.env.CHAIRMAN_EMAIL || 'chairman@bhavki.com'
    await sendPasswordResetEmail(email, token, user.name)

    return res.status(200).json({ message: 'If the account exists, a reset email has been sent' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
