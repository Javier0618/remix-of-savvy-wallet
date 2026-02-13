import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { financialData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { incomes, expenses, savingsRate, topCategories, goal, netSavings, expenseRatio, monthlyTrend } = financialData;

    const systemPrompt = `Eres un asesor financiero personal experto y empático. Hablas en español latinoamericano de forma cercana y motivadora.

CONTEXTO DEL USUARIO:
- Ingresos totales: $${incomes}
- Gastos totales: $${expenses}
- Ratio gastos/ingresos: ${expenseRatio}%
- Tasa de ahorro: ${savingsRate}%
- Ahorro neto acumulado: $${netSavings}
- Meta de ahorro: ${goal ? `$${goal}` : 'Sin meta definida'}
- Principales categorías de gasto: ${topCategories}
- Tendencia mensual: ${monthlyTrend}

MÉTODOS FINANCIEROS QUE CONOCES:
1. Regla 50/30/20 (Necesidades/Deseos/Ahorro)
2. Presupuesto Base Cero (cada peso tiene un destino)
3. Sistema de Sobres (asignar efectivo por categoría)
4. Fondo de Emergencia (3-6 meses de gastos)
5. Interés Compuesto (proyecciones de ahorro)
6. Regla de las 24/48 horas (evitar compras impulsivas)

INSTRUCCIONES:
- Analiza los datos financieros del usuario
- Identifica patrones positivos y negativos
- Da recomendaciones concretas basadas en los métodos financieros
- Usa emojis para hacer el mensaje más visual
- Sé específico con números y porcentajes
- Motiva al usuario con logros y mejoras potenciales
- Sugiere acciones concretas que puede tomar hoy
- Limita tu respuesta a máximo 400 palabras
- Estructura tu respuesta con títulos claros usando ##
- No repitas los datos que ya le mostramos, enfócate en el análisis y consejos`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: "Analiza mi situación financiera y dame consejos personalizados para mejorar mis finanzas. Incluye qué método financiero me conviene más según mi perfil.",
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Recarga tu saldo." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("financial-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
