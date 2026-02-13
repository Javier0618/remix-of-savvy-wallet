import React, { useState } from "react";
import { FINANCIAL_METHODS, type FinancialMethod } from "@/lib/financialMethodsRegistry";
import { setFinancialMethod } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
  currentMethodId?: string | null;
}

const MethodSelector: React.FC<Props> = ({ onComplete, currentMethodId }) => {
  const { uid, isGuest } = useAuth();
  const [selected, setSelected] = useState<string | null>(currentMethodId ?? null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selected) return toast.error("Selecciona un método");
    if (!uid) return;
    if (isGuest) return toast.error("Regístrate para guardar tu método");
    setSaving(true);
    try {
      await setFinancialMethod(uid, selected);
      toast.success("Método financiero guardado");
      onComplete();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" /> Personaliza tu experiencia
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">
          ¿Cómo quieres manejar tu dinero?
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Elige el método financiero que mejor se adapte a ti. Puedes cambiarlo cuando quieras desde tu perfil.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {FINANCIAL_METHODS.map((method) => {
          const isSelected = selected === method.id;
          const isExpanded = expanded === method.id;

          return (
            <div key={method.id}>
              <button
                onClick={() => {
                  setSelected(method.id);
                  setExpanded(isExpanded ? null : method.id);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                    : "bg-card border-border hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        {method.name}
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{method.shortDesc}</div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 mx-2 p-4 bg-secondary/30 border border-border rounded-xl animate-fade-in-up">
                  <p className="text-sm text-muted-foreground mb-3">{method.longDesc}</p>
                  <p className="text-xs text-muted-foreground/70 italic mb-3">
                    Origen: {method.origin}
                  </p>

                  {method.buckets.some((b) => b.percentage > 0) && (
                    <div className="mb-3">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
                        Distribución
                      </p>
                      <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-secondary">
                        {method.buckets
                          .filter((b) => b.percentage > 0)
                          .map((b) => (
                            <div
                              key={b.name}
                              className={`bg-${b.color} rounded-full`}
                              style={{ width: `${b.percentage}%` }}
                              title={`${b.name}: ${b.percentage}%`}
                            />
                          ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {method.buckets
                          .filter((b) => b.percentage > 0)
                          .map((b) => (
                            <span
                              key={b.name}
                              className="text-[0.65rem] text-muted-foreground"
                            >
                              {b.icon} {b.name} ({b.percentage}%)
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                      Consejos
                    </p>
                    <ul className="space-y-1">
                      {method.tips.slice(0, 3).map((tip, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={!selected || saving}
        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm disabled:opacity-50 hover:opacity-90 transition"
      >
        {saving ? "Guardando..." : "Confirmar método"}
      </button>
    </div>
  );
};

export default MethodSelector;
