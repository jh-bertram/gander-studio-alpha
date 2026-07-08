# Archivist Correction — prog-studio-v2-2026-07-s2-party-shell-gap

**Task ID:** prog-studio-v2-2026-07-s2-party-shell-gap
**Agent:** AR#2 (Archivist, correction pass)
**Timestamp:** 2026-07-08T04:15:26Z
**Target:** `docs/project_log.md` lines 2424–2522 (AR#1 entry)

---

## Status: COMPLETE

Archive correction addendum appended to `docs/project_log.md` at lines 2524–2609 (append-only, after original entry's closing tag).

**First line of addendum:**
```
<archive_correction ref="prog-studio-v2-2026-07-s2-party-shell">
```

---

## Corrections Verified and Appended (6 factual errors)

### 1. Commit count error (Line 2444)
- **Error:** "Commits (5 total)" followed by 7 enumerated items
- **Correction:** EIGHT commits total (7 durability + 1 ceremony)
- **Evidence:** commit_record lines 14–22 (all 7 durability commits with shas); ceremony 0a0536e separate

### 2a. Ceremony commit misdescription — code folding (Line 2463)
- **Error:** 0a0536e described as "stitching t1–t4 + remediation rounds"
- **Correction:** 0a0536e is coordination staging only (zero code); remediation code is in 87dc529 (t3-rem) and 3a6a277 (t5)
- **Evidence:** after-action §6 G5 explicit statement; commit_record classifications

### 2b. Ceremony commit misdescription — parent program confusion (Line 2438)
- **Error:** Cites 0a0536e as parent program ceremony
- **Correction:** Parent program ceremony is 290de04 (separate commit); 0a0536e is this sprint's ceremony
- **Evidence:** after-action line 30 distinguishes the two; prior sprint records

### 3. t3-rem commit omitted from list (Lines 2441–2470)
- **Error:** Commit 87dc529 (t3-rem fix) not listed separately; fix folded into t3 description
- **Correction:** 87dc529 is a separate durability commit between t3 and t5
- **Evidence:** commit_record line 19 (separate entry with trailer task="prog-studio-v2-2026-07-s2-party-shell-t3-rem")

### 4. t5 omits ui-store.ts file (Lines 2465–2466)
- **Error:** t5 entry lists only ModeContent.tsx
- **Correction:** t5 (3a6a277) modifies BOTH packages/client/src/store/ui-store.ts AND ModeContent.tsx
- **Evidence:** AUD#5 verdict (lines 30–31: both files listed as inputs; SA review lines 37–50 documents changes to both)

### 5. materia-tint.ts fabricated characterization (Line 2450)
- **Error:** Described as "(color indexer, Zod-validated input)"
- **Correction:** Pure string-template helper returning color-mix() CSS; NO Zod schema, NO validation
- **Evidence:** Direct file read (materia-tint.ts, 13 lines, lines 1–13, zero Zod anywhere)

### 6. First-pass rate incoherent denominator (Line 2511)
- **Error:** "First-pass rate: 6/8" with no referent that yields 6/8
- **Correction:** 8 total verdicts; 7 PASS, 1 FAIL (remediated); first-pass verdicts = 5 (4 PASS, 1 FAIL)
- **Evidence:** All 8 audit verdict files (t1–t6 + t3-rem + t5-reaudit); after-action §6 G5 explicit breakdown

---

## Verification Notes

1. **Glob-verified commit_record artifact exists:** `.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-COMMIT-1783483923.md`
2. **All audit verdict files exist and read:** AUD#1–AUD#8 outputs all present and cited
3. **materia-tint.ts file verified:** 13 lines, zero Zod, pure CSS helper (confirmed by direct read)
4. **AUD#5 verdict explicitly lists both t5 file targets:** packages/client/src/store/ui-store.ts + ModeContent.tsx
5. **After-action reference accurate:** §6 G5 line 191 explicit statement of all 6 errors, matching AR#2 findings

---

## Chronological Append Confirmed

- Original entry closes at line 2522: `</archive_entry>`
- Blank line 2523
- Correction addendum begins line 2524: `<archive_correction ref=...>`
- Correction addendum ends line 2609: `</archive_correction>`
- **Append-only invariant maintained:** new entry at the END of file, preserving chronological ordering

---

## Root Cause (per after-action §6 G5)

Third consecutive Archivist drift sighting. The s1 correction (AR#2) enforced Glob-verify-before-citation for file paths, which prevented path fabrications. However, the drift class mutated: this sprint AR drifted on **commit inventory facts** re-narrated from memory rather than mechanically copied from commit_record XML. The mechanism must extend: commit lists must be VERBATIM copies from commit_record, never paraphrased.

**Recommended rule change (§9 row 4 / standards.md):** Commit inventories in archive entries MUST be copied verbatim from the commit_record's `<commits>` block; no re-narration permitted. Any commit characterization beyond the verbatim fields requires a Read of the commit diff.

---

## Output File

Written to: `/home/jhber/projects/gander-studio-alpha/.claude/tasks/outputs/prog-studio-v2-2026-07-s2-party-shell-gap-AR-1783485043.md`
