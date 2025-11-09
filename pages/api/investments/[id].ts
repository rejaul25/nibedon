import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { updateInvestmentSchema } from '@/lib/validation'
import { createAuditLog } from '@/lib/audit'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  const auth = requireAuth(req, res, ['chairman'])
  if (!auth) return

  if (req.method === 'PUT') {
    try {
      const investment = await prisma.investment.findUnique({
        where: { id: String(id) },
      })

      if (!investment) {
        return res.status(404).json({ error: 'Investment not found' })
      }

      const validation = updateInvestmentSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message })
      }

      const updateData: any = { updatedBy: auth.userId }
      const changes: string[] = []

      if (validation.data.title) {
        updateData.title = validation.data.title
        changes.push(`title: ${investment.title} → ${validation.data.title}`)
      }
      if (validation.data.description) {
        updateData.description = validation.data.description
        changes.push('description updated')
      }
      if (validation.data.amount !== undefined) {
        updateData.amount = validation.data.amount
        changes.push(`amount: ${investment.amount} → ${validation.data.amount}`)
      }
      if (validation.data.date) {
        updateData.date = new Date(validation.data.date)
        changes.push('date updated')
      }
      if (validation.data.purpose) {
        updateData.purpose = validation.data.purpose
        changes.push('purpose updated')
      }
      if (validation.data.status) {
        updateData.status = validation.data.status
        changes.push(`status updated to: ${validation.data.status}`)
      }
      if (validation.data.profitLoss !== undefined) {
        updateData.profitLoss = validation.data.profitLoss
        changes.push(`profit/loss: ${validation.data.profitLoss}`)
      }
      if (validation.data.reason) {
        updateData.reason = validation.data.reason
        changes.push('reason updated')
      }

      const updated = await prisma.investment.update({
        where: { id: String(id) },
        data: updateData,
      })

      await createAuditLog(
        'INVESTMENT_UPDATED',
        auth.userId,
        'Investment',
        investment.id,
        `Updated investment: ${investment.title} - ${changes.join(', ')}`,
        { changes }
      )

      return res.status(200).json({ investment: updated })
    } catch (error) {
      console.error('Update investment error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const investment = await prisma.investment.findUnique({
        where: { id: String(id) },
      })

      if (!investment) {
        return res.status(404).json({ error: 'Investment not found' })
      }

      await prisma.investment.delete({
        where: { id: String(id) },
      })

      await createAuditLog(
        'INVESTMENT_DELETED',
        auth.userId,
        'Investment',
        investment.id,
        `Deleted investment: ${investment.title} - ${investment.amount} BDT`,
        { title: investment.title, amount: investment.amount }
      )

      return res.status(200).json({ message: 'Investment deleted successfully' })
    } catch (error) {
      console.error('Delete investment error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
