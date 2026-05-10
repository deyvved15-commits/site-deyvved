import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@kadimaacademy.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const name = "Deyvved Mesquita";

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log("Admin já existe:", email);
    return;
  }

  await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 12), role: Role.ADMIN },
  });
  console.log("✓ Admin criado:", email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
