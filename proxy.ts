import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // Set pathname header for layout to use
  const response = await updateSession(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  
  // If response is a redirect, return it as-is
  if (response.status === 307 || response.status === 308) {
    return response;
  }
  
  // Otherwise, add pathname header to response
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

// Only run proxy on admin routes
export const config = {
  matcher: "/admin/:path*",
};

