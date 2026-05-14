const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  try {
    let rawData = fs.readFileSync('scratch/commissions_backup.json', 'utf16le');
    if (rawData.charCodeAt(0) === 0xFEFF) {
      rawData = rawData.slice(1);
    }
    const data = JSON.parse(rawData.trim());

    console.log('Restoring associations and commissions...');

    for (const assoc of data.teachers) {
      const courseId = assoc.A;
      const teacherId = assoc.B;
      
      // Find the commission from the backup courses
      const courseData = data.courses.find(c => c.id === courseId);
      const commission = courseData ? courseData.commissionPercentage : 0;

      await prisma.courseTeacher.create({
        data: {
          courseId,
          teacherId,
          commissionPercentage: commission
        }
      });
      console.log(`Restored: Course ${courseId} -> Teacher ${teacherId} (${commission}%)`);
    }

    console.log('Migration complete!');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
