import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance } from "@/contexts/FinanceContext";
import {
  addTransaction,
  addSavingsContribution,
  getLastExecution,
  logExecution,
  type ScheduledAction,
} from "@/lib/firebase";
import { toast } from "sonner";

/**
 * Checks scheduled actions on mount and executes any pending ones
 * for today (or missed days in the current month).
 */
export function useScheduledExecutor() {
  const { uid, isGuest } = useAuth();
  const { scheduledActions, loading } = useFinance();
  const executed = useRef(false);

  useEffect(() => {
    if (!uid || isGuest || loading || executed.current) return;
    if (scheduledActions.length === 0) return;

    executed.current = true;
    runPendingActions(uid, scheduledActions);
  }, [uid, isGuest, loading, scheduledActions]);
}

async function runPendingActions(uid: string, actions: ScheduledAction[]) {
  const now = new Date();
  const today = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();

  let count = 0;

  for (const action of actions) {
    if (!action.active) continue;

    for (const day of action.days) {
      // Only execute if today >= the scheduled day (catch up for current month)
      if (day > today) continue;

      const alreadyRan = await getLastExecution(uid, action.id, day, month, year);
      if (alreadyRan) continue;

      try {
        if (action.type === "savings") {
          await addSavingsContribution(uid, action.amount);
        } else {
          await addTransaction(uid, {
            type: "expense",
            amount: action.amount,
            category: action.category,
            desc: `Auto: ${action.name}`,
            date: new Date(year, month, day).toISOString(),
          });
        }

        await logExecution(uid, action.id, day, month, year);
        count++;
      } catch (err) {
        console.error("Error executing scheduled action", action.name, err);
      }
    }
  }

  if (count > 0) {
    toast.info(`Se ejecutaron ${count} acción(es) programada(s)`, {
      description: "Revisa tus movimientos para ver los detalles.",
      duration: 5000,
    });
  }
}
