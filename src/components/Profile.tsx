import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance, useAggregate } from "@/contexts/FinanceContext";
import { logout, resetUserData } from "@/lib/firebase";
import { LogOut, RotateCcw, User, Mail, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { toast } from "sonner";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Profile: React.FC = () => {
  const { uid, isGuest } = useAuth();
  const { profile, goal } = useFinance();
  const { incomes, expenses, netSavings, totalContributions } = useAggregate();

  const expenseRatio = incomes > 0 ? ((expenses / incomes) * 100).toFixed(1) : "0";
  const goalRatio = goal && goal > 0 ? ((totalContributions / goal) * 100).toFixed(1) : "—";

  const handleLogout = async () => {
    await logout();
  };

  const handleReset = async () => {
    if (!uid || isGuest) return toast.error("Regístrate para resetear datos");
    if (!window.confirm("¿Estás seguro? Se borrarán todas tus transacciones, aportes y reportes.")) return;
    try {
      await resetUserData(uid);
      toast.success("Datos reiniciados");
    } catch {
      toast.error("Error al reiniciar");
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Perfil</h1>
        <p className="text-sm text-muted-foreground">Tu información y configuración</p>
      </div>

      {/* User Info */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{profile.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {profile.email || "No registrado"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-success/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-success" /> Ingresos
            </div>
            <div className="font-extrabold text-success">{fmt(incomes)}</div>
          </div>
          <div className="bg-destructive/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-destructive" /> Gastos
            </div>
            <div className="font-extrabold text-destructive">{fmt(expenses)}</div>
          </div>
          <div className="bg-primary/10 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <PiggyBank className="w-3.5 h-3.5 text-primary" /> Ahorro Neto
            </div>
            <div className="font-extrabold text-primary">{fmt(netSavings)}</div>
          </div>
          <div className="bg-secondary rounded-xl p-3">
            <div className="text-xs text-muted-foreground mb-1">Ratios</div>
            <div className="text-xs space-y-0.5">
              <div>Gastos/Ingresos: <span className="font-bold text-foreground">{expenseRatio}%</span></div>
              <div>Meta: <span className="font-bold text-foreground">{goalRatio}%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleReset}
          className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:bg-secondary/50 transition text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-warning" />
          </div>
          <div>
            <div className="font-semibold text-sm">Reiniciar finanzas</div>
            <div className="text-xs text-muted-foreground">Borra todas las transacciones y reportes</div>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 bg-card border border-destructive/20 rounded-2xl p-4 hover:bg-destructive/5 transition text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <div className="font-semibold text-sm text-destructive">Cerrar sesión</div>
            <div className="text-xs text-muted-foreground">Salir de tu cuenta</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Profile;
