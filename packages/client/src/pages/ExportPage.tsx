import React, { useState, useId, useEffect, useRef } from 'react';
import type { z } from 'zod';
import type { LoadoutSchema } from '@gander-studio/shared';
import { trpc } from '../trpc';
import { useComposeStore } from '../store/compose-store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  EXPORT_SUCCESS_DURATION_MS,
  TARGET_DIR_PATTERN,
  AGENTS_CHIP_BG,
  AGENTS_CHIP_BD,
  SKILLS_CHIP_BG,
  SKILLS_CHIP_BD,
  HOOKS_CHIP_BG,
  HOOKS_CHIP_BD,
} from '../constants/export';

// ─── Inferred type ─────────────────────────────────────────────────────────────
type Loadout = z.infer<typeof LoadoutSchema>;

// ─── Local state types ─────────────────────────────────────────────────────────
type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

// ─── Panel shell ───────────────────────────────────────────────────────────────
const PANEL_STYLE: React.CSSProperties = {
  background: 'var(--sf)',
  border: '1px solid var(--bd)',
  borderRadius: 'var(--rl)',
  padding: '16px',
};

const PANEL_LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--fh)',
  fontSize: '10px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.2em',
  color: 'var(--wm)',
  marginBottom: '10px',
};

// ─── Stat chip ─────────────────────────────────────────────────────────────────
interface StatChipProps {
  label: string;
  bg: string;
  bd: string;
  color: string;
}

