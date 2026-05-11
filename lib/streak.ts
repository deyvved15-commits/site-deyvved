export function calcStreak(completedAts: (Date | null)[]): number {
  const dates = completedAts
    .filter((d): d is Date => d !== null)
    .map(d => d.toISOString().slice(0, 10));

  const unique = [...new Set(dates)].sort().reverse();
  if (unique.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (unique[0] !== today && unique[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export const STREAK_ACHIEVEMENTS = [
  { days: 3,  title: "3 Dias Seguidos",   description: "Estudou 3 dias consecutivos", icon: "🔥" },
  { days: 7,  title: "1 Semana Seguida",  description: "Estudou 7 dias consecutivos", icon: "⚡" },
  { days: 30, title: "1 Mês de Estudos",  description: "30 dias consecutivos de estudo", icon: "👑" },
];
