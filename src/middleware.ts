import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware intercepta solicitudes a rutas específicas
export function middleware(request: NextRequest) {
  // Verificar si la solicitud es para una ruta API problemática
  if (
    request.nextUrl.pathname.startsWith('/api/test-db') ||
    request.nextUrl.pathname.startsWith('/api/datos/prisma')
  ) {
    // Redireccionar a la versión de demostración
    return NextResponse.redirect(new URL('/api/demo', request.url));
  }

  // Continuar con otras rutas
  return NextResponse.next();
}

// Configurar para ejecutarse solo en las rutas especificadas
export const config = {
  matcher: ['/api/test-db/:path*', '/api/datos/prisma/:path*'],
}; 