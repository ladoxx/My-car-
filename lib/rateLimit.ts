import { prisma } from './db';

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function isRateLimited(ip: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const failedCount = await prisma.loginAttempt.count({
    where: {
      ip,
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  return failedCount >= MAX_FAILED_ATTEMPTS;
}

export async function recordLoginAttempt(ip: string, success: boolean): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        ip,
        success,
      },
    });
  } catch (error) {
    console.error('Failed to record login attempt:', error);
  }
}
