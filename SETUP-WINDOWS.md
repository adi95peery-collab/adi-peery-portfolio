# Setup on Windows

Steps to get the project running on a Windows PC after unzipping the archive.

## 1. Prerequisites

- **Node.js 22 LTS** — install from https://nodejs.org (the project was built on
  Node 22.17). This includes `npm`.
- **A terminal** — Windows PowerShell or Windows Terminal.
- **VS Code** (recommended) with the Astro extension.
- **Claude Code** (if you'll keep using it) — https://claude.com/claude-code
- *(optional)* **Git** — https://git-scm.com if you want version history.

## 2. Unzip & install

Unzip the archive somewhere without spaces if possible, e.g.
`C:\Users\<you>\adi-peery-portfolio`. Then in PowerShell:

```powershell
cd C:\Users\<you>\adi-peery-portfolio
npm install
npx playwright install chromium   # only needed to run the visual harness
```

`node_modules/` was intentionally excluded from the zip — `npm install` rebuilds it
from `package-lock.json` (this also restores the self-hosted fonts: Inter, Lexend,
Geist).

## 3. Run it

```powershell
npm run dev            # dev server → http://localhost:4321
npm run build          # production static build → .\dist
npm run preview        # serve the built .\dist
npm run test:visual    # build + pixel-diff every page vs Figma goldens
```

All npm scripts are cross-platform. The site will look identical on Windows: the
case-study font stack (`--font-sf`) is **Geist-first**, so Windows renders the same
Geist as macOS (the `-apple-system` fallback only matters on Apple devices).

## 4. Deploy (static)

`npm run build` outputs `.\dist` — drag-drop to Netlify, or connect to Cloudflare
Pages / GitHub Pages (build command `npm run build`, output dir `dist`). Set the real
domain first in `astro.config.mjs`, `public\robots.txt`, `public\sitemap.xml`.

## 5. Reconnect the Figma MCP (to keep editing from the design)

In Claude Code:

```powershell
claude plugin install figma@claude-plugins-official
# — or —
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

Then in a Claude session type `/mcp` → select **figma** → **Authenticate** →
**Allow Access**. Figma file key is in `HANDOFF.md` (`DyF8mmxLD9LMgEXvaME6qS`).

## 6. (Optional) Restore Claude memory so it auto-loads

The durable project notes are in `.handoff\memory\`. To have Claude Code auto-load
them in future sessions:

1. Open Claude Code **in the project folder** once (`cd` there, run `claude`) — this
   creates `C:\Users\<you>\.claude\projects\<encoded-path>\`.
2. Copy `.handoff\memory\MEMORY.md` and `.handoff\memory\adi-peery-portfolio-figma-to-web.md`
   into that new `...\<encoded-path>\memory\` folder (create `memory` if missing).
3. Restart the session.

If that's fiddly, don't worry: keeping **`HANDOFF.md`** in the repo is enough — tell
a new Claude session to read it and it will have full context.

## 7. What's in `.handoff\`

- `session-transcript.jsonl` — the raw transcript of the whole build conversation
  (reference only; won't auto-resume across machines).
- `memory\` — the two Claude memory notes.
- `tool-results\` — large Figma metadata / design-context dumps captured during the
  build (useful raw structure; optional).

## Windows notes / gotchas

- The `lsof` / `kill` commands you may see in the old transcript are macOS-only dev
  helpers — not part of the project. On Windows, if port 4321 is stuck, use
  `npx kill-port 4321` or close the terminal.
- Keep the folder path free of unusual characters; long Windows paths can trip some
  tools.
- If `npm install` warns about optional native deps, it's safe to ignore (the
  project uses no native modules at build time).
