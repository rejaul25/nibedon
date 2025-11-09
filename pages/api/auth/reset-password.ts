import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { resetPasswordSchema } from '@/lib/validation'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const validation = resetPasswordSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message })
    }

    const { token, password } = validation.data

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ])

    return res.status(200).json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
