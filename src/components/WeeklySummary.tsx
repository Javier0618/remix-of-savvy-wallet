import React, { useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

interface WeeklySummaryProps {
  onViewReports?: () => void;
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ onViewReports }) => {
  const { transactions } = useFinance();

  const { weekIncomes, weekExpenses, topCategory, txCount } = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    let inc = 0;
    let exp = 0;
    let count = 0;
    const catMap: Record<string, number> = {};

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (txDate >= monday && txDate <= now) {
        count++;
        if (tx.type === "income") inc += Number(tx.amount);
        else {
          exp += Number(tx.amount);
          catMap[tx.category] = (catMap[tx.category] || 0) + Number(tx.amount);
        }
      }
    });

    const top = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0];

    return {
      weekIncomes: inc,
      weekExpenses: exp,
      topCategory: top ? top[0] : null,
      txCount: count,
    };
  }, [transactions]);

  const balance = weekIncomes - weekExpenses;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">📊 Resumen semanal</h3>
        {onViewReports && (
          <button
            onClick={onViewReports}
            className="text-xs text-info font-semibold flex items-center gap-1 hover:underline"
          >
            Ver informe <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <TrendingUp className="w-4 h-4 text-success mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">Ingresos</div>
          <div className="text-sm font-extrabold text-success">{fmt(weekIncomes)}</div>
        </div>
        <div className="text-center">
          <TrendingDown className="w-4 h-4 text-destructive mx-auto mb-1" />
          <div className="text-xs text-muted-foreground">Gastos</div>
          <div className="text-sm font-extrabold text-destructive">{fmt(weekExpenses)}</div>
        </div>
        <div className="text-center">
          <div className="w-4 h-4 mx-auto mb-1 text-center text-sm">💰</div>
          <div className="text-xs text-muted-foreground">Balance</div>
          <div className={`text-sm font-extrabold ${balance >= 0 ? "text-success" : "text-destructive"}`}>
            {fmt(balance)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
        <span>{txCount} transacciones esta semana</span>
        {topCategory && (
          <span>
            Mayor gasto: <span className="font-semibold text-foreground">{topCategory}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default WeeklySummary;
