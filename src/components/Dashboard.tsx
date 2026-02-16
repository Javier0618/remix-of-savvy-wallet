import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance, useAggregate } from "@/contexts/FinanceContext";
import { addTransaction, type Transaction } from "@/lib/firebase";
import { Plus, TrendingUp, TrendingDown, Edit2, Trash2 } from "lucide-react";
import { deleteTransaction } from "@/lib/firebase";
import SummaryCard from "./SummaryCard";
import TransactionModal from "./TransactionModal";
import BudgetProgress from "./BudgetProgress";
import WeeklySummary from "./WeeklySummary";
import { toast } from "sonner";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Dashboard: React.FC<{ onSelectMethod?: () => void; onViewReports?: () => void }> = ({ onSelectMethod, onViewReports }) => {
  const { uid, isGuest } = useAuth();
  const { transactions } = useFinance();
  const { incomes, expenses, available, netSavings } = useAggregate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"income" | "expense">("income");
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Buenos días" : now.getHours() < 18 ? "Buenas tardes" : "Buenas noches";
  const { profile } = useFinance();

  const expensePct = incomes > 0 ? ((expenses / incomes) * 100).toFixed(0) : "0";
  const availablePct = incomes > 0 ? ((available / incomes) * 100).toFixed(0) : "0";

  const openAdd = (type: "income" | "expense") => {
    setEditTx(null);
    setModalType(type);
    setModalOpen(true);
  };

  const handleDelete = async (tx: Transaction) => {
    if (!uid) return;
    if (isGuest) return toast.error("Regístrate para eliminar transacciones");
    try {
      await deleteTransaction(uid, tx.id);
      toast.success("Transacción eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const recentTxs = transactions.slice(0, 10);

  // Group by date
  const grouped: Record<string, Transaction[]> = {};
  recentTxs.forEach((tx) => {
    const d = new Date(tx.date).toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(tx);
  });

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {greeting}, <span>{profile.name.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground capitalize mt-0.5">
          {now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <SummaryCard
          label="Ingresos"
          value={fmt(incomes)}
          icon={<TrendingUp className="w-5 h-5 text-success" />}
          variant="income"
        />
        <SummaryCard
          label="Gastos"
          value={fmt(expenses)}
          subValue={`${expensePct}% de ingresos`}
          icon={<TrendingDown className="w-5 h-5 text-destructive" />}
          variant="expense"
        />
        <SummaryCard
          label="Disponible"
          value={fmt(available)}
          subValue={`${availablePct}% de ingresos`}
          icon={<span className="text-info text-lg">💳</span>}
          variant="available"
        />
        <SummaryCard
          label="Ahorro Neto"
          value={fmt(netSavings)}
          icon={<span className="text-primary text-lg">🐷</span>}
          variant="savings"
        />
      </div>

      {/* Weekly Summary */}
      <WeeklySummary onViewReports={onViewReports} />

      {/* Budget Progress by Method */}
      <BudgetProgress onChangeMethod={onSelectMethod} />

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => openAdd("income")}
          className="flex-1 bg-success/5 text-success border border-success/20 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-success/10 transition"
        >
          <Plus className="w-4 h-4" /> Ingreso
        </button>
        <button
          onClick={() => openAdd("expense")}
          className="flex-1 bg-destructive/5 text-destructive border border-destructive/20 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 transition"
        >
          <Plus className="w-4 h-4" /> Gasto
        </button>
      </div>

      {/* Recent Movements */}
      <div>
        <h2 className="text-base font-bold mb-4">Movimientos recientes</h2>
        {Object.entries(grouped).length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">
            No hay movimientos registrados aún.
          </p>
        )}
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <p className="text-[0.7rem] font-extrabold uppercase text-muted-foreground tracking-wider mb-2 ml-1 mt-4 first:mt-0">
              {date}
            </p>
            <div className="flex flex-col gap-2">
              {txs.map((tx) => (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between p-3 bg-secondary/30 border border-border rounded-2xl hover:bg-secondary/50 hover:translate-x-1 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                        tx.type === "income" ? "bg-success/15" : "bg-destructive/15"
                      }`}
                    >
                      {tx.type === "income" ? "📈" : "📉"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{tx.category}</div>
                      {tx.desc && <div className="text-xs text-muted-foreground">{tx.desc}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-extrabold text-sm ${
                        tx.type === "income" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}{fmt(Number(tx.amount))}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditTx(tx);
                          setModalType(tx.type);
                          setModalOpen(true);
                        }}
                        className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                      >
                        <Edit2 className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx)}
                        className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        editTransaction={editTx}
      />
    </div>
  );
};

export default Dashboard;
