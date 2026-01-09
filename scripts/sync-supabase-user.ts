import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncUser(email: string, role: 'ADMIN' | 'SUPER_ADMIN' | 'USER' = 'USER') {
  try {
    console.log(`\n🔄 Syncing user: ${email}`);

    // Get user from Supabase Auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }

    const authUser = authUsers.users.find(u => u.email === email);

    if (!authUser) {
      console.error(`❌ User ${email} not found in Supabase Auth`);
      console.log('💡 Create the user in Supabase Dashboard first:');
      console.log('   1. Go to Authentication → Users');
      console.log('   2. Click "Add user" → "Create new user"');
      console.log('   3. Enter email and password');
      console.log('   4. Check "Auto Confirm User"');
      return;
    }

    console.log(`✅ Found user in Supabase Auth: ${authUser.id}`);

    // Sync to Prisma User table
    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {
        role,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      },
      create: {
        id: authUser.id, // Use Supabase Auth UUID
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        role,
        emailVerified: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : null,
      },
    });

    console.log(`✅ Synced to database: ${dbUser.email} (${dbUser.role})`);
    console.log(`   User ID: ${dbUser.id}`);

  } catch (error) {
    console.error('❌ Error syncing user:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: npx tsx scripts/sync-supabase-user.ts <email> [role]');
    console.log('Example: npx tsx scripts/sync-supabase-user.ts admin@example.com SUPER_ADMIN');
    process.exit(1);
  }

  const email = args[0];
  const role = (args[1] as 'ADMIN' | 'SUPER_ADMIN' | 'USER') || 'USER';

  await syncUser(email, role);

  await prisma.$disconnect();
}

main();

