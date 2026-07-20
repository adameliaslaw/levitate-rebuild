
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query','error','warn'] : ['error']
})
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const getOverdueContacts = (ownerId: string) => {
  return prisma.$queryRaw`
    SELECT * FROM "Contact"
    WHERE "ownerId" = ${ownerId}
    AND "lastContacted" < NOW() - ("keepInterval" || ' days')::interval
    ORDER BY "lastContacted" ASC
  `
}
