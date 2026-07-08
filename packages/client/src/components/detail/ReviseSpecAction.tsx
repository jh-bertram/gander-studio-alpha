import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import type { Agent, Skill } from '@gander-studio/shared';
import { trpc } from '@/trpc';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { bufferReducer, INITIAL_BUFFER, targetKey, type ReviseTarget } from './revise-spec-buffer';

// prog-studio-v2-2026-07-s3-drilldowns-t3 — Edit-absorption "Revise this spec" action.
// Reuses the EXISTING trpc.agent.get/save + trpc.skill.get/save load+save path verified against
// EditPage.tsx (same AgentSchema/SkillSchema payload shape) — no new server procedure. REBUILDS
// a minimal target-scoped editor shell rather than reusing EditPage's FilePicker/useEditStore:
// useEditStore is a single global buffer keyed by nothing but `selectedFile` identity checks in
// the CALLER, which is exactly the class of bug SC3 regression-guards against. The buffer here
// (revise-spec-buffer.ts) is a pure reducer keyed by `type:name` so a target switch structurally
// cannot leak content across targets — see that file's header comment for the full guarantee.

const DIALOG_MAX_WIDTH_PX = 560; // wide enough for a markdown body without the FilePicker chrome
const EDITOR_MIN_HEIGHT_PX = 280;

// prog-studio-v2-2026-07-s3-drilldowns-t3-rem — DESIGN.md's "Error state" Component Rule
// ("left-border accent --color-error") applies to any status/error text rendered on --sfh: the
// accent color is the LEFT BORDER, never the message text itself. Shared by both alert `<p>`s and
// the "Saved" status `<p>` below so all three read as one consistent accent-bar treatment.
const ACCENT_BORDER_PX = 3;
const ACCENT_PADDING_LEFT_PX = 10;

export interface ReviseSpecActionProps {
  target: ReviseTarget;
}

