import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, quizAnswers } = await req.json();

    if (!leadId || !quizAnswers) {
      return new Response(JSON.stringify({ error: "Missing leadId or quizAnswers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Analise as respostas de um lead e classifique como "quente", "morno" ou "frio".

Critérios:
- Quente: faturamento alto (R$30k+), disposto a investir com convicção, tem desafio claro
- Morno: tem alguma estrutura ou interesse parcial, faturamento médio, quer entender melhor
- Frio: sem estrutura, sem interesse imediato, faturamento baixo

Respostas do lead:
${JSON.stringify(quizAnswers, null, 2)}

Responda APENAS com uma palavra: quente, morno ou frio.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Você é um classificador de leads. Responda apenas com: quente, morno ou frio." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error("AI classification failed");
    }

    const aiData = await aiResponse.json();
    const rawScore = aiData.choices?.[0]?.message?.content?.trim().toLowerCase() || "";
    const score = ["quente", "morno", "frio"].includes(rawScore) ? rawScore : "morno";

    // Update lead with score using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from("leads")
      .update({ lead_score: score })
      .eq("id", leadId);

    if (updateError) {
      console.error("Failed to update lead score:", updateError);
      throw new Error("Failed to update lead score");
    }

    return new Response(JSON.stringify({ score }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify-lead error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
