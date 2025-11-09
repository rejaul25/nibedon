import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createPaymentSchema } from '@/lib/validation'
import { createAuditLog } from '@/lib/audit'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const auth = requireAuth(req, res, ['chairman'])
    if (!auth) return

    try {
      const { page = 1, limit = 50 } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          skip,
          take: Number(limit),
          orderBy: { date: 'desc' },
          include: {
            member: {
              select: {
                name: true,
                membershipId: true,
              },
            },
          },
        }),
        prisma.payment.count(),
      ])

      return res.status(200).json({
        payments,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get payments error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const auth = requireAuth(req, res, ['chairman'])
    if (!auth) return

    try {
      const validation = createPaymentSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message })
      }

      const { membershipId, amount, date, paymentFrom, transactionNumber } = validation.data

      const member = await prisma.user.findFirst({
        where: {
          membershipId,
          role: 'member',
          isDeleted: false,
        },
      })

      if (!member) {
        return res.status(404).json({ error: 'Member not found' })
      }

      const payment = await prisma.payment.create({
        data: {
          membershipId,
          amount,
          date: new Date(date),
          paymentFrom,
          transactionNumber: transactionNumber || null,
          createdById: auth.userId,
        },
      })

      await createAuditLog(
        'PAYMENT_CREATED',
        auth.userId,
        'Payment',
        payment.id,
        `Created payment: ${amount} BDT for ${membershipId} via ${paymentFrom}`,
        { membershipId, amount, paymentFrom, transactionNumber }
      )

      return res.status(201).json({ payment })
    } catch (error) {
      console.error('Create payment error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
