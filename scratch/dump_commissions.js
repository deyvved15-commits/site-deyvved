const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const teachers = await prisma.$queryRawUnsafe('SELECT * FROM "_CourseTeachers"');
    const courses = await prisma.course.findMany({ select: { id: true, commissionPercentage: true } });
    
    console.log(JSON.stringify({ teachers, courses }, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
