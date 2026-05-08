import { ArchiveRestore, HardDrive } from 'lucide-react';
import { formatBytes, formatOffset } from '../../lib/bytes';
import type { DiskAnalysis } from './disk';

interface DiskPanelProps {
  analysis?: DiskAnalysis;
}

export function DiskPanel({ analysis }: DiskPanelProps) {
  if (!analysis) {
    return <EmptyPanel label="Load evidence to inspect disk structures." />;
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg bg-white p-5 shadow-panel">
        <div className="flex items-center gap-3">
          <HardDrive className="text-signal" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Partition Map</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2">Slot</th>
                <th>Type</th>
                <th>Start</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {analysis.partitions.map((partition) => (
                <tr key={partition.index} className="border-t border-slate-200">
                  <td className="py-2">{partition.index}</td>
                  <td>{partition.type}</td>
                  <td>{partition.lbaStart}</td>
                  <td>{formatBytes(partition.sizeBytes)}</td>
                </tr>
              ))}
              {analysis.partitions.length === 0 ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={4}>
                    No MBR entries detected.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600">Entropy sample: {analysis.entropy.toFixed(2)}</p>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-panel">
        <div className="flex items-center gap-3">
          <ArchiveRestore className="text-evidence" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Recovered Files</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {analysis.artifacts.map((artifact) => (
            <article key={artifact.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{artifact.kind}</h3>
                <span className="rounded bg-slatewash px-2 py-1 font-mono text-xs">
                  {formatOffset(artifact.offset)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {formatBytes(artifact.size)} · {artifact.confidence} confidence · .
                {artifact.extension}
              </p>
              <p className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-slate-500">
                {artifact.previewAscii}
              </p>
            </article>
          ))}
          {analysis.artifacts.length === 0 ? (
            <p className="text-sm text-slate-500">No recoverable signatures found.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <section className="rounded-lg bg-white p-5 text-sm text-slate-500 shadow-panel">
      {label}
    </section>
  );
}
