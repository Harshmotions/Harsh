import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Block the Sanity Studio route on Vercel deployments.
 *
 * Vercel sets VERCEL_ENV to "production" or "preview" automatically.
 * On localhost it is undefined, so the studio stays accessible for editing.
 *
 * Visitors who navigate to /studio on the live site get a plain 404.
 */
export function middleware(request: NextRequest) {
  if (process.env.VERCEL_ENV) {
    // Return a proper 404 — no redirect that leaks the studio exists
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  // Matches /studio and every sub-path under it
  matcher: ['/studio', '/studio/:path*'],
};
