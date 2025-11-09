import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import crypto from 'crypto'

const generateMembershipId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `BM-${timestamp}-${random}`
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = requireAuth(req, res, ['chairman'])
  if (!auth) return

  try {
    const { count = 1 } = req.body

    const generateCount = Math.min(Math.max(count, 1), 100)
    const membershipIds = []

    for (let i = 0; i < generateCount; i++) {
      const membershipId = generateMembershipId()
      const created = await prisma.membershipId.create({
        data: { membershipId },
      })
      membershipIds.push(created)
    }

    await createAuditLog(
      'MEMBERSHIP_ID_GENERATED',
      auth.userId,
      'MembershipId',
      null,
      `Generated ${generateCount} membership ID(s)`,
      { count: generateCount, ids: membershipIds.map(m => m.membershipId) }
    )

    return res.status(201).json({ membershipIds })
  } catch (error) {
    console.error('Generate membership ID error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
