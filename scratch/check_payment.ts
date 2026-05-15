import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: true }
  });
  console.log(JSON.stringify(payments, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
