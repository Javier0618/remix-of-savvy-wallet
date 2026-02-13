import React, { useState } from "react";
import { useFinance, useAggregate } from "@/contexts/FinanceContext";
import { generateRecommendations } from "@/lib/recommendations";
import { generateMethodRecommendations } from "@/lib/financialMethods";
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp, Info, ChevronDown, ChevronUp } from "lucide-react";
import FinancialHealthScore from "./FinancialHealthScore";
import AIAdvisor from "./AIAdvisor";
import GoalSimulator from "./GoalSimulator";

const iconMap: Record<string, React.ReactNode> = {
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
  success: <CheckCircle className="w-5 h-5 text-success" />,
  tip: <Lightbulb className="w-5 h-5 text-info" />,
  insight: <TrendingUp className="w-5 h-5 text-primary" />,
};

const bgMap: Record<string, string> = {
  warning: "bg-warning/10 border-warning/20",
  success: "bg-success/10 border-success/20",
  tip: "bg-info/10 border-info/20",
  insight: "bg-primary/10 border-primary/20",
};

const SmartAdvice: React.FC = () => {
  const { transactions, goal, expenseCategories } = useFinance();
  const { incomes, expenses, totalContributions, totalWithdrawals } = useAggregate();
  const [showAllRecs, setShowAllRecs] = useState(false);

  const savingsRate = incomes > 0 ? (totalContributions / incomes) * 100 : 0;

  // Expense by category
  const expenseByCat: Record<string, number> = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    expenseByCat[t.category] = (expenseByCat[t.category] || 0) + Number(t.amount);
  });

  const recommendations = generateRecommendations(
    transactions, goal, totalContributions, totalWithdrawals, incomes, expenses, expenseCategories
  );

  const methodRecs = generateMethodRecommendations({
    incomes, expenses, savingsRate, totalContributions,
    goal, expenseByCat, monthlyExpenses: expenses, transactionCount: transactions.length,
  });

  const allRecs = [...recommendations, ...methodRecs.map(r => ({
    id: r.id,
    type: r.type,
    icon: r.icon,
    title: `${r.title}`,
    description: `${r.description}\n\n💡 ${r.actionable}`,
    priority: r.priority,
  }))].sort((a, b) => a.priority - b.priority);

  const uniqueRecs = allRecs.filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i);
  const visibleRecs = showAllRecs ? uniqueRecs : uniqueRecs.slice(0, 5);

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-warning" /> Consejos
        </h1>
        <p className="text-sm text-muted-foreground">
          Tu centro de inteligencia financiera
        </p>
      </div>

      {/* Financial Health Score + Gamification */}
      <FinancialHealthScore />

      {/* AI Advisor */}
      <AIAdvisor />

      {/* 50/30/20 visual breakdown */}
      {incomes > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-info" /> Regla 50/30/20
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            La regla sugiere destinar 50% a necesidades, 30% a deseos y 20% a ahorro.
          </p>
          <div className="flex gap-1 h-5 rounded-full overflow-hidden mb-3">
            {(() => {
              const needs = ["Comida", "Transporte", "Hogar", "Salud", "Servicios", "Educación"];
              const wants = ["Entretenimiento", "Ropa", "Viajes"];
              let needsTotal = 0, wantsTotal = 0;
              transactions.filter(t => t.type === "expense").forEach(t => {
                if (needs.includes(t.category)) needsTotal += Number(t.amount);
                else if (wants.includes(t.category)) wantsTotal += Number(t.amount);
              });
              const savingsTotal = totalContributions;
              const total = needsTotal + wantsTotal + savingsTotal || 1;
              const nPct = (needsTotal / total) * 100;
              const wPct = (wantsTotal / total) * 100;
              const sPct = (savingsTotal / total) * 100;
              return (
                <>
                  <div className="bg-info rounded-l-full" style={{ width: `${nPct}%` }} title={`Necesidades ${nPct.toFixed(0)}%`} />
                  <div className="bg-warning" style={{ width: `${wPct}%` }} title={`Deseos ${wPct.toFixed(0)}%`} />
                  <div className="bg-success rounded-r-full" style={{ width: `${sPct}%` }} title={`Ahorro ${sPct.toFixed(0)}%`} />
                </>
              );
            })()}
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-info" /> Necesidades (50%)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Deseos (30%)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Ahorro (20%)</span>
          </div>
        </div>
      )}

      {/* Goal Simulator */}
      <GoalSimulator />

      {/* Recommendations */}
      <div>
        <h3 className="font-bold text-sm mb-3">Recomendaciones personalizadas</h3>
        <div className="space-y-3">
          {visibleRecs.map((rec) => (
            <div key={rec.id} className={`border rounded-2xl p-4 ${bgMap[rec.type]}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  <span className="text-2xl">{rec.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{rec.description}</p>
                </div>
                <div className="flex-shrink-0">{iconMap[rec.type]}</div>
              </div>
            </div>
          ))}
        </div>
        {uniqueRecs.length > 5 && (
          <button
            onClick={() => setShowAllRecs(!showAllRecs)}
            className="w-full mt-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition flex items-center justify-center gap-1"
          >
            {showAllRecs ? <><ChevronUp className="w-3.5 h-3.5" /> Mostrar menos</> : <><ChevronDown className="w-3.5 h-3.5" /> Ver {uniqueRecs.length - 5} más</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default SmartAdvice;
