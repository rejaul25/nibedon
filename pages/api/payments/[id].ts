import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { updatePaymentSchema } from '@/lib/validation'
import { createAuditLog } from '@/lib/audit'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = requireAuth(req, res, ['chairman'])
  if (!auth) return

  const { id } = req.query

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: String(id) },
    })

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    const validation = updatePaymentSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message })
    }

    const updateData: any = { updatedBy: auth.userId }
    const changes: string[] = []

    if (validation.data.amount !== undefined) {
      updateData.amount = validation.data.amount
      changes.push(`amount: ${payment.amount} → ${validation.data.amount}`)
    }
    if (validation.data.date) {
      updateData.date = new Date(validation.data.date)
      changes.push(`date: ${payment.date} → ${validation.data.date}`)
    }
    if (validation.data.paymentFrom) {
      updateData.paymentFrom = validation.data.paymentFrom
      changes.push(`paymentFrom: ${payment.paymentFrom} → ${validation.data.paymentFrom}`)
    }
    if (validation.data.transactionNumber !== undefined) {
      updateData.transactionNumber = validation.data.transactionNumber
      changes.push(`transactionNumber: ${payment.transactionNumber || 'null'} → ${validation.data.transactionNumber}`)
    }

    const updated = await prisma.payment.update({
      where: { id: String(id) },
      data: updateData,
    })

    await createAuditLog(
      'PAYMENT_UPDATED',
      auth.userId,
      'Payment',
      payment.id,
      `Updated payment for ${payment.membershipId} - ${changes.join(', ')}`,
      { changes }
    )

    return res.status(200).json({ payment: updated })
  } catch (error) {
    console.error('Update payment error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
