import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signAdminToken, hashPassword, COOKIE_NAME } from '@/lib/auth';
import { isRateLimited, recordLoginAttempt } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = (forwarded ? forwarded.split(',')[0].trim() : realIp) || '127.0.0.1';

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

    let user = await prisma.adminUser.findUnique({
      where: { username },
    }).catch(async (dbErr) => {
      console.error('[LOGIN] Database findUnique error:', dbErr);
      return null;
    });

    // Auto-seed admin user if database is fresh or empty
    if (!user) {
      const adminCount = await prisma.adminUser.count().catch(() => 0);
      if (adminCount === 0 && (username === 'admin' || username === (process.env.ADMIN_USERNAME || 'admin'))) {
        const defaultPassword = process.env.ADMIN_PASSWORD || 'admin1234!';
        if (password === defaultPassword) {
          const passwordHash = await hashPassword(defaultPassword);
          user = await prisma.adminUser.create({
            data: {
              username,
              passwordHash,
            },
          }).catch(() => null);
        }
      }
    }

    if (!user) {
      await recordLoginAttempt(ip, false);
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    let isValid = await verifyPassword(password, user.passwordHash);

    // Initial password rescue ONLY if the password has NEVER been changed by the user in /admin
    const isFirstTimePassword =
      user.createdAt &&
      user.updatedAt &&
      Math.abs(new Date(user.updatedAt).getTime() - new Date(user.createdAt).getTime()) < 3000;

    if (
      !isValid &&
      isFirstTimePassword &&
      (password === 'admin1234!' || (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD))
    ) {
      const newHash = await hashPassword(password);
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      }).catch(() => {});
      isValid = true;
    }

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
    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd || isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
