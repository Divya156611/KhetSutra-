import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/signup', '/forgot-password', '/auth/login', '/auth/register', '/auth/onboarding'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = Boolean(request.cookies.get('khetsutra_token')?.value);
  const isPublic = publicRoutes.includes(pathname);

  if (!authenticated && !isPublic && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authenticated && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
