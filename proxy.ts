import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const protectedPaths = ['/learn', '/tasks', '/exams', '/review', '/plan', '/ai', '/map', '/stats', '/profile', '/settings', '/generator', '/mistakes']

function requiresAuth(pathname: string) {
  if (pathname === '/') return true
  return protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export async function proxy(request: NextRequest) {
  const { response, user, configured } = await updateSession(request)
  if (!configured) return response

  const { pathname, search } = request.nextUrl

  if (!user && requiresAuth(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = `redirect=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const redirect = request.nextUrl.searchParams.get('redirect')
    const url = request.nextUrl.clone()
    url.pathname = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
