<research_dossier task_id="gander-studio-p1-materia-canvas-RA">

  <verdict>CONDITIONAL</verdict>

  <install_command>npm install @xyflow/react</install_command>

  <css_import>import '@xyflow/react/dist/style.css';</css_import>

  <react19_notes>
## React 19 Compatibility — Full Notes

### peerDependencies (verified from npm registry)

`@xyflow/react@12.10.1` (latest as of 2026-03-16) declares:

```json
"peerDependencies": {
  "react": ">=17",
  "react-dom": ">=17"
}
```

Source: https://registry.npmjs.org/@xyflow/react/12.10.1

React 19 satisfies `>=17`, so the peerDependency range is formally met.

### The Historical Conflict (now resolved)

`@xyflow/react` depends on `zustand@^4.4.0`. Prior to zustand 4.5.6, that package depended on `use-sync-external-store` at a version that declared `react@^16 || ^17 || ^18` — explicitly excluding React 19 — which caused npm to emit peer dependency errors when installing `@xyflow/react` into a React 19 project.

Three GitHub issues document this:
- https://github.com/xyflow/xyflow/issues/5229 — "React 19 not supported"
- https://github.com/xyflow/xyflow/issues/4893 — "Conflict dependency React 19"
- https://github.com/xyflow/xyflow/issues/5095 — "zustand dependency version needs to be bumped to support React 19"

All three issues are **closed as resolved**. The xyflow maintainer confirmed (in issues #4893 and #5229) that zustand 4.5.6 fixed the `use-sync-external-store` peer dependency chain, and that reinstalling node_modules after that zustand release resolves the peer errors.

### Current Status

Because `@xyflow/react` specifies `zustand@^4.4.0`, npm's semver resolution will install the latest compatible 4.x.x release — which is currently 4.5.6 or later. This means a fresh `npm install` in a new project will pull the fixed zustand version automatically. No `--legacy-peer-deps` flag is needed.

**Condition on which CONDITIONAL is declared:** If the project already has a locked `node_modules` or `package-lock.json` that pins zustand to an older 4.x.x below 4.5.6 (unlikely in a fresh project, but possible after a previous install), the transitive peer conflict will re-appear. The fix is `npm update zustand` or a clean reinstall.

The xyflow team explicitly chose NOT to upgrade to zustand v5 (which would also fully resolve the issue) because v5 drops React 17 support, and they want to maintain that range. This means the zustand 4.x constraint is intentional.

### React Flow UI Components and React 19

The xyflow team additionally published a blog post on 2025-10-28 confirming their React Flow UI component library (the higher-level building-block components) was updated for React 19 and Tailwind CSS 4 compatibility:
https://reactflow.dev/whats-new/2025-10-28

This confirms the xyflow team actively supports React 19.
  </react19_notes>

  <css_import_detail>
## CSS Import — Detailed Notes

The official documentation specifies a single required import:

```js
import '@xyflow/react/dist/style.css';
```

Source: https://reactflow.dev/learn/getting-started/installation-and-requirements

This import **can be placed at the top of any component file** — it does not need to go in `globals.css`. Placing it in a component file (e.g., `MateriaCavasPage.tsx`) is a valid pattern and will cause the styles to be included in the JS bundle chunk for that page when using Vite's code splitting.

An alternative minimal import exists for base layout only (no default node/edge styles):

```js
import '@xyflow/react/dist/base.css';
```

### Tailwind CSS 4 Caveat (does not apply to this project)

If using Tailwind CSS 4 (this project uses Tailwind CSS 3 per CLAUDE.md), the CSS import must move to `globals.css` as a CSS `@import` rather than a JS import. This project uses Tailwind 3, so the standard JS import in a component file works correctly.
  </css_import_detail>

  <alternative>
NOT REQUIRED — package is CONDITIONAL (compatible with workaround awareness). If a future version of @xyflow/react becomes incompatible, the following alternatives are viable for a React 19 + TypeScript drag-and-drop node canvas:

1. **`@dnd-kit/core`** — Lightweight, React 19 compatible, full TypeScript support. Would require building node canvas layout manually; no built-in edge/connection rendering.
   https://dndkit.com/

2. **Plain SVG + pointer events** — Zero dependency. Implement drag via onPointerDown/onPointerMove/onPointerUp on SVG elements. Suitable if the canvas is simple with no edge routing needed.

3. **`reactflow` v11** (the legacy package) — React 18 max, not forward-compatible with React 19. Not recommended.

4. **`@vue-flow/core`** — Vue only, not applicable.
  </alternative>

  <security_notes>
## Security Advisories

No security advisories exist for `@xyflow/react` or any xyflow package in the GitHub Advisory Database as of 2026-03-16.

Source (0 results): https://github.com/advisories?query=xyflow

The security search results for `@xyflow/react npm audit 2025` returned only React Server Components vulnerabilities (CVE-2025-55182, CVE-2025-66478) which affect Next.js RSC and `react-router` — **not** `@xyflow/react`. These CVEs are irrelevant to this package.

The project's CLAUDE.md already documents the known audit finding: 4 high severity vulns in `serialize-javascript` via `workbox-build` — these are build-time only and unrelated to `@xyflow/react`.

No action required on security grounds for this installation.
  </security_notes>

  <sources>
1. npm registry — @xyflow/react@12.10.1 (peerDependencies, dependencies, version):
   https://registry.npmjs.org/@xyflow/react/latest

2. npm registry — exact 12.10.1 release metadata:
   https://registry.npmjs.org/@xyflow/react/12.10.1

3. GitHub Issue #5229 — "React 19 not supported" (closed/resolved):
   https://github.com/xyflow/xyflow/issues/5229

4. GitHub Issue #4893 — "Conflict dependency React 19" (closed/resolved):
   https://github.com/xyflow/xyflow/issues/4893

5. GitHub Issue #5095 — "zustand dependency version needs to be bumped to support React 19" (closed/resolved):
   https://github.com/xyflow/xyflow/issues/5095

6. React Flow Installation and Requirements docs (CSS import):
   https://reactflow.dev/learn/getting-started/installation-and-requirements

7. React Flow "What's New" — React 19 + Tailwind 4 UI components update (2025-10-28):
   https://reactflow.dev/whats-new/2025-10-28

8. GitHub Advisory Database — search for "xyflow" (0 results):
   https://github.com/advisories?query=xyflow

9. xyflow GitHub repository:
   https://github.com/xyflow/xyflow
  </sources>

</research_dossier>
