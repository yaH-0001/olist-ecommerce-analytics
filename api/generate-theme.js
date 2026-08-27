// api/generate-theme.js
//
// Deploy target: Vercel (or adapt for Netlify Functions / Cloudflare Workers —
// see notes at the bottom). This is the ONLY place your Anthropic API key
// should ever live. Never put it in index.html or any front-end file.
//
// Setup:
//   1. Deploy this project to Vercel (vercel.com — free tier is fine).
//   2. In your Vercel project settings, add an Environment Variable:
//        ANTHROPIC_API_KEY = sk-ant-xxxxxxxx
//   3. Vercel automatically turns anything in /api into a serverless
//      function at /api/generate-theme — no extra config needed.
//
// The front end (index.html) POSTs { season: "monsoon" } here and expects
// back a JSON object with: name, bg, surface, surface2, primary, secondary,
// tertiary, text, muted (all hex colors). If anything goes wrong, index.html
// already falls back to its local curated palette, so this endpoint is safe
// to leave undeployed while you're just trying the site out.

const SEASON_VIBES = {
  winter:  "a crisp North Indian winter: cold clear mornings, frost-blue light, quiet cities",
  spring:  "Indian spring (March-April): mustard fields, fresh green shoots, warming light",
  summer:  "peak North Indian summer (May-June): dry heat, dust, harsh amber sun",
  monsoon: "the Delhi monsoon (July-September): rain-heavy skies, wet asphalt, cool grey-teal light",
  autumn:  "Indian post-monsoon/autumn (October-November): golden harvest light, festival season, clear skies",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set in this deployment's environment variables." });
  }

  const season = (req.body && req.body.season) || "monsoon";
  const vibe = SEASON_VIBES[season] || SEASON_VIBES.monsoon;

  const prompt = `You are a color palette designer for a dark-mode data-analytics portfolio site.
Generate ONE cohesive dark color palette evoking: ${vibe}.

Return ONLY a raw JSON object, no markdown fences, no commentary, in exactly this shape:
{
  "name": "short evocative 1-3 word palette name",
  "bg": "#hex",
  "surface": "#hex",
  "surface2": "#hex",
  "primary": "#hex",
  "secondary": "#hex",
  "tertiary": "#hex",
  "text": "#hex",
  "muted": "#hex"
}

Constraints:
- "bg" must be a very dark, low-saturation color (site background), luminance roughly 6-12%.
- "surface" and "surface2" are slightly lighter panel colors built from "bg".
- "primary", "secondary", "tertiary" are vivid accent colors, distinct from each other, with strong contrast against "bg" (this is a data dashboard — accents mark charts and alerts).
- "text" must be near-white / high contrast against "bg" (WCAG AA at minimum).
- "muted" is a mid-gray-toned secondary text color, readable but subdued against "bg".
- All 8 values must be valid 6-digit hex codes.`;

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(502).json({ error: "Anthropic API error", detail: errText });
    }

    const data = await anthropicRes.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    if (!textBlock) return res.status(502).json({ error: "No text in Claude response" });

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const palette = JSON.parse(cleaned);

    const hex = /^#([0-9A-Fa-f]{6})$/;
    const keys = ["bg", "surface", "surface2", "primary", "secondary", "tertiary", "text", "muted"];
    for (const k of keys) {
      if (!palette[k] || !hex.test(palette[k])) {
        return res.status(502).json({ error: `Invalid or missing color for "${k}"` });
      }
    }

    return res.status(200).json(palette);
  } catch (err) {
    return res.status(500).json({ error: "Unexpected error", detail: String(err) });
  }
}

// --- Adapting to other platforms ---
// Netlify: rename to netlify/functions/generate-theme.js, wrap in
//   exports.handler = async (event) => { ... JSON.parse(event.body) ... }
//   and return { statusCode, body: JSON.stringify(...) } instead of res.status().
// Cloudflare Workers: rewrite as an `export default { fetch(request, env) {...} }`
//   module and read the key from `env.ANTHROPIC_API_KEY`.
