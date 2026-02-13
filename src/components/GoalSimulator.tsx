import React, { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";

const GoalSimulator: React.FC = () => {
  const [goalAmount, setGoalAmount] = useState("");
  const [monthlySaving, setMonthlySaving] = useState("");
  const [annualRate, setAnnualRate] = useState("8");
  const [result, setResult] = useState<{ months: number; totalInterest: number; totalSaved: number } | null>(null);

  const calculate = () => {
    const goal = parseFloat(goalAmount);
    const monthly = parseFloat(monthlySaving);
    const rate = parseFloat(annualRate) / 100 / 12;

    if (isNaN(goal) || isNaN(monthly) || monthly <= 0 || goal <= 0) return;

    let accumulated = 0;
    let months = 0;
    const maxMonths = 600; // 50 years cap

    while (accumulated < goal && months < maxMonths) {
      accumulated = accumulated * (1 + rate) + monthly;
      months++;
    }

    const totalSaved = monthly * months;
    const totalInterest = accumulated - totalSaved;

    setResult({ months, totalInterest: Math.max(0, totalInterest), totalSaved });
  };

  const formatYearsMonths = (m: number) => {
    const years = Math.floor(m / 12);
    const rem = m % 12;
    if (years === 0) return `${rem} meses`;
    if (rem === 0) return `${years} año${years > 1 ? "s" : ""}`;
    return `${years} año${years > 1 ? "s" : ""} y ${rem} mes${rem > 1 ? "es" : ""}`;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-info" /> Simulador de Metas
      </h3>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-[0.65rem] font-bold text-muted-foreground uppercase mb-1 block">Meta ($)</label>
          <input
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            placeholder="Ej: 10,000,000"
            className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-info"
          />
        </div>
        <div>
          <label className="text-[0.65rem] font-bold text-muted-foreground uppercase mb-1 block">Ahorro mensual ($)</label>
          <input
            type="number"
            value={monthlySaving}
            onChange={(e) => setMonthlySaving(e.target.value)}
            placeholder="Ej: 500,000"
            className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-info"
          />
        </div>
        <div>
          <label className="text-[0.65rem] font-bold text-muted-foreground uppercase mb-1 block">Rendimiento anual (%)</label>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="8"
            className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-info"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-info text-info-foreground py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4" /> Calcular
      </button>

      {result && (
        <div className="mt-4 bg-info/5 border border-info/20 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tiempo estimado</span>
            <span className="font-extrabold text-info">{formatYearsMonths(result.months)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total ahorrado</span>
            <span className="font-bold">${result.totalSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Intereses ganados</span>
            <span className="font-bold text-success">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalSimulator;
