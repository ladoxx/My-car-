import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signAdminToken, COOKIE_NAME } from '@/lib/auth';
import { isRateLimited, recordLoginAttempt } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Check rate limit
    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!user) {
      await recordLoginAttempt(ip, false);
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      await recordLoginAttempt(ip, false);
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Success
    await recordLoginAttempt(ip, true);

    const token = signAdminToken({
      userId: user.id,
      username: user.username,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username },
    });

    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
