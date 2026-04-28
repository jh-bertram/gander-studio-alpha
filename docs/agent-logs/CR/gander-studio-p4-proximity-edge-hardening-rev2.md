# CR#3 — gander-studio-p4-proximity-edge-hardening (rev2, A4 narrow re-verify)

## Stage 1: RECEIVED
- ts: 2026-04-27
- task: Re-verify A4 only after PM#3's narrow revision
- scope: A4 + spot-check unchanged sections (A1, A2, A3, A5, A6, A7, FE-002)
- round: 3 (human-authorized; protocol cap is 2)

## Stage 2: PLAN
Files to read:
1. PM#3 output: `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-PM-rev2-1777340068.md`
2. PM#2 output (for diff): `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-PM-rev-1777339...` (search)
3. CR#2 critique: `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-CR-rev-1777339583.md`
4. `packages/client/src/hooks/useLinkSound.ts` — confirm freq.setValueAtTime call sites
5. `packages/client/src/constants/canvas.ts` — confirm constants 220/880/1320

A4 checks (1-5) + spot-check unchanged (6).
