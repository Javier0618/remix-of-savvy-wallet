import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance } from "@/contexts/FinanceContext";
import {
  addTransaction,
  updateTransaction,
  addCategory,
  type Transaction,
} from "@/lib/firebase";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import IconPicker, { ICON_MAP } from "./IconPicker";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  type: "income" | "expense";
  editTransaction?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  open,
  onClose,
  type: initialType,
  editTransaction,
}) => {
  const { uid, isGuest } = useAuth();
  const { incomeCategories, expenseCategories } = useFinance();

  const [type, setType] = useState<"income" | "expense">(initialType);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setCategory(editTransaction.category);
      setDesc(editTransaction.desc || "");
      setDate(new Date(editTransaction.date).toISOString().slice(0, 10));
    } else {
      setType(initialType);
      setAmount("");
      setCategory("");
      setDesc("");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [editTransaction, initialType, open]);

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleSave = async () => {
    const a = parseFloat(amount);
    if (isNaN(a) || a <= 0) return toast.error("Monto inválido");
    if (!category) return toast.error("Selecciona una categoría");

    const payload = {
      type,
      amount: a,
      category,
      desc,
      date: new Date(date).toISOString(),
    };

    try {
      if (editTransaction && uid && !isGuest) {
        await updateTransaction(uid, editTransaction.id, payload);
        toast.success("Transacción actualizada");
      } else if (uid && !isGuest) {
        await addTransaction(uid, payload);
        toast.success("Transacción agregada");
      } else {
        toast.error("Regístrate para guardar transacciones");
      }
      onClose();
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    if (uid && !isGuest) {
      await addCategory(uid, type, newCatName.trim(), newCatIcon || "Star");
    }
    setCategory(newCatName.trim());
    setShowNewCat(false);
    setNewCatName("");
    setNewCatIcon("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {editTransaction ? "Editar" : "Nuevo"}{" "}
            {type === "income" ? "ingreso" : "gasto"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex bg-secondary/50 rounded-xl p-1 mb-4">
          <button
            onClick={() => setType("income")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
              type === "income" ? "bg-success text-success-foreground" : "text-muted-foreground"
            }`}
          >
            Ingreso
          </button>
          <button
            onClick={() => setType("expense")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
              type === "expense" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground"
            }`}
          >
            Gasto
          </button>
        </div>

        {/* Amount */}
        <div className="text-center mb-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="bg-transparent border-b-2 border-border text-4xl font-extrabold text-center w-full max-w-[250px] py-2 outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/30 transition"
          />
        </div>

        {/* Category grid */}
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          Categoría
        </label>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {categories.map((cat) => {
            const LucideIcon = ICON_MAP[cat.icon];
            return (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                  category === cat.name
                    ? "bg-primary/15 border-primary shadow-lg shadow-primary/10"
                    : "bg-secondary/30 border-border hover:bg-secondary/50"
                }`}
              >
                {LucideIcon ? (
                  <LucideIcon className="w-5 h-5 text-foreground" />
                ) : (
                  <span className="text-xl">{cat.icon}</span>
                )}
                <span
                  className={`text-[0.6rem] font-bold truncate w-full text-center ${
                    category === cat.name ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setShowNewCat(!showNewCat)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition"
          >
            <Plus className="w-5 h-5 text-muted-foreground" />
            <span className="text-[0.6rem] font-bold text-muted-foreground">Nueva</span>
          </button>
        </div>

        {showNewCat && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Nombre"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <IconPicker value={newCatIcon} onChange={setNewCatIcon} />
            <button onClick={handleAddCategory} className="bg-primary text-primary-foreground px-4 rounded-xl text-sm font-bold">
              OK
            </button>
          </div>
        )}

        {/* Description */}
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block mt-2">
          Descripción
        </label>
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Opcional"
          className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary mb-4"
        />

        {/* Date */}
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          Fecha
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary mb-6"
        />

        <button
          onClick={handleSave}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold hover:brightness-110 transition"
        >
          {editTransaction ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </div>
  );
};

export default TransactionModal;
