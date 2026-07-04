export type ModuleAccessRule = {
  id: string;
  releaseAfterDays: number | null;
  releaseAfterModuleId: string | null;
  lessons: { id: string }[];
};

export type ModuleAccessResult =
  | { unlocked: true }
  | { unlocked: false; reason: "days"; availableAt: Date; daysLeft: number }
  | { unlocked: false; reason: "module"; blockerModuleId: string };

/**
 * Calcula se um módulo está liberado para o aluno.
 * @param module          O módulo a verificar
 * @param enrolledAt      Data de matrícula do aluno no curso
 * @param completedLessonIds  Set de IDs de aulas concluídas pelo aluno
 */
export function getModuleAccess(
  module: ModuleAccessRule,
  enrolledAt: Date,
  completedLessonIds: Set<string>
): ModuleAccessResult {
  // Regra 1: liberar após N dias da matrícula
  if (module.releaseAfterDays != null && module.releaseAfterDays > 0) {
    const availableAt = new Date(enrolledAt);
    availableAt.setDate(availableAt.getDate() + module.releaseAfterDays);
    const now = new Date();
    if (now < availableAt) {
      const msLeft   = availableAt.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      return { unlocked: false, reason: "days", availableAt, daysLeft };
    }
  }

  // Regra 2: liberar quando o módulo anterior for concluído
  if (module.releaseAfterModuleId) {
    return { unlocked: false, reason: "module", blockerModuleId: module.releaseAfterModuleId };
  }

  return { unlocked: true };
}

/**
 * Versão completa que resolve a dependência de módulo consultando as aulas do módulo bloqueador.
 */
export function isModuleComplete(
  moduleLessonIds: string[],
  completedLessonIds: Set<string>
): boolean {
  if (moduleLessonIds.length === 0) return false;
  return moduleLessonIds.every(id => completedLessonIds.has(id));
}

export function resolveModuleAccess(
  module: ModuleAccessRule,
  enrolledAt: Date,
  completedLessonIds: Set<string>,
  allModules: ModuleAccessRule[]
): ModuleAccessResult {
  const base = getModuleAccess(module, enrolledAt, completedLessonIds);
  if (base.unlocked || base.reason !== "module") return base;

  // Verifica se o módulo bloqueador está de fato concluído
  const blocker = allModules.find(m => m.id === base.blockerModuleId);
  if (!blocker) return { unlocked: true }; // módulo bloqueador não existe mais → libera

  const blockerComplete = isModuleComplete(
    blocker.lessons.map(l => l.id),
    completedLessonIds
  );

  if (blockerComplete) return { unlocked: true };
  return base;
}
