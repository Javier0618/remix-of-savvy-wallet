import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance, useAggregate } from "@/contexts/FinanceContext";
import {
  setGoal,
  clearGoal,
  addSavingsContribution,
  addSavingsWithdrawal,
  deleteSavingsContribution,
  deleteSavingsWithdrawal,
} from "@/lib/firebase";
import { Target, Trash2, Plus, ArrowDownCircle } from "lucide-react";
import { toast } from "sonner";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Savings: React.FC = () => {
  const { uid, isGuest } = useAuth();
  const { goal, contributions, withdrawals } = useFinance();
  const { totalContributions, totalWithdrawals, netSavings } = useAggregate();

  const [goalInput, setGoalInput] = useState("");
  const [contribInput, setContribInput] = useState("");
  const [withdrawInput, setWithdrawInput] = useState("");

  const progressPct = goal && goal > 0 ? Math.min((totalContributions / goal) * 100, 100) : 0;

  const handleSetGoal = async () => {
    const val = parseFloat(goalInput);
    if (isNaN(val) || val < 0) return toast.error("Meta inválida");
    if (!uid || isGuest) return toast.error("Regístrate para guardar metas");
    await setGoal(uid, val);
    setGoalInput("");
    toast.success("Meta guardada");
  };

  const handleClearGoal = async () => {
    if (!uid || isGuest) return;
    await clearGoal(uid);
    toast.success("Meta borrada");
  };

  const handleContribution = async () => {
    const val = parseFloat(contribInput);
    if (isNaN(val) || val <= 0) return toast.error("Monto inválido");
    if (!uid || isGuest) return toast.error("Regístrate para aportar");
    await addSavingsContribution(uid, val);
    setContribInput("");
    toast.success("Aporte agregado");
  };

  const handleWithdraw = async () => {
    const val = parseFloat(withdrawInput);
    if (isNaN(val) || val <= 0) return toast.error("Monto inválido");
    if (val > totalContributions) return toast.warning("No tienes suficiente ahorro");
    if (!uid || isGuest) return toast.error("Regístrate para retirar");
    await addSavingsWithdrawal(uid, val);
    setWithdrawInput("");
    toast.success("Retiro realizado");
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Ahorro</h1>
        <p className="text-sm text-muted-foreground">Meta, aportes y retiros</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 relative">
          <div className="text-[0.65rem] font-extrabold uppercase text-muted-foreground mb-1">Meta</div>
          <div className="text-lg font-extrabold text-foreground">{fmt(goal || 0)}</div>
          <div className="absolute top-3 right-3 w-8 h-8 bg-destructive rounded-xl flex items-center justify-center">
            <Target className="w-4 h-4 text-destructive-foreground" />
          </div>
        </div>
        <div className="bg-success/10 border border-success/20 rounded-2xl p-4">
          <div className="text-[0.65rem] font-extrabold uppercase text-muted-foreground mb-1">Ahorro Neto</div>
          <div className="text-lg font-extrabold text-foreground">{fmt(netSavings)}</div>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4">
          <div className="text-[0.65rem] font-extrabold uppercase text-muted-foreground mb-1">Aportes</div>
          <div className="text-lg font-extrabold text-foreground">{fmt(totalContributions)}</div>
        </div>
      </div>

      {/* Goal progress */}
      {goal && goal > 0 && (
        <div className="bg-secondary/30 border border-border rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-muted-foreground">Progreso</span>
            <span className="text-sm font-extrabold text-primary">{progressPct.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {fmt(totalContributions)} de {fmt(goal)}
            {totalContributions < goal && ` — Faltan ${fmt(goal - totalContributions)}`}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Meta de ahorro
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Monto meta"
              className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
            <button onClick={handleSetGoal} className="bg-primary text-primary-foreground px-4 rounded-xl text-sm font-bold hover:brightness-110 transition">
              Guardar
            </button>
            {goal && goal > 0 && (
              <button onClick={handleClearGoal} className="bg-destructive/10 text-destructive px-3 rounded-xl hover:bg-destructive/20 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-success" /> Aportar al ahorro
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={contribInput}
              onChange={(e) => setContribInput(e.target.value)}
              placeholder="Monto"
              className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
            <button onClick={handleContribution} className="bg-success text-success-foreground px-4 rounded-xl text-sm font-bold hover:brightness-110 transition">
              Aportar
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <ArrowDownCircle className="w-4 h-4 text-destructive" /> Retirar del ahorro
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={withdrawInput}
              onChange={(e) => setWithdrawInput(e.target.value)}
              placeholder="Monto"
              className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
            <button onClick={handleWithdraw} className="bg-destructive text-destructive-foreground px-4 rounded-xl text-sm font-bold hover:brightness-110 transition">
              Retirar
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="text-base font-bold mb-3">Historial de aportes</h3>
        {contributions.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">Sin aportes aún</p>
        )}
        <div className="space-y-2 mb-6">
          {contributions.map((c) => (
            <div key={c.id} className="flex justify-between items-center p-3 bg-secondary/30 border border-border rounded-2xl hover:bg-secondary/50 transition">
              <div>
                <span className="text-success font-extrabold">{fmt(c.amount)}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(c.date).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={async () => {
                  if (!uid || isGuest) return;
                  await deleteSavingsContribution(uid, c.id);
                  toast.success("Aporte eliminado");
                }}
                className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>

        <h3 className="text-base font-bold mb-3">Historial de retiros</h3>
        {withdrawals.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">Sin retiros aún</p>
        )}
        <div className="space-y-2">
          {withdrawals.map((w) => (
            <div key={w.id} className="flex justify-between items-center p-3 bg-secondary/30 border border-border rounded-2xl hover:bg-secondary/50 transition">
              <div>
                <span className="text-destructive font-extrabold">-{fmt(w.amount)}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(w.date).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={async () => {
                  if (!uid || isGuest) return;
                  await deleteSavingsWithdrawal(uid, w.id);
                  toast.success("Retiro eliminado");
                }}
                className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Savings;
