const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function backup() {
  const backupDir = path.join(__dirname, 'db_backup');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  const tables = [
    'user', 'course', 'module', 'lesson', 'enrollment', 'payment', 
    'ticket', 'message', 'lessonProgress', 'lessonRating', 
    'certificate', 'achievement', 'userAchievement'
  ];

  for (const table of tables) {
    try {
      // Use raw SQL to avoid schema mismatch issues
      const data = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`);
      fs.writeFileSync(
        path.join(backupDir, `${table}.json`), 
        JSON.stringify(data, null, 2)
      );
      console.log(`✓ Backup de ${table} concluído.`);
    } catch (e) {
      console.error(`✗ Erro ao fazer backup de ${table}:`, e.message);
    }
  }
  await prisma.$disconnect();
}

backup();
