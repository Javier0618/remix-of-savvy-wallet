import type { Transaction, CategoryMeta } from "@/lib/firebase";

export interface Recommendation {
  id: string;
  type: "warning" | "success" | "tip" | "insight";
  icon: string;
  title: string;
  description: string;
  priority: number; // lower = more important
}

// Categorías de necesidades vs deseos
const NEEDS_CATEGORIES = ["Comida", "Transporte", "Hogar", "Salud", "Servicios", "Educación"];
const WANTS_CATEGORIES = ["Entretenimiento", "Ropa", "Viajes"];
const SAVINGS_CATEGORIES = ["Ahorro"];

export function generateRecommendations(
  transactions: Transaction[],
  goal: number | null,
  totalContributions: number,
  totalWithdrawals: number,
  incomes: number,
  expenses: number,
  expenseCategories: CategoryMeta[]
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (transactions.length === 0) {
    recs.push({
      id: "no-data",
      type: "tip",
      icon: "📝",
      title: "¡Empieza a registrar!",
      description:
        "Registra tus primeros ingresos y gastos para recibir recomendaciones personalizadas sobre cómo administrar tu dinero.",
      priority: 0,
    });
    return recs;
  }

  // Calculate expense by category
  const expenseByCat: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseByCat[t.category] = (expenseByCat[t.category] || 0) + Number(t.amount);
    });

  // 50/30/20 Rule Analysis
  if (incomes > 0) {
    const needsTotal = Object.entries(expenseByCat)
      .filter(([cat]) => NEEDS_CATEGORIES.includes(cat))
      .reduce((s, [, v]) => s + v, 0);
    const wantsTotal = Object.entries(expenseByCat)
      .filter(([cat]) => WANTS_CATEGORIES.includes(cat))
      .reduce((s, [, v]) => s + v, 0);
    const savingsTotal = totalContributions;

    const needsPct = (needsTotal / incomes) * 100;
    const wantsPct = (wantsTotal / incomes) * 100;
    const savingsPct = (savingsTotal / incomes) * 100;

    // Regla 50/30/20
    recs.push({
      id: "rule-502030",
      type: "insight",
      icon: "📊",
      title: "Regla 50/30/20",
      description: `Necesidades: ${needsPct.toFixed(0)}% (recomendado ≤50%) · Deseos: ${wantsPct.toFixed(0)}% (recomendado ≤30%) · Ahorro: ${savingsPct.toFixed(0)}% (recomendado ≥20%). ${
        needsPct > 50
          ? "⚠️ Tus gastos en necesidades superan el 50% recomendado."
          : "✅ Tus necesidades están dentro del rango."
      }`,
      priority: 1,
    });

    // Expense ratio warning
    const expenseRatio = (expenses / incomes) * 100;
    if (expenseRatio > 90) {
      recs.push({
        id: "high-expenses",
        type: "warning",
        icon: "🚨",
        title: "Gastos muy altos",
        description: `Estás gastando el ${expenseRatio.toFixed(0)}% de tus ingresos. Intenta mantener tus gastos por debajo del 80% para tener un colchón financiero.`,
        priority: 2,
      });
    } else if (expenseRatio < 60) {
      recs.push({
        id: "great-balance",
        type: "success",
        icon: "🌟",
        title: "¡Excelente balance!",
        description: `Solo gastas el ${expenseRatio.toFixed(0)}% de tus ingresos. Tienes un buen margen para ahorrar e invertir.`,
        priority: 5,
      });
    }

    // Savings encouragement
    if (savingsPct < 10 && incomes > 0) {
      recs.push({
        id: "low-savings",
        type: "warning",
        icon: "🐷",
        title: "Ahorro bajo",
        description: `Solo ahorras el ${savingsPct.toFixed(0)}% de tus ingresos. La recomendación es ahorrar mínimo un 20%. Intenta apartar un monto fijo cada mes antes de gastar.`,
        priority: 3,
      });
    } else if (savingsPct >= 20) {
      recs.push({
        id: "good-savings",
        type: "success",
        icon: "💪",
        title: "¡Buen hábito de ahorro!",
        description: `Ahorras el ${savingsPct.toFixed(0)}% de tus ingresos, cumpliendo la meta del 20%. ¡Sigue así!`,
        priority: 6,
      });
    }
  }

  // Top expense category
  const sortedCats = Object.entries(expenseByCat)
    .filter(([cat]) => cat !== "Ahorro")
    .sort(([, a], [, b]) => b - a);

  if (sortedCats.length > 0 && incomes > 0) {
    const [topCat, topAmount] = sortedCats[0];
    const topPct = ((topAmount / expenses) * 100).toFixed(0);
    recs.push({
      id: "top-category",
      type: "insight",
      icon: "🔍",
      title: `Mayor gasto: ${topCat}`,
      description: `El ${topPct}% de tus gastos van a ${topCat} ($${topAmount.toLocaleString()}). ${
        Number(topPct) > 40
          ? "Considera diversificar tus gastos o buscar alternativas más económicas."
          : "Parece un porcentaje razonable."
      }`,
      priority: 4,
    });
  }

  // Goal progress
  if (goal && goal > 0) {
    const progress = (totalContributions / goal) * 100;
    if (progress >= 100) {
      recs.push({
        id: "goal-reached",
        type: "success",
        icon: "🎉",
        title: "¡Meta alcanzada!",
        description: `Has alcanzado el ${progress.toFixed(0)}% de tu meta de ahorro. ¡Felicidades! Considera establecer una nueva meta más ambiciosa.`,
        priority: 0,
      });
    } else if (progress >= 50) {
      recs.push({
        id: "goal-halfway",
        type: "tip",
        icon: "🏃",
        title: "Vas por buen camino",
        description: `Llevas el ${progress.toFixed(0)}% de tu meta. ¡No te detengas! Faltan $${(goal - totalContributions).toLocaleString()} para llegar.`,
        priority: 4,
      });
    } else {
      recs.push({
        id: "goal-push",
        type: "tip",
        icon: "🎯",
        title: "Impulsa tu meta",
        description: `Llevas solo el ${progress.toFixed(0)}% de tu meta ($${totalContributions.toLocaleString()} de $${goal.toLocaleString()}). Intenta aumentar tus aportes mensuales.`,
        priority: 3,
      });
    }
  } else {
    recs.push({
      id: "no-goal",
      type: "tip",
      icon: "🎯",
      title: "Establece una meta de ahorro",
      description:
        "Tener una meta concreta te ayuda a mantener la disciplina. Ve a la sección de Ahorro y define cuánto quieres ahorrar.",
      priority: 5,
    });
  }

  // Spending tips based on specific categories
  if (expenseByCat["Entretenimiento"] && incomes > 0) {
    const entPct = (expenseByCat["Entretenimiento"] / incomes) * 100;
    if (entPct > 15) {
      recs.push({
        id: "entertainment-high",
        type: "tip",
        icon: "🎬",
        title: "Entretenimiento elevado",
        description: `Gastas ${entPct.toFixed(0)}% en entretenimiento. Busca alternativas gratuitas o con descuento para reducir este gasto sin sacrificar diversión.`,
        priority: 4,
      });
    }
  }

  if (expenseByCat["Comida"] && incomes > 0) {
    const foodPct = (expenseByCat["Comida"] / incomes) * 100;
    if (foodPct > 30) {
      recs.push({
        id: "food-high",
        type: "tip",
        icon: "🍽️",
        title: "Gasto en comida alto",
        description: `El ${foodPct.toFixed(0)}% de tus ingresos va a comida. Planifica tus comidas semanalmente y cocina en casa para reducir este gasto.`,
        priority: 3,
      });
    }
  }

  return recs.sort((a, b) => a.priority - b.priority);
}
