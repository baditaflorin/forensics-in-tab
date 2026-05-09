import { FileUp, FlaskConical, FolderInput, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import { useId, useState } from 'react';
import type { EvidenceEntry } from '../../app/session';
import { formatBytes } from '../../lib/bytes';
import { evidenceKindSchema, type EvidenceKind } from './evidence';

type PasteMode = 'auto' | 'text' | 'hex' | 'base64';

interface EvidenceIntakeProps {
  evidence: EvidenceEntry[];
  activeEvidenceId: string | null;
  busy: boolean;
  onFiles: (files: FileList | File[]) => Promise<void> | void;
  onPaste: (content: string, mode: PasteMode) => Promise<void> | void;
  onImportSession: (file: File) => Promise<void> | void;
  onSample: () => Promise<void> | void;
  onClear: () => void;
  onSelectEvidence: (id: string) => void;
  onRemoveEvidence: (id: string) => void;
  onSetEvidenceKind: (id: string, kind: EvidenceKind) => void;
}

function isPasteMode(value: string): value is PasteMode {
  return value === 'auto' || value === 'text' || value === 'hex' || value === 'base64';
}

export function EvidenceIntake({
  evidence,
  activeEvidenceId,
  busy,
  onFiles,
  onPaste,
  onImportSession,
  onSample,
  onClear,
  onSelectEvidence,
  onRemoveEvidence,
  onSetEvidenceKind
}: EvidenceIntakeProps) {
  const fileInputId = useId();
  const importInputId = useId();
  const [dragging, setDragging] = useState(false);
  const [pasteMode, setPasteMode] = useState<PasteMode>('auto');
  const [pasteValue, setPasteValue] = useState('');

  return (
    <section
      className={`rounded-lg border border-dashed px-5 py-5 transition ${
        dragging ? 'border-signal bg-white' : 'border-slate-300 bg-white/80'
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (event.dataTransfer.files.length > 0) {
          void onFiles(event.dataTransfer.files);
        }
      }}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-signal text-white">
            <FileUp aria-hidden="true" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Evidence Intake</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Bring your own files, drag several at once, paste bytes or text, load a sample, or
              restore a saved session. The browser samples up to 64 MiB per item for local triage.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <label
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            htmlFor={fileInputId}
          >
            <Upload aria-hidden="true" size={16} />
            {busy ? 'Loading...' : 'Add Evidence'}
          </label>
          <input
            className="sr-only"
            data-testid="evidence-input"
            id={fileInputId}
            multiple
            type="file"
            onChange={(event) => {
              if (event.currentTarget.files?.length) {
                void onFiles(event.currentTarget.files);
                event.currentTarget.value = '';
              }
            }}
          />

          <label
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slatewash"
            htmlFor={importInputId}
          >
            <FolderInput aria-hidden="true" size={16} />
            Import Session
          </label>
          <input
            className="sr-only"
            id={importInputId}
            accept=".json,application/json"
            type="file"
            onChange={(event) => {
              const file = event.currentTarget.files?.item(0);
              if (file) {
                void onImportSession(file);
                event.currentTarget.value = '';
              }
            }}
          />

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slatewash"
            type="button"
            onClick={() => void onSample()}
          >
            <FlaskConical aria-hidden="true" size={16} />
            Load Sample
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slatewash"
            disabled={evidence.length === 0}
            type="button"
            onClick={onClear}
          >
            <Trash2 aria-hidden="true" size={16} />
            Start Fresh
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Paste Intake</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Paste analyst notes, hex bytes, or base64 and load them as evidence.
                </p>
              </div>
              <select
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={pasteMode}
                onChange={(event) => {
                  if (isPasteMode(event.target.value)) {
                    setPasteMode(event.target.value);
                  }
                }}
              >
                <option value="auto">Auto detect</option>
                <option value="text">Text</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            <textarea
              className="mt-3 h-40 w-full resize-y rounded-lg border border-slate-300 p-3 font-mono text-sm"
              placeholder="Paste raw notes, hex bytes, or base64 here..."
              spellCheck={false}
              value={pasteValue}
              onChange={(event) => setPasteValue(event.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white"
                type="button"
                onClick={async () => {
                  await onPaste(pasteValue, pasteMode);
                  setPasteValue('');
                }}
              >
                <Upload aria-hidden="true" size={16} />
                Load Pasted Evidence
              </button>
              <p className="self-center text-xs text-slate-500">
                Auto mode prefers hex or base64 when the pasted content clearly matches one of them.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Case Queue</h3>
              <p className="mt-1 text-sm text-slate-600">
                Switch between loaded evidence items and correct the detected kind when needed.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              <ShieldCheck aria-hidden="true" size={16} />
              Local-only
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {evidence.map((entry) => {
              const active = entry.id === activeEvidenceId;
              return (
                <article
                  key={entry.id}
                  className={`rounded-lg border p-3 ${active ? 'border-signal bg-slatewash' : 'border-slate-200'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <button
                      className="min-w-0 flex-1 text-left"
                      type="button"
                      onClick={() => onSelectEvidence(entry.id)}
                    >
                      <p className="truncate font-semibold">{entry.metadata.name}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {formatBytes(entry.metadata.size)} sampled{' '}
                        {formatBytes(entry.metadata.sampledBytes)}
                      </p>
                    </button>
                    <button
                      className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900"
                      type="button"
                      onClick={() => onRemoveEvidence(entry.id)}
                    >
                      <X aria-hidden="true" size={16} />
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-medium text-slate-600">
                      Treat as
                      <select
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={entry.selectedKind}
                        onChange={(event) => {
                          const parsed = evidenceKindSchema.safeParse(event.target.value);
                          if (parsed.success) {
                            onSetEvidenceKind(entry.id, parsed.data);
                          }
                        }}
                      >
                        <option value="disk-image">Disk image</option>
                        <option value="memory-dump">Memory dump</option>
                        <option value="binary-sample">Binary sample</option>
                        <option value="text-buffer">Text buffer</option>
                      </select>
                    </label>
                    <div className="text-xs text-slate-600">
                      <p className="font-medium">Detected</p>
                      <p className="mt-1 capitalize">{entry.detectedKind.replace('-', ' ')}</p>
                      <p className="mt-1 break-all font-mono">
                        {entry.metadata.sha256.slice(0, 24)}...
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
            {evidence.length === 0 ? (
              <p className="rounded-lg bg-slatewash p-3 text-sm text-slate-600">
                No evidence loaded yet. Add your own files, paste bytes, or start with the sample.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
