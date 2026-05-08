import { Download } from 'lucide-react';
import type { BuildInfo } from '../../lib/buildInfo';
import { buildCaseReport, type CaseReport } from './report';
import type { DiskAnalysis } from '../disk/disk';
import type { DisasmResult } from '../disasm/disasm';
import type { EvidenceMetadata } from '../evidence/evidence';
import type { MemoryAnalysis } from '../memory/memory';
import type { YaraScanResult } from '../yara/yaraEngine';

interface ReportPanelProps {
  buildInfo?: BuildInfo;
  evidence?: EvidenceMetadata;
  disk?: DiskAnalysis;
  memory?: MemoryAnalysis;
  yara?: YaraScanResult;
  disassembly?: DisasmResult;
}

export function ReportPanel(props: ReportPanelProps) {
  const report = makeReport(props);

  return (
    <section className="rounded-lg bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Case Report</h2>
          <p className="mt-1 text-sm text-slate-600">
            JSON export for local notes and chain-of-work records.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!props.evidence}
          type="button"
          onClick={() => downloadReport(report)}
        >
          <Download aria-hidden="true" size={17} />
          Export JSON
        </button>
      </div>
      <pre className="mt-5 max-h-[520px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
        {JSON.stringify(report, null, 2)}
      </pre>
    </section>
  );
}

function makeReport(props: ReportPanelProps): CaseReport {
  return buildCaseReport({
    app: {
      name: props.buildInfo?.name ?? 'forensics-in-tab',
      version: props.buildInfo?.version ?? 'dev',
      commit: props.buildInfo?.commit ?? 'dev',
      repository: props.buildInfo?.repository ?? 'https://github.com/baditaflorin/forensics-in-tab'
    },
    evidence: props.evidence,
    disk: props.disk,
    memory: props.memory,
    yara: props.yara,
    disassembly: props.disassembly
  });
}

function downloadReport(report: CaseReport) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `forensics-in-tab-report-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
