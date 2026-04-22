<project_conventions>
  <package_manager>npm</package_manager>
  <language>TypeScript</language>
  <typescript_strict>true</typescript_strict>
  <test_runner>playwright</test_runner>
  <test_command>npx playwright test (from packages/client — no root-level test script)</test_command>
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
    - Test runner is Playwright (packages/client/playwright.config.ts), test dir: packages/client/tests/e2e. No vitest/jest found.
    - Client unit tests in packages/client/src/tests/ use an undetected runner (likely vitest given Vite stack — not confirmed by config file).
    - tsconfig.base.json sets strict:true, target:ES2022, module:ESNext, moduleResolution:bundler.
    - Client port: 5173 (Vite). Server port: 3001.
    - PWA enabled via vite-plugin-pwa.
    - Key client deps: React 19, @xyflow/react ^12, Zustand ^5, tRPC 11, Tailwind 3, Shadcn/ui, Lucide React.
  </notes>
</project_conventions>
