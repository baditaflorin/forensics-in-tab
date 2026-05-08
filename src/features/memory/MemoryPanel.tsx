import { Binary, Cpu } from 'lucide-react';
import { formatOffset } from '../../lib/bytes';
import type { MemoryAnalysis } from './memory';
import { formatPeFinding } from './memory';

interface MemoryPanelProps {
  analysis?: MemoryAnalysis;
}

export function MemoryPanel({ analysis }: MemoryPanelProps) {
  if (!analysis) {
    return (
      <section className="rounded-lg bg-white p-5 text-sm text-slate-500 shadow-panel">
        Load evidence to inspect memory.
      </section>
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-3">
      <div className="rounded-lg bg-white p-5 shadow-panel lg:col-span-2">
        <div className="flex items-center gap-3">
          <Cpu className="text-signal" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Memory IOCs</h2>
        </div>
        <div className="mt-4 max-h-[440px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white text-slate-500">
              <tr>
                <th className="py-2">Type</th>
                <th>Value</th>
                <th>Offset</th>
              </tr>
            </thead>
            <tbody>
              {analysis.iocs.map((ioc) => (
                <tr
                  key={`${ioc.type}-${ioc.value}-${ioc.offset}`}
                  className="border-t border-slate-200"
                >
                  <td className="py-2 capitalize">{ioc.type}</td>
                  <td className="max-w-[28rem] break-all font-mono text-xs">{ioc.value}</td>
                  <td className="font-mono text-xs">{formatOffset(ioc.offset)}</td>
                </tr>
              ))}
              {analysis.iocs.length === 0 ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={3}>
                    No IOC-shaped strings found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-5">
        <aside className="rounded-lg bg-white p-5 shadow-panel">
          <div className="flex items-center gap-3">
            <Binary className="text-evidence" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Executable Hints</h2>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {analysis.peFindings.slice(0, 8).map((finding) => (
              <li key={finding.offset} className="font-mono text-xs">
                {formatPeFinding(finding)}
              </li>
            ))}
            {analysis.peFindings.length === 0 ? (
              <li className="text-slate-500">No MZ offsets.</li>
            ) : null}
          </ul>
        </aside>

        <aside className="rounded-lg bg-white p-5 shadow-panel">
          <h2 className="text-lg font-semibold">Process Strings</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.processHints.slice(0, 18).map((hint) => (
              <span key={hint} className="rounded bg-slatewash px-2 py-1 font-mono text-xs">
                {hint}
              </span>
            ))}
            {analysis.processHints.length === 0 ? (
              <p className="text-sm text-slate-500">No process hints.</p>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
