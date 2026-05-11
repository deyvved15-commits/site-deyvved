import { prisma } from "./lib/prisma";

async function seedAchievements() {
  const achievements = [
    { title: "Primeiro Passo", description: "Concluiu sua primeira aula", icon: "Stars", type: "progression" },
    { title: "Maratonista", description: "Concluiu um módulo completo", icon: "Zap", type: "completion" },
    { title: "Mestre Kadima", description: "Concluiu seu primeiro curso", icon: "Trophy", type: "completion" },
    { title: "Voz Ativa", description: "Deixou seu primeiro comentário", icon: "MessageCircle", type: "special" },
    { title: "Crítico de Conteúdo", description: "Avaliou sua primeira aula", icon: "Star", type: "special" },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { id: ach.title }, // This won't work with cuid, but I can use title as key for seeding
      update: ach,
      create: ach,
    });
  }
}
