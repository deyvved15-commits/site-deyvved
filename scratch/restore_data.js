const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function restore() {
  const backupDir = path.join(__dirname, 'db_dump_1300');
  
  const read = (name) => {
    const p = path.join(backupDir, `${name}.json`);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
  };

  console.log('--- Iniciando Restauração e Migração ---');

  // 1. Users
  const users = read('user');
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: u,
      create: u
    });
  }
  console.log(`✓ ${users.length} usuários restaurados.`);

  // 2. Courses (Special Migration)
  const courses = read('course');
  for (const c of courses) {
    const teacherId = c.teacherId;
    delete c.teacherId; // Remove old field
    
    await prisma.course.upsert({
      where: { id: c.id },
      update: {
        ...c,
        teachers: teacherId ? { connect: [{ id: teacherId }] } : undefined
      },
      create: {
        ...c,
        teachers: teacherId ? { connect: [{ id: teacherId }] } : undefined
      }
    });
  }
  console.log(`✓ ${courses.length} cursos restaurados e migrados para múltiplos professores.`);

  // 3. Modules
  const modules = read('module');
  for (const m of modules) {
    await prisma.module.upsert({
      where: { id: m.id },
      update: m,
      create: m
    });
  }
  console.log(`✓ ${modules.length} módulos restaurados.`);

  // 4. Lessons
  const lessons = read('lesson');
  for (const l of lessons) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: l,
      create: l
    });
  }
  console.log(`✓ ${lessons.length} aulas restauradas.`);

  // 5. Enrollments
  const enrollments = read('enrollment');
  for (const e of enrollments) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: e.userId, courseId: e.courseId } },
      update: e,
      create: e
    });
  }
  console.log(`✓ ${enrollments.length} matrículas restauradas.`);

  // 6. Payments
  const payments = read('payment');
  for (const p of payments) {
    await prisma.payment.upsert({
      where: { id: p.id },
      update: p,
      create: p
    });
  }
  console.log(`✓ ${payments.length} pagamentos restaurados.`);

  // 7. Progress
  const progress = read('lessonProgress');
  for (const p of progress) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: p.userId, lessonId: p.lessonId } },
      update: p,
      create: p
    });
  }
  console.log(`✓ ${progress.length} registros de progresso restaurados.`);

  // 8. Weekly & Live
  const weekly = read('weeklyLesson');
  for (const w of weekly) {
    await prisma.weeklyLesson.upsert({
      where: { id: w.id },
      update: w,
      create: w
    });
  }
  const lives = read('liveSession');
  for (const l of lives) {
    await prisma.liveSession.upsert({
      where: { id: l.id },
      update: l,
      create: l
    });
  }
  const attendance = read('liveAttendance');
  for (const a of attendance) {
    await prisma.liveAttendance.upsert({
      where: { userId_date: { userId: a.userId, date: a.date } },
      update: a,
      create: a
    });
  }
  console.log('✓ Dados de aulas semanais e lives restaurados.');

  console.log('--- Migração Concluída com Sucesso! ---');
  await prisma.$disconnect();
}

restore().catch(e => {
  console.error('FAIL:', e);
  process.exit(1);
});
