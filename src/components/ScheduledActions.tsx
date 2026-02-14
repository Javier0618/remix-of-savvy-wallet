import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance } from "@/contexts/FinanceContext";
import {
  addScheduledAction,
  deleteScheduledAction,
  updateScheduledAction,
  type ScheduledAction,
} from "@/lib/firebase";
import { CalendarClock, Plus, Trash2, Pause, Play, Banknote, PiggyBank } from "lucide-react";
import { toast } from "sonner";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dayLabels = (days: number[]) =>
  days.map((d) => (d === 30 ? "30 (último)" : String(d))).join(", ");

const ScheduledActions: React.FC = () => {
  const { uid, isGuest } = useAuth();
  const { scheduledActions, expenseCategories } = useFinance();

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"debt" | "savings">("debt");
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDays, setFormDays] = useState<number[]>([]);
  const [dayInput, setDayInput] = useState("");

  const resetForm = () => {
    setFormName("");
    setFormAmount("");
    setFormCategory("");
    setFormDays([]);
    setDayInput("");
    setShowForm(false);
  };

  const addDay = () => {
    const d = parseInt(dayInput);
    if (isNaN(d) || d < 1 || d > 31) return toast.error("Día inválido (1-31)");
    if (formDays.includes(d)) return toast.error("Día ya agregado");
    setFormDays([...formDays, d].sort((a, b) => a - b));
    setDayInput("");
  };

  const removeDay = (d: number) => setFormDays(formDays.filter((x) => x !== d));

  const handleCreate = async () => {
    if (!uid || isGuest) return toast.error("Regístrate para usar esta función");
    if (!formName.trim()) return toast.error("Nombre requerido");
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) return toast.error("Monto inválido");
    if (formDays.length === 0) return toast.error("Agrega al menos un día");
    if (formType === "debt" && !formCategory) return toast.error("Selecciona una categoría");

    await addScheduledAction(uid, {
      type: formType,
      name: formName.trim(),
      amount,
      days: formDays,
      category: formType === "savings" ? "Ahorro" : formCategory,
      active: true,
      created: new Date().toISOString(),
    });
    toast.success("Acción programada creada");
    resetForm();
  };

  const toggleActive = async (action: ScheduledAction) => {
    if (!uid) return;
    await updateScheduledAction(uid, action.id, { active: !action.active });
    toast.success(action.active ? "Pausada" : "Activada");
  };

  const handleDelete = async (id: string) => {
    if (!uid) return;
    await deleteScheduledAction(uid, id);
    toast.success("Acción eliminada");
  };

  const debtActions = scheduledActions.filter((a) => a.type === "debt");
  const savingsActions = scheduledActions.filter((a) => a.type === "savings");

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Automatizaciones</h1>
          <p className="text-sm text-muted-foreground">Pagos y ahorros programados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 animate-fade-in-up">
          <h3 className="text-sm font-bold mb-4">Nueva acción programada</h3>

          {/* Type selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFormType("debt")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
                formType === "debt"
                  ? "bg-destructive/15 text-destructive border border-destructive/30"
                  : "bg-secondary/50 text-muted-foreground border border-border"
              }`}
            >
              <Banknote className="w-4 h-4" /> Deuda / Pago
            </button>
            <button
              onClick={() => setFormType("savings")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
                formType === "savings"
                  ? "bg-success/15 text-success border border-success/30"
                  : "bg-secondary/50 text-muted-foreground border border-border"
              }`}
            >
              <PiggyBank className="w-4 h-4" /> Ahorro
            </button>
          </div>

          {/* Name */}
          <input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder={formType === "debt" ? "Ej: Cuota banco" : "Ej: Ahorro mensual"}
            className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary mb-3"
          />

          {/* Amount */}
          <input
            type="number"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            placeholder="Monto a cobrar/ahorrar"
            className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary mb-3"
          />

          {/* Category (debt only) */}
          {formType === "debt" && (
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary mb-3"
            >
              <option value="">Categoría del gasto</option>
              {expenseCategories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Days */}
          <div className="mb-4">
            <label className="text-xs font-bold text-muted-foreground mb-2 block">
              Días del mes para ejecutar
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                min={1}
                max={31}
                value={dayInput}
                onChange={(e) => setDayInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDay()}
                placeholder="Día (1-31)"
                className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
              <button
                onClick={addDay}
                className="bg-info/15 text-info px-4 rounded-xl text-sm font-bold hover:bg-info/25 transition"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formDays.map((d) => (
                <span
                  key={d}
                  className="bg-info/15 text-info text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-destructive/15 hover:text-destructive transition"
                  onClick={() => removeDay(d)}
                >
                  Día {d} ✕
                </span>
              ))}
              {formDays.length === 0 && (
                <span className="text-xs text-muted-foreground">Sin días seleccionados</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition"
            >
              Crear automatización
            </button>
            <button
              onClick={resetForm}
              className="bg-secondary text-muted-foreground px-4 rounded-xl text-sm font-bold hover:bg-secondary/80 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Debt Actions */}
      <div className="mb-6">
        <h2 className="text-base font-bold mb-3 flex items-center gap-2">
          <Banknote className="w-4 h-4 text-destructive" /> Pagos de deudas
        </h2>
        {debtActions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4 bg-secondary/20 border border-border rounded-2xl">
            Sin pagos programados
          </p>
        ) : (
          <div className="space-y-2">
            {debtActions.map((a) => (
              <ActionCard key={a.id} action={a} onToggle={toggleActive} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Savings Actions */}
      <div>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-success" /> Ahorros automáticos
        </h2>
        {savingsActions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4 bg-secondary/20 border border-border rounded-2xl">
            Sin ahorros programados
          </p>
        ) : (
          <div className="space-y-2">
            {savingsActions.map((a) => (
              <ActionCard key={a.id} action={a} onToggle={toggleActive} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ActionCard: React.FC<{
  action: ScheduledAction;
  onToggle: (a: ScheduledAction) => void;
  onDelete: (id: string) => void;
}> = ({ action, onToggle, onDelete }) => {
  const isDebt = action.type === "debt";
  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-2xl transition ${
        action.active
          ? "bg-secondary/30 border-border"
          : "bg-secondary/10 border-border/50 opacity-60"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
            isDebt ? "bg-destructive/15" : "bg-success/15"
          }`}
        >
          {isDebt ? "💳" : "🐷"}
        </div>
        <div>
          <div className="text-sm font-bold">{action.name}</div>
          <div className="text-xs text-muted-foreground">
            {fmt(action.amount)} · Días: {dayLabels(action.days)}
          </div>
          {isDebt && (
            <div className="text-xs text-muted-foreground">Categoría: {action.category}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onToggle(action)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
            action.active
              ? "bg-success/15 hover:bg-warning/15"
              : "bg-warning/15 hover:bg-success/15"
          }`}
        >
          {action.active ? (
            <Pause className="w-3.5 h-3.5 text-warning" />
          ) : (
            <Play className="w-3.5 h-3.5 text-success" />
          )}
        </button>
        <button
          onClick={() => onDelete(action.id)}
          className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition"
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>
      </div>
    </div>
  );
};

export default ScheduledActions;
