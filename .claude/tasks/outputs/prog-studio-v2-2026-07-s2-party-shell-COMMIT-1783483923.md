<commit_record schema_version="2.0">
  <task_id>prog-studio-v2-2026-07-s2-party-shell</task_id>
  <generated>2026-07-08T04:12:03+00:00</generated>
  <provenance_marker>commit-packet@2.0.0</provenance_marker>
  <inputs>
    <audit_verdicts note="8 PASS verdicts: t1..t6 + t3-rem + t5-reaudit (t5's original AUD#5 FAIL superseded by the family re-audit)">.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-t*-AUD-*.md</audit_verdicts>
    <reqval>.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-REQVAL-1783483508.md (COVERED 15/15, requires_human_visual)</reqval>
  </inputs>
  <branch_type>two-commit</branch_type>
  <preflight_checks>
    <secret_pattern_grep>CLEAN</secret_pattern_grep>
    <pre_stage_scope_check>PASS (per-packet scoped adds across 7 durability commits)</pre_stage_scope_check>
  </preflight_checks>
  <commits>
    <commit><sha>7359da517a5e6f81c1ca71f7c51a2c3984578ef3</sha><subject>feat(v2-shell): selectedAgentCode store + RAIL_ITEMS</subject><trailers><task>prog-studio-v2-2026-07-s2-party-shell-t1</task><audit>PASS</audit></trailers></commit>
    <commit><sha>b9dffa98b5cb98dce1dad78292b76d2e2c86cbfa</sha><subject>feat(v2-shell): PortraitFrame, StatBar, materiaTint</subject><trailers><task>prog-studio-v2-2026-07-s2-party-shell-t2</task><audit>PASS</audit></trailers></commit>
    <commit><sha>82c24000b9ef39f1df759781c8e0f98810f4b9fc</sha><subject>feat(v2-shell): PartyMemberCard + SubmenuRail (+ vitest alias infra fix)</subject><trailers><task>prog-studio-v2-2026-07-s2-party-shell-t3</task><audit>PASS</audit></trailers></commit>
    <commit><sha>2c23c7e282f307ac6301f70cbb0da004a5eefa36</sha><subject>feat(v2-shell): PartyPage + useParty</subject><trailers><task>prog-studio-v2-2026-07-s2-party-shell-t4</task><audit>PASS</audit></trailers></commit>
    <commit><sha>87dc529b953cc074bee6cb418465ab25d64e46ee</sha><subject>fix(v2-shell): card keyboard focus stabilization</subject><trailers><task>prog-studio-v2-2026-07-s2-party-shell-t3-rem</task><audit>PASS</audit></trailers></commit>
    <commit><sha>3a6a2772bd999d5bc5c9d77802fb8317f9a71b8c</sha><subject>feat(v2-shell): party default route + code-splitting (t5+rem1+rem2)</subject><trailers><task>prog-studio-v2-2026-07-s2-party-shell-t5</task><audit>PASS (AUD#7 family re-audit after AUD#5 FAIL)</audit></trailers></commit>
    <commit><sha>dbc4b87d46bab8ad64c9b7b02cb571f71d475edf</sha><subject>test(v2-shell): Tier-2 e2e gate</subject><trailers><task>prog-studio-v2-2026-07-s2-party-shell-t6</task><audit>PASS</audit></trailers></commit>
  </commits>
</commit_record>
