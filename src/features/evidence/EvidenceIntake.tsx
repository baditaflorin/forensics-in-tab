import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileUp,
  FlaskConical,
  FolderInput,
  ShieldCheck,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { useId, useState } from 'react';
import type { EvidenceEntry } from '../../app/session';
import { formatBytes } from '../../lib/bytes';
import { evidenceKindSchema, type EvidenceKind } from './evidence';

type PasteMode = 'auto' | 'text' | 'hex' | 'base64';

interface AcquisitionEntry {
  label: string;
  cmds: string[];
  note?: string;
}

const acquisitionGuide: Record<string, AcquisitionEntry[]> = {
  'Memory dump': [
    {
      label: 'Windows — WinPmem (open source)',
      cmds: [
        'winpmem_mini_x64.exe memory.dmp',
        '# outputs a raw memory image you can load here'
      ],
      note: 'Download from github.com/Velocidex/WinPmem'
    },
    {
      label: 'Windows — DumpIt (Magnet / free)',
      cmds: ['DumpIt.exe /OUTPUT memory.dmp'],
      note: 'Download from magnetforensics.com/resources/magnet-dumpit-for-windows'
    },
    {
      label: 'Linux — /proc/kcore or LiME',
      cmds: [
        'sudo cp /proc/kcore memory.dmp',
        '# or use LiME kernel module for a clean dump',
        'sudo insmod lime-$(uname -r).ko "path=/tmp/memory.lime format=lime"'
      ]
    },
    {
      label: 'macOS — not practically possible on modern systems',
      cmds: [
        '# Apple blocked unsigned kernel extensions from El Capitan (2015) onward.',
        '# On Apple Silicon the hardware itself prevents DMA-based memory reads.',
        '#',
        '# Options that do work:',
        '#   - Suspend a VMware/Parallels/UTM VM → the .vmem file is a memory dump',
        '#   - Use Cellebrite Digital Collector (paid commercial tool)',
        '#   - Use Velociraptor for live OS-API-based volatile data collection',
        '#   - On a test machine: disable SIP in recovery mode, then use older tools'
      ],
      note: 'osxpmem is unmaintained and non-functional on Ventura/Sonoma/Sequoia with SIP on'
    },
    {
      label: 'VMware / VirtualBox / Parallels / UTM',
      cmds: [
        '# VMware: suspend the VM — the .vmem file IS the memory image',
        '# VirtualBox: suspend → find the .sav file next to the .vbox file',
        '# Parallels/UTM: suspend → .mem or .vmem file in the VM bundle',
        '# Drag-drop that file directly into this app'
      ]
    }
  ],
  'Disk image': [
    {
      label: 'Linux / macOS — dd',
      cmds: [
        'sudo dd if=/dev/sda of=disk.img bs=4M status=progress',
        'sudo dd if=/dev/disk2 of=disk.img bs=4m'
      ]
    },
    {
      label: 'Linux — dcfldd (enhanced dd with hashing)',
      cmds: ['sudo dcfldd if=/dev/sda of=disk.img hash=sha256 hashlog=disk.sha256']
    },
    {
      label: 'Windows — FTK Imager (free GUI)',
      cmds: ['# File → Create Disk Image → select drive → raw (dd) format'],
      note: 'Download from exterro.com/digital-forensics-software/ftk-imager'
    },
    {
      label: 'Cross-platform — Autopsy / Sleuth Kit',
      cmds: ['# New Case → Add Data Source → select disk'],
      note: 'autopsy.com'
    }
  ],
  'Binary / shellcode snippet': [
    {
      label: 'Extract from a running process (Windows)',
      cmds: [
        'procdump -ma <pid> process.dmp',
        '# or use Process Hacker: right-click process → Miscellaneous → Dump'
      ]
    },
    {
      label: 'Copy bytes from a hex editor',
      cmds: ['# Open any file in HxD / 010 Editor, select region, Edit → Copy As → Hex String'],
      note: 'Then paste directly into the Paste Intake box below and pick Hex mode'
    }
  ]
};

function AcquisitionGuide() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<string>(Object.keys(acquisitionGuide)[0]);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50">
      <button
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <ChevronDown aria-hidden="true" size={16} />
        ) : (
          <ChevronRight aria-hidden="true" size={16} />
        )}
        <BookOpen aria-hidden="true" size={16} />
        <span>How to acquire evidence files</span>
        {!open && (
          <span className="ml-auto font-normal text-slate-500">
            memory dumps, disk images, binary samples
          </span>
        )}
      </button>

      {open && (
        <div className="border-t border-slate-200 p-4">
          <p className="mb-3 text-sm text-slate-600">
            This app analyses files you already have. Use one of the methods below to create them,
            then drag-drop or click <strong>Add Evidence</strong>.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(acquisitionGuide).map((key) => (
              <button
                key={key}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  section === key
                    ? 'bg-ink text-white'
                    : 'border border-slate-300 hover:bg-white'
                }`}
                type="button"
                onClick={() => setSection(key)}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="grid gap-4">
            {acquisitionGuide[section]?.map((entry) => (
              <div key={entry.label} className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-800">{entry.label}</p>
                {entry.note && (
                  <p className="mt-0.5 text-xs text-slate-500">{entry.note}</p>
                )}
                <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs leading-relaxed text-green-300">
                  {entry.cmds.join('\n')}
                </pre>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Files accepted: <code>.dmp .mem .vmem .lime</code> (memory) ·{' '}
            <code>.img .dd .raw .iso</code> (disk) · any binary or text paste
          </p>
        </div>
      )}
    </div>
  );
}

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

      <div className="mt-4">
        <AcquisitionGuide />
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
