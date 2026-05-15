import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "cmoz66noq0003js04wj3v8h7m";
  const productId = "cmp5wr8u90000jx043jg3bdww";

  console.log("Liberando apostila para Suelen...");

  await prisma.$transaction([
    // Atualizar pagamento
    prisma.payment.updateMany({
      where: { userId, productId, status: "pending" },
      data: { status: "approved" }
    }),
    // Criar compra do produto
    prisma.productPurchase.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, amount: 15 },
      update: { amount: 15 }
    })
  ]);

  console.log("Apostila liberada com sucesso!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
