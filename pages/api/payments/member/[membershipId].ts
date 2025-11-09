import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = requireAuth(req, res)
  if (!auth) return

  const { membershipId } = req.query

  try {
    const member = await prisma.user.findFirst({
      where: {
        membershipId: String(membershipId),
        role: 'member',
        isDeleted: false,
      },
    })

    if (!member) {
      return res.status(404).json({ error: 'Member not found' })
    }

    if (auth.role === 'member' && member.membershipId !== auth.membershipId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const payments = await prisma.payment.findMany({
      where: { membershipId: String(membershipId) },
      orderBy: { date: 'asc' },
    })

    return res.status(200).json({ payments })
  } catch (error) {
    console.error('Get member payments error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
