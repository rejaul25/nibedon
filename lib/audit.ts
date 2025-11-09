import { prisma } from './prisma'
import { AuditAction } from '@prisma/client'

export const createAuditLog = async (
  action: AuditAction,
  performedBy: string,
  targetType: string,
  targetId: string | null,
  changeSummary: string,
  metadata?: Record<string, any>
): Promise<void> => {
  await prisma.auditLog.create({
    data: {
      action,
      performedBy,
      targetType,
      targetId,
      changeSummary,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })
}

export const getAuditLogs = async (
  limit = 100,
  offset = 0
) => {
  return await prisma.auditLog.findMany({
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          membershipId: true,
        },
      },
    },
  })
}
