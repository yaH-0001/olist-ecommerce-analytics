# Ankit Saini — Portfolio

A self-theming portfolio site. The palette shifts by Indian season (Winter,
Spring, Summer, Monsoon, Post-Monsoon) automatically based on today's date,
with an optional "Regenerate" button that asks Claude to design a live
variant.

## Files

```
index.html            → the entire site (structure + styles + logic, no build step)
api/generate-theme.js  → serverless function for live AI palette generation
README.md              → this file
```

## 1. See it locally, right now

Just open `index.html` in a browser. Everything works except the "Regenerate"
button, which will show a friendly toast and fall back to the curated local
palette — that's expected until you deploy the API function (step 3).

## 2. Fill in your real links

Open `index.html`, find the `CONFIG` object near the bottom (search for
`EDIT-ME CONFIG`), and set:

```js
const CONFIG = {
  githubUrl:    "https://github.com/yourname/olist-ecommerce-analytics",
  dashboardUrl: "https://app.powerbi.com/view?r=your-report-id",
  linkedinUrl:  "https://linkedin.com/in/yourname",
  email:        "you@example.com"
};
```

Every button and contact link on the page pulls from this one place.

## 3. Publish it

**Easiest — GitHub Pages (site works, AI theming stays on local fallback):**
1. Create a new GitHub repo, e.g. `portfolio`.
2. Push `index.html` (and optionally this README) to it.
3. In the repo settings → Pages, set the source to your main branch.
4. Your site is live at `https://yourname.github.io/portfolio`.

**Full version with live AI theming — Vercel (free tier):**
1. Push this whole folder (including `api/generate-theme.js`) to a GitHub repo.
2. Go to vercel.com → New Project → import that repo. No build settings needed.
3. In the project's Settings → Environment Variables, add:
   `ANTHROPIC_API_KEY = sk-ant-...` (get one from console.anthropic.com).
4. Deploy. Vercel automatically serves `api/generate-theme.js` at
   `/api/generate-theme` — the front end already calls that exact path.
5. Click the season badge in the top-right of your live site — it will now
   ask Claude for a fresh palette instead of falling back.

Netlify and Cloudflare Pages work too; see the comments at the bottom of
`api/generate-theme.js` for the small adaptation each one needs.

## 4. Add your next case study

Duplicate one of the two dashed "Coming soon" cards in the "More case
studies" section of `index.html` and turn it into a real project card —
copy the structure of the "Featured case study" section above it (pipeline
eyebrow, `.project-card`, `.mini-stats`, tool tags, CTA row) and swap in the
new project's content.

## Notes on the design

- Palette logic lives in `SEASON_PALETTES` in the `<script>` block — five
  hand-picked sets (Winter/Spring/Summer/Monsoon/Post-Monsoon), matched to
  Indian meteorological seasons rather than the generic four-season model.
- The hero's "Order Pulse" line is illustrative, not live data — swap the
  SVG path coordinates for a real query result whenever you want it to
  reflect actual order-volume trends.
- Respects `prefers-reduced-motion` and uses visible keyboard focus states
  throughout.
