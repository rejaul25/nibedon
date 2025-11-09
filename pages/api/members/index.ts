import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import bcrypt from 'bcrypt'
import { createMemberSchema } from '@/lib/validation'
import { createAuditLog } from '@/lib/audit'
import { calculateFullShareUpfrontPayment } from '@/lib/share-calculator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const auth = requireAuth(req, res, ['chairman'])
    if (!auth) return

    try {
      const { search, page = 1, limit = 20 } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      const where: any = {
        role: 'member',
        isDeleted: false,
      }

      if (search) {
        where.OR = [
          { name: { contains: String(search), mode: 'insensitive' } },
          { membershipId: { contains: String(search), mode: 'insensitive' } },
        ]
      }

      const [members, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            payments: {
              orderBy: { date: 'asc' },
            },
          },
        }),
        prisma.user.count({ where }),
      ])

      return res.status(200).json({
        members,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get members error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const auth = requireAuth(req, res, ['chairman'])
    if (!auth) return

    try {
      const validation = createMemberSchema.safeParse(req.body)
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message })
      }

      const { membershipId, name, fatherName, mobile, password, shareType } = validation.data

      const membershipIdRecord = await prisma.membershipId.findUnique({
        where: { membershipId },
      })

      if (!membershipIdRecord || membershipIdRecord.isDeleted || membershipIdRecord.assignedTo) {
        return res.status(400).json({ error: 'Invalid or already used membership ID' })
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const member = await prisma.$transaction(async (tx) => {
        const newMember = await tx.user.create({
          data: {
            membershipId,
            name,
            fatherName,
            mobile,
            passwordHash,
            role: 'member',
            shareType,
          },
        })

        await tx.membershipId.update({
          where: { membershipId },
          data: { assignedTo: newMember.id },
        })

        if (shareType === 'fullShare') {
          const upfrontPayment = await calculateFullShareUpfrontPayment()
          await tx.payment.create({
            data: {
              membershipId,
              amount: upfrontPayment,
              date: new Date(),
              paymentFrom: 'Bank',
              transactionNumber: 'INITIAL-FULL-SHARE',
              createdById: auth.userId,
            },
          })
        }

        return newMember
      })

      await createAuditLog(
        'MEMBER_CREATED',
        auth.userId,
        'User',
        member.id,
        `Created member: ${name} (${membershipId}) as ${shareType}`,
        { membershipId, shareType }
      )

      return res.status(201).json({ member })
    } catch (error) {
      console.error('Create member error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
