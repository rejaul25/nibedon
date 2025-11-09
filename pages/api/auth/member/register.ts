import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { memberRegisterSchema } from '@/lib/validation'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const validation = memberRegisterSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message })
    }

    const { membershipId, name, fatherName, mobile, password } = validation.data

    const membershipIdRecord = await prisma.membershipId.findUnique({
      where: { membershipId },
    })

    if (!membershipIdRecord || membershipIdRecord.isDeleted || membershipIdRecord.assignedTo) {
      return res.status(400).json({ error: 'Invalid or already used membership ID' })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { membershipId },
          { mobile },
        ],
      },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Membership ID or mobile already in use' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          membershipId,
          name,
          fatherName,
          mobile,
          passwordHash,
          role: 'member',
          shareType: 'newMember',
        },
      })

      await tx.membershipId.update({
        where: { membershipId },
        data: { assignedTo: newUser.id },
      })

      return newUser
    })

    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        membershipId: user.membershipId,
      },
    })
  } catch (error) {
    console.error('Member registration error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
