import { prisma } from './db';

// IP rate-limiting disabled to avoid blocking legitimate tunnel traffic (Cloudflare Tunnel / reverse proxies)
export async function isRateLimited(_ip: string): Promise<boolean> {
  return false;
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
