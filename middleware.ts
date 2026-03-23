import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { apiRateLimit, authRateLimit } from '@/lib/redis/ratelimit'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // ─── Rate limiting ──────────────────────────────────────────────────────────
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous'

  if (pathname.startsWith('/api/auth')) {
    const { success } = await authRateLimit.limit(ip)
    if (!success) {
      return new NextResponse('Too many requests', { status: 429 })
    }
  } else if (pathname.startsWith('/api/')) {
    const { success } = await apiRateLimit.limit(ip)
    if (!success) {
      return new NextResponse('Too many requests', { status: 429 })
    }
  }

  // ─── Supabase session refresh ───────────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) { response.cookies.set({ name, value, ...options }) },
        remove(name, options) { response.cookies.set({ name, value: '', ...options }) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ─── Protected route guard ──────────────────────────────────────────────────
  const protectedPaths = [
    '/dashboard',
    '/workforce',
    '/compliance',
    '/safety',
    '/hiring',
    '/benefits',
    '/ai',
    '/settings',
  ]
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // ─── Redirect authenticated users away from auth pages ─────────────────────
  if (user && pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
