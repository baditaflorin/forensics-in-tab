import {
  ArchiveRestore,
  FileJson,
  HardDrive,
  Microscope,
  ShieldAlert,
  TerminalSquare
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyzeDiskImage, type DiskAnalysis } from './features/disk/disk';
import { DiskPanel } from './features/disk/DiskPanel';
import { DisasmPanel } from './features/disasm/DisasmPanel';
import type { DisasmResult } from './features/disasm/disasm';
import { EvidenceIntake } from './features/evidence/EvidenceIntake';
import { loadEvidenceFile, type EvidenceMetadata } from './features/evidence/evidence';
import { analyzeMemory, summarizeMemory, type MemoryAnalysis } from './features/memory/memory';
import { MemoryPanel } from './features/memory/MemoryPanel';
import { ReportPanel } from './features/report/ReportPanel';
import { YaraPanel } from './features/yara/YaraPanel';
import type { YaraScanResult } from './features/yara/yaraEngine';
import { fetchBuildInfo } from './lib/buildInfo';
import { formatBytes } from './lib/bytes';
import { Header } from './ui/Header';
import { Tabs, type TabItem } from './ui/Tabs';

type Tab = 'overview' | 'disk' | 'memory' | 'yara' | 'disasm' | 'report';

const tabs: TabItem<Tab>[] = [
  { id: 'overview', label: 'Overview', icon: Microscope },
  { id: 'disk', label: 'Disk', icon: HardDrive },
  { id: 'memory', label: 'Memory', icon: ArchiveRestore },
  { id: 'yara', label: 'YARA', icon: ShieldAlert },
  { id: 'disasm', label: 'Disasm', icon: TerminalSquare },
  { id: 'report', label: 'Report', icon: FileJson }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [metadata, setMetadata] = useState<EvidenceMetadata>();
  const [bytes, setBytes] = useState<Uint8Array>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [yaraResult, setYaraResult] = useState<YaraScanResult>();
  const [disasmResult, setDisasmResult] = useState<DisasmResult>();
  const { data: buildInfo } = useQuery({ queryKey: ['build-info'], queryFn: fetchBuildInfo });

  const disk = useMemo<DiskAnalysis | undefined>(
    () => (bytes ? analyzeDiskImage(bytes) : undefined),
    [bytes]
  );
  const memory = useMemo<MemoryAnalysis | undefined>(
    () => (bytes ? analyzeMemory(bytes) : undefined),
    [bytes]
  );

  async function handleFile(file: File) {
    setBusy(true);
    setError(undefined);
    setYaraResult(undefined);
    setDisasmResult(undefined);

    try {
      const loaded = await loadEvidenceFile(file);
      setMetadata(loaded.metadata);
      setBytes(loaded.bytes);
      setActiveTab('overview');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Evidence could not be loaded.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slatewash text-ink">
      <Header buildInfo={buildInfo} />
      <main className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
        <EvidenceIntake metadata={metadata} busy={busy} onFile={handleFile} />
        {error ? <p className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}

        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'overview' ? (
          <Overview metadata={metadata} disk={disk} memory={memory} />
        ) : activeTab === 'disk' ? (
          <DiskPanel analysis={disk} />
        ) : activeTab === 'memory' ? (
          <MemoryPanel analysis={memory} />
        ) : activeTab === 'yara' ? (
          <YaraPanel bytes={bytes} result={yaraResult} onResult={setYaraResult} />
        ) : activeTab === 'disasm' ? (
          <DisasmPanel bytes={bytes} result={disasmResult} onResult={setDisasmResult} />
        ) : (
          <ReportPanel
            buildInfo={buildInfo}
            evidence={metadata}
            disk={disk}
            memory={memory}
            yara={yaraResult}
            disassembly={disasmResult}
          />
        )}
      </main>
    </div>
  );
}

function Overview({
  metadata,
  disk,
  memory
}: {
  metadata?: EvidenceMetadata;
  disk?: DiskAnalysis;
  memory?: MemoryAnalysis;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-4">
      <Metric label="Evidence" value={metadata ? formatBytes(metadata.size) : 'Waiting'} />
      <Metric label="Recovered" value={disk ? String(disk.artifacts.length) : '0'} />
      <Metric label="Partitions" value={disk ? String(disk.partitions.length) : '0'} />
      <Metric label="Memory" value={memory ? summarizeMemory(memory) : 'No sample'} wide />
      <div className="rounded-lg bg-white p-5 shadow-panel lg:col-span-4">
        <h2 className="text-xl font-semibold">Privacy Boundary</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          The published app is static GitHub Pages. Evidence bytes are processed in this tab and are
          not sent to a runtime backend.
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-lg bg-white p-5 shadow-panel ${wide ? 'lg:col-span-1' : ''}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold">{value}</p>
    </div>
  );
}
