# dev.UTS — Roberto Nájera's portfolio

Live: **https://ultimate-truth-seeker.github.io/dev.UTS/** · Bilingual (English / Español) · React 19 + TypeScript + Vite

## What's inside

| Feature | Where |
|---|---|
| ES / EN switch (default from the browser language, `?lang=es` / `?lang=en` to force) | `src/i18n/`, `src/components/ui/LangToggle.tsx` |
| Command palette (`Ctrl/⌘ + K`): sections, projects, demos, links, CV | `src/components/navigation/CommandPalette.tsx` |
| 14 projects with filters and case-study modals (media + technical details) | `src/data/projects.ts`, `src/components/sections/Projects.tsx`, `ProjectModal.tsx` |
| 3D laptop whose screen shows the selected project | `src/components/sections/LaptopScene.tsx`, `useScreenTexture.ts` |
| Lab: QuantDesk MCP console (browser port of the 7 quant-mcp tools + JSON-RPC trace) | `src/components/sections/demos/QuantDeskDemo.tsx`, `quantMetrics.ts`, `quantRouter.ts` |
| Lab: N-body with Web Workers and a speedup benchmark | `demos/NBodyDemo.tsx`, `nbodySim.ts`, `nbody.worker.ts` |
| Lab: LoRA vs full fine-tuning vs prompting chart | `demos/LoraChart.tsx` |
| Live GitHub activity (1 h cache, static fallback) | `src/components/sections/GitHubActivity.tsx` |

## Editing content

* **Texts, experience, awards, skills:** `src/data/content.ts` (every string has `en` and `es`).
* **Projects:** `src/data/projects.ts`. Add an object to the `raw` array; media files go in `public/media/`.
* **Links, email, CV switch:** `src/config.ts`. Set `cv.enabled` to `false` to hide every CV button.
* **CV PDFs:** `public/cv/Roberto_Najera_CV_{EN,ES}.pdf` (public versions, no phone number).
* **Particles background:** `src/components/layout/ParticlesBackground.tsx` is intentionally untouched.

## Honest notes about the demos

* The QuantDesk demo has **no LLM**: a small rule-based router replaces Claude. Prices are synthetic (geometric Brownian motion, seed 42, generated in the browser), so numbers differ from the Python run.
* The N-body demo uses message passing between Web Workers (no shared memory), so its speedups are not comparable with the OpenMP numbers in the case study; both are shown side by side on purpose.
* Projects with no screenshot show a generated cover (never a fake capture).

## Scripts

```bash
npm install
npm run dev       # http://localhost:5173/dev.UTS/
npm run build     # type-check + production build (writes stats.html, git-ignored)
npm run preview   # serve the build
npm run deploy    # publish dist/ to GitHub Pages (gh-pages branch)
```

---

## Español

Portafolio bilingüe de Roberto Nájera. El idioma se detecta por el navegador (inglés salvo que sea español) y se puede cambiar con el botón ES/EN o con `?lang=es`. Todo el contenido editable está en `src/data/` y `src/config.ts`; ver la tabla de arriba para cada función.
