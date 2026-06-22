import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Voce e um nutricionista assistente. Analise o conteudo (imagem ou descricao) e retorne APENAS um JSON valido seguindo este schema:
{
  "nome_sugerido": "string curta (ex: 'Almoco proteico')",
  "emoji": "1 emoji",
  "alimentos": [
    { "name": "string", "amount": "string ex 200g", "calories": number, "protein": number, "fat": number, "carbs": number }
  ],
  "total": { "calorias": number, "proteinas": number, "gorduras": number, "carboidratos": number },
  "confianca": number entre 0 e 1,
  "observacao": "string curta opcional"
}
Use estimativas razoaveis em portugues brasileiro. NUNCA adicione texto fora do JSON.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { imageDataUrl, text } = body ?? {};

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY ausente');

    const userContent: any[] = [];
    if (text) userContent.push({ type: 'text', text: `Descricao do usuario: ${text}` });
    if (imageDataUrl) userContent.push({ type: 'image_url', image_url: { url: imageDataUrl } });
    if (!userContent.length) {
      return new Response(JSON.stringify({ error: 'Forneca imagem ou descricao.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisicoes excedido. Tente novamente em instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: 'Creditos esgotados. Adicione creditos ao workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const errTxt = await aiRes.text();
      console.error('AI gateway error', aiRes.status, errTxt);
      return new Response(JSON.stringify({ error: 'Falha na analise da IA.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await aiRes.json();
    const content = data?.choices?.[0]?.message?.content ?? '{}';
    let parsed: any;
    try {
      parsed = typeof content === 'string' ? JSON.parse(content) : content;
    } catch {
      const match = String(content).match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    // Normaliza campos faltantes
    const alimentos = Array.isArray(parsed.alimentos) ? parsed.alimentos.map((a: any) => ({
      name: String(a.name ?? a.nome ?? 'Alimento'),
      amount: String(a.amount ?? a.quantidade ?? '100g'),
      calories: Number(a.calories ?? a.calorias ?? 0) || 0,
      protein: Number(a.protein ?? a.proteinas ?? 0) || 0,
      fat: Number(a.fat ?? a.gorduras ?? 0) || 0,
      carbs: Number(a.carbs ?? a.carboidratos ?? 0) || 0,
    })) : [];

    const total = alimentos.reduce((acc: any, a: any) => ({
      calorias: acc.calorias + a.calories,
      proteinas: acc.proteinas + a.protein,
      gorduras: acc.gorduras + a.fat,
      carboidratos: acc.carboidratos + a.carbs,
    }), { calorias: 0, proteinas: 0, gorduras: 0, carboidratos: 0 });

    const result = {
      nome_sugerido: parsed.nome_sugerido ?? 'Refeicao',
      emoji: parsed.emoji ?? '🍽️',
      alimentos,
      total: parsed.total ?? total,
      confianca: typeof parsed.confianca === 'number' ? Math.max(0, Math.min(1, parsed.confianca)) : 0.7,
      observacao: parsed.observacao,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('analyze-meal error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
