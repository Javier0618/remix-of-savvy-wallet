import React, { useMemo } from "react";
import { useFinance, useAggregate } from "@/contexts/FinanceContext";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import SummaryCard from "./SummaryCard";
import { TrendingUp, TrendingDown, PiggyBank, Wallet, FileDown, FileSpreadsheet } from "lucide-react";
import { generatePDF } from "@/lib/exportPDF";
import { generateExcel } from "@/lib/exportExcel";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"];

const Reports: React.FC = () => {
  const { transactions, goal } = useFinance();
  const { incomes, expenses, totalContributions, netSavings } = useAggregate();
  const { isGuest } = useAuth();
  const { profile } = useFinance();

  // Monthly comparison data (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { label: string; incomes: number; expenses: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("es-CO", { month: "short" }).replace(".", "");

      let inc = 0;
      let exp = 0;
      transactions.forEach((tx) => {
        const txDate = new Date(tx.date);
        const txKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
        if (txKey === monthKey) {
          if (tx.type === "income") inc += Number(tx.amount);
          else exp += Number(tx.amount);
        }
      });

      months.push({ label: label.charAt(0).toUpperCase() + label.slice(1), incomes: inc, expenses: exp });
    }
    return months;
  }, [transactions]);

  // Expense by category
  const expenseByCat: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseByCat[t.category] = (expenseByCat[t.category] || 0) + Number(t.amount);
    });

  const categoryData = Object.entries(expenseByCat)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    }));

  const incomeVsExpense = [
    { name: "Ingresos", value: incomes, color: "#10b981" },
    { name: "Gastos", value: expenses, color: "#f87171" },
  ];

  const goalData = [
    { name: "Meta", value: goal || 0 },
    { name: "Aportado", value: totalContributions },
  ];

  const currentMonthLabel = new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  const handleExportPDF = () => {
    if (isGuest) return toast.error("Regístrate para exportar reportes");
    generatePDF({
      incomes,
      expenses,
      netSavings,
      totalContributions,
      goal,
      transactions,
      profileName: profile.name,
      monthLabel: currentMonthLabel,
    });
    toast.success("Reporte PDF descargado");
  };

  const handleExportExcel = () => {
    if (isGuest) return toast.error("Regístrate para exportar reportes");
    generateExcel({
      incomes,
      expenses,
      netSavings,
      totalContributions,
      goal,
      transactions,
      profileName: profile.name,
      monthLabel: currentMonthLabel,
    });
    toast.success("Archivo Excel descargado");
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Informe financiero</h1>
          <p className="text-sm text-muted-foreground">Tu situación en números</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-bold hover:bg-destructive/20 transition"
          >
            <FileDown className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-success/10 text-success border border-success/20 rounded-xl text-xs font-bold hover:bg-success/20 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <SummaryCard label="Ingresos" value={fmt(incomes)} icon={<TrendingUp className="w-5 h-5 text-success" />} variant="income" />
        <SummaryCard label="Gastos" value={fmt(expenses)} icon={<TrendingDown className="w-5 h-5 text-destructive" />} variant="expense" />
        <SummaryCard label="Ahorro Neto" value={fmt(netSavings)} icon={<PiggyBank className="w-5 h-5 text-primary" />} variant="savings" />
        <SummaryCard label="Aportes" value={fmt(totalContributions)} icon={<Wallet className="w-5 h-5 text-info" />} variant="available" />
      </div>

      {/* Monthly Comparison */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <h3 className="font-bold mb-1">Comparativo mensual</h3>
        <p className="text-xs text-muted-foreground mb-4">Ingresos vs Gastos — últimos 6 meses</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData} barGap={4}>
            <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} />
            <Tooltip
              formatter={(v: number) => fmt(v)}
              contentStyle={{
                background: "hsl(222 35% 12%)",
                border: "1px solid hsl(220 13% 18%)",
                borderRadius: "12px",
                color: "#f1f5f9",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Legend />
            <Bar dataKey="incomes" name="Ingresos" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
            <Bar dataKey="expenses" name="Gastos" fill="#f87171" radius={[6, 6, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Income vs Expense */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold mb-1">Ingresos vs Gastos</h3>
          <p className="text-xs text-muted-foreground mb-4">Comparación</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={incomeVsExpense} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                {incomeVsExpense.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "hsl(222 35% 12%)", border: "1px solid hsl(220 13% 18%)", borderRadius: "12px", color: "#f1f5f9" }} labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#f1f5f9" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Goal Progress */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold">Progreso de meta</h3>
            <span className="text-xs font-bold text-info">
              {goal && goal > 0 ? ((totalContributions / goal) * 100).toFixed(1) : "0.0"}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Aportes vs meta</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={goalData}>
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => "$" + v.toLocaleString()} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "hsl(222 35% 12%)", border: "1px solid hsl(220 13% 18%)", borderRadius: "12px", color: "#f1f5f9" }} labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#f1f5f9" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                <Cell fill="rgba(59,130,246,0.5)" />
                <Cell fill="#10b981" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-card border border-border rounded-3xl p-5">
        <h3 className="font-bold mb-1">Desglose por categoría (gastos)</h3>
        <p className="text-xs text-muted-foreground mb-4">A dónde se va tu dinero</p>
        {categoryData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No hay gastos registrados</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "hsl(222 35% 12%)", border: "1px solid hsl(220 13% 18%)", borderRadius: "12px", color: "#f1f5f9" }} labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#f1f5f9" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-3">
              {categoryData.map((cat) => {
                const pct = expenses > 0 ? ((cat.value / expenses) * 100).toFixed(0) : "0";
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold">{fmt(cat.value)}</span>
                        <span className="text-xs text-muted-foreground font-bold">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
