import React, { useState, useRef, useEffect } from "react";
import { useFinance, useAggregate } from "@/contexts/FinanceContext";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-advisor`;

const AIAdvisor: React.FC = () => {
  const { transactions, goal } = useFinance();
  const { incomes, expenses, totalContributions, totalWithdrawals, netSavings } = useAggregate();
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  const savingsRate = incomes > 0 ? ((totalContributions / incomes) * 100).toFixed(1) : "0";
  const expenseRatio = incomes > 0 ? ((expenses / incomes) * 100).toFixed(0) : "0";

  // Build expense by category
  const expenseByCat: Record<string, number> = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    expenseByCat[t.category] = (expenseByCat[t.category] || 0) + Number(t.amount);
  });
  const topCategories = Object.entries(expenseByCat)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: $${amt.toLocaleString()}`)
    .join(", ");

  // Monthly trend simplified
  const monthlyTrend = incomes > expenses ? "superávit" : incomes < expenses ? "déficit" : "equilibrio";

  const generateAdvice = async () => {
    if (transactions.length === 0) {
      toast.error("Registra al menos un ingreso o gasto para obtener consejos de IA");
      return;
    }

    setLoading(true);
    setResponse("");
    setHasGenerated(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          financialData: {
            incomes,
            expenses,
            savingsRate,
            topCategories,
            goal: goal || null,
            netSavings,
            expenseRatio,
            monthlyTrend,
          },
        }),
      });

      if (resp.status === 429) {
        toast.error("Demasiadas solicitudes. Intenta en un momento.");
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("Créditos de IA agotados.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        toast.error("Error al obtener análisis de IA");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setResponse(accumulated);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setResponse(accumulated);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión con el servicio de IA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-border bg-gradient-to-r from-primary/10 to-info/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Asesor Financiero IA</h3>
            <p className="text-[0.65rem] text-muted-foreground">Análisis personalizado con inteligencia artificial</p>
          </div>
        </div>
      </div>

      {!hasGenerated ? (
        <div className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-primary/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Obtén un análisis completo de tus finanzas con recomendaciones personalizadas basadas en métodos financieros probados.
          </p>
          <button
            onClick={generateAdvice}
            disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analizar mis finanzas
          </button>
        </div>
      ) : (
        <div>
          <div ref={responseRef} className="p-5 max-h-96 overflow-y-auto">
            {response ? (
              <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            ) : loading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analizando tus finanzas...
              </div>
            ) : null}
          </div>
          {!loading && response && (
            <div className="p-4 border-t border-border">
              <button
                onClick={generateAdvice}
                className="w-full bg-secondary/50 text-foreground py-2.5 rounded-xl font-semibold text-xs hover:bg-secondary transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generar nuevo análisis
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
