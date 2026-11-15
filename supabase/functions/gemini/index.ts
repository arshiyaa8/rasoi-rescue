// Supabase Edge Function: a small server that forwards requests to Gemini.
// The Gemini key lives here as a secret, so it is never sent to the browser.
//
// Deploy:
//   supabase secrets set GEMINI_API_KEY=your_key
//   supabase functions deploy gemini
// Then set VITE_USE_EDGE_FUNCTION=true in .env

const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json(); // { contents, generationConfig } built by the app
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': Deno.env.get('GEMINI_API_KEY')! },
        body: JSON.stringify({ contents: body.contents, generationConfig: body.generationConfig }),
      },
    );
    const data = await res.text();
    return new Response(data, { status: res.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
