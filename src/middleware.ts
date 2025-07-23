import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware completely for webhook endpoints
  if (request.nextUrl.pathname === '/api/story-complete' || 
      request.nextUrl.pathname.startsWith('/api/story-complete/')) {
    return NextResponse.next()
  }
  
  // Add other authentication logic here if needed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except API routes and static files
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}