// Financial Methods Engine - Advanced recommendations based on proven methods

export interface MethodRecommendation {
  id: string;
  method: string;
  icon: string;
  title: string;
  description: string;
  type: "warning" | "success" | "tip" | "insight";
  priority: number;
  actionable: string; // concrete action step
}

const NEEDS = ["Comida", "Transporte", "Hogar", "Salud", "Servicios", "Educación"];
const WANTS = ["Entretenimiento", "Ropa", "Viajes"];

interface FinancialSnapshot {
  incomes: number;
  expenses: number;
  savingsRate: number;
  totalContributions: number;
  goal: number | null;
  expenseByCat: Record<string, number>;
  monthlyExpenses: number;
  transactionCount: number;
}

export function generateMethodRecommendations(data: FinancialSnapshot): MethodRecommendation[] {
  const recs: MethodRecommendation[] = [];

  if (data.transactionCount === 0) return recs;

  // === REGLA 50/30/20 ===
  if (data.incomes > 0) {
    const needsTotal = Object.entries(data.expenseByCat)
      .filter(([cat]) => NEEDS.includes(cat))
      .reduce((s, [, v]) => s + v, 0);
    const wantsTotal = Object.entries(data.expenseByCat)
      .filter(([cat]) => WANTS.includes(cat))
      .reduce((s, [, v]) => s + v, 0);

    const needsPct = (needsTotal / data.incomes) * 100;
    const wantsPct = (wantsTotal / data.incomes) * 100;

    if (needsPct > 50) {
      recs.push({
        id: "503020-needs",
        method: "Regla 50/30/20",
        icon: "📊",
        title: "Necesidades por encima del 50%",
        description: `Tus necesidades representan el ${needsPct.toFixed(0)}%. Deberían ser máximo 50%.`,
        type: "warning",
        priority: 1,
        actionable: `Reduce $${((needsTotal - data.incomes * 0.5)).toLocaleString()} en necesidades. Revisa servicios y transporte.`,
      });
    }
    if (wantsPct > 30) {
      recs.push({
        id: "503020-wants",
        method: "Regla 50/30/20",
        icon: "🎭",
        title: "Deseos por encima del 30%",
        description: `Tus deseos representan el ${wantsPct.toFixed(0)}%. Deberían ser máximo 30%.`,
        type: "warning",
        priority: 2,
        actionable: `Reduce $${((wantsTotal - data.incomes * 0.3)).toLocaleString()} en entretenimiento, ropa o viajes.`,
      });
    }
  }

  // === PRESUPUESTO BASE CERO ===
  if (data.incomes > 0) {
    const unassigned = data.incomes - data.expenses - data.totalContributions;
    if (unassigned > data.incomes * 0.1) {
      recs.push({
        id: "zero-budget",
        method: "Presupuesto Base Cero",
        icon: "📋",
        title: "Dinero sin asignar",
        description: `Tienes $${unassigned.toLocaleString()} sin destino claro. En el presupuesto base cero, cada peso debe tener un propósito.`,
        type: "tip",
        priority: 3,
        actionable: "Asigna ese dinero a ahorro, inversión o un fondo de emergencia.",
      });
    }
  }

  // === FONDO DE EMERGENCIA ===
  if (data.monthlyExpenses > 0) {
    const monthsCovered = data.totalContributions / data.monthlyExpenses;
    if (monthsCovered < 1) {
      recs.push({
        id: "emergency-critical",
        method: "Fondo de Emergencia",
        icon: "🚨",
        title: "Sin fondo de emergencia",
        description: `Solo cubres ${(monthsCovered * 30).toFixed(0)} días de gastos. Lo recomendado es 3-6 meses.`,
        type: "warning",
        priority: 1,
        actionable: `Ahorra $${(data.monthlyExpenses * 3 - data.totalContributions).toLocaleString()} para cubrir 3 meses.`,
      });
    } else if (monthsCovered < 3) {
      recs.push({
        id: "emergency-building",
        method: "Fondo de Emergencia",
        icon: "🛡️",
        title: "Fondo en construcción",
        description: `Cubres ${monthsCovered.toFixed(1)} meses de gastos. Faltan ${(3 - monthsCovered).toFixed(1)} meses más.`,
        type: "tip",
        priority: 3,
        actionable: `Aporta $${((data.monthlyExpenses * 3 - data.totalContributions) / 6).toLocaleString()} mensuales para alcanzar 3 meses en 6 meses.`,
      });
    } else {
      recs.push({
        id: "emergency-solid",
        method: "Fondo de Emergencia",
        icon: "✅",
        title: "Fondo de emergencia sólido",
        description: `Cubres ${monthsCovered.toFixed(1)} meses de gastos. ¡Excelente protección!`,
        type: "success",
        priority: 7,
        actionable: monthsCovered < 6 ? "Sigue hasta 6 meses para máxima seguridad." : "Considera invertir el excedente.",
      });
    }
  }

  // === REGLA 24/48 HORAS (Compras impulsivas) ===
  const sortedCats = Object.entries(data.expenseByCat)
    .filter(([cat]) => WANTS.includes(cat))
    .sort(([, a], [, b]) => b - a);

  if (sortedCats.length > 0 && data.incomes > 0) {
    const totalWants = sortedCats.reduce((s, [, v]) => s + v, 0);
    if (totalWants > data.incomes * 0.35) {
      recs.push({
        id: "impulse-control",
        method: "Regla 24/48 horas",
        icon: "⏰",
        title: "Posibles compras impulsivas",
        description: `Tus gastos en deseos son altos (${((totalWants / data.incomes) * 100).toFixed(0)}%). Antes de comprar algo no esencial, espera 24-48 horas.`,
        type: "tip",
        priority: 3,
        actionable: "Antes de cada compra no esencial, pregúntate: ¿Lo necesito o lo quiero? Espera 24h antes de decidir.",
      });
    }
  }

  // === INTERÉS COMPUESTO (Proyección) ===
  if (data.totalContributions > 0 && data.savingsRate > 0) {
    const monthlySaving = (data.incomes * data.savingsRate) / 100;
    const annualRate = 0.08; // 8% annual return estimate
    const monthlyRate = annualRate / 12;
    const months = 12;
    const futureValue = data.totalContributions * Math.pow(1 + monthlyRate, months) +
      monthlySaving * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    recs.push({
      id: "compound-interest",
      method: "Interés Compuesto",
      icon: "📈",
      title: "Proyección a 1 año",
      description: `Si mantienes tu ritmo actual de ahorro, en 12 meses podrías tener ~$${futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} (estimando 8% anual).`,
      type: "insight",
      priority: 5,
      actionable: `Aumenta tu ahorro mensual en un 10% ($${(monthlySaving * 0.1).toLocaleString()}) para acelerar tus resultados.`,
    });
  }

  // === SISTEMA DE SOBRES ===
  if (data.incomes > 0 && Object.keys(data.expenseByCat).length >= 3) {
    const topCat = Object.entries(data.expenseByCat)
      .filter(([cat]) => cat !== "Ahorro")
      .sort(([, a], [, b]) => b - a)[0];

    if (topCat) {
      const [catName, catAmount] = topCat;
      const catPct = (catAmount / data.expenses) * 100;
      if (catPct > 35) {
        recs.push({
          id: "envelope-system",
          method: "Sistema de Sobres",
          icon: "✉️",
          title: `Controla tu gasto en ${catName}`,
          description: `${catName} representa el ${catPct.toFixed(0)}% de tus gastos. Asigna un "sobre" con límite fijo.`,
          type: "tip",
          priority: 4,
          actionable: `Asigna máximo $${(catAmount * 0.8).toLocaleString()} mensuales para ${catName} y no lo excedas.`,
        });
      }
    }
  }

  return recs.sort((a, b) => a.priority - b.priority);
}
