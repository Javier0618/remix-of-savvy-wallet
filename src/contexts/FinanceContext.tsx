import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  subscribeToTransactions,
  subscribeToCategories,
  subscribeToGoal,
  subscribeToExpenseLimit,
  subscribeToContributions,
  subscribeToWithdrawals,
  subscribeToProfile,
  subscribeToMonthlyReports,
  type Transaction,
  type CategoryMeta,
  type SavingsEntry,
  type MonthlyReport,
} from "@/lib/firebase";

interface FinanceState {
  transactions: Transaction[];
  incomeCategories: CategoryMeta[];
  expenseCategories: CategoryMeta[];
  goal: number | null;
  expenseLimit: { amount: number | null; active: boolean };
  contributions: SavingsEntry[];
  withdrawals: SavingsEntry[];
  profile: { name: string; email: string };
  monthlyReports: MonthlyReport[];
  loading: boolean;
}

const defaultIncomeCategories: CategoryMeta[] = [
  { name: "Salario", icon: "💼" },
  { name: "Intereses", icon: "💰" },
  { name: "Freelance", icon: "🖥️" },
  { name: "Regalos", icon: "🎁" },
  { name: "Ventas", icon: "📦" },
  { name: "Otros", icon: "🔧" },
];

const defaultExpenseCategories: CategoryMeta[] = [
  { name: "Comida", icon: "🍽️" },
  { name: "Transporte", icon: "🚗" },
  { name: "Entretenimiento", icon: "🎬" },
  { name: "Hogar", icon: "🏠" },
  { name: "Salud", icon: "🩺" },
  { name: "Educación", icon: "🎓" },
  { name: "Servicios", icon: "💡" },
  { name: "Ropa", icon: "👕" },
  { name: "Viajes", icon: "✈️" },
  { name: "Ahorro", icon: "💰" },
  { name: "Otros", icon: "🔧" },
];

const FinanceContext = createContext<FinanceState>({
  transactions: [],
  incomeCategories: defaultIncomeCategories,
  expenseCategories: defaultExpenseCategories,
  goal: null,
  expenseLimit: { amount: null, active: false },
  contributions: [],
  withdrawals: [],
  profile: { name: "Usuario", email: "" },
  monthlyReports: [],
  loading: true,
});

export const useFinance = () => useContext(FinanceContext);

// Aggregation helpers
export function useAggregate() {
  const { transactions, contributions, withdrawals } = useFinance();

  const incomes = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalContributions = contributions.reduce((s, c) => s + Number(c.amount), 0);
  const totalWithdrawals = withdrawals.reduce((s, w) => s + Number(w.amount), 0);
  const netSavings = totalContributions - totalWithdrawals;
  const available = incomes - expenses;

  return { incomes, expenses, totalContributions, totalWithdrawals, netSavings, available };
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uid, isGuest } = useAuth();
  const [state, setState] = useState<FinanceState>({
    transactions: [],
    incomeCategories: defaultIncomeCategories,
    expenseCategories: defaultExpenseCategories,
    goal: null,
    expenseLimit: { amount: null, active: false },
    contributions: [],
    withdrawals: [],
    profile: { name: "Usuario", email: "" },
    monthlyReports: [],
    loading: true,
  });

  const update = useCallback(
    <K extends keyof FinanceState>(key: K, val: FinanceState[K]) =>
      setState((prev) => ({ ...prev, [key]: val })),
    []
  );

  useEffect(() => {
    if (!uid || isGuest) {
      setState((prev) => ({
        ...prev,
        transactions: [],
        incomeCategories: defaultIncomeCategories,
        expenseCategories: defaultExpenseCategories,
        goal: null,
        expenseLimit: { amount: null, active: false },
        contributions: [],
        withdrawals: [],
        profile: { name: isGuest ? "Invitado" : "Usuario", email: isGuest ? "No registrado" : "" },
        monthlyReports: [],
        loading: false,
      }));
      return;
    }

    const unsubs = [
      subscribeToTransactions(uid, (txs) => update("transactions", txs)),
      subscribeToCategories(uid, "income", (cats) => update("incomeCategories", cats)),
      subscribeToCategories(uid, "expense", (cats) => update("expenseCategories", cats)),
      subscribeToGoal(uid, (g) => update("goal", g)),
      subscribeToExpenseLimit(uid, (l) => update("expenseLimit", l)),
      subscribeToContributions(uid, (c) => update("contributions", c)),
      subscribeToWithdrawals(uid, (w) => update("withdrawals", w)),
      subscribeToProfile(uid, (p) => update("profile", p)),
      subscribeToMonthlyReports(uid, (r) => update("monthlyReports", r)),
    ];

    // Mark as loaded after short delay
    const t = setTimeout(() => update("loading", false), 1500);

    return () => {
      unsubs.forEach((u) => u());
      clearTimeout(t);
    };
  }, [uid, isGuest, update]);

  return <FinanceContext.Provider value={state}>{children}</FinanceContext.Provider>;
};
