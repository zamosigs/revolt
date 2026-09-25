import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { canAccessPath } from '@/lib/auth/permissions';
import { updateLedgerSession } from '@/features/ledger/lib/supabase/middleware';

const ERP_PUBLIC_ROUTES = ['/login', '/set-password', '/forgot-password', '/unauthorized', '/api/auth/callback'];
const LEDGER_PUBLIC_ROUTES = ['/ledger/login'];

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  // ──────────────────────────────────────────────
  // LEDGER MODULE: Separate authentication & authorization boundary
  // ──────────────────────────────────────────────
  if (currentPath.startsWith('/ledger')) {
    const { response, user, supabase } = await updateLedgerSession(request);

    // Allow public ledger routes
    if (LEDGER_PUBLIC_ROUTES.includes(currentPath)) {
      return response;
    }

    // Redirect to ledger login if not authenticated
    if (!user) {
      return NextResponse.redirect(new URL('/ledger/login', request.url));
    }

    // Check ledger_users table in Ledger Supabase DB
    const { data: ledgerUser } = await supabase
      .from('ledger_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .single();

    if (!ledgerUser || !ledgerUser.is_active) {
      return NextResponse.redirect(new URL('/ledger/login?error=no_access', request.url));
    }

    // OPERATOR role restrictions (Wasi can only access /ledger/payments)
    if (ledgerUser.role === 'OPERATOR') {
      const allowedOperatorPrefixes = ['/ledger/payments'];
      const isAllowed = allowedOperatorPrefixes.some(prefix =>
        currentPath === prefix || currentPath.startsWith(prefix + '/')
      );
      if (!isAllowed) {
        return NextResponse.redirect(new URL('/ledger/payments', request.url));
      }
    }

    return response;
  }

  // ──────────────────────────────────────────────
  // EXISTING ERP ROUTING (UNTOUCHED)
  // ──────────────────────────────────────────────
  const { response, user, supabase } = await updateSession(request);

  if (ERP_PUBLIC_ROUTES.includes(currentPath)) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

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
