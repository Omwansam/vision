require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to BACKEND/.env before creating an admin user.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const VALID_ROLES = ['admin', 'editor', 'procurement', 'finance'];
const MIN_PASSWORD_LENGTH = 8;

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;

    const [flag, inlineValue] = arg.slice(2).split('=');
    if (flag === 'generate') {
      args.generate = true;
      continue;
    }

    args[flag] = inlineValue !== undefined ? inlineValue : argv[++i];
  }

  return args;
}

function generatePassword() {
  // 18 url-safe chars — long enough that the printed value is the only copy needed.
  return crypto.randomBytes(18).toString('base64url');
}

async function createAdmin() {
  const args = parseArgs(process.argv.slice(2));

  const email = (args.email || process.env.SEED_ADMIN_EMAIL || 'admin@visionmentorsgroup.org')
    .trim()
    .toLowerCase();
  const name = args.name || process.env.SEED_ADMIN_NAME || 'VMG Admin';
  const role = args.role || 'admin';

  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Invalid role "${role}". Expected one of: ${VALID_ROLES.join(', ')}`);
  }

  const generated = args.generate ? generatePassword() : null;
  const password = generated || args.password || process.env.SEED_ADMIN_PASSWORD || null;

  if (password && password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing && !password) {
    throw new Error(
      `No user exists for ${email} and no password was supplied.\n` +
        'Pass --password=<value>, use --generate, or set SEED_ADMIN_PASSWORD.'
    );
  }

  // Only touch the password when one was supplied — a bare re-run syncs
  // name/role/isActive without locking the current holder out.
  const passwordFields = password ? { password: await bcrypt.hash(password, 10) } : {};

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      isActive: true,
      ...passwordFields,
    },
    create: {
      name,
      email,
      role,
      country: 'Kenya',
      isActive: true,
      ...passwordFields,
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  console.log(existing ? 'Admin user synced:' : 'Admin user created:');
  console.log(`  id:     ${user.id}`);
  console.log(`  name:   ${user.name}`);
  console.log(`  email:  ${user.email}`);
  console.log(`  role:   ${user.role}`);
  console.log(`  active: ${user.isActive}`);

  if (generated) {
    console.log(`\n  password: ${generated}`);
    console.log('  Store this now — it is not recoverable and will not be shown again.');
  } else if (password) {
    console.log('\n  Password updated.');
  } else {
    console.log('\n  Password left unchanged (none supplied).');
  }
}

createAdmin()
  .catch((error) => {
    console.error('Admin creation failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
