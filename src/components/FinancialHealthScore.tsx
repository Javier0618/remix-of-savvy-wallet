import React from "react";
import { useFinance, useAggregate } from "@/contexts/FinanceContext";
import { calculateFinancialScore } from "@/lib/financialScore";
import { Trophy, Star, Lock, ChevronRight } from "lucide-react";

const FinancialHealthScore: React.FC = () => {
  const { transactions, goal, contributions } = useFinance();
  const { incomes, expenses, totalContributions, netSavings } = useAggregate();

  const savingsRate = incomes > 0 ? (totalContributions / incomes) * 100 : 0;
  const monthlyExpenses = expenses; // simplified: current period
  const score = calculateFinancialScore(
    incomes, expenses, savingsRate, totalContributions,
    goal, transactions.length, !!(goal && goal > 0), monthlyExpenses
  );

  const circumference = 2 * Math.PI * 54;
  const strokeDash = (score.total / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Score Circle */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Salud Financiera</h3>
          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full bg-${score.color}/15 text-${score.color}`}>
            {score.grade}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={`hsl(var(--${score.color}))`}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - strokeDash}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold">{score.total}</span>
              <span className="text-[0.6rem] text-muted-foreground">de 100</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {score.breakdown.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-[0.65rem] mb-0.5">
                  <span className="text-muted-foreground">{cat.icon} {cat.name}</span>
                  <span className="font-bold">{cat.score}</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      cat.score >= 70 ? "bg-success" : cat.score >= 40 ? "bg-warning" : "bg-destructive"
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Level & XP */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-warning" />
            <div>
              <span className="text-sm font-bold">Nivel {score.level}</span>
              <span className="text-xs text-muted-foreground ml-2">{score.levelName}</span>
            </div>
          </div>
          <span className="text-xs font-bold text-warning">{score.xp} XP</span>
        </div>
        <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-warning to-warning/60 rounded-full transition-all duration-700"
            style={{ width: `${Math.max(5, 100 - (score.xpToNext / (score.xp + score.xpToNext)) * 100)}%` }}
          />
        </div>
        <p className="text-[0.65rem] text-muted-foreground mt-1.5">
          {score.xpToNext > 0 ? `Faltan ${score.xpToNext} XP para el siguiente nivel` : "¡Nivel máximo!"}
        </p>
      </div>

      {/* Achievements */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-warning" /> Logros
          </h3>
          <span className="text-xs text-muted-foreground">
            {score.achievements.filter(a => a.unlocked).length}/{score.achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {score.achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-xl border transition-all ${
                ach.unlocked
                  ? "bg-warning/5 border-warning/20"
                  : "bg-secondary/30 border-border opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{ach.unlocked ? ach.icon : "🔒"}</span>
                <span className="text-[0.7rem] font-bold truncate">{ach.name}</span>
              </div>
              <p className="text-[0.6rem] text-muted-foreground leading-tight">{ach.description}</p>
              {!ach.unlocked && ach.progress > 0 && (
                <div className="w-full h-1 bg-secondary rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-warning/50 rounded-full" style={{ width: `${ach.progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthScore;
