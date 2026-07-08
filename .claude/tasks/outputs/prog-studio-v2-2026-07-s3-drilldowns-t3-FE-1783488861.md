# FE Output — prog-studio-v2-2026-07-s3-drilldowns-t3

Task: Edit-absorption "Revise this spec" action (action component only — no page assembly, no nav).
Contract: `.claude/tasks/outputs/prog-studio-v2-2026-07-s3-drilldowns-rev2-PM-1783488067.md` → `<task_packet>` t3.

## Files delivered

- `packages/client/src/components/detail/revise-spec-buffer.ts` (61 lines) — pure target-keyed reducer
- `packages/client/src/components/detail/__tests__/revise-spec-buffer.test.ts` (75 lines) — 6 vitest cases
- `packages/client/src/components/detail/ReviseSpecAction.tsx` (234 lines) — trigger + Dialog + editor + save wiring

## Design notes

**Load path (verified against EditPage.tsx, not invented):** `trpc.agent.get({name})` / `trpc.skill.get({name})` — same procedures and input shape EditPage uses. Query is `enabled: target.type-match && open` (fetches only once the dialog is actually opened, avoiding an eager network call the moment the host page mounts).

**Save path (verified against EditPage.tsx, not invented):** `trpc.agent.save.useMutation()` / `trpc.skill.save.useMutation()`. On save, the entire loaded `Agent`/`Skill` record (from `.get`) is spread and only `body` is overridden with the buffer's edited content — this guarantees no field is dropped from the exact shape `agent.save`/`skill.save` (server-validated `AgentSchema`/`SkillSchema`) expects, without duplicating EditPage's FrontmatterForm.

**Component is target-generic**, not agent-only: `ReviseSpecActionProps.target: { type: 'agent' | 'skill'; name: string }` — matches the PM packet's explicit "agent.save (and skill.save where a skill is edited)" language and EditPage's own `selectedFile` shape, keeping the component reusable wherever a "revise this spec" trigger is needed (t4a wires it for the selected agent; the packet leaves the door open for a future skill-editing call site without a redesign).

## Buffer-lifecycle design note — how contamination is structurally prevented

Implemented via the **reset-effect variant** explicitly authorized by the packet ("an effect that resets buffer state whenever the target changes"), not the remount-by-`key` variant, so the same component instance survives target changes without re-fetching the whole subtree.

- `revise-spec-buffer.ts` exports a pure `bufferReducer(state, action)` with three actions: `TARGET_CHANGED`, `CONTENT_LOADED`, `CONTENT_EDITED`. Every action carries a `key` (`type:name`).
- **`TARGET_CHANGED` unconditionally wipes content to `''`.** There is no code path in the reducer that copies `state.content` into the new state on a target change — contamination is not "guarded against by a check that might be wrong," it is **structurally impossible** because the old content is never referenced in that branch at all.
- **`CONTENT_LOADED` and `CONTENT_EDITED` both guard on `action.key === state.targetKey`** before applying. This closes the race where a slow `agent.get` for target A resolves *after* the user has already switched to target B (or a stray `onChange` fires in the same tick as a switch) — the stale/stray action is dropped, never merged into B's live buffer.
- In `ReviseSpecAction.tsx`, a `useEffect` keyed on `targetKey(target)` dispatches `TARGET_CHANGED` on every target change, **regardless of dialog open/closed state** — so the t5 regression scenario (open A, type, cancel/Escape, switch to B, open again) resets the buffer at the moment the target prop changes, not merely when the dialog next opens.
- Because the reducer is pure and framework-free, the exact A→B lifecycle (including the two race conditions above) is unit-tested in `revise-spec-buffer.test.ts` without any DOM/rendering — matching this repo's existing `.test.ts` convention (`vitest.config.ts` is `environment: 'node'`, glob excludes `.test.tsx`, no `@testing-library/react` dependency; see `PartyMemberCard.test.ts`/`ui-store.test.ts` for the precedent this follows).

## Focus/role explicitness note (s2 AA §6 G2, binding)

- `DialogContent` sets `role="dialog"` and `aria-modal="true"` **explicitly**. Investigated base-ui's `DialogPopup` source (`node_modules/@base-ui/react/dialog/popup/DialogPopup.js` + `dialog/store/DialogStore.js:84`): the internal `role` state already defaults to `'dialog'`, but **`aria-modal` is never emitted automatically anywhere in `@base-ui/react`** (confirmed via `grep -rl aria-modal node_modules/@base-ui/react/` — only `toast/root/ToastRoot.js` matches, not dialog). So `aria-modal="true"` here is not belt-and-suspenders — it is the only source of that attribute; omitting it would have shipped a dialog with no explicit modal announcement to assistive tech despite `modal={true}` being the internal *behavioral* default.
- `initialFocus={textareaRef}` — explicit ref to the editor textarea (not `true`/default, which per `DialogPopup.js:75-79` falls back to "first tabbable element or the popup itself" depending on interaction type). Focus lands on the actual editable content on open, deterministically, for both mouse and keyboard opens.
- `finalFocus={triggerRef}` — explicit ref back to the trigger button (not relying on base-ui's default `returnFocus: true`, which infers the triggering element). Verified via `DialogPopup.js:114-115` (`initialFocus`/`finalFocus` map directly to floating-ui-react's `FloatingFocusManager` `initialFocus`/`returnFocus` props) that both accept a `RefObject<HTMLElement | null>` — the types used here.
- No custom focus-trap/`querySelectorAll` function was authored (grep-confirmed: zero matches for `querySelectorAll|getFocusableElements|trapFocus` in `ReviseSpecAction.tsx`) — trapping is delegated entirely to base-ui's internal `FloatingFocusManager`, so the visibility-filter pre-flight for hand-rolled traps does not apply here.

