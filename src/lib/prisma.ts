import { PrismaClient } from '@prisma/client';

// PrismaClient es adjuntado al objeto global para prevenir
// múltiples instancias del cliente Prisma en entornos de desarrollo/testing
declare global {
  var prisma: PrismaClient | undefined;
}

// En producción, es mejor no usar el objeto global
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 