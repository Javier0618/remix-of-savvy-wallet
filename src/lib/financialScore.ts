// Financial Health Score Calculator & Gamification Engine

export interface FinancialScore {
  total: number; // 0-100
  grade: string; // A+ to F
  color: string; // tailwind color token
  breakdown: ScoreCategory[];
  level: number;
  levelName: string;
  xp: number;
  xpToNext: number;
  achievements: Achievement[];
}

export interface ScoreCategory {
  name: string;
  score: number; // 0-100
  weight: number;
  icon: string;
  tip: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0-100
}

const LEVELS = [
  { name: "Principiante", minXP: 0 },
  { name: "Aprendiz", minXP: 100 },
  { name: "Planificador", minXP: 300 },
  { name: "Ahorrador", minXP: 600 },
  { name: "Estratega", minXP: 1000 },
  { name: "Experto", minXP: 1500 },
  { name: "Maestro", minXP: 2200 },
  { name: "Gurú Financiero", minXP: 3000 },
];

function getGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: "A+", color: "success" };
  if (score >= 80) return { grade: "A", color: "success" };
  if (score >= 70) return { grade: "B+", color: "info" };
  if (score >= 60) return { grade: "B", color: "info" };
  if (score >= 50) return { grade: "C", color: "warning" };
  if (score >= 40) return { grade: "D", color: "warning" };
  return { grade: "F", color: "destructive" };
}

function getLevel(xp: number) {
  let level = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      level = i;
      break;
    }
  }
  const nextLevel = level < LEVELS.length - 1 ? LEVELS[level + 1].minXP : LEVELS[level].minXP;
  return {
    level: level + 1,
    levelName: LEVELS[level].name,
    xpToNext: nextLevel - xp,
  };
}

export function calculateFinancialScore(
  incomes: number,
  expenses: number,
  savingsRate: number,
  totalContributions: number,
  goal: number | null,
  transactionCount: number,
  hasGoal: boolean,
  monthlyExpenses: number
): FinancialScore {
  const breakdown: ScoreCategory[] = [];

  // 1. Expense Control (25%)
  const expenseRatio = incomes > 0 ? (expenses / incomes) * 100 : 100;
  const expenseScore = expenseRatio <= 50 ? 100 : expenseRatio <= 70 ? 80 : expenseRatio <= 85 ? 60 : expenseRatio <= 95 ? 40 : 20;
  breakdown.push({
    name: "Control de gastos",
    score: expenseScore,
    weight: 25,
    icon: "💳",
    tip: expenseRatio > 80 ? "Reduce tus gastos al 80% o menos de tus ingresos" : "¡Buen control de gastos!",
  });

  // 2. Savings Rate (30%)
  const savingsScore = savingsRate >= 20 ? 100 : savingsRate >= 15 ? 85 : savingsRate >= 10 ? 65 : savingsRate >= 5 ? 40 : 10;
  breakdown.push({
    name: "Tasa de ahorro",
    score: savingsScore,
    weight: 30,
    icon: "🐷",
    tip: savingsRate < 20 ? "Intenta ahorrar al menos el 20% de tus ingresos" : "¡Excelente hábito de ahorro!",
  });

  // 3. Emergency Fund (20%)
  const monthsOfExpenses = monthlyExpenses > 0 ? totalContributions / monthlyExpenses : 0;
  const emergencyScore = monthsOfExpenses >= 6 ? 100 : monthsOfExpenses >= 3 ? 75 : monthsOfExpenses >= 1 ? 40 : 10;
  breakdown.push({
    name: "Fondo de emergencia",
    score: emergencyScore,
    weight: 20,
    icon: "🛡️",
    tip: monthsOfExpenses < 3 ? `Tienes ${monthsOfExpenses.toFixed(1)} meses cubiertos. Meta: 3-6 meses` : "¡Buen colchón de emergencia!",
  });

  // 4. Goal Progress (15%)
  const goalProgress = goal && goal > 0 ? Math.min((totalContributions / goal) * 100, 100) : 0;
  const goalScore = hasGoal ? (goalProgress >= 100 ? 100 : goalProgress >= 50 ? 70 : goalProgress >= 25 ? 45 : 20) : 5;
  breakdown.push({
    name: "Progreso de meta",
    score: goalScore,
    weight: 15,
    icon: "🎯",
    tip: !hasGoal ? "Establece una meta de ahorro para mejorar tu score" : `Llevas ${goalProgress.toFixed(0)}% de tu meta`,
  });

  // 5. Consistency (10%)
  const consistencyScore = transactionCount >= 20 ? 100 : transactionCount >= 10 ? 70 : transactionCount >= 5 ? 40 : 15;
  breakdown.push({
    name: "Consistencia",
    score: consistencyScore,
    weight: 10,
    icon: "📊",
    tip: transactionCount < 10 ? "Registra más movimientos para un análisis preciso" : "¡Buen seguimiento!",
  });

  // Calculate weighted total
  const total = Math.round(breakdown.reduce((sum, cat) => sum + (cat.score * cat.weight) / 100, 0));
  const { grade, color } = getGrade(total);

  // XP calculation
  const xp = Math.round(total * 10 + transactionCount * 5 + (hasGoal ? 50 : 0) + (goalProgress >= 100 ? 200 : 0));
  const { level, levelName, xpToNext } = getLevel(xp);

  // Achievements
  const achievements = calculateAchievements(incomes, expenses, savingsRate, totalContributions, goal, transactionCount, monthsOfExpenses);

  return { total, grade, color, breakdown, level, levelName, xp, xpToNext, achievements };
}

