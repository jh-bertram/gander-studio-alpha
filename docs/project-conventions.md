<!-- Re-detected 2026-07-07 (sprint gander-studio-p11-v2-vision). Diff vs 2026-05-25 block:
     test_runner was "playwright" with vitest "not confirmed by config file" — vitest is NOW CONFIRMED
     as the unit-test runner via package.json test scripts in BOTH client ("vitest run") and server
     ("vitest run src/parsers/__tests__", 9+ test files present). Playwright remains the e2e runner
     (packages/client/tests/e2e). All other fields unchanged.
     Layout stamp: npm-workspaces monorepo, entry = packages/{shared,server,client}, client entry
     packages/client/src/main.tsx, no root src/. -->
<project_conventions>
  <package_manager>npm</package_manager>
  <language>TypeScript</language>
  <typescript_strict>true</typescript_strict>
  <test_runner>vitest (unit — client + server) + playwright (e2e — packages/client/tests/e2e)</test_runner>
  <test_command>npm test -w @gander-studio/server (vitest run src/parsers/__tests__); npm test -w @gander-studio/client (vitest run); npx playwright test (e2e, from packages/client)</test_command>
  <lint_command>tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json</lint_command>
  <typecheck_command>same as lint_command (lint IS typecheck — no separate eslint config found)</typecheck_command>
  <build_command>npm run build -w @gander-studio/client (runs tsc && vite build)</build_command>
  <dev_command>node --env-file=.env ./node_modules/.bin/concurrently "npm run dev -w @gander-studio/server" "npm run dev -w @gander-studio/client"</dev_command>
  <build_system>vite</build_system>
  <monorepo>true</monorepo>
  <monorepo_tool>npm workspaces</monorepo_tool>
  <workspaces>
    <workspace name="@gander-studio/shared" path="packages/shared" />
    <workspace name="@gander-studio/server" path="packages/server" />
    <workspace name="@gander-studio/client" path="packages/client" />
  </workspaces>
  <key_directories>
    <dir>packages/</dir>
    <dir>docs/</dir>
    <dir>node_modules/</dir>
  </key_directories>
  <all_scripts>
    <script name="dev">node --env-file=.env ./node_modules/.bin/concurrently "npm run dev -w @gander-studio/server" "npm run dev -w @gander-studio/client"</script>
    <script name="build">npm run build -w @gander-studio/client</script>
    <script name="lint">tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json</script>
  </all_scripts>
  <notes>
    - No eslint or prettier config found. "lint" is typecheck-only via tsc --noEmit across all three packages.
    - Unit tests: vitest, confirmed by workspace test scripts (server: src/parsers/__tests__ with 9+ suites incl. security + seam tests; client: vitest run). E2e: Playwright (packages/client/playwright.config.ts, tests/e2e).
    - tsconfig.base.json sets strict:true, target:ES2022, module:ESNext, moduleResolution:bundler.
    - Client port: 5173 (Vite). Server port: 3001. Server requires GANDER_ROOT + LOADOUTS_DIR env vars.
    - PWA enabled via vite-plugin-pwa.
    - Key client deps: React 19, @xyflow/react ^12, Zustand ^5, tRPC 11, Tailwind 3, Shadcn/ui, Lucide React.
    - Design system: DESIGN.md at repo root (30KB, updated 2026-07-02) + FF7 Remake Intergrade tokens in packages/client/src/globals.css.
  </notes>
</project_conventions>
