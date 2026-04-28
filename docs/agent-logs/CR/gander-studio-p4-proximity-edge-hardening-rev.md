# CR#2 Re-review Log — gander-studio-p4-proximity-edge-hardening (round 2)

## Stage 1: RECEIVED
- Task: re-review PM#2's revised plan after CR#1 BLOCK
- Prior critique: 2 BLOCKERs + 3 WARNINGs
- Cap: 2 of 2; if BLOCK again, escalate to human

## Stage 2: PLAN
Verifications:
1. BLOCKER 1 (A1 selector at lines ~99 and ~154)
2. BLOCKER 2 (A6 line 11 vs 12)
3. WARNING 1 (oscillator counter reset)
4. WARNING 2 (addInitScript prose)
5. WARNING 3 (A5 inline literals)
6. New fact errors
7. Coverage of all 7 advisories preserved

## Stage 2 Checkpoints

### BLOCKER 1 — RESOLVED
PM#2 description explicitly mandates fix at sites 1-4 (lines ~99-103, ~119-125, ~155-159, ~172-176) using Agents-section h3 landmark. SC#8 grep -c 'palette-item-agent-' = 0. Out-of-scope, must_not_contain, and risk_flags all corroborate. RESOLVED.

### BLOCKER 2 — RESOLVED
constants/compose.ts confirmed: line 7 = `META_AGENTS as COMMAND_AGENTS,`, line 11 = `META_AGENTS,`, line 12 = `META_FRAGMENTS,`. PM#2 description, SC#6, must_not_contain, and risk_flags all reference line 11 correctly. RESOLVED.

### WARNING 1 — NEW BLOCKER FOUND (PARTIAL/INCORRECT FIX)
PM implemented option (b) — reset counter post-unlock, pre-drag, assert `=== 2`.

Mechanics:
- handleCanvasMouseDown (line 851-859): playApproach → stopApproach. After unlock click, before reset, counter is at +1.
- Counter reset: 0.
- During drag: as the dragged node crosses within CANVAS_PROXIMITY_THRESHOLD_PX, handleNodesChange line 773-805 fires playApproach (line 804) → +1 oscillator.
- On drop (dragging:false, line 819): stopApproach (line 824) — does NOT create new oscillators but schedules stop on the existing one. Then addEdgeWithEffects → playLink → +2 oscillators.
- Final counter: 0 + 1 (approach during drag) + 2 (link) = **3**, not 2.

PM acknowledged in risk_flags: "if playApproach fires during the drag BEFORE the edge commit, its 1 oscillator would make the count 3 (not 2)". But this isn't a risk — it's the deterministic production flow. Proximity-enter IS the trigger sequence for both sounds. The `=== 2` assertion will fail every CI run.

The CR#1 option (b) recipe was wrong because CR#1 missed the proximity-enter playApproach. The actual fix is either option (a) — instrument playLink directly with a dedicated counter — OR change the assertion to `=== 3` with a comment, OR `>= 2 && oscCount % 2 === 0 ? false : ...` is too brittle. Cleanest: option (a).

### WARNING 2 — RESOLVED
PM#2 added rationale at A4: "addInitScript injects the proxy into the page's main world before any user JS runs, including before the first ensureAudioContext() call inside handleCanvasMouseDown" — verbatim from CR#1 recommendation. RESOLVED.

### WARNING 3 — DEFERRED (acceptable)
PM#2 explicitly deferred per CR#1's "PM's call". RESOLVED as deferral.

### File path / fact verification
- MateriaCanvas.tsx line 25: `import type { AgentRole }` already imported ✓ (PM's "do not duplicate" is correct)
- MateriaCanvas.tsx line 592: `boxShadow: \`inset 3px 0 0 ${getMateriaColor(...)}\`` confirmed in 2-arg form ✓
- MateriaNode.tsx lines 42-55: HANDLE_STYLE 9-property object confirmed ✓
- CardNode.tsx lines 17-27: CARD_HANDLE_STYLE 9-property object confirmed; byte-identical to MateriaNode ✓
- useLinkSound.ts: playLink creates exactly 2 oscillators (line 154 + 180); playApproach creates 1 (line 77) ✓

### 7 advisories coverage
All 7 (A1-A7) covered: A1+A2+A3+A4 in FE-001; A5+A6+A7 in FE-002. None dropped.

### FE-001/FE-002 parallel-safety
FE-001 touches only materia-canvas.spec.ts; FE-002 touches MateriaNode.tsx, CardNode.tsx, constants/compose.ts, MateriaCanvas.tsx, and creates handle-style.ts. Disjoint file sets. Safe.

## Stage 3: COMPLETE
Verdict: CRITIQUE_BLOCK with 1 NEW BLOCKER on A4 (oscillator counter) — must escalate per round-2 cap.

Output written to:
.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-CR-rev-1777339583.md
