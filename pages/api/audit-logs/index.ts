import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { getAuditLogs } from '@/lib/audit'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = requireAuth(req, res, ['chairman'])
  if (!auth) return

  try {
    const { page = 1, limit = 50 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const logs = await getAuditLogs(Number(limit), skip)

    return res.status(200).json({ logs })
  } catch (error) {
    console.error('Get audit logs error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
