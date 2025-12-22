import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function middleware(request) {
    const protectedRoutes = ['/dashboard'];
    const currentPath = request.nextUrl.pathname;

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));

    if (isProtectedRoute) {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');
        const session = await decrypt(sessionCookie?.value);

        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
};
