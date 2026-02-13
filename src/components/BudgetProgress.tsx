import React from "react";
import { useFinance, useAggregate } from "@/contexts/FinanceContext";
import { getMethodById, calculateBucketSpending } from "@/lib/financialMethodsRegistry";
import { Settings2 } from "lucide-react";

interface Props {
  onChangeMethod?: () => void;
}

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const BudgetProgress: React.FC<Props> = ({ onChangeMethod }) => {
  const { financialMethod, transactions } = useFinance();
  const { incomes } = useAggregate();

  const method = financialMethod ? getMethodById(financialMethod) : null;
  if (!method) return null;

  // Build expense by category from transactions
  const expenseByCat: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseByCat[t.category] = (expenseByCat[t.category] || 0) + Number(t.amount);
    });

  const bucketData = calculateBucketSpending(method, expenseByCat, incomes);
  const hasBudgets = method.buckets.some((b) => b.percentage > 0);

  if (!hasBudgets) {
    // For methods like Kakeibo that don't have fixed percentages
    return (
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{method.icon}</span>
            <h3 className="text-sm font-bold">{method.name}</h3>
          </div>
          {onChangeMethod && (
            <button onClick={onChangeMethod} className="text-muted-foreground hover:text-foreground transition">
              <Settings2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="space-y-2">
          {bucketData.map(({ bucket, spent }) => (
            <div key={bucket.name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {bucket.icon} {bucket.name}
              </span>
              <span className="font-bold">{fmt(spent)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">
          {method.tips[0]}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{method.icon}</span>
          <h3 className="text-sm font-bold">{method.name}</h3>
        </div>
        {onChangeMethod && (
          <button onClick={onChangeMethod} className="text-muted-foreground hover:text-foreground transition">
            <Settings2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {bucketData.map(({ bucket, spent, limit, percentage }) => {
          const isOver = percentage > 100;
          const barColor = isOver ? "bg-destructive" : `bg-${bucket.color}`;
          const barWidth = Math.min(percentage, 100);

          return (
            <div key={bucket.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  {bucket.icon} {bucket.name} ({bucket.percentage}%)
                </span>
                <span className={`text-xs font-bold ${isOver ? "text-destructive" : "text-foreground"}`}>
                  {fmt(spent)} / {fmt(limit)}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              {isOver && (
                <p className="text-[0.65rem] text-destructive mt-0.5">
                  ⚠️ Excedido por {fmt(spent - limit)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetProgress;