## design_tokens_used

FF7 runtime CSS vars only, applied via explicit inline `style` (matching the established `EditPage.tsx`/`SaveAsNewDialog`/`PartyMemberCard.tsx` convention in this codebase — this app's Shadcn↔FF7 token collision was already fixed project-wide at the root-token-mapping level in `prog-studio-vision-2026-06-s1-token-root-fix`, but the packet binds explicit-per-surface tokening as defense in depth):
`--sfh`, `--sf`, `--bd`, `--bdb`, `--w`, `--wd`, `--wm`, `--mt`, `--mg`, `--redb`, `--void`, `--fb`, `--fh`, `--fm`, `--r`, `--rl`. No raw hex anywhere (grep-confirmed 0 matches).

## style_conflict_check

NONE — no inline `style="..."` string attributes used (all styling is `style={{...}}` object literals on elements with no competing Tailwind utility class for the same CSS property covered by the inline style; `buttonVariants(...)`'s className supplies non-overlapping utility classes — spacing/typography/variant chrome — while the inline style overrides only color/background/border/font-family tokens). No dynamic overflow/collapse-animation styling in this component.

## Constant/audit greps (verbatim, all files touched)

```
$ grep -n "#[0-9a-fA-F]\{6\}" ReviseSpecAction.tsx revise-spec-buffer.ts revise-spec-buffer.test.ts
(no matches)
$ grep -nE "<(span|div|li|a)[^>]*onClick=" ReviseSpecAction.tsx
(no matches)
$ grep -n "JSON\.parse" ReviseSpecAction.tsx
(no matches)
$ grep -n 'style="[^"]*\(overflow\|display\|position\|flex\|padding\|margin\|color\|background\|border\)' ReviseSpecAction.tsx
(no matches)
$ grep -n "querySelectorAll\|getFocusableElements\|trapFocus" ReviseSpecAction.tsx
(no matches)
```

## Verification — verbatim

### `npm run lint`
```
> lint
> tsc --noEmit --project packages/shared/tsconfig.json && tsc --noEmit --project packages/server/tsconfig.json && tsc --noEmit --project packages/client/tsconfig.json
```
Exit 0, no output — clean across all three packages. (One type error was hit and fixed during verification: `DialogTrigger`'s `ref` required `RefObject<HTMLButtonElement | null>`, not the broader `RefObject<HTMLElement | null>` — `triggerRef` was retyped `useRef<HTMLButtonElement>(null)`, which remains structurally compatible with `finalFocus`'s wider `RefObject<HTMLElement | null>` prop type.)

### `npm test -w @gander-studio/client`
```
> @gander-studio/client@0.1.0 test
> vitest run

 RUN  v4.1.7 /home/jhber/projects/gander-studio-alpha/packages/client

 Test Files  7 passed (7)
      Tests  43 passed (43)
   Duration  912ms (transform 359ms, setup 0ms, import 943ms, tests 69ms, environment 1ms)
```
The new `revise-spec-buffer.test.ts` contributed 6 of the 43 passing tests (verified individually via `--reporter=verbose`): targetKey stability, A→B switch wipes content, same-key TARGET_CHANGED no-op, stale CONTENT_LOADED dropped, stray CONTENT_EDITED dropped, isDirty tracking.

Port :3001 was not touched. No `git stash` / `git commit` run.

## SC-by-SC self-check (against t3's `<success_criteria>`)

- (a) Trigger opens Dialog with markdown editor pre-loaded via `agent.get`/`skill.get` (existing procedures, no new server code) — MET.
- (b) Save calls existing `agent.save`/`skill.save` mutation, verified signature/shape against `EditPage.tsx` (`AgentSchema`/`SkillSchema` spread + `body` override) — MET.
- (c) Editor buffer is target-keyed; switching target resets the buffer — structurally, via `bufferReducer`'s `TARGET_CHANGED` branch — MET, unit-tested.
- (d) Dialog sets focus/role EXPLICITLY (`initialFocus`, `finalFocus`, `role="dialog"`, `aria-modal="true"`), never base-ui defaults; Escape returns focus to trigger via explicit `finalFocus` ref — MET.
- (e) FF7 tokens only, no raw hex (grep-confirmed) — MET. Full WCAG-ratio computation is out of this component's scope per the standing project delegation to auditor SA static contrast checks (t5/SC4 note); tokens reused here are pre-verified AA/AAA pairs already in use by `EditPage.tsx`/`SaveAsNewDialog` (`--w`/`--wd`/`--wm` on `--sf`/`--sfh`, `--mt` on `--void`, `--redb` on `--void` — DEFERRED-006-resolved).
- (f) `npm run lint` clean ×3 — MET (verbatim above).

## must_not_contain check

- No new/modified server procedure or Zod schema — confirmed, zero touches to `packages/server` or `packages/shared`.
- No `useEditStore` reuse — confirmed, `ReviseSpecAction.tsx` imports no store module; its own `revise-spec-buffer.ts` reducer is the only state mechanism.
- No base-ui default focus reliance — confirmed, `initialFocus`/`finalFocus`/`role`/`aria-modal` all explicit.
- No raw hex values — confirmed via grep.

## integration_status

SUCCESS — reuses live `agent.get`/`agent.save`/`skill.get`/`skill.save` tRPC procedures verbatim (no mocking); no server/schema changes made or required.
