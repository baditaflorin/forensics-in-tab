import { Binary, Cpu, Download } from 'lucide-react';
import { formatOffset } from '../../lib/bytes';
import { downloadCsvFile } from '../../lib/export';
import { EmptyState, PanelCard } from '../../ui/PanelCard';
import type { MemoryAnalysis } from './memory';
import { formatPeFinding } from './memory';

interface MemoryPanelProps {
  analysis?: MemoryAnalysis;
}

export function MemoryPanel({ analysis }: MemoryPanelProps) {
  if (!analysis) {
    return <EmptyState label="Load evidence to inspect memory." />;
  }

  return (
    <section className="grid gap-5 lg:grid-cols-3">
      <PanelCard
        title="Memory IOCs"
        icon={<Cpu aria-hidden="true" />}
        actions={
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slatewash"
            type="button"
            onClick={() =>
              downloadCsvFile('forensics-in-tab-memory-iocs.csv', [
                ['type', 'value', 'offset'],
                ...analysis.iocs.map((ioc) => [ioc.type, ioc.value, String(ioc.offset)])
              ])
            }
          >
            <Download aria-hidden="true" size={16} />
            Export CSV
          </button>
        }
      >
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
      </PanelCard>

      <div className="grid gap-5">
        <PanelCard
          title="Executable Hints"
          icon={<Binary className="text-evidence" aria-hidden="true" />}
        >
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
        </PanelCard>

        <PanelCard title="Process Strings">
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
        </PanelCard>
      </div>
    </section>
  );
}
