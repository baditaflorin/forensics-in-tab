import { Copy, Download, Link2, Printer } from 'lucide-react';
import type { BuildInfo } from '../../lib/buildInfo';
import { copyText, downloadJsonFile } from '../../lib/export';
import { EmptyState, PanelCard } from '../../ui/PanelCard';
import type { PersistedSession } from '../../app/session';
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
  sessionSnapshot: PersistedSession;
  onShare: () => Promise<void> | void;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
}

export function ReportPanel(props: ReportPanelProps) {
  if (!props.evidence) {
    return <EmptyState label="Load evidence to build a report." />;
  }

  const report = makeReport(props);
  const reportJson = JSON.stringify(report, null, 2);

  return (
    <PanelCard
      title="Case Report"
      description="Export findings, copy them into notes, save the full session, or print a clean handoff."
      actions={
        <>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white"
            type="button"
            onClick={() => downloadJsonFile(reportFilename('report'), report)}
          >
            <Download aria-hidden="true" size={17} />
            Export JSON
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slatewash"
            type="button"
            onClick={async () => {
              await copyText(reportJson);
              props.onNotice('Copied the case report JSON to the clipboard.');
            }}
          >
            <Copy aria-hidden="true" size={16} />
            Copy JSON
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slatewash"
            type="button"
            onClick={() => {
              downloadJsonFile(reportFilename('session'), props.sessionSnapshot);
              props.onNotice('Exported a restorable session snapshot.');
            }}
          >
            <Download aria-hidden="true" size={16} />
            Save Session
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slatewash"
            type="button"
            onClick={async () => {
              try {
                await props.onShare();
              } catch (caught) {
                props.onError(
                  caught instanceof Error ? caught.message : 'A share URL could not be created.'
                );
              }
            }}
          >
            <Link2 aria-hidden="true" size={16} />
            Share URL
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slatewash"
            type="button"
            onClick={() => window.print()}
          >
            <Printer aria-hidden="true" size={16} />
            Print
          </button>
        </>
      }
    >
      <pre className="mt-5 max-h-[520px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
        {reportJson}
      </pre>
    </PanelCard>
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

function reportFilename(kind: 'report' | 'session') {
  return `forensics-in-tab-${kind}-${new Date().toISOString().slice(0, 10)}.json`;
}
