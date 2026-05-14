import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function generatePassword(): string {
  return randomBytes(12).toString('base64url') + 'A1!';
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@lumalab.asia';
  const name = process.env.SEED_ADMIN_NAME ?? 'LumaLab Admin';
  const explicit = process.env.SEED_ADMIN_PASSWORD;
  const password = explicit && explicit.length >= 8 ? explicit : generatePassword();

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`[seed] admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log('====================================================');
  console.log('[seed] LumaLab admin created');
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  if (!explicit) {
    console.log('  (random — store it now; it will not be shown again)');
  }
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('[seed] failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
