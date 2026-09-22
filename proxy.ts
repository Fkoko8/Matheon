import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const protectedPaths = ['/learn', '/tasks', '/exams', '/review', '/plan', '/ai', '/map', '/stats', '/profile', '/settings']

export async function proxy(request: NextRequest) {
  const response = await updateSession(request)
  const configured = Boolean(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)
  if (!configured) return response
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`))
  if (!isProtected) return response
  return response
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
