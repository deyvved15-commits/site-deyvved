const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.product.count();
    console.log("Produtos no banco:", count);
  } catch (err) {
    console.error("ERRO AO ACESSAR TABELA PRODUCT:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
