// Registry of all supported financial methods

export interface BudgetCategory {
  name: string;
  percentage: number;
  color: string; // semantic token name
  icon: string;
  matchCategories: string[]; // maps to transaction categories
}

export interface FinancialMethod {
  id: string;
  name: string;
  icon: string;
  shortDesc: string;
  longDesc: string;
  origin: string;
  buckets: BudgetCategory[];
  tips: string[];
}

export const FINANCIAL_METHODS: FinancialMethod[] = [
  {
    id: "50-30-20",
    name: "Regla 50/30/20",
    icon: "📊",
    shortDesc: "Divide ingresos en necesidades, deseos y ahorro",
    longDesc: "Popularizada por Elizabeth Warren, esta regla divide tus ingresos después de impuestos: 50% para necesidades esenciales, 30% para deseos y 20% para ahorro e inversión.",
    origin: "Elizabeth Warren – All Your Worth (2005)",
    buckets: [
      {
        name: "Necesidades",
        percentage: 50,
        color: "info",
        icon: "🏠",
        matchCategories: ["Comida", "Transporte", "Hogar", "Salud", "Servicios", "Educación"],
      },
      {
        name: "Deseos",
        percentage: 30,
        color: "warning",
        icon: "🎭",
        matchCategories: ["Entretenimiento", "Ropa", "Viajes"],
      },
      {
        name: "Ahorro",
        percentage: 20,
        color: "success",
        icon: "💰",
        matchCategories: ["Ahorro"],
      },
    ],
    tips: [
      "Si tus necesidades superan el 50%, revisa suscripciones y servicios innecesarios.",
      "Los deseos son flexibles: aquí puedes recortar primero.",
      "El 20% de ahorro incluye fondo de emergencia, inversiones y pago de deudas.",
    ],
  },
  {
    id: "kakeibo",
    name: "Kakeibo",
    icon: "📓",
    shortDesc: "Método japonés de ahorro consciente",
    longDesc: "Kakeibo (家計簿) es un método japonés centenario que promueve el ahorro consciente mediante la reflexión. Clasifica gastos en 4 pilares: supervivencia, opcional, cultura y extras.",
    origin: "Hani Motoko – Japón (1904)",
    buckets: [
      {
        name: "Supervivencia",
        percentage: 0, // Kakeibo doesn't prescribe exact %
        color: "info",
        icon: "🍚",
        matchCategories: ["Comida", "Transporte", "Hogar", "Salud", "Servicios"],
      },
      {
        name: "Opcional",
        percentage: 0,
        color: "warning",
        icon: "🍰",
        matchCategories: ["Entretenimiento", "Ropa"],
      },
      {
        name: "Cultura",
        percentage: 0,
        color: "primary",
        icon: "📚",
        matchCategories: ["Educación"],
      },
      {
        name: "Extras",
        percentage: 0,
        color: "destructive",
        icon: "🎁",
        matchCategories: ["Viajes"],
      },
    ],
    tips: [
      "Al inicio de cada mes, pregúntate: ¿Cuánto dinero tengo? ¿Cuánto quiero ahorrar?",
      "Registra cada gasto a mano para tomar conciencia de tus hábitos.",
      "Al final del mes, reflexiona: ¿Cumplí mi meta? ¿Qué puedo mejorar?",
      "Kakeibo no fija porcentajes: la clave es la reflexión y el compromiso personal.",
    ],
  },
  {
    id: "zero-based",
    name: "Presupuesto Base Cero",
    icon: "🎯",
    shortDesc: "Cada peso tiene un propósito asignado",
    longDesc: "En el presupuesto base cero, tus ingresos menos todos tus gastos asignados deben ser exactamente $0. Cada peso se destina a una categoría específica antes de gastarlo.",
    origin: "Dave Ramsey / Peter Pyhrr (1970s)",
    buckets: [
      {
        name: "Vivienda y servicios",
        percentage: 25,
        color: "info",
        icon: "🏠",
        matchCategories: ["Hogar", "Servicios"],
      },
      {
        name: "Alimentación",
        percentage: 15,
        color: "success",
        icon: "🍽️",
        matchCategories: ["Comida"],
      },
      {
        name: "Transporte",
        percentage: 10,
        color: "warning",
        icon: "🚗",
        matchCategories: ["Transporte"],
      },
      {
        name: "Salud y educación",
        percentage: 10,
        color: "primary",
        icon: "🩺",
        matchCategories: ["Salud", "Educación"],
      },
      {
        name: "Entretenimiento y personal",
        percentage: 10,
        color: "accent",
        icon: "🎬",
        matchCategories: ["Entretenimiento", "Ropa", "Viajes"],
      },
      {
        name: "Ahorro e inversión",
        percentage: 20,
        color: "success",
        icon: "📈",
        matchCategories: ["Ahorro"],
      },
      {
        name: "Libre asignación",
        percentage: 10,
        color: "muted",
        icon: "🔧",
        matchCategories: ["Otros"],
      },
    ],
    tips: [
      "Asigna cada peso de tu ingreso ANTES de que empiece el mes.",
      "Si sobra dinero en una categoría, reasígnalo a otra.",
      "Revisa y ajusta tu presupuesto cada semana.",
      "Lo importante es que Ingresos - Gastos Asignados = $0.",
    ],
  },
  {
    id: "envelope",
    name: "Sistema de Sobres",
    icon: "✉️",
    shortDesc: "Asigna efectivo a sobres por categoría",
    longDesc: "El sistema de sobres divide tu dinero en sobres físicos o virtuales, uno por cada categoría de gasto. Cuando un sobre se vacía, no puedes gastar más en esa categoría hasta el próximo mes.",
    origin: "Tradición popular – Siglo XX",
    buckets: [
      {
        name: "Comida",
        percentage: 20,
        color: "success",
        icon: "🍽️",
        matchCategories: ["Comida"],
      },
      {
        name: "Transporte",
        percentage: 10,
        color: "info",
        icon: "🚗",
        matchCategories: ["Transporte"],
      },
      {
        name: "Hogar y servicios",
        percentage: 30,
        color: "primary",
        icon: "🏠",
        matchCategories: ["Hogar", "Servicios"],
      },
      {
        name: "Entretenimiento",
        percentage: 10,
        color: "warning",
        icon: "🎬",
        matchCategories: ["Entretenimiento", "Ropa", "Viajes"],
      },
      {
        name: "Salud y educación",
        percentage: 10,
        color: "destructive",
        icon: "🩺",
        matchCategories: ["Salud", "Educación"],
      },
      {
        name: "Ahorro",
        percentage: 20,
        color: "success",
        icon: "💰",
        matchCategories: ["Ahorro"],
      },
    ],
    tips: [
      "Cuando un sobre se vacía, NO tomes de otro sobre.",
      "Si sobra dinero en un sobre, pásalo a ahorro.",
      "Revisa tus sobres cada semana para no quedarte sin fondos.",
      "Este método es ideal si tiendes a gastar de más en ciertas categorías.",
    ],
  },
  {
    id: "80-20",
    name: "Regla 80/20",
    icon: "⚡",
    shortDesc: "Ahorra primero el 20%, gasta el resto libre",
    longDesc: "La versión simplificada: ahorra automáticamente el 20% de tus ingresos y usa el 80% restante sin restricciones. Ideal si no quieres rastrear cada categoría.",
    origin: "Principio de Pareto aplicado a finanzas",
    buckets: [
      {
        name: "Gastos libres",
        percentage: 80,
        color: "info",
        icon: "💳",
        matchCategories: ["Comida", "Transporte", "Hogar", "Salud", "Servicios", "Educación", "Entretenimiento", "Ropa", "Viajes", "Otros"],
      },
      {
        name: "Ahorro primero",
        percentage: 20,
        color: "success",
        icon: "🏦",
        matchCategories: ["Ahorro"],
      },
    ],
    tips: [
      "Automatiza el ahorro: transfiere el 20% el día que recibes tu ingreso.",
      "No te preocupes por categorías del 80%: la clave es ahorrar primero.",
      "Si puedes, aumenta gradualmente al 25% o 30%.",
    ],
  },
  {
    id: "60-20-20",
    name: "Regla 60/20/20",
    icon: "📐",
    shortDesc: "60% gastos fijos, 20% metas, 20% flexible",
    longDesc: "Divide tus ingresos en 60% para gastos fijos y compromisos, 20% para metas financieras (ahorro, inversión, deudas) y 20% para gastos flexibles y diversión.",
    origin: "Variante moderna de presupuesto por porcentajes",
    buckets: [
      {
        name: "Gastos fijos",
        percentage: 60,
        color: "info",
        icon: "📌",
        matchCategories: ["Comida", "Transporte", "Hogar", "Salud", "Servicios", "Educación"],
      },
      {
        name: "Metas financieras",
        percentage: 20,
        color: "success",
        icon: "🎯",
        matchCategories: ["Ahorro"],
      },
      {
        name: "Gastos flexibles",
        percentage: 20,
        color: "warning",
        icon: "🎉",
        matchCategories: ["Entretenimiento", "Ropa", "Viajes", "Otros"],
      },
    ],
    tips: [
      "Los gastos fijos incluyen todo lo que NO puedes evitar pagar.",
      "Las metas financieras son tu futuro: priorízalas antes de los flexibles.",
      "Si tus fijos superan el 60%, busca reducir renta, servicios o transporte.",
    ],
  },
];

export function getMethodById(id: string): FinancialMethod | undefined {
  return FINANCIAL_METHODS.find((m) => m.id === id);
}

export function calculateBucketSpending(
  method: FinancialMethod,
  expenseByCat: Record<string, number>,
  incomes: number
): { bucket: BudgetCategory; spent: number; limit: number; percentage: number }[] {
  return method.buckets.map((bucket) => {
    const spent = bucket.matchCategories.reduce(
      (sum, cat) => sum + (expenseByCat[cat] || 0),
      0
    );
    const limit = bucket.percentage > 0 ? (incomes * bucket.percentage) / 100 : 0;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    return { bucket, spent, limit, percentage };
  });
}