export default function ReviseSpecAction({ target }: ReviseSpecActionProps) {
  const [open, setOpen] = useState(false);
  const [buffer, dispatch] = useReducer(bufferReducer, INITIAL_BUFFER);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Explicit focus targets (s2 AA §6 G2, BINDING) — never rely on base-ui's default open/close
  // focus behavior. `triggerRef` doubles as the DialogTrigger's own DOM ref and the `finalFocus`
  // target; `textareaRef` is the ultimate `initialFocus` target so focus lands on the editable
  // content, not the popup shell — see the t3-rem2 comment below for how that's made
  // deterministic against the async-loaded Textarea.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const key = targetKey(target);

  // Target-keyed reset — fires on every target change regardless of dialog open state, so a
  // switch that happens while the dialog is closed (the t5 regression scenario: open A, type,
  // cancel, switch to B, open again) still lands on a clean buffer the moment B is opened.
  useEffect(() => {
    dispatch({ type: 'TARGET_CHANGED', key });
  }, [key]);

  const agentQuery = trpc.agent.get.useQuery(
    { name: target.name },
    { enabled: target.type === 'agent' && open },
  );
  const skillQuery = trpc.skill.get.useQuery(
    { name: target.name },
    { enabled: target.type === 'skill' && open },
  );

  const loadedRecord = target.type === 'agent' ? agentQuery.data : skillQuery.data;
  const isLoading = target.type === 'agent' ? agentQuery.isLoading : skillQuery.isLoading;
  const loadError = target.type === 'agent' ? agentQuery.error : skillQuery.error;

  useEffect(() => {
    if (loadedRecord) {
      dispatch({ type: 'CONTENT_LOADED', key, content: loadedRecord.body });
    }
    // `key` is included so a stale query resolving after a target switch is still routed through
    // the reducer's own `action.key === state.targetKey` guard (belt-and-suspenders with the
    // reducer's structural drop of stale loads).
  }, [loadedRecord, key]);

  // prog-studio-v2-2026-07-s3-drilldowns-t3-rem2 — base-ui's `initialFocus` ref resolves via a
  // queueMicrotask fired once, synchronously, right after the dialog opens — BEFORE the async
  // trpc.agent.get/skill.get query resolves. `<Textarea ref={textareaRef}>` only mounts once
  // `!isLoading`, which is never true on that first microtask tick for a cold open, so
  // `textareaRef.current` is null when base-ui resolves it and it falls back to the first
  // tabbable element (the Cancel button) instead. `initialFocus={() => textareaRef.current ?? false}`
  // below still lets base-ui land on the textarea for free in the rare case it's already mounted
  // (a cache-hit open where isLoading is false synchronously); this effect is the deterministic
  // path that covers every other case by focusing the textarea itself once it actually exists.
  // `hasFocusedOnOpenRef` resets on every close and fires at most once per open so it never yanks
  // focus away from a user mid-edit (e.g. after a save completes and isLoading is unaffected, or
  // on any other re-render once the initial focus has already landed).
  const hasFocusedOnOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasFocusedOnOpenRef.current = false;
    }
  }, [open]);

  useLayoutEffect(() => {
    if (
      open &&
      !isLoading &&
      !loadError &&
      !hasFocusedOnOpenRef.current &&
      textareaRef.current
    ) {
      textareaRef.current.focus();
      hasFocusedOnOpenRef.current = true;
    }
  }, [open, isLoading, loadError]);

  const agentSaveMutation = trpc.agent.save.useMutation();
  const skillSaveMutation = trpc.skill.save.useMutation();

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setSaveStatus('idle');
      setSaveError(null);
    }
  }, []);

  const handleEditorChange = useCallback(
    (value: string) => {
      dispatch({ type: 'CONTENT_EDITED', key, content: value });
    },
    [key],
  );

  const handleSave = useCallback(() => {
    if (!loadedRecord || saveStatus === 'saving') return;
    setSaveStatus('saving');
    setSaveError(null);

    const onSuccess = () => setSaveStatus('saved');
    const onError = (err: unknown) => {
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'Unknown error');
    };

    if (target.type === 'agent') {
      const agent = loadedRecord as Agent;
      agentSaveMutation.mutate({ ...agent, body: buffer.content }, { onSuccess, onError });
    } else {
      const skill = loadedRecord as Skill;
      skillSaveMutation.mutate({ ...skill, body: buffer.content }, { onSuccess, onError });
    }
  }, [loadedRecord, saveStatus, target.type, buffer.content, agentSaveMutation, skillSaveMutation]);

  const canSave = !!loadedRecord && !isLoading && saveStatus !== 'saving';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        ref={triggerRef}
        data-testid="revise-spec-trigger"
        aria-label="Revise this spec"
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
        style={{
          fontFamily: 'var(--fb)',
          fontSize: '12px',
          color: 'var(--wd)',
          borderColor: 'var(--bd)',
          background: 'transparent',
        }}
      >
        Revise this spec
      </DialogTrigger>

      <DialogContent
        role="dialog"
        aria-modal="true"
        initialFocus={() => textareaRef.current ?? false}
        finalFocus={triggerRef}
        style={{
          background: 'var(--sfh)',
          border: '1px solid var(--bdb)',
          borderRadius: 'var(--rl)',
          color: 'var(--w)',
          maxWidth: `${DIALOG_MAX_WIDTH_PX}px`,
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--fh)', color: 'var(--w)', fontSize: '16px' }}>
            Revise {target.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <p style={{ fontFamily: 'var(--fb)', fontSize: '12px', color: 'var(--wm)', margin: 0 }}>
            Loading spec…
          </p>
        )}

        {!isLoading && loadError && (
          <p
            role="alert"
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              color: 'var(--w)',
              margin: 0,
              borderLeft: `${ACCENT_BORDER_PX}px solid var(--redb)`,
              paddingLeft: `${ACCENT_PADDING_LEFT_PX}px`,
            }}
          >
            Failed to load {target.name}: {loadError instanceof Error ? loadError.message : 'unknown error'}
          </p>
        )}

        {!isLoading && !loadError && (
          <Textarea
            ref={textareaRef}
            aria-label={`Markdown editor for ${target.name}`}
            value={buffer.content}
            onChange={(e) => handleEditorChange(e.target.value)}
            spellCheck={false}
            style={{
              background: 'var(--sf)',
              color: 'var(--w)',
              fontFamily: 'var(--fm)',
              fontSize: '13px',
              lineHeight: '1.6',
              minHeight: `${EDITOR_MIN_HEIGHT_PX}px`,
              border: '1px solid var(--bd)',
              caretColor: 'var(--mt)',
            }}
          />
        )}

        {saveStatus === 'error' && saveError && (
          <p
            role="alert"
            style={{
              fontFamily: 'var(--fb)',
              fontSize: '11px',
              color: 'var(--w)',
              margin: 0,
              borderLeft: `${ACCENT_BORDER_PX}px solid var(--redb)`,
              paddingLeft: `${ACCENT_PADDING_LEFT_PX}px`,
            }}
          >
            Save failed: {saveError}
          </p>
        )}
        {saveStatus === 'saved' && (
          <p
            role="status"
            style={{
              fontFamily: 'var(--fm)',
              fontSize: '11px',
              color: 'var(--w)',
              margin: 0,
              borderLeft: `${ACCENT_BORDER_PX}px solid var(--mg)`,
              paddingLeft: `${ACCENT_PADDING_LEFT_PX}px`,
            }}
          >
            Saved
          </p>
        )}

        <DialogFooter>
          <DialogClose
            style={{
              background: 'transparent',
              border: '1px solid var(--bd)',
              borderRadius: 'var(--r)',
              color: 'var(--wd)',
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              padding: '4px 12px',
              cursor: 'pointer',
              height: '28px',
            }}
          >
            Cancel
          </DialogClose>
          <Button
            size="sm"
            disabled={!canSave}
            aria-busy={saveStatus === 'saving'}
            onClick={handleSave}
            style={{
              background: 'var(--mt)',
              color: 'var(--void)',
              fontFamily: 'var(--fb)',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              opacity: canSave ? undefined : 0.6,
            }}
          >
            {saveStatus === 'saving' ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
