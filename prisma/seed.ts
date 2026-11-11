import { prisma } from '../lib/db';
import { hashPassword } from '../lib/auth';
import { DEFAULT_SETTINGS } from '../lib/settings';

async function main() {
  console.log('Seeding database...');

  // Ensure default admin user
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234!';

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.adminUser.create({
      data: {
        username: adminUsername,
        passwordHash,
      },
    });
    console.log(`Created default admin user: ${adminUsername}`);
  } else {
    console.log(`Admin user ${adminUsername} already exists.`);
  }

  // Ensure default settings
  const existingSettings = await prisma.vehicleContactSettings.findUnique({
    where: { id: 'default' },
  });

  if (!existingSettings) {
    await prisma.vehicleContactSettings.create({
      data: {
        id: 'default',
        ...DEFAULT_SETTINGS,
      },
    });
    console.log('Created default vehicle contact settings.');
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
