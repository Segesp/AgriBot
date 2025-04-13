// Este archivo configura el cliente Prisma para funcionar en diferentes entornos
import { PrismaClient } from '@prisma/client'

// Variable para guardar la instancia del cliente
let prisma: PrismaClient

// En entornos de producción, crear una nueva instancia por cada invocación
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // En desarrollo, reutilizar la misma instancia para evitar demasiadas conexiones
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient()
  }
  prisma = (global as any).prisma
}

export { prisma } 