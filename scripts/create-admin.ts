import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const email = process.argv[2] || "admin@example.com";
  const name = process.argv[3] || "Admin User";
  const role = (process.argv[4] || "ADMIN").toUpperCase();

  console.log(`Creating admin user with email: ${email}`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: role as any,
      name,
    },
    create: {
      email,
      name,
      role: role as any,
    },
  });

  console.log(`✅ Admin user created/updated successfully!`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Role: ${user.role}`);
  console.log(`\n⚠️  Note: Password authentication is currently disabled.`);
  console.log(`   You can log in with any email that exists in the database.`);
  console.log(`   To enable password authentication, you'll need to add a password field to the User model.`);
}

main()
  .catch((e) => {
    console.error("Error creating admin user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

