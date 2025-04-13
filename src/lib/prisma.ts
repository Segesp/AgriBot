// Este archivo configura el cliente Prisma para funcionar en diferentes entornos
import { PrismaClient } from '@prisma/client'

// Evitar inicialización instantánea - importante para entornos edge
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Configuración específica para Vercel
    datasourceUrl: process.env.DATABASE_URL,
    // Logs solo en desarrollo
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Usar globalThis para persistencia en desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined
}

// Exportación aplazada para evitar inicialización prematura
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// Solo guardar cliente en instancia global en desarrollo
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 