import { FileUp, ShieldCheck } from 'lucide-react';
import { useId, useState } from 'react';
import { formatBytes } from '../../lib/bytes';
import type { EvidenceMetadata } from './evidence';

interface EvidenceIntakeProps {
  metadata?: EvidenceMetadata;
  busy: boolean;
  onFile: (file: File) => void;
}

export function EvidenceIntake({ metadata, busy, onFile }: EvidenceIntakeProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

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
        const file = event.dataTransfer.files.item(0);
        if (file) {
          onFile(file);
        }
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-signal text-white">
            <FileUp aria-hidden="true" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Evidence Intake</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Drop a disk image, memory dump, or binary sample. The browser reads up to 64 MiB for
              v1 triage.
            </p>
          </div>
        </div>
        <label
          className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          htmlFor={inputId}
        >
          {busy ? 'Loading...' : 'Choose Evidence'}
        </label>
        <input
          className="sr-only"
          data-testid="evidence-input"
          id={inputId}
          type="file"
          onChange={(event) => {
            const file = event.currentTarget.files?.item(0);
            if (file) {
              onFile(file);
            }
          }}
        />
      </div>

      {metadata ? (
        <dl className="mt-5 grid gap-3 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium">{metadata.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Size</dt>
            <dd className="font-medium">
              {formatBytes(metadata.size)} sampled {formatBytes(metadata.sampledBytes)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">SHA-256</dt>
            <dd className="break-all font-mono text-xs">{metadata.sha256.slice(0, 32)}...</dd>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="text-signal" size={18} />
            <dd className="font-medium">Local-only</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
