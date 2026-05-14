const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function dump() {
  const backupDir = path.join(__dirname, 'db_dump_1300');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  const models = [
    'user', 'course', 'module', 'lesson', 'enrollment', 'payment', 
    'ticket', 'ticketMessage', 'comment', 'lessonProgress', 'lessonRating', 
    'certificate', 'achievement', 'userAchievement', 'weeklyLesson', 'liveSession', 'liveAttendance'
  ];

  for (const model of models) {
    try {
      if (!prisma[model]) {
        console.warn(`! Modelo ${model} não encontrado no client.`);
        continue;
      }
      const data = await prisma[model].findMany();
      fs.writeFileSync(
        path.join(backupDir, `${model}.json`), 
        JSON.stringify(data, null, 2)
      );
      console.log(`✓ Dump de ${model} concluído (${data.length} registros).`);
    } catch (e) {
      console.error(`✗ Erro ao fazer dump de ${model}:`, e.message);
    }
  }
  await prisma.$disconnect();
}

dump();