function StatChip({ label, bg, bd, color }: StatChipProps) {
  return (
    <span
      style={{
        background: bg,
        border: `1px solid ${bd}`,
        color,
        fontFamily: 'var(--fm)',
        fontSize: '11px',
        padding: '2px 8px',
        borderRadius: 'var(--r)',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {label}
    </span>
  );
}

// ─── ExportPage ────────────────────────────────────────────────────────────────

export default function ExportPage() {
  const { currentLoadout } = useComposeStore();

  // ── Local state ──────────────────────────────────────────────────────────────
  const [targetDirName, setTargetDirName] = useState('');
  const [includeStandards, setIncludeStandards] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [result, setResult] = useState<{
    targetPath: string;
    plannedFiles: string[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success flash timer ref — used to clear on unmount
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  // ── A11y IDs ─────────────────────────────────────────────────────────────────
  const targetDirId = useId();
  const targetDirErrorId = useId();
  const targetDirHintId = useId();
  const checkboxId = useId();

  // ── Validation ────────────────────────────────────────────────────────────────
  const isDirNameInvalid =
    targetDirName.length > 0 && !TARGET_DIR_PATTERN.test(targetDirName);
  const isLoadoutEmpty =
    currentLoadout.agents.length === 0 &&
    currentLoadout.skills.length === 0 &&
    currentLoadout.hooks.length === 0;

  const canExport =
    !isLoadoutEmpty &&
    targetDirName.length > 0 &&
    !isDirNameInvalid &&
    exportStatus !== 'loading';

  // ── tRPC mutation ─────────────────────────────────────────────────────────────
  const exportMutation = trpc.export.spawn.useMutation({
    onSuccess: (data) => {
      setResult({ targetPath: data.targetPath, plannedFiles: data.plannedFiles });
      setErrorMessage(null);
      setExportStatus('success');

      successTimerRef.current = setTimeout(() => {
        setExportStatus('idle');
      }, EXPORT_SUCCESS_DURATION_MS);
    },
    onError: (err) => {
      setErrorMessage(err.message);
      setResult(null);
      setExportStatus('error');
    },
  });

  function handleExport(): void {
    if (!canExport) return;

    const loadout: Loadout = {
      name: currentLoadout.name || 'unnamed',
      agents: currentLoadout.agents,
      skills: currentLoadout.skills,
      hooks: currentLoadout.hooks,
      createdAt: new Date().toISOString(),
    };

    setExportStatus('loading');
    exportMutation.mutate({ loadout, targetDirName, includeStandards });
  }

  // ── Button label ──────────────────────────────────────────────────────────────
  let buttonLabel = 'Export Loadout';
  if (exportStatus === 'loading') buttonLabel = 'Exporting...';
  if (exportStatus === 'success') buttonLabel = 'Exported \u2713';

  return (
    <div
      data-testid="export-page"
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header>
        <h2
          style={{
            fontFamily: 'var(--fh)',
            fontSize: '15px',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--w)',
            textShadow: 'var(--title-glow)',
            margin: 0,
          }}
        >
          Export
        </h2>
        <p
          style={{
            fontFamily: 'var(--fb)',
            fontSize: '11px',
            color: 'var(--wm)',
            margin: '4px 0 0',
          }}
        >
          Write loadout to a .claude/ project directory
        </p>
      </header>

      {/* ── Loadout Summary Panel ────────────────────────────────────────────── */}
      <section aria-label="Current loadout summary" style={PANEL_STYLE}>
        <div style={PANEL_LABEL_STYLE}>Current Loadout</div>

        {isLoadoutEmpty ? (
          <p
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              color: 'var(--wm)',
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            No loadout composed. Switch to Compose mode to build one.
          </p>
        ) : (
          <div>
            <div
              style={{
                fontFamily: 'var(--fm)',
                fontSize: '14px',
                color: 'var(--w)',
                marginBottom: '10px',
              }}
            >
              {currentLoadout.name || 'unnamed'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <StatChip
                label={`${currentLoadout.agents.length} agents`}
                bg={AGENTS_CHIP_BG}
                bd={AGENTS_CHIP_BD}
                color="var(--mg)"
              />
              <StatChip
                label={`${currentLoadout.skills.length} skills`}
                bg={SKILLS_CHIP_BG}
                bd={SKILLS_CHIP_BD}
                color="var(--mb)"
              />
              <StatChip
                label={`${currentLoadout.hooks.length} hooks`}
                bg={HOOKS_CHIP_BG}
                bd={HOOKS_CHIP_BD}
                color="var(--mo)"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Export Config Panel ──────────────────────────────────────────────── */}
      <section aria-label="Export configuration" style={PANEL_STYLE}>
        <div style={PANEL_LABEL_STYLE}>Export Config</div>

        {/* Target directory name field */}
        <div style={{ marginBottom: '14px' }}>
          <label
            htmlFor={targetDirId}
            style={{
              display: 'block',
              fontFamily: 'var(--fb)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--wm)',
              marginBottom: '4px',
            }}
          >
            Target Directory
          </label>
          <Input
            id={targetDirId}
            value={targetDirName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTargetDirName(e.target.value)
            }
            placeholder="my-project"
            aria-invalid={isDirNameInvalid ? 'true' : undefined}
            aria-describedby={
              isDirNameInvalid ? targetDirErrorId : targetDirHintId
            }
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '13px',
              background: 'var(--sfm)',
              borderColor: isDirNameInvalid ? 'var(--redb)' : undefined,
            }}
          />
          {isDirNameInvalid ? (
            <p
              id={targetDirErrorId}
              role="alert"
              style={{
                fontFamily: 'var(--fb)',
                fontSize: '11px',
                color: 'var(--redb)',
                margin: '4px 0 0',
              }}
            >
              Only letters, numbers, hyphens, and underscores are allowed.
            </p>
          ) : (
            <p
              id={targetDirHintId}
              style={{
                fontFamily: 'var(--fb)',
                fontSize: '11px',
                color: 'var(--wm)',
                margin: '4px 0 0',
              }}
            >
              Files will be written to EXPORT_BASE_DIR/
              {targetDirName || '[dirname]'}/.claude/
            </p>
          )}
        </div>

        {/* Include standards toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <input
            type="checkbox"
            id={checkboxId}
            checked={includeStandards}
            onChange={(e) => setIncludeStandards(e.target.checked)}
            style={{ accentColor: 'var(--mt)', cursor: 'pointer' }}
          />
          <label
            htmlFor={checkboxId}
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              color: 'var(--wd)',
              cursor: 'pointer',
            }}
          >
            Include standards.md
          </label>
        </div>
      </section>

      {/* ── Export Button ────────────────────────────────────────────────────── */}
      <Button
        size="sm"
        disabled={!canExport}
        aria-disabled={!canExport}
        aria-busy={exportStatus === 'loading'}
        onClick={handleExport}
        style={{
          width: '100%',
          background:
            exportStatus === 'success' ? 'var(--dg)' : 'var(--mt)',
          color: 'var(--void)',
          fontFamily: 'var(--fb)',
          fontSize: '12px',
          boxShadow:
            exportStatus === 'loading' || exportStatus === 'success'
              ? 'none'
              : undefined,
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (canExport && exportStatus === 'idle') {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--mtd)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              'var(--gt)';
          }
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (canExport && exportStatus === 'idle') {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--mt)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }
        }}
      >
        {buttonLabel}
      </Button>

      {/* ── Results Panel ─────────────────────────────────────────────────────── */}
      {result !== null && exportStatus !== 'error' && (
        <section
          aria-live="polite"
          aria-label="Export complete"
          style={{
            borderLeft: '3px solid var(--mg)',
            background: 'var(--sfm)',
            borderRadius: 'var(--rl)',
            padding: '14px 18px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--mg)',
            }}
          >
            Export Complete
          </div>
          <div
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '12px',
              color: 'var(--wd)',
              marginTop: '6px',
            }}
          >
            {result.targetPath}
          </div>
          <ul
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '11px',
              color: 'var(--wm)',
              maxHeight: '200px',
              overflowY: 'auto',
              margin: '8px 0 0',
              paddingLeft: '16px',
              listStyleType: 'disc',
            }}
          >
            {result.plannedFiles.map((file) => (
              <li key={file}>{file}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Error Panel ───────────────────────────────────────────────────────── */}
      {exportStatus === 'error' && errorMessage !== null && (
        <section
          role="alert"
          aria-label="Export failed"
          style={{
            borderLeft: '3px solid var(--redb)',
            background: 'var(--sfm)',
            borderRadius: 'var(--rl)',
            padding: '14px 18px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '10px',
              textTransform: 'uppercase',
              color: 'var(--redb)',
            }}
          >
            Export Failed
          </div>
          <div
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              color: 'var(--wd)',
              marginTop: '6px',
            }}
          >
            {errorMessage}
          </div>
        </section>
      )}
    </div>
  );
}
