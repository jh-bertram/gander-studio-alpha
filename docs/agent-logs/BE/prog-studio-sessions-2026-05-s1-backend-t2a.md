## [STAGE 1] RECEIVED
- **From:** Orchestrator
- **At:** 2026-05-20T17:52:14Z
- **Task ID:** prog-studio-sessions-2026-05-s1-backend-t2a
- **Message received:**
  > You are implementing task packet **t2a** of sprint `prog-studio-sessions-2026-05-s1-backend`. The plan is Critic-approved (rev2). t1 (schemas) is already committed. Follow the `agent-log` protocol and return a `<completion_packet>` XML block.
  >
  > ## Task: Configure vitest for the server package (config-only — 3 changes)
  >
  > 1. **Verify** vitest is already in devDependencies of `packages/server/package.json`. The Orchestrator pre-installed it (`vitest ^4.1.7` confirmed present). This is a VERIFICATION step only — **do NOT run `npm install`**. If vitest is NOT found, **halt immediately and surface** — do NOT retry install silently, do NOT proceed to steps 2/3.
  >
  > 2. Add a `"test"` script to `packages/server/package.json`: `"test": "vitest run src/parsers/__tests__"`
  >
  > 3. Create `packages/server/vitest.config.ts` — minimal configuration. Read the existing `packages/server/package.json` and `packages/server/tsconfig.json` first to ensure the config is compatible (e.g., ESM/CJS, test root). Keep it minimal (~10 lines).
  > …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-05-20T17:52:30Z
- **Approach:**
  1. VERIFIED: `vitest ^4.1.7` is present in `packages/server/package.json` devDependencies — proceeding.
  2. Add `"test": "vitest run src/parsers/__tests__"` to the `"scripts"` block in `packages/server/package.json`.
  3. Create `packages/server/vitest.config.ts` using `defineConfig` from `vitest/config`. Package is ESM (`"type": "module"`), `moduleResolution: "bundler"`, `module: "ESNext"`. Config will use `pool: "forks"` (safe for ESM), set `testMatch` to the `src/parsers/__tests__` dir.
  4. Run `tsc --noEmit --project packages/server/tsconfig.json` to verify SC4. Note: `tsconfig.json` includes only `src/` — vitest.config.ts lives at package root. It will NOT be checked by the project tsconfig. This means SC4 runs cleanly.
- **Files to create/modify:**
  - `packages/server/package.json` → add "test" script
  - `packages/server/vitest.config.ts` → create minimal vitest config
- **Dependencies / assumptions:**
  - vitest pre-installed (confirmed)
  - No npm install needed
  - tsconfig `include: ["src"]` means vitest.config.ts is outside the TypeScript project scope — tsc will not flag it

### Checkpoint — 17:52:35
- Modified `packages/server/package.json` (30 lines). Added "test" script. Next: create vitest.config.ts.

### Checkpoint — 17:52:40
- Wrote `packages/server/vitest.config.ts` (8 lines). Next: run success criteria checks.

## [STAGE 3] COMPLETE
- **At:** 2026-05-20T17:52:63Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/server/package.json` | 31 | Added "test" script |
| `packages/server/vitest.config.ts` | 8 | Created minimal vitest config |

- **Lint / tests:** `tsc --noEmit --project packages/server/tsconfig.json` → exit 0. All 4 SC checks pass.
- **npm install:** NOT run. Pre-installed by ORC confirmed.
- **Open items:** None. t2b (test files) is the next dependency.
