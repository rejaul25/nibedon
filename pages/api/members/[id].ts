import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import bcrypt from 'bcrypt'
import { updateMemberSchema } from '@/lib/validation'
import { createAuditLog } from '@/lib/audit'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method === 'GET') {
    const auth = requireAuth(req, res)
    if (!auth) return

    try {
      const member = await prisma.user.findFirst({
        where: {
          id: String(id),
          isDeleted: false,
        },
        include: {
          payments: {
            orderBy: { date: 'desc' },
          },
        },
      })

      if (!member) {
        return res.status(404).json({ error: 'Member not found' })
      }

      if (auth.role === 'member' && member.id !== auth.userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const { passwordHash, ...memberData } = member
      return res.status(200).json({ member: memberData })
    } catch (error) {
      console.error('Get member error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const auth = requireAuth(req, res)
    if (!auth) return

    try {
      const member = await prisma.user.findFirst({
        where: { id: String(id), isDeleted: false },
      })

      if (!member) {
        return res.status(404).json({ error: 'Member not found' })
      }

      if (auth.role === 'member' && member.id !== auth.userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const validation = updateMemberSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message })
      }

      const updateData: any = {}
      const changes: string[] = []

      if (validation.data.name) {
        updateData.name = validation.data.name
        changes.push(`name: ${member.name} → ${validation.data.name}`)
      }
      if (validation.data.fatherName) {
        updateData.fatherName = validation.data.fatherName
        changes.push(`fatherName: ${member.fatherName} → ${validation.data.fatherName}`)
      }
      if (validation.data.mobile) {
        updateData.mobile = validation.data.mobile
        changes.push(`mobile: ${member.mobile} → ${validation.data.mobile}`)
      }
      if (validation.data.password) {
        updateData.passwordHash = await bcrypt.hash(validation.data.password, 10)
        changes.push('password updated')
      }

      const updated = await prisma.user.update({
        where: { id: String(id) },
        data: updateData,
      })

      await createAuditLog(
        'MEMBER_UPDATED',
        auth.userId,
        'User',
        member.id,
        `Updated member: ${member.membershipId} - ${changes.join(', ')}`,
        { changes }
      )

      const { passwordHash, ...memberData } = updated
      return res.status(200).json({ member: memberData })
    } catch (error) {
      console.error('Update member error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    const auth = requireAuth(req, res, ['chairman'])
    if (!auth) return

    try {
      const member = await prisma.user.findFirst({
        where: { id: String(id), role: 'member', isDeleted: false },
      })

      if (!member) {
        return res.status(404).json({ error: 'Member not found' })
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: String(id) },
          data: { isDeleted: true },
        }),
        prisma.membershipId.update({
          where: { membershipId: member.membershipId },
          data: { isDeleted: true },
        }),
      ])

      await createAuditLog(
        'MEMBER_DELETED',
        auth.userId,
        'User',
        member.id,
        `Deleted member: ${member.name} (${member.membershipId})`,
        { membershipId: member.membershipId }
      )

      return res.status(200).json({ message: 'Member deleted successfully' })
    } catch (error) {
      console.error('Delete member error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
