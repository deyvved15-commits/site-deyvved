const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourses() {
  const courses = await prisma.course.findMany({
    include: { teachers: true }
  });
  console.log('COURSES:', JSON.stringify(courses, null, 2));
  await prisma.$disconnect();
}

checkCourses();
