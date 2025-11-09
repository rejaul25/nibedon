import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createInvestmentSchema } from '@/lib/validation'
import { createAuditLog } from '@/lib/audit'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const auth = requireAuth(req, res)
    if (!auth) return

    try {
      const { page = 1, limit = 20 } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      const [investments, total] = await Promise.all([
        prisma.investment.findMany({
          skip,
          take: Number(limit),
          orderBy: { date: 'desc' },
        }),
        prisma.investment.count(),
      ])

      return res.status(200).json({
        investments,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get investments error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const auth = requireAuth(req, res, ['chairman'])
    if (!auth) return

    try {
      const validation = createInvestmentSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message })
      }

      const { title, description, amount, date, purpose } = validation.data

      const investment = await prisma.investment.create({
        data: {
          title,
          description,
          amount,
          date: new Date(date),
          purpose,
          createdBy: auth.userId,
        },
      })

      await createAuditLog(
        'INVESTMENT_CREATED',
        auth.userId,
        'Investment',
        investment.id,
        `Created investment: ${title} - ${amount} BDT`,
        { title, amount, purpose }
      )

      return res.status(201).json({ investment })
    } catch (error) {
      console.error('Create investment error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
