import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { calculateAllShares } from '@/lib/share-calculator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = requireAuth(req, res)
  if (!auth) return

  try {
    const shareCalculations = await calculateAllShares()

    const totalShares = shareCalculations.reduce(
      (sum, calc) => sum + calc.sharePercentage,
      0
    )

    return res.status(200).json({
      calculations: shareCalculations,
      totalShares,
    })
  } catch (error) {
    console.error('Get share report error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
