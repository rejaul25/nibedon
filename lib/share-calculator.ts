import { prisma } from './prisma'

export interface ShareCalculation {
  membershipId: string
  name: string
  shareType: 'fullShare' | 'newMember'
  totalPaid: number
  sharePercentage: number
  monthsPaid: number
}

export const calculateOldMemberShare = (
  monthsPaid: number,
  totalShares: number,
  totalMonths: number
): number => {
  if (totalShares === 0 || totalMonths === 0) return 0
  return (monthsPaid / totalShares) * 100
}

export const calculateNewMemberShare = (
  monthsPaid: number,
  previousTotal: number,
  newMonthTotal: number
): number => {
  const memberContribution = 500 * monthsPaid
  const totalFund = previousTotal + newMonthTotal
  if (totalFund === 0) return 0
  return (memberContribution / totalFund) * 100
}

export const calculateFullShareUpfrontPayment = async (): Promise<number> => {
  const existingMembers = await prisma.user.findMany({
    where: {
      role: 'member',
      isDeleted: false,
    },
    include: {
      payments: true,
    },
  })

  if (existingMembers.length === 0) {
    return 500
  }

  const maxMonths = Math.max(
    ...existingMembers.map((m) => m.payments.length)
  )

  return 500 * maxMonths
}

export const calculateAllShares = async (): Promise<ShareCalculation[]> => {
  const members = await prisma.user.findMany({
    where: {
      role: 'member',
      isDeleted: false,
    },
    include: {
      payments: {
        orderBy: {
          date: 'asc',
        },
      },
    },
  })

  if (members.length === 0) {
    return []
  }

  const calculations: ShareCalculation[] = []
  let totalShares = 0

  for (const member of members) {
    const totalPaid = member.payments.reduce((sum, p) => sum + p.amount, 0)
    const monthsPaid = member.payments.length

    if (member.shareType === 'fullShare') {
      totalShares += monthsPaid
    }
  }

  const totalMonths = Math.max(...members.map((m) => m.payments.length))

  for (const member of members) {
    const totalPaid = member.payments.reduce((sum, p) => sum + p.amount, 0)
    const monthsPaid = member.payments.length

    let sharePercentage = 0

    if (member.shareType === 'fullShare') {
      sharePercentage = calculateOldMemberShare(
        monthsPaid,
        totalShares,
        totalMonths
      )
    } else if (member.shareType === 'newMember') {
      const allPayments = await prisma.payment.findMany({
        where: {
          date: {
            lt: member.createdAt,
          },
        },
      })
      const previousTotal = allPayments.reduce((sum, p) => sum + p.amount, 0)
      
      const memberPayments = member.payments
      const newMonthTotal = memberPayments.reduce((sum, p) => sum + p.amount, 0)

      sharePercentage = calculateNewMemberShare(
        monthsPaid,
        previousTotal,
        newMonthTotal
      )
    }

    calculations.push({
      membershipId: member.membershipId,
      name: member.name,
      shareType: member.shareType || 'newMember',
      totalPaid,
      sharePercentage,
      monthsPaid,
    })
  }

  return calculations
}
