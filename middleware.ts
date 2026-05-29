import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export function resolveRedirect(
  pathname: string,
  hasSession: boolean,
  isAdmin: boolean
): 'login' | 'home' | null {
  if (!hasSession && pathname !== '/login') return 'login'
  if (pathname.startsWith('/admin') && hasSession && !isAdmin) return 'home'
  return null
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({ request })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  let isAdmin = false
  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.is_admin ?? false
  }

  const redirect = resolveRedirect(pathname, !!user, isAdmin)
  if (redirect === 'login') return NextResponse.redirect(new URL('/login', request.url))
  if (redirect === 'home') return NextResponse.redirect(new URL('/', request.url))

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
