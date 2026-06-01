import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { canAccessPath } from '@/lib/auth/permissions';

const PUBLIC_ROUTES = ['/login', '/set-password', '/forgot-password', '/unauthorized', '/api/auth/callback'];

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);

  const currentPath = request.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(currentPath)) {
    return response;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based route protection
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(new URL('/login', request.url));
  }


  const isAuthorized = canAccessPath(profile.role, currentPath);

  if (!isAuthorized) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
