import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = verifyAuth(req)
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        membershipId: true,
        name: true,
        fatherName: true,
        mobile: true,
        role: true,
        shareType: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json({ user })
  } catch (error) {
    console.error('Get current user error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