function calculateAchievements(
  incomes: number,
  expenses: number,
  savingsRate: number,
  totalContributions: number,
  goal: number | null,
  transactionCount: number,
  monthsOfExpenses: number
): Achievement[] {
  return [
    {
      id: "first-step",
      name: "Primer Paso",
      description: "Registra tu primera transacción",
      icon: "👣",
      unlocked: transactionCount >= 1,
      progress: Math.min(transactionCount, 1) * 100,
    },
    {
      id: "tracker",
      name: "Rastreador",
      description: "Registra 10 transacciones",
      icon: "📝",
      unlocked: transactionCount >= 10,
      progress: Math.min((transactionCount / 10) * 100, 100),
    },
    {
      id: "disciplined",
      name: "Disciplinado",
      description: "Registra 50 transacciones",
      icon: "🏆",
      unlocked: transactionCount >= 50,
      progress: Math.min((transactionCount / 50) * 100, 100),
    },
    {
      id: "saver-20",
      name: "Ahorrador Estrella",
      description: "Alcanza una tasa de ahorro del 20%",
      icon: "⭐",
      unlocked: savingsRate >= 20,
      progress: Math.min((savingsRate / 20) * 100, 100),
    },
    {
      id: "emergency-fund",
      name: "Fondo de Emergencia",
      description: "Ahorra 3 meses de gastos",
      icon: "🛡️",
      unlocked: monthsOfExpenses >= 3,
      progress: Math.min((monthsOfExpenses / 3) * 100, 100),
    },
    {
      id: "goal-reached",
      name: "Meta Cumplida",
      description: "Alcanza tu meta de ahorro",
      icon: "🎯",
      unlocked: !!(goal && goal > 0 && totalContributions >= goal),
      progress: goal && goal > 0 ? Math.min((totalContributions / goal) * 100, 100) : 0,
    },
    {
      id: "budget-master",
      name: "Maestro del Presupuesto",
      description: "Mantén gastos bajo el 70% de ingresos",
      icon: "💪",
      unlocked: incomes > 0 && (expenses / incomes) * 100 <= 70,
      progress: incomes > 0 ? Math.min(((100 - (expenses / incomes) * 100) / 30) * 100, 100) : 0,
    },
    {
      id: "first-saving",
      name: "Primera Semilla",
      description: "Haz tu primer aporte al ahorro",
      icon: "🌱",
      unlocked: totalContributions > 0,
      progress: totalContributions > 0 ? 100 : 0,
    },
  ];
}
